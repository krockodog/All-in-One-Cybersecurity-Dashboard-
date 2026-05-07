package agent

func VerifyFinding(finding ClassifiedFinding) bool {
	if finding.CVSS >= 7.0 {
		return true
	}
	if finding.Severity == "critical" || finding.Severity == "high" {
		return true
	}
	return finding.CVSS >= 4.0
}
