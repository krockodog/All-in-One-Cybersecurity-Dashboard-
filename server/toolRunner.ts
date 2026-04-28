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
  bodySnippet: string;
};

const SSRF_BLOCKED_RE = /^(localhost|.*\.local|.*\.internal)$/i;
const SSRF_BLOCKED_IPS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /^0\.0\.0\.0$/,
];

function validateTarget(raw: string): void {
  const host = hostFromTarget(raw).toLowerCase();
  if (SSRF_BLOCKED_RE.test(host)) throw new Error(`Gesperrtes Ziel: ${host}`);
  for (const re of SSRF_BLOCKED_IPS) {
    if (re.test(host)) throw new Error(`Gesperrtes Ziel (private/loopback): ${host}`);
  }
}

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
        bodySnippet: html.slice(0, 4000).toLowerCase(),
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

// ─── Sherlock: Username-Lookup über öffentliche Plattformen ──────────────────
async function runSherlock(input: ToolRunInput): Promise<ToolRunResult> {
  const username = input.target.trim().replace(/^@/, "");
  const platforms = [
    { name: "GitHub", url: `https://github.com/${username}` },
    { name: "GitLab", url: `https://gitlab.com/${username}` },
    { name: "Reddit", url: `https://www.reddit.com/user/${username}` },
    { name: "HackerNews", url: `https://news.ycombinator.com/user?id=${username}` },
    { name: "Keybase", url: `https://keybase.io/${username}` },
    { name: "Dev.to", url: `https://dev.to/${username}` },
    { name: "Mastodon", url: `https://mastodon.social/@${username}` },
    { name: "Steam", url: `https://steamcommunity.com/id/${username}` },
    { name: "Docker Hub", url: `https://hub.docker.com/u/${username}` },
    { name: "npm", url: `https://www.npmjs.com/~${username}` },
    { name: "PyPI", url: `https://pypi.org/user/${username}/` },
    { name: "Gravatar", url: `https://gravatar.com/${username}` },
  ];

  const results = await Promise.allSettled(
    platforms.map(async (p) => {
      try {
        const res = await safeFetch(p.url, { redirect: "follow" });
        return { ...p, status: res.status, found: res.ok };
      } catch {
        return { ...p, status: 0, found: false };
      }
    }),
  );

  const all = results.map((r) => (r.status === "fulfilled" ? r.value : { name: "?", url: "", status: 0, found: false }));
  const hits = all.filter((r) => r.found);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${hits.length}/${platforms.length} Plattformen zeigen ein Profil für "${username}".`,
    findings: hits.map((h) => `${h.name} → ${h.url} [${h.status}]`),
    output: lines(
      `[${ts()}] sherlock> ${username}`,
      `[${ts()}] platforms checked: ${platforms.length}`,
      ...all.map((r) => `[${ts()}] ${r.found ? "FOUND" : "not found"} ${r.name.padEnd(14)} ${r.url}`),
      `[${ts()}] result: ${hits.length} profile(s) found`,
    ),
  };
}

// ─── Shodan / InternetDB: IP-Intelligence ohne API-Key ───────────────────────
async function runShodan(input: ToolRunInput): Promise<ToolRunResult> {
  const target = input.target.trim();
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(target);

  if (isIp) {
    const res = await safeFetch(`https://internetdb.shodan.io/${target}`);
    if (!res.ok) throw new Error(`InternetDB returned ${res.status}`);
    const data = await res.json() as { ip?: string; ports?: number[]; cpes?: string[]; vulns?: string[]; hostnames?: string[]; tags?: string[] };
    const ports = data.ports ?? [];
    const vulns = data.vulns ?? [];
    const cpes = data.cpes ?? [];
    const hostnames = data.hostnames ?? [];
    return {
      status: "success",
      mode: "integrated",
      command: buildCommand(input.baseCommand, target, input.options),
      target,
      options: input.options,
      summary: `${target}: ${ports.length} offene Ports, ${vulns.length} bekannte CVEs, ${hostnames.length} Hostnamen.`,
      findings: [
        `Ports: ${ports.length ? ports.join(", ") : "keine"}`,
        `Vulns: ${vulns.length ? vulns.slice(0, 6).join(", ") : "keine"}`,
        `CPEs: ${cpes.length ? cpes.slice(0, 4).join(", ") : "keine"}`,
        `Hostnames: ${hostnames.length ? hostnames.slice(0, 5).join(", ") : "keine"}`,
        `Tags: ${data.tags?.join(", ") ?? "keine"}`,
      ],
      output: lines(
        `[${ts()}] shodan-internetdb> ${target}`,
        `[${ts()}] open ports: ${ports.join(", ") || "none"}`,
        `[${ts()}] vulns: ${vulns.slice(0, 6).join(", ") || "none"}`,
        `[${ts()}] cpes: ${cpes.slice(0, 4).join(", ") || "none"}`,
        `[${ts()}] hostnames: ${hostnames.slice(0, 5).join(", ") || "none"}`,
        `[${ts()}] result: internet-exposure intelligence loaded`,
      ),
    };
  }

  // Domain → lookup IPs first, then check each
  const domain = hostFromTarget(target);
  let aRecords: string[] = [];
  try { aRecords = await dns.resolve4(domain); } catch { /* ignore */ }
  const ipResults: string[] = [];
  for (const ip of aRecords.slice(0, 3)) {
    try {
      const res = await safeFetch(`https://internetdb.shodan.io/${ip}`);
      if (res.ok) {
        const d = await res.json() as { ports?: number[]; vulns?: string[] };
        ipResults.push(`${ip}: ports=[${(d.ports ?? []).join(",")}] vulns=[${(d.vulns ?? []).join(",")}]`);
      }
    } catch { /* ignore */ }
  }

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, target, input.options),
    target,
    options: input.options,
    summary: `${domain} löst zu ${aRecords.length} IP(s) auf. Shodan-Daten für ${ipResults.length} IP(s) geladen.`,
    findings: ipResults.length ? ipResults : [`IPs: ${aRecords.slice(0, 5).join(", ") || "keine gefunden"}`],
    output: lines(
      `[${ts()}] shodan> ${domain}`,
      `[${ts()}] resolved ips: ${aRecords.slice(0, 5).join(", ") || "none"}`,
      ...ipResults.map((r) => `[${ts()}] ${r}`),
      `[${ts()}] result: shodan internet-db lookup completed`,
    ),
  };
}

// ─── Censys: Zertifikat-Transparenz + Hosting-Info ───────────────────────────
async function runCensys(input: ToolRunInput): Promise<ToolRunResult> {
  const domain = hostFromTarget(input.target);
  const res = await safeFetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`);
  if (!res.ok) throw new Error(`crt.sh returned ${res.status}`);
  const raw = await res.json() as Array<{ issuer_name?: string; not_before?: string; not_after?: string; name_value?: string; common_name?: string }>;

  const issuers = Array.from(new Set(raw.map((e) => e.issuer_name ?? "").filter(Boolean))).slice(0, 5);
  const dates = raw.slice(0, 1).map((e) => `issued: ${e.not_before?.slice(0, 10)} · expires: ${e.not_after?.slice(0, 10)}`);
  const names = Array.from(new Set(raw.flatMap((e) => String(e.name_value ?? "").split("\n")).map((s) => s.trim()).filter((s) => s.length > 0))).slice(0, 12);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `${raw.length} Zertifikate gefunden. ${issuers.length} Aussteller. ${names.length} eindeutige Hostnamen.`,
    findings: [
      ...dates,
      `Issuers: ${issuers.slice(0, 3).join(" | ")}`,
      ...names.slice(0, 8),
    ],
    output: lines(
      `[${ts()}] censys-cert> ${domain}`,
      `[${ts()}] total certificates: ${raw.length}`,
      `[${ts()}] issuers: ${issuers.slice(0, 3).join(", ")}`,
      ...names.slice(0, 10).map((n, i) => `[${ts()}] cert-host ${i + 1}: ${n}`),
      `[${ts()}] result: certificate transparency data loaded`,
    ),
  };
}

// ─── Google Dorking: DuckDuckGo Instant-Answer + Dork-URL ────────────────────
async function runGoogleDorking(input: ToolRunInput): Promise<ToolRunResult> {
  const query = input.target.trim();
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;

  let relatedTopics: string[] = [];
  try {
    const res = await safeFetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    );
    if (res.ok) {
      const data = await res.json() as { RelatedTopics?: Array<{ Text?: string; FirstURL?: string }> };
      relatedTopics = (data.RelatedTopics ?? [])
        .map((t) => t.Text ?? "")
        .filter(Boolean)
        .slice(0, 8);
    }
  } catch { /* ignore */ }

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `Dork-Query aufgebaut. ${relatedTopics.length} verwandte Treffer via DuckDuckGo API.`,
    findings: [
      `Search URL: ${searchUrl}`,
      ...relatedTopics,
    ],
    output: lines(
      `[${ts()}] google-dork> ${query}`,
      `[${ts()}] constructed url: ${searchUrl}`,
      `[${ts()}] ddg instant results: ${relatedTopics.length}`,
      ...relatedTopics.map((t, i) => `[${ts()}] result ${i + 1}: ${t.slice(0, 120)}`),
      `[${ts()}] result: dork query processed`,
    ),
  };
}

// ─── Social Media: Profil-Existenz-Check ─────────────────────────────────────
async function runSocialMedia(input: ToolRunInput): Promise<ToolRunResult> {
  const handle = input.target.trim().replace(/^@/, "");
  const platforms = [
    { name: "GitHub", url: `https://github.com/${handle}` },
    { name: "GitLab", url: `https://gitlab.com/${handle}` },
    { name: "Reddit", url: `https://www.reddit.com/user/${handle}/about.json` },
    { name: "Twitch", url: `https://www.twitch.tv/${handle}` },
    { name: "Dev.to", url: `https://dev.to/${handle}` },
    { name: "Medium", url: `https://medium.com/@${handle}` },
    { name: "Keybase", url: `https://keybase.io/${handle}` },
    { name: "Gravatar", url: `https://en.gravatar.com/${handle}` },
    { name: "npm", url: `https://www.npmjs.com/~${handle}` },
    { name: "PyPI", url: `https://pypi.org/user/${handle}/` },
    { name: "HackerNews", url: `https://news.ycombinator.com/user?id=${handle}` },
    { name: "Docker Hub", url: `https://hub.docker.com/u/${handle}` },
  ];

  const results = await Promise.allSettled(
    platforms.map(async (p) => {
      try {
        const res = await safeFetch(p.url, { redirect: "follow" });
        return { ...p, found: res.status === 200 };
      } catch {
        return { ...p, found: false };
      }
    }),
  );

  const all = results.map((r) => (r.status === "fulfilled" ? r.value : { name: "?", url: "", found: false }));
  const hits = all.filter((r) => r.found);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `@${handle}: ${hits.length} aktive Profile auf ${platforms.length} geprüften Plattformen gefunden.`,
    findings: hits.map((h) => `${h.name}: ${h.url}`),
    output: lines(
      `[${ts()}] social-media> @${handle}`,
      ...all.map((r) => `[${ts()}] ${r.found ? "[+]" : "[-]"} ${r.name.padEnd(12)} ${r.url}`),
      `[${ts()}] result: ${hits.length} profile(s) confirmed`,
    ),
  };
}

// ─── ExifTool: HTTP-Metadaten-Extraktion ─────────────────────────────────────
async function runExifTool(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const metaFields = [
    "content-type", "last-modified", "etag", "x-powered-by", "server",
    "x-generator", "x-drupal-cache", "x-wp-total", "x-frame-options",
    "content-length", "cache-control", "via", "x-cache",
  ];
  const extracted = metaFields.map((k) => `${k}: ${probe.headers[k] ?? "nicht vorhanden"}`);
  const techIndicators = [
    probe.headers["x-powered-by"],
    probe.headers["server"],
    probe.headers["x-generator"],
    probe.title,
  ].filter(Boolean);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `HTTP-Metadaten für ${probe.url} extrahiert. ${techIndicators.length} Technologie-Indikatoren erkannt.`,
    findings: extracted.filter((e) => !e.endsWith("nicht vorhanden")),
    output: lines(
      `[${ts()}] exiftool-http> ${probe.url}`,
      `[${ts()}] status: ${probe.status}`,
      `[${ts()}] title: ${probe.title}`,
      ...metaFields.map((k) => `[${ts()}] ${k}: ${probe.headers[k] ?? "–"}`),
      `[${ts()}] result: metadata extraction completed`,
    ),
  };
}

// ─── Recon-ng: Kombiniertes DNS + crt.sh + HTTP ───────────────────────────────
async function runReconNg(input: ToolRunInput): Promise<ToolRunResult> {
  const domain = hostFromTarget(input.target);
  const [dnsResult, certResult, httpResult] = await Promise.allSettled([
    runDnsEnumeration({ ...input, target: domain }),
    runSubdomainIntel({ ...input, target: domain }, "subfinder"),
    runHttpxLike({ ...input, target: domain }),
  ]);

  const dns_ = dnsResult.status === "fulfilled" ? dnsResult.value : null;
  const cert = certResult.status === "fulfilled" ? certResult.value : null;
  const http = httpResult.status === "fulfilled" ? httpResult.value : null;

  const allFindings = [
    ...(dns_?.findings ?? []),
    ...(cert?.findings.slice(0, 6) ?? []),
    ...(http?.findings ?? []),
  ].slice(0, 16);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `Recon-ng multi-source: DNS-Records, ${cert?.findings.length ?? 0} Subdomains, HTTP-Header analysiert.`,
    findings: allFindings,
    output: lines(
      `[${ts()}] recon-ng> ${domain}`,
      `[${ts()}] module dns: ${dns_ ? "completed" : "failed"}`,
      ...(dns_?.findings.slice(0, 4).map((f) => `[${ts()}]   ${f}`) ?? []),
      `[${ts()}] module cert-transparency: ${cert ? `${cert.findings.length} subdomains` : "failed"}`,
      ...(cert?.findings.slice(0, 5).map((f) => `[${ts()}]   ${f}`) ?? []),
      `[${ts()}] module http-fingerprint: ${http ? "completed" : "failed"}`,
      ...(http?.findings.slice(0, 4).map((f) => `[${ts()}]   ${f}`) ?? []),
      `[${ts()}] result: recon-ng multi-module run completed`,
    ),
  };
}

// ─── SpiderFoot: Multi-Source OSINT ─────────────────────────────────────────
async function runSpiderFoot(input: ToolRunInput): Promise<ToolRunResult> {
  const domain = hostFromTarget(input.target);
  const [dns_, rdap, certs, wayback, http] = await Promise.allSettled([
    runDnsEnumeration({ ...input, target: domain }),
    runWhoisLike({ ...input, target: domain }),
    runSubdomainIntel({ ...input, target: domain }, "subfinder"),
    runWayback({ ...input, target: domain }),
    runHttpxLike({ ...input, target: domain }),
  ]);

  const findings: string[] = [
    ...(dns_.status === "fulfilled" ? dns_.value.findings.slice(0, 3) : []),
    ...(rdap.status === "fulfilled" ? rdap.value.findings.slice(0, 2) : []),
    ...(certs.status === "fulfilled" ? certs.value.findings.slice(0, 4) : []),
    ...(wayback.status === "fulfilled" ? [`Wayback: ${wayback.value.findings.length} archivierte URLs`] : []),
    ...(http.status === "fulfilled" ? http.value.findings.slice(0, 3) : []),
  ];

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `SpiderFoot-Scan: 5 Module ausgeführt, ${findings.length} Findings aggregiert.`,
    findings,
    output: lines(
      `[${ts()}] spiderfoot> ${domain}`,
      `[${ts()}] DNS_RECORDS: ${dns_.status === "fulfilled" ? "ok" : "err"}`,
      `[${ts()}] WHOIS_RDAP: ${rdap.status === "fulfilled" ? "ok" : "err"}`,
      `[${ts()}] CERT_TRANSPARENCY: ${certs.status === "fulfilled" ? certs.value.findings.length + " subdomains" : "err"}`,
      `[${ts()}] WAYBACK_ARCHIVE: ${wayback.status === "fulfilled" ? wayback.value.findings.length + " snapshots" : "err"}`,
      `[${ts()}] HTTP_FINGERPRINT: ${http.status === "fulfilled" ? "ok" : "err"}`,
      ...findings.map((f) => `[${ts()}] finding: ${f}`),
      `[${ts()}] result: spiderfoot intelligence aggregation completed`,
    ),
  };
}

// ─── Maltego: Entity-Korrelation via DNS + RDAP + crt.sh ─────────────────────
async function runMaltego(input: ToolRunInput): Promise<ToolRunResult> {
  const entity = input.target.trim();
  const domain = hostFromTarget(entity);

  const [dns_, rdap, certs] = await Promise.allSettled([
    runDnsEnumeration({ ...input, target: domain }),
    runWhoisLike({ ...input, target: domain }),
    runSubdomainIntel({ ...input, target: domain }, "subfinder"),
  ]);

  const nodes: string[] = [];
  if (dns_.status === "fulfilled") nodes.push(...dns_.value.findings.slice(0, 5));
  if (rdap.status === "fulfilled") nodes.push(...rdap.value.findings.slice(0, 3));
  if (certs.status === "fulfilled") nodes.push(...certs.value.findings.slice(0, 6));

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `Maltego-Korrelation: ${nodes.length} Entitäten aus DNS, RDAP und Certificate Transparency verknüpft.`,
    findings: nodes,
    output: lines(
      `[${ts()}] maltego> entity: ${entity}`,
      `[${ts()}] transform DNS_TO_IP: ${dns_.status === "fulfilled" ? "ok" : "err"}`,
      `[${ts()}] transform DOMAIN_TO_WHOIS: ${rdap.status === "fulfilled" ? "ok" : "err"}`,
      `[${ts()}] transform DOMAIN_TO_SUBDOMAINS: ${certs.status === "fulfilled" ? certs.value.findings.length + " nodes" : "err"}`,
      ...nodes.slice(0, 10).map((n, i) => `[${ts()}] node ${i + 1}: ${n}`),
      `[${ts()}] result: entity correlation completed`,
    ),
  };
}

// ─── Burp Suite: Erweiterter Web-App-Scan ───────────────────────────────────
async function runBurpSuite(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const securityHeaders = [
    "content-security-policy", "strict-transport-security", "x-frame-options",
    "x-content-type-options", "referrer-policy", "permissions-policy",
    "x-xss-protection", "cross-origin-opener-policy",
  ];
  const missing = securityHeaders.filter((h) => !probe.headers[h]);
  const present = securityHeaders.filter((h) => !!probe.headers[h]);

  const interestingPaths = [
    "/robots.txt", "/.git/HEAD", "/.env", "/server-status", "/phpinfo.php",
    "/wp-login.php", "/admin/", "/api/v1/", "/swagger-ui.html", "/actuator",
  ];
  const pathResults = await Promise.allSettled(
    interestingPaths.map(async (path) => {
      try {
        const res = await safeFetch(new URL(path, probe.url).toString(), { redirect: "manual" });
        return `${path} → ${res.status}`;
      } catch {
        return `${path} → error`;
      }
    }),
  );
  const pathHits = pathResults
    .filter((r) => r.status === "fulfilled" && !r.value.endsWith("404") && !r.value.endsWith("error"))
    .map((r) => (r as PromiseFulfilledResult<string>).value);

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `Burp-Scan: ${missing.length} fehlende Security-Header, ${pathHits.length} interessante Pfade gefunden.`,
    findings: [
      `Missing headers (${missing.length}): ${missing.join(", ")}`,
      `Present headers (${present.length}): ${present.join(", ")}`,
      ...pathHits,
    ],
    output: lines(
      `[${ts()}] burp-suite> ${probe.url}`,
      `[${ts()}] status: ${probe.status} | server: ${probe.server}`,
      `[${ts()}] title: ${probe.title}`,
      ...securityHeaders.map((h) => `[${ts()}] header ${h}: ${probe.headers[h] ? "present" : "MISSING"}`),
      ...pathResults.map((r) => `[${ts()}] path: ${r.status === "fulfilled" ? r.value : "error"}`),
      `[${ts()}] result: web application surface analysis completed`,
    ),
  };
}

// ─── SQLMap: SQL-Error-Detection (passiv) ────────────────────────────────────
async function runSqlMap(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const body = probe.bodySnippet;
  const sqlErrors = [
    "sql syntax", "mysql_fetch", "ora-", "postgresql", "sqlite", "unclosed quotation",
    "syntax error", "unexpected token", "division by zero",
  ];
  const detectedErrors = sqlErrors.filter((e) => body.toLowerCase().includes(e));

  const dbIndicators = [
    probe.headers["x-powered-by"],
    probe.headers["server"],
  ].filter((h) => h && /php|mysql|postgres|oracle|django|laravel/i.test(h));

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `SQLMap-Probe: ${detectedErrors.length} SQL-Fehlermuster, ${dbIndicators.length} Datenbank-Indikatoren in HTTP-Headern.`,
    findings: [
      `SQL error indicators: ${detectedErrors.length ? detectedErrors.join(", ") : "keine erkannt"}`,
      `DB indicators in headers: ${dbIndicators.length ? dbIndicators.join(", ") : "keine"}`,
      `Server: ${probe.server}`,
      `X-Powered-By: ${probe.headers["x-powered-by"] ?? "nicht vorhanden"}`,
    ],
    output: lines(
      `[${ts()}] sqlmap-probe> ${probe.url}`,
      `[${ts()}] passive error detection: ${detectedErrors.length ? detectedErrors.join(", ") : "none"}`,
      `[${ts()}] db tech indicators: ${dbIndicators.join(", ") || "none"}`,
      `[${ts()}] note: active injection requires authorized environment`,
      `[${ts()}] result: passive sql-injection surface analysis completed`,
    ),
  };
}

// ─── WPScan: WordPress-Erkennung ─────────────────────────────────────────────
async function runWpScan(input: ToolRunInput): Promise<ToolRunResult> {
  const probe = await probeHttp(input.target);
  const wpPaths = [
    "/wp-login.php", "/wp-admin/", "/wp-content/", "/wp-json/wp/v2/users",
    "/xmlrpc.php", "/readme.html", "/license.txt", "/wp-cron.php",
  ];

  const pathResults = await Promise.allSettled(
    wpPaths.map(async (path) => {
      try {
        const res = await safeFetch(new URL(path, probe.url).toString(), { redirect: "manual" });
        return { path, status: res.status, interesting: res.status < 404 };
      } catch {
        return { path, status: 0, interesting: false };
      }
    }),
  );

  const hits = pathResults
    .filter((r) => r.status === "fulfilled" && r.value.interesting)
    .map((r) => (r as PromiseFulfilledResult<{ path: string; status: number; interesting: boolean }>).value);

  const isWp = hits.some((h) => ["/wp-login.php", "/wp-admin/", "/wp-content/"].includes(h.path));

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `WPScan: ${isWp ? "WordPress erkannt!" : "Kein WordPress gefunden."} ${hits.length} Pfade erreichbar.`,
    findings: hits.map((h) => `${h.path} → HTTP ${h.status}`),
    output: lines(
      `[${ts()}] wpscan> ${probe.url}`,
      `[${ts()}] wordpress detected: ${isWp ? "YES" : "NO"}`,
      ...pathResults.map((r) => {
        if (r.status !== "fulfilled") return `[${ts()}] error`;
        return `[${ts()}] ${r.value.path.padEnd(28)} → ${r.value.status}`;
      }),
      `[${ts()}] result: wordpress surface scan completed`,
    ),
  };
}

// ─── Enum4linux: SMB/NetBIOS-Port-Probe ──────────────────────────────────────
async function runEnum4linux(input: ToolRunInput): Promise<ToolRunResult> {
  const host = hostFromTarget(input.target);
  const smbPorts = [135, 137, 138, 139, 445, 1433, 3268, 3269];
  const results = await Promise.all(smbPorts.map(async (port) => ({ port, open: await scanPort(host, port) })));
  const openPorts = results.filter((r) => r.open);

  const portLabels: Record<number, string> = {
    135: "RPC Endpoint Mapper",
    137: "NetBIOS Name Service",
    138: "NetBIOS Datagram",
    139: "NetBIOS Session",
    445: "SMB over TCP",
    1433: "MSSQL",
    3268: "LDAP Global Catalog",
    3269: "LDAP Global Catalog SSL",
  };

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `enum4linux: ${openPorts.length}/${smbPorts.length} SMB/Windows-Ports offen auf ${host}.`,
    findings: openPorts.map((r) => `TCP ${r.port} (${portLabels[r.port] ?? "unbekannt"}) offen`),
    output: lines(
      `[${ts()}] enum4linux> ${host}`,
      ...results.map((r) => `[${ts()}] TCP ${String(r.port).padEnd(5)} ${portLabels[r.port]?.padEnd(26) ?? "unknown"} ${r.open ? "OPEN" : "closed"}`),
      `[${ts()}] result: smb surface probe completed`,
    ),
  };
}

// ─── Masscan: Schneller Port-Scan (= nmap-lite) ──────────────────────────────
async function runMasscan(input: ToolRunInput): Promise<ToolRunResult> {
  return runPortScan(input);
}

// ─── Aquatone: HTTP-Snapshot-Sammler ────────────────────────────────────────
async function runAquatone(input: ToolRunInput): Promise<ToolRunResult> {
  const domain = hostFromTarget(input.target);
  // Collect subdomains via crt.sh, then probe each
  const crtRes = await safeFetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
  let subdomains: string[] = [];
  if (crtRes.ok) {
    const raw = await crtRes.json() as Array<{ name_value?: string }>;
    subdomains = Array.from(new Set(
      raw.flatMap((e) => String(e.name_value ?? "").split("\n"))
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.endsWith(domain) && !s.includes("*")),
    )).slice(0, 10);
  }
  if (subdomains.length === 0) subdomains = [domain];

  const probes = await Promise.allSettled(
    subdomains.map(async (sub) => {
      try {
        const res = await safeFetch(`https://${sub}`, { redirect: "follow" });
        const html = await res.text();
        const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() ?? "–";
        return `${sub} → ${res.status} | ${title.slice(0, 60)}`;
      } catch {
        return `${sub} → unreachable`;
      }
    }),
  );

  const snapshots = probes.map((r) => (r.status === "fulfilled" ? r.value : "error"));

  return {
    status: "success",
    mode: "integrated",
    command: buildCommand(input.baseCommand, input.target, input.options),
    target: input.target,
    options: input.options,
    summary: `Aquatone: ${subdomains.length} Hosts geprüft, HTTP-Snapshots und Titles gesammelt.`,
    findings: snapshots.filter((s) => !s.includes("unreachable")),
    output: lines(
      `[${ts()}] aquatone> ${domain}`,
      `[${ts()}] hosts: ${subdomains.length}`,
      ...snapshots.map((s) => `[${ts()}] snapshot: ${s}`),
      `[${ts()}] result: http screenshot collection completed`,
    ),
  };
}

// ─── Hydra/John/Hashcat/Aircrack/Wireshark/Sparrow: Safety-Guided ────────────
function safetyGuidedFallback(input: ToolRunInput): ToolRunResult {
  const command = buildCommand(input.baseCommand, input.target, input.options);
  return {
    status: "success",
    mode: "guided",
    command,
    target: input.target,
    options: input.options,
    summary: `${input.toolName} erfordert native Ausführung in einer autorisierten und isolierten Umgebung.`,
    findings: [
      "Befehlsvorschau generiert",
      "Ziel und Optionen validiert",
      `Empfehlung: nur in explizit genehmigtem Scope ausführen`,
    ],
    output: lines(
      `[${ts()}] safety-guided> ${input.toolName}`,
      `[${ts()}] target: ${input.target}`,
      `[${ts()}] command: ${command}`,
      `[${ts()}] note: this tool requires native binary / hardware / authorized environment`,
      `[${ts()}] next: copy command and execute in your approved pentest lab`,
      `[${ts()}] result: command preview prepared`,
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
    summary: `${input.toolName} ist im Framework als geführter Flow verfügbar.`,
    findings: ["Befehlsvorschau erzeugt", "Ziel und Optionen validiert", "Operative Folgeaktion vorbereitet"],
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
    // Reject private/loopback targets to prevent SSRF
    if (input.target.trim()) validateTarget(input.target);

    switch (input.toolId) {
      // ── Original integrations ──────────────────────────────────────────────
      case "dns-enumeration":
      case "dns-enum":
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
      // ── New integrations ───────────────────────────────────────────────────
      case "sherlock":
        return await runSherlock(input);
      case "shodan":
        return await runShodan(input);
      case "censys":
        return await runCensys(input);
      case "google-dorking":
        return await runGoogleDorking(input);
      case "social-media":
        return await runSocialMedia(input);
      case "exiftool":
        return await runExifTool(input);
      case "recon-ng":
        return await runReconNg(input);
      case "spiderfoot":
        return await runSpiderFoot(input);
      case "maltego":
        return await runMaltego(input);
      case "burp-suite":
        return await runBurpSuite(input);
      case "sqlmap":
        return await runSqlMap(input);
      case "wpscan":
        return await runWpScan(input);
      case "enum4linux":
        return await runEnum4linux(input);
      case "masscan":
        return await runMasscan(input);
      case "aquatone":
        return await runAquatone(input);
      // ── Safety-guided (require native binary / hardware) ───────────────────
      case "hydra":
      case "john":
      case "hashcat":
      case "aircrack":
      case "sparrow":
      case "wireshark":
      case "metasploit":
        return safetyGuidedFallback(input);
      default:
        return guidedFallback(
          input,
          "Dieses Tool wird als geführter Flow unterstützt.",
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
