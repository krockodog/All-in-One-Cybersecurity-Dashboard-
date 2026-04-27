/**
 * Zentrale Datendefinitionen für das Cybersecurity Dashboard.
 * Tool-Katalog, Kategorien, Ausführungsmodi und operative Konfiguration.
 */

export type ToolCategory = "osint" | "pentest" | "recon";
export type ToolRisk = "passiv" | "kontrolliert" | "aktiv";
export type ExecutionMode = "web-integrated" | "command-reference" | "external";
export type JobStatus = "idle" | "scanning" | "success" | "error";

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  risk: ToolRisk;
  description: string; // Kurz, max 60 Zeichen
  executionMode: ExecutionMode;
  inputFields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "select";
    placeholder?: string;
    options?: string[];
  }>;
  commandTemplate?: string; // Für command-reference Mode
}

export const toolCatalog: ToolDefinition[] = [
  // OSINT Tools
  {
    id: "sherlock",
    name: "Sherlock",
    category: "osint",
    risk: "passiv",
    description: "Benutzernamen-Suche über Netzwerke",
    executionMode: "command-reference",
    inputFields: [{ name: "username", label: "Benutzername", type: "text" }],
    commandTemplate: "sherlock {{username}}",
  },
  {
    id: "theharvester",
    name: "theHarvester",
    category: "osint",
    risk: "passiv",
    description: "E-Mails, Subdomains und Hosts sammeln",
    executionMode: "command-reference",
    inputFields: [
      { name: "domain", label: "Domain", type: "text" },
      {
        name: "source",
        label: "Quelle",
        type: "select",
        options: ["google", "bing", "linkedin"],
      },
    ],
    commandTemplate: "theHarvester -d {{domain}} -b {{source}}",
  },
  {
    id: "maltego",
    name: "Maltego",
    category: "osint",
    risk: "passiv",
    description: "Visuelle Daten-Korrelation",
    executionMode: "external",
    inputFields: [{ name: "entity", label: "Entity", type: "text" }],
  },
  {
    id: "recon-ng",
    name: "Recon-ng",
    category: "osint",
    risk: "passiv",
    description: "Web-Reconnaissance Framework",
    executionMode: "command-reference",
    inputFields: [{ name: "target", label: "Ziel-Domain", type: "text" }],
    commandTemplate: "recon-ng -w {{target}}",
  },
  {
    id: "spiderfoot",
    name: "SpiderFoot",
    category: "osint",
    risk: "passiv",
    description: "Automatisierte OSINT-Automatisierung",
    executionMode: "external",
    inputFields: [{ name: "target", label: "Ziel", type: "text" }],
  },
  {
    id: "shodan",
    name: "Shodan",
    category: "osint",
    risk: "passiv",
    description: "IoT & Netzwerk-Suche",
    executionMode: "web-integrated",
    inputFields: [{ name: "query", label: "Suchanfrage", type: "text" }],
  },
  {
    id: "censys",
    name: "Censys",
    category: "osint",
    risk: "passiv",
    description: "Zertifikate und Host-Daten",
    executionMode: "web-integrated",
    inputFields: [{ name: "query", label: "Suchanfrage", type: "text" }],
  },
  {
    id: "google-dorking",
    name: "Google Dorking",
    category: "osint",
    risk: "passiv",
    description: "Erweiterte Google-Suche",
    executionMode: "web-integrated",
    inputFields: [{ name: "query", label: "Dork-Query", type: "text" }],
  },
  {
    id: "wayback-machine",
    name: "Wayback Machine",
    category: "osint",
    risk: "passiv",
    description: "Historische Website-Snapshots",
    executionMode: "web-integrated",
    inputFields: [{ name: "url", label: "URL", type: "text" }],
  },
  {
    id: "social-media",
    name: "Social Media Analysis",
    category: "osint",
    risk: "passiv",
    description: "Profil- und Aktivitäts-Analyse",
    executionMode: "web-integrated",
    inputFields: [{ name: "profile", label: "Profil/Handle", type: "text" }],
  },
  {
    id: "exiftool",
    name: "ExifTool",
    category: "osint",
    risk: "passiv",
    description: "Metadaten aus Dateien extrahieren",
    executionMode: "command-reference",
    inputFields: [{ name: "file", label: "Datei-URL", type: "text" }],
    commandTemplate: "exiftool {{file}}",
  },
  {
    id: "whois",
    name: "WHOIS",
    category: "osint",
    risk: "passiv",
    description: "Domain-Registrierungsdaten",
    executionMode: "web-integrated",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
  },
  {
    id: "dns-enum",
    name: "DNS Enumeration",
    category: "osint",
    risk: "passiv",
    description: "DNS-Records und Zonen auflösen",
    executionMode: "web-integrated",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
  },

  // Pentest Tools
  {
    id: "nmap",
    name: "Nmap",
    category: "pentest",
    risk: "kontrolliert",
    description: "Port-Scanning und Host-Erkennung",
    executionMode: "command-reference",
    inputFields: [{ name: "target", label: "Ziel-IP/Host", type: "text" }],
    commandTemplate: "nmap -sV {{target}}",
  },
  {
    id: "nikto",
    name: "Nikto",
    category: "pentest",
    risk: "kontrolliert",
    description: "Web-Server-Schwachstellen-Scanner",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "Ziel-URL", type: "text" }],
    commandTemplate: "nikto -h {{url}}",
  },
  {
    id: "burp-suite",
    name: "Burp Suite",
    category: "pentest",
    risk: "kontrolliert",
    description: "Web-Application-Pentest-Plattform",
    executionMode: "external",
    inputFields: [{ name: "target", label: "Ziel-URL", type: "text" }],
  },
  {
    id: "metasploit",
    name: "Metasploit",
    category: "pentest",
    risk: "aktiv",
    description: "Exploitation Framework",
    executionMode: "external",
    inputFields: [{ name: "target", label: "Ziel", type: "text" }],
  },
  {
    id: "sqlmap",
    name: "SQLMap",
    category: "pentest",
    risk: "kontrolliert",
    description: "SQL-Injection-Tester",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "Ziel-URL", type: "text" }],
    commandTemplate: "sqlmap -u {{url}} --dbs",
  },
  {
    id: "hydra",
    name: "Hydra",
    category: "pentest",
    risk: "aktiv",
    description: "Brute-Force-Login-Tester",
    executionMode: "command-reference",
    inputFields: [
      { name: "target", label: "Ziel-Host", type: "text" },
      { name: "service", label: "Service", type: "select", options: ["ssh", "ftp", "http"] },
    ],
    commandTemplate: "hydra -l admin -P wordlist.txt {{target}} {{service}}",
  },
  {
    id: "john",
    name: "John the Ripper",
    category: "pentest",
    risk: "passiv",
    description: "Passwort-Hash-Cracker",
    executionMode: "command-reference",
    inputFields: [{ name: "hashfile", label: "Hash-Datei", type: "text" }],
    commandTemplate: "john {{hashfile}}",
  },
  {
    id: "hashcat",
    name: "Hashcat",
    category: "pentest",
    risk: "passiv",
    description: "GPU-beschleunigtes Hash-Cracking",
    executionMode: "command-reference",
    inputFields: [{ name: "hashfile", label: "Hash-Datei", type: "text" }],
    commandTemplate: "hashcat -m 0 {{hashfile}} wordlist.txt",
  },
  {
    id: "aircrack",
    name: "Aircrack-ng",
    category: "pentest",
    risk: "aktiv",
    description: "WiFi-Sicherheits-Audit",
    executionMode: "external",
    inputFields: [{ name: "interface", label: "Netzwerk-Interface", type: "text" }],
  },
  {
    id: "sparrow",
    name: "Sparrow WiFi",
    category: "pentest",
    risk: "kontrolliert",
    description: "WiFi-Netzwerk-Analyzer",
    executionMode: "external",
    inputFields: [{ name: "interface", label: "Interface", type: "text" }],
  },
  {
    id: "wireshark",
    name: "Wireshark",
    category: "pentest",
    risk: "passiv",
    description: "Netzwerk-Packet-Analyzer",
    executionMode: "external",
    inputFields: [{ name: "interface", label: "Interface", type: "text" }],
  },
  {
    id: "gobuster",
    name: "Gobuster",
    category: "pentest",
    risk: "kontrolliert",
    description: "Directory & DNS Brute-Force",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "Ziel-URL", type: "text" }],
    commandTemplate: "gobuster dir -u {{url}} -w wordlist.txt",
  },
  {
    id: "wpscan",
    name: "WPScan",
    category: "pentest",
    risk: "kontrolliert",
    description: "WordPress-Schwachstellen-Scanner",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "WordPress-URL", type: "text" }],
    commandTemplate: "wpscan --url {{url}} --enumerate p,u",
  },
  {
    id: "enum4linux",
    name: "enum4linux",
    category: "pentest",
    risk: "kontrolliert",
    description: "SMB/NetBIOS-Enumeration",
    executionMode: "command-reference",
    inputFields: [{ name: "target", label: "Ziel-IP", type: "text" }],
    commandTemplate: "enum4linux {{target}}",
  },

  // Reconnaissance Tools
  {
    id: "subfinder",
    name: "Subfinder",
    category: "recon",
    risk: "passiv",
    description: "Subdomain-Discovery",
    executionMode: "command-reference",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
    commandTemplate: "subfinder -d {{domain}}",
  },
  {
    id: "amass",
    name: "Amass",
    category: "recon",
    risk: "passiv",
    description: "Umfassende Asset-Enumeration",
    executionMode: "command-reference",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
    commandTemplate: "amass enum -d {{domain}}",
  },
  {
    id: "masscan",
    name: "Masscan",
    category: "recon",
    risk: "kontrolliert",
    description: "Schneller Port-Scanner",
    executionMode: "command-reference",
    inputFields: [{ name: "target", label: "Ziel-IP/Range", type: "text" }],
    commandTemplate: "masscan {{target}} -p 1-65535",
  },
  {
    id: "nuclei",
    name: "Nuclei",
    category: "recon",
    risk: "kontrolliert",
    description: "Template-basierte Schwachstellen-Scanner",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "Ziel-URL", type: "text" }],
    commandTemplate: "nuclei -u {{url}} -t cves/",
  },
  {
    id: "httpx",
    name: "httpx",
    category: "recon",
    risk: "passiv",
    description: "HTTP-Probe für Hosts",
    executionMode: "command-reference",
    inputFields: [{ name: "input", label: "Host-Liste", type: "textarea" }],
    commandTemplate: "httpx -l hosts.txt",
  },
  {
    id: "ffuf",
    name: "ffuf",
    category: "recon",
    risk: "kontrolliert",
    description: "Web-Fuzzer",
    executionMode: "command-reference",
    inputFields: [{ name: "url", label: "Ziel-URL", type: "text" }],
    commandTemplate: "ffuf -u {{url}}/FUZZ -w wordlist.txt",
  },
  {
    id: "aquatone",
    name: "Aquatone",
    category: "recon",
    risk: "passiv",
    description: "Website-Screenshot-Sammler",
    executionMode: "command-reference",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
    commandTemplate: "aquatone -d {{domain}}",
  },
  {
    id: "fierce",
    name: "Fierce",
    category: "recon",
    risk: "passiv",
    description: "DNS-Rekursions-Scanner",
    executionMode: "command-reference",
    inputFields: [{ name: "domain", label: "Domain", type: "text" }],
    commandTemplate: "fierce --domain {{domain}}",
  },
];

export const toolsByCategory = {
  osint: toolCatalog.filter((tool) => tool.category === "osint"),
  pentest: toolCatalog.filter((tool) => tool.category === "pentest"),
  recon: toolCatalog.filter((tool) => tool.category === "recon"),
};

export const defaultSettings = {
  mode: "advisor-controlled",
  routing: "segmented-workspaces",
  logRetention: 30,
  rateProfile: "balanced",
  alerts: true,
  evidenceSnapshots: true,
};

export const assetUrls = {
  heroReference:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663552661904/XNBpKyMBuA4rXy2AbmJ3JH/cyber-control-room-reference-YuiGUiu5E8SwHPBbxaxfTj.webp",
  earth:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663552661904/XNBpKyMBuA4rXy2AbmJ3JH/cyber-earth-core-5Qav3BvyDf2yAtd4zZwSEy.webp",
  krockodogLogo:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663552661904/XNBpKyMBuA4rXy2AbmJ3JH/krockodog-frontpage-logo-dXLNrmhcavSYdiUsvafheK.webp",
};

export function categoryLabel(category: ToolCategory) {
  if (category === "osint") return "OSINT";
  if (category === "pentest") return "Pentest";
  return "Reconnaissance";
}

export function riskLabel(risk: ToolRisk) {
  if (risk === "passiv") return "Passiv";
  if (risk === "kontrolliert") return "Kontrolliert";
  return "Aktiv";
}

export function riskColor(risk: ToolRisk) {
  if (risk === "passiv") return "text-green-400";
  if (risk === "kontrolliert") return "text-yellow-400";
  return "text-red-400";
}
