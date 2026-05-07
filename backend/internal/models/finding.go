package models

import "time"

type Severity string

const (
	SeverityCritical Severity = "critical"
	SeverityHigh     Severity = "high"
	SeverityMedium   Severity = "medium"
	SeverityLow      Severity = "low"
	SeverityInfo     Severity = "info"
)

type FindingStatus string

const (
	FindingStatusOpen          FindingStatus = "open"
	FindingStatusConfirmed     FindingStatus = "confirmed"
	FindingStatusFalsePositive FindingStatus = "false_positive"
	FindingStatusFixed         FindingStatus = "fixed"
	FindingStatusAccepted      FindingStatus = "accepted"
)

type Finding struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Severity    Severity      `json:"severity"`
	CVSS        float64       `json:"cvss"`
	EPSS        float64       `json:"epss"`
	CVE         string        `json:"cve"`
	CWE         string        `json:"cwe"`
	NIST        string        `json:"nist"`
	Tool        string        `json:"tool"`
	TargetID    string        `json:"targetId"`
	PentestID   string        `json:"pentestId"`
	Evidence    string        `json:"evidence"`
	Remediation string        `json:"remediation"`
	Status      FindingStatus `json:"status"`
	CreatedAt   time.Time     `json:"createdAt"`
}

type CreateFindingInput struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Severity    Severity `json:"severity"`
	CVSS        float64  `json:"cvss"`
	EPSS        float64  `json:"epss"`
	CVE         string   `json:"cve"`
	CWE         string   `json:"cwe"`
	NIST        string   `json:"nist"`
	Tool        string   `json:"tool"`
	TargetID    string   `json:"targetId"`
	PentestID   string   `json:"pentestId"`
	Evidence    string   `json:"evidence"`
	Remediation string   `json:"remediation"`
}
