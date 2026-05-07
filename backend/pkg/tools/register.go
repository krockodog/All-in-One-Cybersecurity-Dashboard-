package tools

import (
	"fmt"
	"strings"
)

type Definition struct {
	Name         string `json:"name"`
	Category     string `json:"category"`
	Container    string `json:"container"`
	Command      string `json:"command"`
	OutputParser string `json:"outputParser"`
}

func RegisterDefaultTools() []Definition {
	catalog := map[string][]string{
		"reconnaissance": {
			"theHarvester", "amass", "subfinder", "spiderfoot", "shodan", "recon-ng", "sublist3r", "dnsrecon", "dnsenum", "dnsmap", "dnswalk", "fierce", "dmitry", "maltego", "whois", "dig", "nslookup", "host", "dnsdumpster", "crtsh", "securitytrails", "virustotal", "censys", "zoomeye", "foFa", "shodan.io", "builtwith", "wappalyzer", "whatweb", "webanalyze", "gowitness", "eyewitness", "aquatone", "httprobe", "httpx", "gospider", "hakrawler", "waybackurls", "gau", "katana", "urlhunter", "trufflehog", "gitleaks", "gitrob", "gitgraber", "git-dumper", "git-hound", "repo-supervisor", "github-search", "gitlab-search",
		},
		"scanning": {
			"nmap", "masscan", "rustscan", "naabu", "zmap", "unicornscan", "netcat", "nc", "hping3", "ping", "fping", "arp-scan", "nbtscan", "smbclient", "smbmap", "enum4linux", "enum4linux-ng", "ldapsearch",
		},
		"web_application_scanning": {
			"nuclei", "nikto", "wpscan", "joomscan", "droopescan", "wafw00f", "whatwaf", "dirsearch", "gobuster", "feroxbuster", "ffuf", "wfuzz", "dirb", "dirbuster", "dalfox", "xsstrike", "xsser", "commix", "sqlmap", "nosqlmap", "tplmap", "graphqlmap",
		},
		"vulnerability_scanning": {
			"openvas", "nessus", "nexpose", "qualys", "acunetix", "burpsuite", "zaproxy", "w3af", "arachni", "skipfish",
		},
		"exploitation": {
			"metasploit", "msfvenom", "searchsploit", "exploit-db", "routersploit", "isf", "pocsuite3", "cve-search", "vulners", "beef", "empire", "starkiller", "armitage",
		},
		"c2_frameworks": {
			"sliver", "havok", "covenant", "merlin", "mythic", "apfell", "poshc2", "deediv", "pupy", "nimplant", "hoaxshell", "bruteratel",
		},
		"post_exploitation": {
			"bloodhound", "sharphound", "plumhound", "aclpwn", "powerview", "powermad", "powermaid", "pwned", "seatbelt", "sharplockpick", "rubeus", "kekeo", "mimikatz", "lazagne", "nanodump", "dploot", "pypykatz", "chlonium", "sharpchromium", "mailiminer",
		},
		"privilege_escalation": {
			"winpeas", "linpeas", "peass-ng", "lse", "linux-smart-enumeration", "unix-privesc-check", "gtfobins", "lolbas", "wadcoms", "certify", "adfind", "sherlock", "watson", "powersploit", "jaws", "powerup",
		},
		"credential_access": {
			"hashcat", "john", "hydra", "medusa", "ncrack", "crowbar", "patator", "responder", "impacket-secretsdump", "impacket-getnpusers", "impacket-kerberoast", "asrep-roast", "kerbrute", "eviltree",
		},
		"lateral_movement": {
			"crackmapexec", "netexec", "impacket-psexec", "impacket-wmiexec", "impacket-smbexec", "impacket-atexec", "impacket-dcomexec", "evil-winrm", "winrm", "psexec", "wmic", "sc", "schtasks", "bloodhound-python", "coercer",
		},
		"defense_evasion": {
			"veil", "shellter", "invoke-obfuscation", "obfuscar", "confuser", "smartassembly", "scarecrow", "freeze", "alcatraz", "mangle", "sharpblock", "nimcrypter",
		},
		"persistence": {
			"wmi", "registry-run-keys", "startup-folder", "service-install", "dll-hijack",
		},
		"exfiltration": {
			"dnscat2", "iodine", "dnsteal", "pyexfil", "cloakify", "goshs", "powershell-rat", "wevdav",
		},
		"detection_sigma": {
			"sigma", "yara", "thor-lite", "ossec", "wazuh", "elastic-hunting",
		},
		"cloud_security": {
			"prowler", "scoutsuite", "trivy", "kube-hunter", "kube-bench", "docker-bench-security", "falco", "checkov", "cloudsploit", "pacu",
		},
		"network_tools": {
			"tcpdump", "wireshark-tshark", "tcpflow", "ngrep", "bettercap", "ettercap", "arpspoof", "dnsspoof", "mitmproxy", "burpsuite-pro",
		},
		"osint": {
			"maigret", "holehe", "socialscan", "ghunt", "social-analyzer", "twint", "instaloader", "youtube-dl", "gallery-dl", "photon",
		},
	}

	definitions := make([]Definition, 0, 220)
	seen := map[string]bool{}
	for category, names := range catalog {
		for _, name := range names {
			normalized := strings.ToLower(name)
			if seen[normalized] {
				continue
			}
			seen[normalized] = true
			definitions = append(definitions, Definition{
				Name:         name,
				Category:     category,
				Container:    defaultContainer(category),
				Command:      fmt.Sprintf("tool-runner --tool '%s' --target '{{.Target}}' --output '/output/{{.RunID}}_%s.out'", name, slug(name)),
				OutputParser: "auto",
			})
		}
	}

	return definitions
}

func defaultContainer(category string) string {
	switch category {
	case "reconnaissance", "scanning", "web_application_scanning", "vulnerability_scanning", "osint":
		return "tools-recon"
	case "c2_frameworks":
		return "tools-c2"
	default:
		return "tools-exploit"
	}
}

func slug(value string) string {
	replacer := strings.NewReplacer(" ", "-", ".", "-", "/", "-", "(", "", ")", "", "_", "-")
	return strings.ToLower(replacer.Replace(value))
}
