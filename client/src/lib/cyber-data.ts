export type ToolCategory = "osint" | "pentest" | "recon";
export type JobStatus = "idle" | "scanning" | "success" | "error";

export type ToolDefinition = {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
  description: string;
  baseCommand: string;
  sampleTarget: string;
  defaultOptions: string;
  risk: "passiv" | "kontrolliert" | "aktiv";
  tags: string[];
  guide: {
    objective: string;
    workflow: string[];
    notes: string[];
  };
};

export type OverviewMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "cyan" | "emerald" | "amber";
};

export type GuideSection = {
  title: string;
  summary: string;
  checkpoints: string[];
};

export const overviewMetrics: OverviewMetric[] = [
  { label: "Aktive Assessments", value: "12", delta: "+3 diese Woche", tone: "cyan" },
  { label: "Verifizierte Findings", value: "37", delta: "91% reproduzierbar", tone: "emerald" },
  { label: "Offene Risiko-Cluster", value: "08", delta: "2 mit hoher Priorität", tone: "amber" },
];

export const quickLaunchTargets = [
  "corp.example.com",
  "vpn.example.net",
  "portal.intern",
  "172.16.10.0/24",
];

export const pentestGuideSections: GuideSection[] = [
  {
    title: "Scope zuerst validieren",
    summary:
      "Vor jedem aktiven Test werden Zielraum, Authentisierung, Zeitfenster und Notfallkontakte bestätigt. Das Dashboard behandelt alle Abläufe als autorisierte Audits.",
    checkpoints: [
      "Freigaben und Kontaktwege dokumentieren",
      "Rate Limits und Produktivitätsfenster festlegen",
      "Out-of-Scope Hosts, Anwendungen und Daten definieren",
    ],
  },
  {
    title: "Enumeration vor Exploitation",
    summary:
      "Aktive Tests werden aus einer belastbaren Recon- und Fingerprinting-Phase abgeleitet. Je sauberer die Voranalyse, desto präziser und risikoärmer die nächsten Schritte.",
    checkpoints: [
      "Dienste und Versionen verifizieren",
      "Angriffsoberfläche nach Technologie clustern",
      "Nur passende Module und Wortlisten verwenden",
    ],
  },
  {
    title: "Belege reproduzierbar sichern",
    summary:
      "Jeder Befund braucht verwertbare Belege: Request/Response, Zeitstempel, Scope-Bezug und technische Auswirkungen. So werden Reports belastbar und remediation-tauglich.",
    checkpoints: [
      "Screenshots und Terminal-Output konsistent sammeln",
      "Impact und Business-Kontext getrennt dokumentieren",
      "Remediation immer direkt am Finding notieren",
    ],
  },
];

export const osintGuideSections: GuideSection[] = [
  {
    title: "Passive Sammlung priorisieren",
    summary:
      "OSINT startet mit öffentlichen und historisierten Quellen, bevor Profile, Infrastruktur und Beziehungen konsolidiert werden. Ziel ist ein verwertbares Lagebild ohne unnötige Berührung des Targets.",
    checkpoints: [
      "Primäre Identitäten und Markenbegriffe sammeln",
      "Domains, Social Handles und historische Artefakte korrelieren",
      "Öffentliche Leaks, Metadaten und Archive in Evidenzlisten ablegen",
    ],
  },
  {
    title: "Quellen quer validieren",
    summary:
      "Ein einzelner Datenpunkt reicht nicht aus. Ergebnisse werden immer mit mindestens einer zweiten Quelle gegengeprüft, bevor sie im Report oder in der Priorisierung auftauchen.",
    checkpoints: [
      "WHOIS, DNS und Certificate-Transparenz abgleichen",
      "Social Media mit Archiv- und Suchquellen verknüpfen",
      "Zeitliche Veränderungen dokumentieren",
    ],
  },
  {
    title: "Kontext statt Datensammlung",
    summary:
      "Gute OSINT ist nicht nur Sammlung, sondern Interpretation. Das Dashboard ordnet Beziehungen, liefert Hypothesen und markiert, welche Erkenntnisse in Recon oder Pentest überführt werden dürfen.",
    checkpoints: [
      "Assets nach Organisationseinheit gruppieren",
      "Exposure nach Relevanz und Aktualität bewerten",
      "Nur autorisierte Folgeschritte zur aktiven Prüfung einleiten",
    ],
  },
];

export const toolCatalog: ToolDefinition[] = [
  {
    id: "sherlock",
    name: "Sherlock",
    icon: "🕵️",
    category: "osint",
    description: "Prüft Benutzernamen plattformübergreifend und konsolidiert öffentliche Treffer für Social-Attribution.",
    baseCommand: "sherlock",
    sampleTarget: "krockodog",
    defaultOptions: "--print-found --timeout 15",
    risk: "passiv",
    tags: ["Usernames", "Social", "Attribution"],
    guide: {
      objective: "Öffentliche Benutzernamen auf mehreren Plattformen prüfen und Trefferliste validieren.",
      workflow: ["Handle normalisieren", "Plattformtreffer verifizieren", "False Positives manuell ausfiltern"],
      notes: ["Ideal für Alias-Korrelation", "Screenshots für sensible Treffer separat sichern"],
    },
  },
  {
    id: "theharvester",
    name: "theHarvester",
    icon: "📇",
    category: "osint",
    description: "Sammelt E-Mail-Adressen, Hosts und öffentliche Beziehungen aus Suchmaschinen und offenen Quellen.",
    baseCommand: "theHarvester",
    sampleTarget: "example.com",
    defaultOptions: "-b all -l 200",
    risk: "passiv",
    tags: ["Email", "Hosts", "OSINT"],
    guide: {
      objective: "Öffentlich exponierte Identitäten, Hosts und Kontakte einer Organisation sammeln.",
      workflow: ["Quelle wählen", "Domains und Markenbegriffe prüfen", "Duplikate und Leaks taggen"],
      notes: ["Ergebnisse mit WHOIS und DNS abgleichen", "Nicht jede Suchquelle liefert konsistente Treffer"],
    },
  },
  {
    id: "maltego",
    name: "Maltego",
    icon: "🕸️",
    category: "osint",
    description: "Visualisiert Entitäten, Beziehungen und Transformationspfade für komplexe Ermittlungsbilder.",
    baseCommand: "maltego",
    sampleTarget: "example.com",
    defaultOptions: "--graph entity-map",
    risk: "passiv",
    tags: ["Graphs", "Entities", "Correlation"],
    guide: {
      objective: "Beziehungen zwischen Domains, Personen, Infrastruktur und Metadaten sichtbar machen.",
      workflow: ["Seed-Entität festlegen", "Transform-Kette ausführen", "Graph-Hotspots priorisieren"],
      notes: ["Starke Wirkung im Reporting", "Korrelationen immer quellenbasiert verifizieren"],
    },
  },
  {
    id: "recon-ng",
    name: "Recon-ng",
    icon: "🧭",
    category: "osint",
    description: "Modulares Framework für passive Recherche, Entitäts-Management und Workflow-Automatisierung.",
    baseCommand: "recon-ng",
    sampleTarget: "example.com",
    defaultOptions: "-m marketplace install all",
    risk: "passiv",
    tags: ["Framework", "Modules", "Automation"],
    guide: {
      objective: "OSINT-Workflows modular orchestrieren und Ergebnisse strukturiert sammeln.",
      workflow: ["Workspace anlegen", "Module passend zum Ziel laden", "Resultate exportieren"],
      notes: ["Für wiederkehrende Workflows besonders nützlich", "API-Schlüssel sauber trennen"],
    },
  },
  {
    id: "spiderfoot",
    name: "SpiderFoot",
    icon: "🕷️",
    category: "osint",
    description: "Automatisiert breit angelegte Open-Source-Recherche mit Korrelations- und Exposure-Sicht.",
    baseCommand: "spiderfoot",
    sampleTarget: "example.com",
    defaultOptions: "-m sfp_dns,sfp_whois,sfp_accounts",
    risk: "passiv",
    tags: ["Automation", "Exposure", "Correlation"],
    guide: {
      objective: "Breite passive Quellensammlung mit anschließender Bewertung der Auffälligkeiten.",
      workflow: ["Scan-Modulset definieren", "Findings deduplizieren", "High-Signal-Treffer verifizieren"],
      notes: ["Hoher Abdeckungsgrad", "Priorisierung im Nachgang entscheidend"],
    },
  },
  {
    id: "shodan",
    name: "Shodan",
    icon: "🌐",
    category: "osint",
    description: "Durchsucht öffentlich exponierte Dienste, Banner, Zertifikate und Geräteprofile.",
    baseCommand: "shodan search",
    sampleTarget: "ssl:example.com",
    defaultOptions: "country:de org:\"Example\"",
    risk: "passiv",
    tags: ["Exposure", "Banners", "Devices"],
    guide: {
      objective: "Internet-exponierte Dienste und auffällige Banner schnell korrelieren.",
      workflow: ["Suchfingerabdruck erstellen", "Treffer clustern", "kritische Exposures markieren"],
      notes: ["Ideal für externe Sicht", "Mit Censys und Certificate Transparency abgleichen"],
    },
  },
  {
    id: "censys",
    name: "Censys",
    icon: "📡",
    category: "osint",
    description: "Analysiert Zertifikate, Hosts und Internetoberflächen aus globalen Scan-Daten.",
    baseCommand: "censys search",
    sampleTarget: "services.tls.certificates.leaf_data.subject.common_name: example.com",
    defaultOptions: "--index-type hosts",
    risk: "passiv",
    tags: ["Certificates", "Hosts", "Internet"],
    guide: {
      objective: "Zertifikats- und Hostdaten für Exposure-Mapping konsolidieren.",
      workflow: ["Query eingrenzen", "Zertifikatspfad prüfen", "Assets nach Relevanz priorisieren"],
      notes: ["Sehr stark bei Infrastruktur-Korrelation", "Hilfreich für Shadow-IT-Erkennung"],
    },
  },
  {
    id: "google-dorking",
    name: "Google Dorking",
    icon: "🔎",
    category: "osint",
    description: "Nutzt präzise Suchoperatoren, um öffentlich indexierte Artefakte und Leaks zu finden.",
    baseCommand: "google-dork",
    sampleTarget: "site:example.com filetype:pdf confidential",
    defaultOptions: "intitle:index.of OR ext:sql",
    risk: "passiv",
    tags: ["Search", "Leaks", "Documents"],
    guide: {
      objective: "Offen indexierte Dokumente, Verzeichnisse und Fehlkonfigurationen identifizieren.",
      workflow: ["Dorks nach Asset-Typ entwerfen", "Treffer manuell validieren", "kritische Funde exportieren"],
      notes: ["Nur öffentlich zugängliche Inhalte bewerten", "Archiv-Quellen ergänzen"],
    },
  },
  {
    id: "wayback-machine",
    name: "Wayback Machine",
    icon: "🕰️",
    category: "osint",
    description: "Vergleicht historische Snapshots, um vergangene Exposures und Strukturänderungen zu erkennen.",
    baseCommand: "waybackurls",
    sampleTarget: "example.com",
    defaultOptions: "| sort -u",
    risk: "passiv",
    tags: ["History", "URLs", "Archive"],
    guide: {
      objective: "Historische Angriffsoberflächen, verwaiste Pfade und alte Inhalte rekonstruieren.",
      workflow: ["Snapshot-Zeiträume prüfen", "alte Pfade deduplizieren", "aktive Relevanz bewerten"],
      notes: ["Ideal für Legacy-Pfade", "Mit ffuf und httpx kombinieren"],
    },
  },
  {
    id: "social-media-analysis",
    name: "Social Media Analysis",
    icon: "💬",
    category: "osint",
    description: "Bewertet öffentliche Profile, Beziehungen, Veröffentlichungsmuster und Markenexposition.",
    baseCommand: "social-analyzer",
    sampleTarget: "examplecorp",
    defaultOptions: "--metadata --profiles",
    risk: "passiv",
    tags: ["Profiles", "Brand", "Behavior"],
    guide: {
      objective: "Öffentliche Personen- und Markeninformationen für Attribution und Awareness sammeln.",
      workflow: ["Profile identifizieren", "Verknüpfungen prüfen", "Metadaten und Zeitpunkt clustern"],
      notes: ["Besonders stark in Spear-Phishing-Prävention", "Datenschutz und Autorisierung beachten"],
    },
  },
  {
    id: "exiftool",
    name: "ExifTool",
    icon: "🖼️",
    category: "osint",
    description: "Extrahiert Metadaten aus Dokumenten und Bildern, um Geräte-, Orts- oder Workflow-Hinweise zu finden.",
    baseCommand: "exiftool",
    sampleTarget: "evidence.jpg",
    defaultOptions: "-a -u -g1",
    risk: "passiv",
    tags: ["Metadata", "Images", "Documents"],
    guide: {
      objective: "Metadaten aus publizierten Dateien auslesen und sicher interpretieren.",
      workflow: ["Datei isolieren", "relevante Felder extrahieren", "Artefakte historisch einordnen"],
      notes: ["Sehr nützlich für Awareness und Leak-Analysen", "Hash-Werte für Chain-of-Custody erfassen"],
    },
  },
  {
    id: "whois",
    name: "WHOIS",
    icon: "📛",
    category: "osint",
    description: "Liefert Registrierungsdaten, Registrar-Hinweise und Ownership-Kontext zu Domains und IPs.",
    baseCommand: "whois",
    sampleTarget: "example.com",
    defaultOptions: "--verbose",
    risk: "passiv",
    tags: ["Ownership", "Registration", "Domains"],
    guide: {
      objective: "Besitz- und Registrierungsinformationen sauber dokumentieren.",
      workflow: ["Domain oder IP prüfen", "Registrar/Nameserver extrahieren", "Datenschutz-Lücken interpretieren"],
      notes: ["Mit DNS und Historical WHOIS kombinieren", "Privacy-Redaction ist häufig normal"],
    },
  },
  {
    id: "dns-enumeration",
    name: "DNS Enumeration",
    icon: "🧬",
    category: "osint",
    description: "Erfasst Nameserver, Zonenhinweise, Records und technische Beziehungen einer Domäne.",
    baseCommand: "dig",
    sampleTarget: "example.com",
    defaultOptions: "ANY +noall +answer",
    risk: "passiv",
    tags: ["DNS", "Records", "Infrastructure"],
    guide: {
      objective: "DNS-Struktur und delegierte Beziehungen eines Targets nachvollziehen.",
      workflow: ["Record-Typen gezielt abfragen", "Nameserver korrelieren", "Shadow-Domains markieren"],
      notes: ["Grundlage für Recon und Asset-Inventar", "Zonentransfer nur mit Erlaubnis testen"],
    },
  },
  {
    id: "nmap",
    name: "Nmap",
    icon: "🛰️",
    category: "pentest",
    description: "Netzwerk-Scanning, Port-Erkennung und Versionsermittlung mit kontextabhängigen Profilen.",
    baseCommand: "nmap",
    sampleTarget: "10.0.10.21",
    defaultOptions: "-sV -Pn -T4",
    risk: "aktiv",
    tags: ["Ports", "Services", "Enumeration"],
    guide: {
      objective: "Ports, Dienste und mögliche Eintrittspunkte präzise erfassen.",
      workflow: ["Host-Scope prüfen", "Profil an Risiko anpassen", "offene Dienste priorisieren"],
      notes: ["Masscan nur gezielt als Vorfilter nutzen", "Nicht jede Umgebung verträgt aggressive Timings"],
    },
  },
  {
    id: "nikto",
    name: "Nikto",
    icon: "🧪",
    category: "pentest",
    description: "Prüft Webserver auf bekannte Fehlkonfigurationen, schwache Defaults und auffällige Artefakte.",
    baseCommand: "nikto",
    sampleTarget: "https://portal.example.com",
    defaultOptions: "-Tuning bde -ask no",
    risk: "aktiv",
    tags: ["Web", "Misconfig", "HTTP"],
    guide: {
      objective: "Schnell sichtbare Webserver-Risiken erfassen und für manuelle Prüfung markieren.",
      workflow: ["URL validieren", "Tuning-Satz wählen", "False Positives im Response-Kontext prüfen"],
      notes: ["Gut als frühe Signalquelle", "Ergebnisse nicht ungeprüft reporten"],
    },
  },
  {
    id: "burp-suite",
    name: "Burp Suite",
    icon: "🧰",
    category: "pentest",
    description: "Interaktives Testen von Requests, Parametern, Sessions und Web-Flows.",
    baseCommand: "burpsuite",
    sampleTarget: "https://portal.example.com/login",
    defaultOptions: "--project-file advisor-session.burp",
    risk: "kontrolliert",
    tags: ["Proxy", "Web", "Manual"],
    guide: {
      objective: "Anwendungslogik, Requests und Authentisierungsflüsse gezielt prüfen.",
      workflow: ["Proxy verbinden", "Scope setzen", "Intruder/Repeater nur kontrolliert einsetzen"],
      notes: ["Stark für reproduzierbare Nachweise", "Session-Handling sauber dokumentieren"],
    },
  },
  {
    id: "metasploit",
    name: "Metasploit",
    icon: "🚀",
    category: "pentest",
    description: "Framework für modulare Validierung, Exploit-Prüfung und Nachweis technisch ausnutzbarer Schwachstellen.",
    baseCommand: "msfconsole -qx",
    sampleTarget: "use exploit/multi/http/example; set RHOSTS 10.0.10.21; run",
    defaultOptions: "set VERBOSE true",
    risk: "aktiv",
    tags: ["Exploit", "Framework", "Validation"],
    guide: {
      objective: "Technische Ausnutzbarkeit eines bereits bestätigten Befunds kontrolliert validieren.",
      workflow: ["Modul gegen Fingerprint prüfen", "Payload-Risiko minimieren", "Nachweis klar abgrenzen"],
      notes: ["Nur innerhalb autorisierter Testziele nutzen", "Cleanup und Spuren im Report dokumentieren"],
    },
  },
  {
    id: "sqlmap",
    name: "SQLMap",
    icon: "🗄️",
    category: "pentest",
    description: "Automatisiert SQL-Injection-Validierung, Fingerprinting und risikobasierte Datenbankabfragen.",
    baseCommand: "sqlmap",
    sampleTarget: "https://portal.example.com/item?id=5",
    defaultOptions: "--batch --level 2 --risk 1",
    risk: "aktiv",
    tags: ["SQLi", "Web", "DB"],
    guide: {
      objective: "Verdächtige Parameter kontrolliert auf SQL-Injection prüfen.",
      workflow: ["Parameter isolieren", "niedrige Risk/Level starten", "nur notwendige Bestätigung durchführen"],
      notes: ["Mit Burp-Replay kombinierbar", "Exploit-Tiefe sauber mit Scope abgleichen"],
    },
  },
  {
    id: "hydra",
    name: "Hydra",
    icon: "🔐",
    category: "pentest",
    description: "Validiert Authentisierungsresistenz kontrolliert mit rate-limit-sensitiven Login-Versuchen.",
    baseCommand: "hydra",
    sampleTarget: "ssh://10.0.10.21",
    defaultOptions: "-L users.txt -P passwords.txt -t 4",
    risk: "aktiv",
    tags: ["Auth", "Bruteforce", "Login"],
    guide: {
      objective: "Schwache Authentisierung im genehmigten Rahmen prüfen.",
      workflow: ["Rate Limits abstimmen", "kleine Wortlisten starten", "Lockout-Risiko überwachen"],
      notes: ["Nur mit expliziter Freigabe verwenden", "Benutzerstörung vermeiden"],
    },
  },
  {
    id: "john-the-ripper",
    name: "John the Ripper",
    icon: "🧠",
    category: "pentest",
    description: "Prüft Passwort-Hashes auf Widerstandsfähigkeit mit Wortlisten und Regelwerken.",
    baseCommand: "john",
    sampleTarget: "hashes.txt",
    defaultOptions: "--wordlist=rockyou.txt --format=auto",
    risk: "kontrolliert",
    tags: ["Passwords", "Hashes", "Offline"],
    guide: {
      objective: "Offline-Hashprüfung zur Passwort-Härtungsbewertung durchführen.",
      workflow: ["Hashformat bestimmen", "Wortliste und Regeln wählen", "Treffer nach Policy bewerten"],
      notes: ["Offline bevorzugen", "Policy-Abweichungen im Report quantifizieren"],
    },
  },
  {
    id: "hashcat",
    name: "Hashcat",
    icon: "⚡",
    category: "pentest",
    description: "Leistungsstarke GPU-gestützte Analyse von Passwort-Hashes und Passwortmustern.",
    baseCommand: "hashcat",
    sampleTarget: "hashes.txt",
    defaultOptions: "-m 0 -a 0 hashes.txt wordlist.txt",
    risk: "kontrolliert",
    tags: ["GPU", "Hashes", "Password Audit"],
    guide: {
      objective: "Hash-Resilienz skalierbar prüfen und Passwortmuster identifizieren.",
      workflow: ["Hashmodus korrekt wählen", "Masken oder Wortlisten definieren", "Resultate nach Policy clustern"],
      notes: ["Nur mit geschützten Testdaten arbeiten", "Resultate nicht unnötig persistieren"],
    },
  },
  {
    id: "aircrack-ng",
    name: "Aircrack-ng",
    icon: "📶",
    category: "pentest",
    description: "Audit von WLAN-Sicherheit, Handshakes und Konfigurationsresistenz im autorisierten Umfeld.",
    baseCommand: "aircrack-ng",
    sampleTarget: "capture.cap",
    defaultOptions: "-w wordlist.txt",
    risk: "aktiv",
    tags: ["WiFi", "Wireless", "Handshake"],
    guide: {
      objective: "WLAN-Härtung und Authentisierungsresistenz bewerten.",
      workflow: ["Adapter und Kanal abstimmen", "Handshake autorisiert sammeln", "Widerstand kontrolliert testen"],
      notes: ["Funkumfeld kann störanfällig sein", "Sparrow WiFi und Wireshark ergänzen"],
    },
  },
  {
    id: "sparrow-wifi",
    name: "Sparrow WiFi",
    icon: "🪽",
    category: "pentest",
    description: "Visualisiert drahtlose Netze, Clients, Sicherheitstypen und geographische Beobachtungen.",
    baseCommand: "sparrow-wifi",
    sampleTarget: "wlan0mon",
    defaultOptions: "--headless --scan-time 60",
    risk: "kontrolliert",
    tags: ["Wireless", "Visualization", "Survey"],
    guide: {
      objective: "WLAN-Umgebungen kartieren und auffällige Konfigurationen entdecken.",
      workflow: ["Interface aktivieren", "Netze clustern", "Verschlüsselung und Client-Muster dokumentieren"],
      notes: ["Stark für Standortbegehungen", "Mit Aircrack und Wireshark kombinieren"],
    },
  },
  {
    id: "wireshark",
    name: "Wireshark",
    icon: "🦈",
    category: "pentest",
    description: "Packet-Analyse für Protokollverhalten, Klartext-Leaks und Kommunikationsmuster.",
    baseCommand: "wireshark",
    sampleTarget: "capture.pcapng",
    defaultOptions: "-r capture.pcapng",
    risk: "kontrolliert",
    tags: ["Packets", "Protocols", "Traffic"],
    guide: {
      objective: "Netzwerkverkehr strukturiert auf Fehlverhalten und Exposition untersuchen.",
      workflow: ["Capture filtern", "Protokolle priorisieren", "sensitive Inhalte markieren"],
      notes: ["Klartext und Auth-Leaks sofort kennzeichnen", "Zeitfenster sauber dokumentieren"],
    },
  },
  {
    id: "gobuster",
    name: "Gobuster",
    icon: "📂",
    category: "pentest",
    description: "Findet versteckte Pfade, Dateien und virtuelle Hosts auf Webzielen.",
    baseCommand: "gobuster dir",
    sampleTarget: "https://portal.example.com",
    defaultOptions: "-w wordlist.txt -k -t 20",
    risk: "aktiv",
    tags: ["Content Discovery", "Directories", "VHosts"],
    guide: {
      objective: "Versteckte Inhalte und administrative Endpunkte systematisch entdecken.",
      workflow: ["Wortliste passend wählen", "Statuscodes interpretieren", "kritische Pfade verifizieren"],
      notes: ["Rate und Wortlisten am Scope ausrichten", "Mit Wayback und ffuf kombinieren"],
    },
  },
  {
    id: "wpscan",
    name: "WPScan",
    icon: "🧱",
    category: "pentest",
    description: "Spezialisierte WordPress-Prüfung für Plugins, Themes, Nutzer und Konfigurationsschwächen.",
    baseCommand: "wpscan",
    sampleTarget: "https://blog.example.com",
    defaultOptions: "--enumerate ap,at,tt,u",
    risk: "aktiv",
    tags: ["WordPress", "CMS", "Plugins"],
    guide: {
      objective: "WordPress-Installationen gezielt auf bekannte Schwächen und Exposures prüfen.",
      workflow: ["CMS-Fingerprint bestätigen", "Enumeration-Satz wählen", "kritische Komponenten priorisieren"],
      notes: ["Nur bei bestätigtem WordPress einsetzen", "Versions- und Plugin-Treffer manuell gegenprüfen"],
    },
  },
  {
    id: "enum4linux",
    name: "enum4linux",
    icon: "🪟",
    category: "pentest",
    description: "Ermittelt SMB-, NetBIOS- und Windows-Domäneninformationen in internen Prüfungen.",
    baseCommand: "enum4linux",
    sampleTarget: "10.0.10.45",
    defaultOptions: "-a",
    risk: "aktiv",
    tags: ["SMB", "Windows", "Enumeration"],
    guide: {
      objective: "SMB- und Windows-bezogene Angriffsflächen systematisch inventarisieren.",
      workflow: ["Host und Segment bestätigen", "Shares/Benutzer prüfen", "unnötige Exposition hervorheben"],
      notes: ["Im internen Scope sehr effektiv", "Mit Nmap-Skripten und Wireshark ergänzen"],
    },
  },
  {
    id: "subfinder",
    name: "Subfinder",
    icon: "🧩",
    category: "recon",
    description: "Sammelt Subdomains aus passiven Quellen als Einstieg in strukturierte Angriffsflächenanalyse.",
    baseCommand: "subfinder",
    sampleTarget: "example.com",
    defaultOptions: "-silent -all",
    risk: "passiv",
    tags: ["Subdomains", "Passive", "Asset Mapping"],
    guide: {
      objective: "Subdomains schnell und breit erfassen.",
      workflow: ["Basisdomain prüfen", "Quellen ausweiten", "Ergebnisse deduplizieren"],
      notes: ["Ideal als Startpunkt für httpx", "Mit Amass validieren"],
    },
  },
  {
    id: "amass",
    name: "Amass",
    icon: "🛰️",
    category: "recon",
    description: "Kombiniert passive und aktive Asset-Recherche für tiefes Domain-Mapping.",
    baseCommand: "amass enum",
    sampleTarget: "example.com",
    defaultOptions: "-passive -src",
    risk: "kontrolliert",
    tags: ["Subdomains", "Intel", "Enumeration"],
    guide: {
      objective: "Subdomains und Infrastrukturbeziehungen vertieft kartieren.",
      workflow: ["Mode wählen", "Quellen priorisieren", "Assets nach Kritikalität clustern"],
      notes: ["Besonders stark für Langläufer", "Aktive Features nur autorisiert nutzen"],
    },
  },
  {
    id: "masscan",
    name: "Masscan",
    icon: "📍",
    category: "recon",
    description: "Ultra-schnelles Port-Scanning zur Vorselektion großer Adressräume im genehmigten Rahmen.",
    baseCommand: "masscan",
    sampleTarget: "10.0.10.0/24",
    defaultOptions: "-p1-1000 --rate 5000",
    risk: "aktiv",
    tags: ["Ports", "Speed", "Surface"],
    guide: {
      objective: "Große Netze schnell auf exponierte Dienste vorfiltern.",
      workflow: ["Scope bestätigen", "Rate konservativ starten", "Treffer mit Nmap validieren"],
      notes: ["Kann laut sein", "Immer mit Freigabe und Rate-Limits betreiben"],
    },
  },
  {
    id: "nuclei",
    name: "Nuclei",
    icon: "☢️",
    category: "recon",
    description: "Template-basierte Prüfung auf bekannte Exposures, Fehlkonfigurationen und Fingerprints.",
    baseCommand: "nuclei",
    sampleTarget: "https://portal.example.com",
    defaultOptions: "-severity critical,high,medium",
    risk: "kontrolliert",
    tags: ["Templates", "Vulns", "Exposure"],
    guide: {
      objective: "Bekannte Muster und exposures schnell gegen Live-Ziele prüfen.",
      workflow: ["Ziel validieren", "Template-Satz eingrenzen", "kritische Treffer manuell bestätigen"],
      notes: ["Starke Geschwindigkeit bei guter Signalqualität", "Template-Qualität im Blick behalten"],
    },
  },
  {
    id: "httpx",
    name: "httpx",
    icon: "🔗",
    category: "recon",
    description: "Validiert Hosts, HTTP-Status, Titel, Fingerprints und TLS-Merkmale effizient.",
    baseCommand: "httpx",
    sampleTarget: "targets.txt",
    defaultOptions: "-title -tech-detect -status-code",
    risk: "passiv",
    tags: ["HTTP", "Validation", "Tech Detect"],
    guide: {
      objective: "Welche Hosts leben wirklich und welche Technologien laufen darauf?", 
      workflow: ["Hostliste einspeisen", "Technologie-Fingerprints sammeln", "interessante Ziele markieren"],
      notes: ["Sehr nützlich nach Subfinder/Amass", "Bildet die Grundlage für Nuclei und Burp"],
    },
  },
  {
    id: "ffuf",
    name: "ffuf",
    icon: "🎯",
    category: "recon",
    description: "Schnelle Fuzzing-Enumeration für Verzeichnisse, Parameter und virtuelle Hosts.",
    baseCommand: "ffuf",
    sampleTarget: "https://portal.example.com/FUZZ",
    defaultOptions: "-w wordlist.txt -mc all -fc 404",
    risk: "aktiv",
    tags: ["Fuzzing", "Discovery", "Web"],
    guide: {
      objective: "Versteckte Pfade und Variationen effizient aufdecken.",
      workflow: ["Wortliste eingrenzen", "Response-Muster filtern", "hochwertige Treffer verifizieren"],
      notes: ["Weniger laut mit präziser Wortliste", "Mit Wayback-URLs besonders wirkungsvoll"],
    },
  },
  {
    id: "aquatone",
    name: "Aquatone",
    icon: "🖥️",
    category: "recon",
    description: "Erstellt visuelle Übersichten erreichbarer Weboberflächen und erleichtert Priorisierung nach Eindruck.",
    baseCommand: "aquatone",
    sampleTarget: "targets.txt",
    defaultOptions: "-ports xlarge",
    risk: "kontrolliert",
    tags: ["Screenshots", "Web", "Triage"],
    guide: {
      objective: "Große Web-Asset-Mengen visuell triagieren.",
      workflow: ["Hostliste vorbereiten", "Screenshots erzeugen", "auffällige Oberflächen clustern"],
      notes: ["Hilfreich für schnelle Priorisierung", "Mit httpx und Nuclei kombinieren"],
    },
  },
  {
    id: "fierce",
    name: "Fierce",
    icon: "🧷",
    category: "recon",
    description: "DNS-zentrierte Recon für Subdomains, Namensauflösung und Zonenhinweise.",
    baseCommand: "fierce",
    sampleTarget: "example.com",
    defaultOptions: "--domain example.com --wide",
    risk: "kontrolliert",
    tags: ["DNS", "Subdomains", "Network"],
    guide: {
      objective: "DNS-Strukturen vertieft kartieren und auffällige Delegationen erkennen.",
      workflow: ["Domain scope prüfen", "Wordlist/Mode wählen", "Treffer verifizieren"],
      notes: ["Gute Ergänzung zu Subfinder und Amass", "Zonentransfers nur mit Erlaubnis testen"],
    },
  },
];

export const toolsByCategory = {
  osint: toolCatalog.filter((tool) => tool.category === "osint"),
  pentest: toolCatalog.filter((tool) => tool.category === "pentest"),
  recon: toolCatalog.filter((tool) => tool.category === "recon"),
};

export const dashboardHighlights = [
  {
    title: "Authorized Use Only",
    body: "Dieses Interface simuliert autorisierte Prüf-Workflows für eigene Netze und Ziele mit expliziter Erlaubnis. Aktive Maßnahmen sind immer scope- und freigabebasiert.",
  },
  {
    title: "OSINT zuerst, Aktionen danach",
    body: "Passive Informationsgewinnung, historische Korrelation und Host-Validierung schaffen die Grundlage für sichere operative Entscheidungen.",
  },
  {
    title: "Report-fähige Evidenz",
    body: "Jeder Lauf erzeugt eine strukturierte Spur aus Befehl, Status, Zeitstempel und terminalähnlicher Ausgabe für die spätere Aufbereitung im Reportbereich.",
  },
];

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
  hacker:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663552661904/XNBpKyMBuA4rXy2AbmJ3JH/hacker-silhouette-left-bHUYArjwMEio4ZonpasiZe.webp",
  analyst:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663552661904/XNBpKyMBuA4rXy2AbmJ3JH/cyber-expert-silhouette-right-BmP8JZR8sfpX9hKLLpq6SV.webp",
};

export function categoryLabel(category: ToolCategory) {
  if (category === "osint") return "OSINT";
  if (category === "pentest") return "Pentest";
  return "Reconnaissance";
}

export function riskLabel(risk: ToolDefinition["risk"]) {
  if (risk === "passiv") return "Passiv";
  if (risk === "kontrolliert") return "Kontrolliert";
  return "Aktiv";
}
