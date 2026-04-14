import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  defaultSettings,
  type JobStatus,
  type ToolCategory,
  type ToolDefinition,
} from "@/lib/cyber-data";

type SettingsState = typeof defaultSettings;

export type AuditJob = {
  id: string;
  toolId: string;
  toolName: string;
  icon: string;
  category: ToolCategory;
  target: string;
  options: string;
  command: string;
  status: JobStatus;
  output: string;
  startedAt: string;
  finishedAt?: string;
  summary: string;
};

type AuditContextValue = {
  jobs: AuditJob[];
  settings: SettingsState;
  runTool: (tool: ToolDefinition, payload: { target: string; options: string }) => Promise<AuditJob>;
  updateSettings: (patch: Partial<SettingsState>) => void;
  clearHistory: () => void;
};

const AuditContext = createContext<AuditContextValue | undefined>(undefined);

function buildCommand(tool: ToolDefinition, target: string, options: string) {
  const normalizedOptions = options.trim();
  const suffix = normalizedOptions.length > 0 ? ` ${normalizedOptions}` : "";
  return `${tool.baseCommand}${suffix} ${target}`.trim();
}

function buildOutput(tool: ToolDefinition, target: string, options: string, status: JobStatus) {
  const timestamp = new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lines = [
    `[${timestamp}] advisor@secure-console:~$ ${buildCommand(tool, target, options)}`,
    `[${timestamp}] scope_check: authorization confirmed for ${target}`,
    `[${timestamp}] fingerprint: ${tool.name} mapped ${tool.guide.objective.toLowerCase()}`,
  ];

  if (tool.category === "osint") {
    lines.push(
      `[${timestamp}] passive_sources: public references, archive context and entity links enumerated`,
      `[${timestamp}] correlation: candidate artifacts normalized into review queue`,
    );
  }

  if (tool.category === "recon") {
    lines.push(
      `[${timestamp}] discovery: live hosts and surface indicators clustered by exposure`,
      `[${timestamp}] validation: follow-up actions recommended only for in-scope assets`,
    );
  }

  if (tool.category === "pentest") {
    lines.push(
      `[${timestamp}] advisory_mode: active validation profile enabled within approved boundaries`,
      `[${timestamp}] evidence: terminal transcript prepared for report export`,
    );
  }

  if (status === "error") {
    lines.push(`[${timestamp}] result: target ${target} requires manual analyst review due to conflicting signals`);
  } else {
    lines.push(`[${timestamp}] result: ${tool.name} simulation finished with verified evidence markers for ${target}`);
  }

  return lines.join("\n");
}

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<AuditJob[]>([
    {
      id: "seed-job-1",
      toolId: "subfinder",
      toolName: "Subfinder",
      icon: "🧩",
      category: "recon",
      target: "corp.example.com",
      options: "-silent -all",
      command: "subfinder -silent -all corp.example.com",
      status: "success",
      output:
        "[08:15:22] advisor@secure-console:~$ subfinder -silent -all corp.example.com\n[08:15:22] discovery: 18 candidate assets normalized\n[08:15:22] validation: httpx follow-up recommended for 11 hosts",
      startedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      finishedAt: new Date(Date.now() - 1000 * 60 * 46).toISOString(),
      summary: "11 live Subdomains priorisiert für HTTP-Validierung.",
    },
    {
      id: "seed-job-2",
      toolId: "theharvester",
      toolName: "theHarvester",
      icon: "📇",
      category: "osint",
      target: "example.com",
      options: "-b all -l 200",
      command: "theHarvester -b all -l 200 example.com",
      status: "scanning",
      output:
        "[08:23:10] advisor@secure-console:~$ theHarvester -b all -l 200 example.com\n[08:23:10] passive_sources: query federation started\n[08:23:11] correlation: candidate emails and hosts queued for validation",
      startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      summary: "Passive Quellensammlung läuft für Marken- und Infrastrukturbezüge.",
    },
    {
      id: "seed-job-3",
      toolId: "nmap",
      toolName: "Nmap",
      icon: "🛰️",
      category: "pentest",
      target: "10.0.10.21",
      options: "-sV -Pn -T4",
      command: "nmap -sV -Pn -T4 10.0.10.21",
      status: "idle",
      output:
        "[08:31:44] ready: controlled validation queued\n[08:31:44] note: active probe pending analyst release",
      startedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      summary: "Aktive Prüfung vorbereitet und auf Freigabe wartend.",
    },
  ]);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const runTool = useCallback(
    async (tool: ToolDefinition, payload: { target: string; options: string }) => {
      const target = payload.target.trim() || tool.sampleTarget;
      const options = payload.options.trim() || tool.defaultOptions;
      const command = buildCommand(tool, target, options);
      const startedAt = new Date().toISOString();
      const id = `${tool.id}-${Date.now()}`;
      const optimisticJob: AuditJob = {
        id,
        toolId: tool.id,
        toolName: tool.name,
        icon: tool.icon,
        category: tool.category,
        target,
        options,
        command,
        status: "scanning",
        output: buildOutput(tool, target, options, "scanning"),
        startedAt,
        summary: `${tool.name} analysiert ${target} innerhalb des autorisierten Prüfpfads.`,
      };

      setJobs((current) => [optimisticJob, ...current].slice(0, 18));

      await new Promise((resolve) => setTimeout(resolve, 1900 + Math.random() * 1600));
      const finalStatus: JobStatus = Math.random() > 0.18 ? "success" : "error";
      const finishedAt = new Date().toISOString();
      const finalizedJob: AuditJob = {
        ...optimisticJob,
        status: finalStatus,
        finishedAt,
        output: buildOutput(tool, target, options, finalStatus),
        summary:
          finalStatus === "success"
            ? `${tool.name} hat verwertbare Evidenzmarker für ${target} erzeugt.`
            : `${tool.name} meldet inkonsistente Signale und verlangt manuelle Validierung für ${target}.`,
      };

      setJobs((current) =>
        current.map((job) => (job.id === optimisticJob.id ? finalizedJob : job)),
      );

      return finalizedJob;
    },
    [],
  );

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const clearHistory = useCallback(() => {
    setJobs([]);
  }, []);

  const value = useMemo(
    () => ({ jobs, settings, runTool, updateSettings, clearHistory }),
    [jobs, settings, runTool, updateSettings, clearHistory],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error("useAudit must be used within AuditProvider");
  }

  return context;
}

export function useReportSummary() {
  const { jobs } = useAudit();

  return useMemo(() => {
    const completed = jobs.filter((job) => job.status === "success");
    const flagged = jobs.filter((job) => job.status === "error");
    const running = jobs.filter((job) => job.status === "scanning");

    return {
      total: jobs.length,
      completed: completed.length,
      flagged: flagged.length,
      running: running.length,
      latestFindings: completed.slice(0, 5),
    };
  }, [jobs]);
}
