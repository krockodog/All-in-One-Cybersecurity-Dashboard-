package agent

type PlannedTask struct {
	Phase string   `json:"phase"`
	Tools []string `json:"tools"`
}

func BuildMitrePlan(targetType string) []PlannedTask {
	base := []PlannedTask{
		{Phase: "Reconnaissance", Tools: []string{"amass", "subfinder", "theHarvester"}},
		{Phase: "Discovery", Tools: []string{"nmap", "httpx", "nuclei"}},
		{Phase: "Initial Access", Tools: []string{"sqlmap", "metasploit"}},
		{Phase: "Credential Access", Tools: []string{"responder", "hashcat"}},
		{Phase: "Lateral Movement", Tools: []string{"crackmapexec", "impacket-psexec"}},
	}
	if targetType == "web" {
		base[1].Tools = append(base[1].Tools, "dirsearch", "ffuf")
	}
	return base
}
