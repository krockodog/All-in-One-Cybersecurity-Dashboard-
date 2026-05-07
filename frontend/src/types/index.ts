export type UserRole = "admin" | "pentester" | "viewer" | "auditor";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export type TargetType = "domain" | "ip" | "cidr" | "url" | "email" | "username" | "phone" | "address";

export interface Target {
  id: string;
  name: string;
  type: TargetType;
  value: string;
  tags: string[];
  findingsCount: number;
  createdAt: string;
}

export type PentestMode = "manual" | "agent";
export type PentestStatus = "draft" | "authorized" | "running" | "stopped" | "completed" | "failed";

export interface Pentest {
  id: string;
  name: string;
  mode: PentestMode;
  status: PentestStatus;
  targetIds: string[];
  toolIds: string[];
  createdAt: string;
}

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  name: string;
  severity: FindingSeverity;
  cvss: number;
  epss: number;
  cve: string;
  tool: string;
  pentestId: string;
  targetId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPentests: number;
  activePentests: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKeyRef: string;
  temperature: number;
  maxTokens: number;
  endpoint?: string;
}

export interface Settings {
  general: {
    theme: "dark" | "light" | "system";
    language: "de" | "en";
    rateLimitRps: number;
    timeoutSec: number;
    outputVerbosity: "compact" | "normal" | "verbose";
    notificationsEmail: boolean;
    notificationsInApp: boolean;
  };
  llm: Record<string, LLMConfig>;
  external: Record<string, string>;
}
