package reporting

import "fmt"

func HTMLTemplate(title string, body string) string {
	return fmt.Sprintf(`<!doctype html><html><head><meta charset="utf-8"><title>%s</title></head><body><h1>%s</h1><div>%s</div></body></html>`, title, title, body)
}
