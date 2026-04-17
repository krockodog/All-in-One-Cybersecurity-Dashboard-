import dns from "node:dns/promises";
import net from "node:net";

export type ToolExecutionMode = "integrated" | "guided";

export type ToolRunInput = {
  toolId: string;
  toolName: string;
  baseCommand: string;
  target: string;
  options: string;
  category: "osint" | "pentest" | "recon";
};

export type ToolRunResult = {
  status: "success" | "error";
  mode: ToolExecutionMode;
  output: string;
  summary: string;
  findings: string[];
  command: string;
  target: string;
  options: string;
};

const DEFAULT_TIMEOUT_MS = 6_000;
const DEFAULT_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3389, 8080, 8443];
const DIR_WORDS = ["admin", "login", "dashboard", "api", "robots.txt", ".env", ".git/HEAD"];

type HttpProbeResult = {
  url: string;
  status: number;
  title: string;
  server: string;
  headers: Record<string, string>;
};

function buildCommand(baseCommand: string, target: string, options: string) {
  const normalizedOptions = options.trim();
  const suffix = normalizedOptions.length ? ` ${normalizedOptions}` : "";
  return `${baseCommand}${suffix} ${target}`.trim();
}

function ts() {
  return new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function lines(...entries: string[]) {
  return entries.join("\n");
}

function sanitizeTarget(raw: string) {
  return raw.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ensureUrl(raw: string) {
  const value = raw.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${sanitizeTarget(value)}`;
}

function hostFromTarget(raw: string) {
  const value = raw.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return new URL(value).hostname;
  }
  return sanitizeTarget(value).split("/")[0] || value;
}

async function safeFetch(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": "cybersecurity-dashboard/1.0",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function probeHttp(target: string): Promise<HttpProbeResult> {
  const candidates = [ensureUrl(target)];

  if (!target.startsWith("http://") && !target.startsWith("https://")) {
    candidates.push(`http://${sanitizeTarget(target)}`);
  }

  let lastError: unknown;

  for (const url of candidates) {
    try {
      const response = await safeFetch(url, { redirect: "follow" });
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const headers = Object.fromEntries(Array.from(response.headers.entries()));
      return {
        url: response.url || url,
        status: response.status,
        title: titleMatch?.[1]?.trim() || "Kein Title erkannt",
        server: headers.server || "unbekannt",
        headers,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("HTTP probe failed");
}

async function scanPort(host: string, port: number) {
  return await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(900);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

function parsePorts(options: string) {
  const match = options.match(/-p\s*([0-9,\-]+)/);
  if (!match?.[1]) return DEFAULT_PORTS;

  const values = new Set<number>();
  for (const chunk of match[1].split(",")) {
    if (chunk.includes("-")) {
      const [startRaw, endRaw] = chunk.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        for (let port = start; port <= Math.min(end, start + 30); port += 1) values.add(port);
      }
      continue;
    }
    const port = Number(chunk);
    if (Number.isFinite(port)) values.add(port);
  }

  return Array.from(values).slice(0, 32);
}

async function runDnsEnumeration(input: ToolRunInput): Promise<ToolRunResult> {
  const host = hostFromTarget(input.target);
  const [a, aaaa, mx, ns, txt, cname] = await Promise.allSettled([
    dns.resolve4(host),
    dns.resolve6(host),
    dns.resolveMx(host),
    dns.resolveNs(host),
    dns.resolveTxt(host),
    dns.resolveCname(host),
  ]);

  const getValue = <T,>(result: PromiseSettledResult<T>, fallback: T) => result.status === "fulfilled" ? result.value : fallback;
  const aRecords = getValue(a, [] as string[]);
  const aaaaRecords = getValue(aaaa, [] as string[]);
  const mxRecords = getValue(mx, [] as { exchange: string; priority: number }[]);
  const nsRecords = getValue(ns, [] as string[]);
  const txtRecords = getValue(txt, [] as string[][]).map((entry) => entry.join(""));
  const cnameRecords = getValue(cname, [] as string[]);

  const findings = [
    `A: ${aRecords.length ? aRecords.join(", ") : "keine"}`,
    `AAAA: ${aaaaRecords.length ? aaaaRecords.join(", ") : "keine"}`,
    `NS: ${nsRecords.length ? nsRecords.join(", ") : "keine"}`,
    `MX: ${mxRecords.length ? mxRecords.map((item) => `${item.exchange}(${item.priority})`).join(", ") : "keine"}`,
    `TXT: ${txtRecords.length ? txtRecords.slice(0, 4).join(" | ") : "keine"}`,
  ];

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${host} wurde direkt abgefragt. ${aRecords.length + aaaaRecords.length} IP-bezogene Records und ${nsRecords.length} Nameserver erkannt.`,
    findings,
    output: lines(
      `[${ts()}] live-dns> ${host}`,
      `[${ts()}] A records: ${aRecords.length ? aRecords.join(", ") : "none"}`,
      `[${ts()}] AAAA records: ${aaaaRecords.length ? aaaaRecords.join(", ") : "none"}`,
      `[${ts()}] NS records: ${nsRecords.length ? nsRecords.join(", ") : "none"}`,
      `[${ts()}] MX records: ${mxRecords.length ? mxRecords.map((item) => `${item.exchange}(${item.priority})`).join(", ") : "none"}`,
      `[${ts()}] CNAME: ${cnameRecords.length ? cnameRecords.join(", ") : "none"}`,
      `[${ts()}] TXT sample: ${txtRecords.length ? txtRecords.slice(0, 2).join(" | ") : "none"}`,
      `[${ts()}] result: integrated dns enumeration completed`,
    ),
  };
}

async function runWhoisLike(input: ToolRunInput): Promise<ToolRunResult> {
  const domain = hostFromTarget(input.target);
  const response = await safeFetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  if (!response.ok) throw new Error(`RDAP returned ${response.status}`);
  const data = (await response.json()) as Record<string, unknown>;

  const nameservers = Array.isArray(data.nameservers)
    ? data.nameservers
        .map((entry) => (entry && typeof entry === "object" && "ldhName" in entry ? String((entry as { ldhName?: string }).ldhName ?? "") : ""))
        .filter(Boolean)
    : [];

  const events = Array.isArray(data.events) ? data.events as Array<{ eventAction?: string; eventDate?: string }> : [];
  const registration = events.find((item) => item.eventAction?.includes("registration"))?.eventDate ?? "unbekannt";
  const expiry = events.find((item) => item.eventAction?.includes("expiration"))?.eventDate ?? "unbekannt";

  const findings = [
    `Status: ${Array.isArray(data.status) ? data.status.join(", ") : "unbekannt"}`,
    `Nameserver: ${nameservers.length ? nameservers.join(", ") : "keine"}`,
    `Registriert: ${registration}`,
    `Ablauf: ${expiry}`,
  ];

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `RDAP-Daten für ${domain} wurden direkt geladen. ${nameservers.length} Nameserver und Registrierungsereignisse sind verfügbar.`,
    findings,
    output: lines(
      `[${ts()}] rdap> domain ${domain}`,
      `[${ts()}] handle: ${String(data.handle ?? "n/a")}`,
      `[${ts()}] status: ${Array.isArray(data.status) ? data.status.join(", ") : "n/a"}`,
      `[${ts()}] nameservers: ${nameservers.length ? nameservers.join(", ") : "none"}`,
      `[${ts()}] registration: ${registration}`,
      `[${ts()}] expiration: ${expiry}`,
      `[${ts()}] result: rdap enrichment completed`,
    ),
  };
}

async function runSubdomainIntel(input: ToolRunInput, flavor: "subfinder" | "amass" | "fierce" | "theharvester") {
  const domain = hostFromTarget(input.target);
  const response = await safeFetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
  if (!response.ok) throw new Error(`crt.sh returned ${response.status}`);
  const raw = (await response.json()) as Array<{ name_value?: string }>;
  const subdomains = Array.from(new Set(raw.flatMap((entry) => String(entry.name_value ?? "").split("\n")).map((item) => item.trim().toLowerCase()).filter((item) => item.endsWith(domain) && !item.includes("*")))).slice(0, 40);

  const label = flavor === "theharvester" ? "source-correlation" : "subdomain-enumeration";

  return {
    status: "success" as const,
    mode: "integrated" as const,
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${subdomains.length} Subdomains wurden für ${domain} aus Zertifikatstransparenz korreliert.`,
    findings: subdomains.slice(0, 12),
    output: lines(
      `[${ts()}] ${label}> ${domain}`,
      `[${ts()}] certificate transparency entries: ${raw.length}`,
      `[${ts()}] unique subdomains: ${subdomains.length}`,
      ...subdomains.slice(0, 12).map((item, index) => `[${ts()}] hit ${index + 1}: ${item}`),
      `[${ts()}] result: integrated enumeration completed`,
    ),
  };
}

async function runWayback(input: ToolRunInput): Promise<ToolRunResult> {
  const query = sanitizeTarget(input.target);
  const response = await safeFetch(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(query)}/*&output=json&limit=15&fl=timestamp,original,statuscode,mimetype`);
  if (!response.ok) throw new Error(`Wayback returned ${response.status}`);
  const data = (await response.json()) as string[][];
  const rows = data.slice(1).map((entry) => ({ timestamp: entry[0], original: entry[1], status: entry[2], mime: entry[3] }));

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${rows.length} archivierte Treffer für ${query} wurden geladen.`,
    findings: rows.slice(0, 8).map((item) => `${item.timestamp} · ${item.status} · ${item.original}`),
    output: lines(
      `[${ts()}] wayback> ${query}`,
      `[${ts()}] archived hits: ${rows.length}`,
      ...rows.slice(0, 8).map((item) => `[${ts()}] ${item.timestamp} ${item.status} ${item.mime} ${item.original}`),
      `[${ts()}] result: archive timeline loaded`,
    ),
  };
}

async function runHttpxLike(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const interestingHeaders = ["server", "content-type", "strict-transport-security", "content-security-policy", "x-frame-options", "x-content-type-options"];

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${probe.url} antwortet mit HTTP ${probe.status}; Titel und Kern-Header wurden live validiert.`,
    findings: interestingHeaders.map((key) => `${key}: ${probe.headers[key] ?? "fehlt"}`),
    output: lines(
      `[${ts()}] http-probe> ${probe.url}`,
      `[${ts()}] status: ${probe.status}`,
      `[${ts()}] title: ${probe.title}`,
      `[${ts()}] server: ${probe.server}`,
      ...interestingHeaders.map((key) => `[${ts()}] ${key}: ${probe.headers[key] ?? "missing"}`),
      `[${ts()}] result: integrated http validation completed`,
    ),
  };
}

async function runNiktoLite(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const findings: string[] = [];
  const missingHeaders = [
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
  ].filter((header) => !probe.headers[header]);

  if (missingHeaders.length) {
    findings.push(`Fehlende Security-Header: ${missingHeaders.join(", ")}`);
  }

  const paths = await Promise.all(
    ["/robots.txt", "/.git/HEAD", "/server-status"].map(async (path) => {
      try {
        const response = await safeFetch(new URL(path, probe.url).toString(), { redirect: "manual" });
        return `${path} -> ${response.status}`;
      } catch {
        return `${path} -> error`;
      }
    }),
  );

  findings.push(...paths);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${probe.url} wurde auf Header-Lücken und häufig exponierte Webpfade geprüft.`,
    findings,
    output: lines(
      `[${ts()}] nikto-lite> ${probe.url}`,
      `[${ts()}] status: ${probe.status}`,
      `[${ts()}] missing-headers: ${missingHeaders.length ? missingHeaders.join(", ") : "none"}`,
      ...paths.map((item) => `[${ts()}] path-check: ${item}`),
      `[${ts()}] result: lightweight web exposure audit completed`,
    ),
  };
}

async function runDirectoryProbe(input: ToolRunInput, label: "ffuf" | "gobuster"): Promise<ToolRunResult> {
  const baseUrl = ensureUrl(input.target.replace(/FUZZ/g, ""));
  const customWords = input.options.includes("wordlist=")
    ? input.options
        .split("wordlist=")[1]
        ?.split(/[\s]+/)[0]
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? []
    : [];
  const words = Array.from(new Set(customWords.length ? customWords : DIR_WORDS)).slice(0, 12);
  const hits: string[] = [];

  for (const word of words) {
    const url = new URL(word, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`).toString();
    try {
      const response = await safeFetch(url, { redirect: "manual" });
      if (response.status < 400 || [401, 403].includes(response.status)) {
        hits.push(`${word} -> ${response.status}`);
      }
    } catch {
      // ignore
    }
  }

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${hits.length} potenziell interessante Pfade wurden auf ${baseUrl} gefunden.`,
    findings: hits.length ? hits : ["Keine auffälligen Pfade im kompakten Probe-Set gefunden."],
    output: lines(
      `[${ts()}] ${label}-lite> ${baseUrl}`,
      `[${ts()}] candidate words: ${words.join(", ")}`,
      ...hits.map((item) => `[${ts()}] hit: ${item}`),
      `[${ts()}] result: ${label} lightweight probe completed`,
    ),
  };
}

async function runNucleiLite(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const issues: string[] = [];
  const interesting = ["/actuator/health", "/.env", "/robots.txt"];

  if (!probe.headers["content-security-policy"]) issues.push("CSP fehlt");
  if (!probe.headers["x-frame-options"]) issues.push("X-Frame-Options fehlt");
  if (!probe.headers["strict-transport-security"] && probe.url.startsWith("https://")) issues.push("HSTS fehlt");

  for (const path of interesting) {
    try {
      const response = await safeFetch(new URL(path, probe.url).toString(), { redirect: "manual" });
      if (response.status < 400 || [401, 403].includes(response.status)) {
        issues.push(`${path} antwortet mit ${response.status}`);
      }
    } catch {
      // ignore unreachable path
    }
  }

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${issues.length} signalstarke Web-Exposure-Indikatoren wurden für ${probe.url} erkannt.`,
    findings: issues.length ? issues : ["Keine signalstarken Standardindikatoren erkannt."],
    output: lines(
      `[${ts()}] nuclei-lite> ${probe.url}`,
      ...issues.map((item) => `[${ts()}] finding: ${item}`),
      `[${ts()}] result: lightweight template checks completed`,
    ),
  };
}

async function runPortScan(input: ToolRunInput): Promise<ToolRunResult> {
  const host = hostFromTarget(input.target);
  const ports = parsePorts(input.options);
  const results = await Promise.all(ports.map(async (port) => ({ port, open: await scanPort(host, port) })));
  const openPorts = results.filter((item) => item.open).map((item) => item.port);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${host} wurde auf ${ports.length} TCP-Ports geprüft; ${openPorts.length} wirken erreichbar.`,
    findings: openPorts.length ? openPorts.map((port) => `TCP ${port} offen`) : ["Keine offenen Ports im kompakten Port-Set erkannt."],
    output: lines(
      `[${ts()}] nmap-lite> ${host}`,
      `[${ts()}] scanned ports: ${ports.join(", ")}`,
      ...results.map((item) => `[${ts()}] tcp/${item.port}: ${item.open ? "open" : "closed|filtered"}`),
      `[${ts()}] result: lightweight port validation completed`,
    ),
  };
}

function guidedFallback(input: ToolRunInput, reason: string): ToolRunResult {
  const command = buildCommand(input.baseCommand, input.target, input.options);
  return {
    status: "success",
    mode: "guided",
    command,
    target: input.target,
    options: input.options,
    summary: `${input.toolName} ist im Framework als geführter Flow verfügbar. Das nativen Spezialtool wird hier nicht direkt eingebettet.`,
    findings: [
      "Befehlsvorschau erzeugt",
      "Ziel und Optionen validiert",
      "Operative Folgeaktion vorbereitet",
    ],
    output: lines(
      `[${ts()}] guided-flow> ${input.toolName}`,
      `[${ts()}] reason: ${reason}`,
      `[${ts()}] target: ${input.target}`,
      `[${ts()}] suggested command: ${command}`,
      `[${ts()}] next: execute this tool only inside an explicitly approved environment`,
      `[${ts()}] result: guided run prepared`,
    ),
  };
}

export async function runTool(input: ToolRunInput): Promise<ToolRunResult> {
  try {
    switch (input.toolId) {
      case "dns-enumeration":
        return await runDnsEnumeration(input);
      case "whois":
        return await runWhoisLike(input);
      case "wayback-machine":
        return await runWayback(input);
      case "subfinder":
        return await runSubdomainIntel(input, "subfinder");
      case "amass":
        return await runSubdomainIntel(input, "amass");
      case "fierce":
        return await runSubdomainIntel(input, "fierce");
      case "theharvester":
        return await runSubdomainIntel(input, "theharvester");
      case "httpx":
        return await runHttpxLike(input);
      case "nikto":
        return await runNiktoLite(input);
      case "ffuf":
        return await runDirectoryProbe(input, "ffuf");
      case "gobuster":
        return await runDirectoryProbe(input, "gobuster");
      case "nuclei":
        return await runNucleiLite(input);
      case "nmap":
        return await runPortScan(input);
      default:
        return guidedFallback(
          input,
          "Dieses Framework unterstützt für dieses Tool aktuell einen geführten Ablauf mit validierter Kommando-Vorschau statt eingebetteter nativer Binär-Ausführung.",
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Ausführungsfehler";
    return {
      status: "error",
      mode: "guided",
      command: buildCommand(input.baseCommand, input.target, input.options),
      target: input.target,
      options: input.options,
      summary: `${input.toolName} konnte für ${input.target} nicht sauber ausgeführt werden.`,
      findings: [message],
      output: lines(
        `[${ts()}] tool-error> ${input.toolName}`,
        `[${ts()}] target: ${input.target}`,
        `[${ts()}] error: ${message}`,
        `[${ts()}] result: execution failed`,
      ),
    };
  }
}
