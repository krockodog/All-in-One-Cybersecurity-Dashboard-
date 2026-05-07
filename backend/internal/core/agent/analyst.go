package agent

import "strings"

type ClassifiedFinding struct {
	Name     string  `json:"name"`
	Severity string  `json:"severity"`
	CVSS     float64 `json:"cvss"`
}

func AnalyzeResult(result TaskResult) []ClassifiedFinding {
	lower := strings.ToLower(result.Output)
	if strings.Contains(lower, "sql") {
		return []ClassifiedFinding{{Name: "Potential SQL Injection", Severity: "high", CVSS: 8.1}}
	}
	if strings.Contains(lower, "exposed") {
		return []ClassifiedFinding{{Name: "Exposed Service", Severity: "medium", CVSS: 6.5}}
	}
	return []ClassifiedFinding{}
}
