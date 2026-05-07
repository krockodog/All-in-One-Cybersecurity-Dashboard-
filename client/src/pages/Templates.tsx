import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

const TEMPLATES = [
  {
    id: "scope-definition",
    name: "Scope Definition Template",
    description: "Define testing boundaries and in-scope/out-of-scope targets",
    content: `# Penetration Testing Scope Definition

## Project Information
- **Client Name:** [Client Name]
- **Project ID:** [Project ID]
- **Testing Period:** [Start Date] to [End Date]
- **Tester:** [Tester Name]
- **Contact:** [Contact Email]

## In-Scope Targets

### Domains
- [ ] domain1.com
- [ ] domain2.com
- [ ] *.subdomain.com

### IP Ranges
- [ ] 192.168.1.0/24
- [ ] 10.0.0.0/8

### Applications
- [ ] Web Application (URL)
- [ ] Mobile Application (Platform)
- [ ] API Endpoints (Base URL)

### Infrastructure
- [ ] Cloud Services (AWS, Azure, GCP)
- [ ] On-Premises Servers
- [ ] Network Devices

## Out-of-Scope Targets

### Excluded Domains
- [ ] admin.domain.com
- [ ] internal.domain.com

### Excluded IP Ranges
- [ ] 192.168.1.1 (Critical Production Server)
- [ ] 10.0.0.0/16 (HR Systems)

### Excluded Systems
- [ ] Legacy Systems (Reason: Running obsolete OS)
- [ ] Third-Party Services (Reason: Not owned by client)

## Testing Methods

### Allowed Techniques
- [x] Network Scanning (Nmap)
- [x] Web Application Testing
- [x] SQL Injection Testing
- [x] Cross-Site Scripting (XSS) Testing
- [x] Authentication Testing
- [x] API Testing

### Prohibited Techniques
- [ ] Denial of Service (DoS) Attacks
- [ ] Social Engineering
- [ ] Physical Security Testing
- [ ] Wireless Network Testing
- [ ] Brute Force Attacks (unless authorized)

## Data Handling

- **Sensitive Data:** All discovered credentials/PII must be securely handled
- **Data Retention:** All data to be destroyed within 30 days of project completion
- **Confidentiality:** All findings are confidential and NDA-protected

## Emergency Procedures

- **Emergency Contact:** [Name] - [Phone Number]
- **Escalation:** Contact immediately if critical systems are affected
- **Incident Response:** Pause testing and notify client immediately

## Approval

- **Client Authorized By:** _________________ Date: _________
- **Tester Authorized By:** _________________ Date: _________
`,
  },
  {
    id: "rules-of-engagement",
    name: "Rules of Engagement (RoE)",
    description: "Legal and operational guidelines for the engagement",
    content: `# Rules of Engagement (RoE)

## 1. Authorization and Legality

1.1 The Client authorizes the Tester to conduct penetration testing on the specified targets only.

1.2 This authorization is limited to the scope defined in the Scope Definition document.

1.3 The Tester will not conduct any testing outside the defined scope without written authorization.

1.4 All testing activities are conducted in compliance with applicable laws and regulations.

## 2. Testing Procedures

2.1 Testing will be conducted during agreed-upon windows: [Testing Windows]

2.2 The Tester will maintain detailed logs of all testing activities.

2.3 Any critical vulnerabilities discovered will be reported immediately to the emergency contact.

2.4 The Tester will not exploit vulnerabilities beyond what is necessary to confirm their existence.

2.5 The Tester will not access, modify, or delete any data except as necessary to confirm vulnerabilities.

## 3. Data Handling

3.1 All data discovered during testing is confidential and will be handled securely.

3.2 Credentials discovered during testing will not be used for unauthorized access.

3.3 All data will be destroyed within 30 days of project completion.

3.4 No data will be shared with third parties without written authorization.

## 4. Communication

4.1 The Client's emergency contact must be available during all testing windows.

4.2 Critical findings will be reported immediately (within 1 hour).

4.3 Weekly status reports will be provided every Friday.

4.4 Final report will be delivered within 5 business days of testing completion.

## 5. Remediation and Retesting

5.1 The Client will have 30 days to remediate findings.

5.2 Retesting will be conducted to verify remediation effectiveness.

5.3 Any new vulnerabilities discovered during retesting will be reported separately.

## 6. Liability and Indemnification

6.1 The Tester will exercise due care to minimize impact on production systems.

6.2 The Client assumes all risk associated with the penetration testing activities.

6.3 The Client indemnifies the Tester from any claims arising from authorized testing activities.

## 7. Confidentiality

7.1 All findings are confidential and protected by NDA.

7.2 The Client will not disclose findings to third parties without written authorization.

7.3 The Tester will not disclose findings except as required by law.

## Signatures

**Client Representative:**
Name: _________________________ 
Signature: _________________________ 
Date: _________________________

**Tester:**
Name: _________________________ 
Signature: _________________________ 
Date: _________________________
`,
  },
  {
    id: "finding-template",
    name: "Finding Report Template",
    description: "Template for documenting individual vulnerabilities",
    content: `# Vulnerability Finding Report

## Finding Information

- **Finding ID:** [ID]
- **Title:** [Vulnerability Title]
- **Severity:** [Critical/High/Medium/Low]
- **CVSS Score:** [Score] (v3.1)
- **CWE:** [CWE ID]
- **Status:** [Open/Resolved/Accepted Risk]

## Description

[Detailed description of the vulnerability, including what was found and why it's a security issue]

## Impact

**Confidentiality:** [High/Medium/Low/None]
**Integrity:** [High/Medium/Low/None]
**Availability:** [High/Medium/Low/None]

[Detailed explanation of the business impact]

## Affected Systems

- [System 1]
- [System 2]
- [System 3]

## Proof of Concept

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Evidence
- [Screenshot 1]
- [Screenshot 2]
- [Log Output]

## Remediation

### Recommended Fix
[Specific, actionable remediation steps]

### Verification
[How to verify the fix is effective]

### Timeline
- **Immediate (0-7 days):** [Critical findings]
- **Urgent (1-30 days):** [High findings]
- **Standard (1-90 days):** [Medium findings]
- **Low Priority:** [Low findings]

## References

- [OWASP Reference]
- [CWE Reference]
- [CVE Reference]
- [Industry Best Practice]
`,
  },
];

export default function Templates() {
  const downloadTemplate = (template: (typeof TEMPLATES)[0]) => {
    const element = document.createElement("a");
    const file = new Blob([template.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Engagement Templates</h1>
          <p className="text-muted-foreground">
            Downloadable templates for scope definition, rules of engagement, and findings
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => downloadTemplate(template)}
                  className="w-full"
                  variant="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use These Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Scope Definition Template</h3>
              <p className="text-sm text-muted-foreground">
                Use this to clearly define what will and won't be tested. Fill in all sections and
                have both client and tester sign off before starting the engagement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Rules of Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Establish legal and operational guidelines. Customize based on your organization's
                policies and the client's requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Finding Report Template</h3>
              <p className="text-sm text-muted-foreground">
                Document each vulnerability with this template. Include proof of concept, impact
                analysis, and specific remediation recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
