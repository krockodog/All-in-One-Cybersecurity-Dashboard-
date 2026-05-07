package risk

func SeverityFromCVSS(score float64) string {
	if score == 0 {
		return "none"
	}
	if score < 4.0 {
		return "low"
	}
	if score < 7.0 {
		return "medium"
	}
	if score < 9.0 {
		return "high"
	}
	return "critical"
}

func CalculateRisk(cvss, epss, nistWeight float64) float64 {
	return cvss * epss * nistWeight
}
