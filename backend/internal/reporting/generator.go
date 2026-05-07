package reporting

type Report struct {
	Title      string `json:"title"`
	Executive  string `json:"executive"`
	Technical  string `json:"technical"`
	Remediation string `json:"remediation"`
}

func Generate(report Report, format string) ([]byte, string) {
	html := HTMLTemplate(report.Title, report.Executive+"\n"+report.Technical+"\n"+report.Remediation)
	if format == "pdf" {
		return GeneratePDFBytes(html), "application/pdf"
	}
	return []byte(html), "text/html"
}
