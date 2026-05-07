/**
 * ISO 27001 ISMS Service
 * Manages Information Security Management System compliance and reporting
 */

interface ISO27001Control {
  controlId: string;
  controlName: string;
  clause: string;
  category: "administrative" | "technical" | "physical";
  description: string;
}

interface RiskAssessment {
  likelihood: "rare" | "unlikely" | "possible" | "likely" | "almost_certain";
  impact: "negligible" | "minor" | "moderate" | "major" | "catastrophic";
  score: number;
}

interface ControlGap {
  controlId: string;
  currentStatus: "not_implemented" | "partial" | "implemented";
  requiredStatus: "implemented" | "optimized";
  remediationEffort: "low" | "medium" | "high";
  remediationCost: number;
}

/**
 * ISO 27001 Service - Singleton instance
 */
class ISO27001Service {
  private static instance: ISO27001Service;

  private allControls: ISO27001Control[] = [];
  private controlCache: Map<string, ISO27001Control> = new Map();

  private constructor() {
    this.initializeControls();
  }

  static getInstance(): ISO27001Service {
    if (!ISO27001Service.instance) {
      ISO27001Service.instance = new ISO27001Service();
    }
    return ISO27001Service.instance;
  }

  /**
   * Initialize all 114 ISO 27001 Annex A controls
   */
  private initializeControls(): void {
    // Clause A.5: Organizational Controls
    this.addControl("A.5.1.1", "Policies for information security", "A.5", "administrative");
    this.addControl("A.5.1.2", "Information security policy review", "A.5", "administrative");
    this.addControl("A.5.2.1", "Information security roles and responsibilities", "A.5", "administrative");
    this.addControl("A.5.2.2", "Segregation of duties", "A.5", "administrative");
    this.addControl("A.5.2.3", "Management responsibilities", "A.5", "administrative");

    // Clause A.6: People Controls
    this.addControl("A.6.1.1", "Screening", "A.6", "administrative");
    this.addControl("A.6.1.2", "Terms and conditions of employment", "A.6", "administrative");
    this.addControl("A.6.2.1", "Management responsibilities", "A.6", "administrative");
    this.addControl("A.6.2.2", "Information security awareness, education and training", "A.6", "administrative");
    this.addControl("A.6.2.3", "Disciplinary process", "A.6", "administrative");
    this.addControl("A.6.3.1", "Responsibilities during employment", "A.6", "administrative");
    this.addControl("A.6.3.2", "Termination or change of employment", "A.6", "administrative");

    // Clause A.7: Asset Management
    this.addControl("A.7.1.1", "Inventory of assets", "A.7", "administrative");
    this.addControl("A.7.1.2", "Ownership of assets", "A.7", "administrative");
    this.addControl("A.7.1.3", "Acceptable use of assets", "A.7", "administrative");
    this.addControl("A.7.2.1", "Classification of information", "A.7", "administrative");
    this.addControl("A.7.2.2", "Labelling of information", "A.7", "administrative");
    this.addControl("A.7.2.3", "Handling of assets", "A.7", "administrative");

    // Clause A.8: Access Control
    this.addControl("A.8.1.1", "Access control policy", "A.8", "technical");
    this.addControl("A.8.1.2", "User registration and de-registration", "A.8", "technical");
    this.addControl("A.8.1.3", "User access provisioning", "A.8", "technical");
    this.addControl("A.8.1.4", "Access rights review", "A.8", "technical");
    this.addControl("A.8.2.1", "User responsibilities", "A.8", "technical");
    this.addControl("A.8.2.2", "Password management", "A.8", "technical");
    this.addControl("A.8.2.3", "Use of privileged access rights", "A.8", "technical");
    this.addControl("A.8.3.1", "Information access restriction", "A.8", "technical");
    this.addControl("A.8.3.2", "Access to network and network services", "A.8", "technical");
    this.addControl("A.8.3.3", "Segregation of information processing environments", "A.8", "technical");
    this.addControl("A.8.3.4", "Segregation of duties", "A.8", "technical");

    // Clause A.9: Cryptography
    this.addControl("A.9.1.1", "Cryptographic controls policy and procedures", "A.9", "technical");
    this.addControl("A.9.2.1", "Encryption", "A.9", "technical");
    this.addControl("A.9.2.2", "Cryptographic key management", "A.9", "technical");

    // Clause A.10: Physical and Environmental Security
    this.addControl("A.10.1.1", "Physical security perimeter", "A.10", "physical");
    this.addControl("A.10.1.2", "Physical entry", "A.10", "physical");
    this.addControl("A.10.1.3", "Securing offices, rooms and facilities", "A.10", "physical");
    this.addControl("A.10.2.1", "Equipment siting and protection", "A.10", "physical");
    this.addControl("A.10.2.2", "Supporting utilities", "A.10", "physical");
    this.addControl("A.10.2.3", "Cabling security", "A.10", "physical");
    this.addControl("A.10.3.1", "Equipment disposal", "A.10", "physical");
    this.addControl("A.10.3.2", "Unattended user equipment", "A.10", "physical");
    this.addControl("A.10.3.3", "Clear desk and clear screen", "A.10", "physical");

    // Clause A.11: Operations Security
    this.addControl("A.11.1.1", "Documented operating procedures", "A.11", "technical");
    this.addControl("A.11.1.2", "Change management", "A.11", "technical");
    this.addControl("A.11.1.3", "Capacity management", "A.11", "technical");
    this.addControl("A.11.1.4", "Separation of development, test and production environments", "A.11", "technical");
    this.addControl("A.11.2.1", "Monitoring", "A.11", "technical");
    this.addControl("A.11.2.2", "Protection of information systems processing facilities", "A.11", "technical");
    this.addControl("A.11.2.3", "Log management", "A.11", "technical");
    this.addControl("A.11.2.4", "Administration of information and communication technology (ICT) facilities", "A.11", "technical");
    this.addControl("A.11.2.5", "Access control to program source code", "A.11", "technical");
    this.addControl("A.11.2.6", "Security of information systems and applications", "A.11", "technical");
    this.addControl("A.11.2.7", "Secure development policy", "A.11", "technical");
    this.addControl("A.11.3.1", "Event logging", "A.11", "technical");
    this.addControl("A.11.3.2", "Protection of log information", "A.11", "technical");
    this.addControl("A.11.3.3", "Administrator and operator logs", "A.11", "technical");
    this.addControl("A.11.3.4", "Restriction of system utility programs", "A.11", "technical");
    this.addControl("A.11.3.5", "Installation of software on operational systems", "A.11", "technical");
    this.addControl("A.11.3.6", "Information systems audit considerations", "A.11", "technical");

    // Clause A.12: Communications Security
    this.addControl("A.12.1.1", "Network controls", "A.12", "technical");
    this.addControl("A.12.1.2", "Security of network services", "A.12", "technical");
    this.addControl("A.12.2.1", "Information transfer policies and procedures", "A.12", "technical");
    this.addControl("A.12.3.1", "Segregation of information systems", "A.12", "technical");

    // Clause A.13: System Acquisition, Development and Maintenance
    this.addControl("A.13.1.1", "Analysis and specification of information security requirements", "A.13", "technical");
    this.addControl("A.13.1.2", "Securing application services on public networks", "A.13", "technical");
    this.addControl("A.13.1.3", "Protection of application services transactions", "A.13", "technical");
    this.addControl("A.13.2.1", "Secure development policy", "A.13", "technical");
    this.addControl("A.13.2.2", "System change control procedures", "A.13", "technical");
    this.addControl("A.13.2.3", "Access control for program source code", "A.13", "technical");
    this.addControl("A.13.2.4", "Secure system architecture and engineering principles", "A.13", "technical");
    this.addControl("A.13.3.1", "Data validation", "A.13", "technical");
    this.addControl("A.13.3.2", "Insecure development practices", "A.13", "technical");
    this.addControl("A.13.3.3", "Outsourced development", "A.13", "technical");

    // Clause A.14: Supplier Relationships
    this.addControl("A.14.1.1", "Information security requirements for supplier relationships", "A.14", "administrative");
    this.addControl("A.14.1.2", "Addressing information security in supplier agreements", "A.14", "administrative");
    this.addControl("A.14.1.3", "Information and communication technology (ICT) supply chain", "A.14", "administrative");
    this.addControl("A.14.2.1", "Monitoring and review of supplier services", "A.14", "administrative");
    this.addControl("A.14.2.2", "Managing changes to supplier services", "A.14", "administrative");

    // Clause A.15: Information Security Incident Management
    this.addControl("A.15.1.1", "Detection and reporting of information security events", "A.15", "technical");
    this.addControl("A.15.1.2", "Assessment and decision on information security events", "A.15", "technical");
    this.addControl("A.15.2.1", "Response to information security incidents", "A.15", "technical");

    // Clause A.16: Business Continuity Management
    this.addControl("A.16.1.1", "Planning information security continuity", "A.16", "administrative");
    this.addControl("A.16.1.2", "Implementing information security continuity", "A.16", "administrative");
    this.addControl("A.16.1.3", "Verify, review and evaluate information security continuity", "A.16", "administrative");

    // Clause A.17: Compliance
    this.addControl("A.17.1.1", "Identification of applicable legislation and regulations", "A.17", "administrative");
    this.addControl("A.17.1.2", "Intellectual property rights (IPR)", "A.17", "administrative");
    this.addControl("A.17.1.3", "Protection of records", "A.17", "administrative");
    this.addControl("A.17.2.1", "Information security reviews by management", "A.17", "administrative");
    this.addControl("A.17.2.2", "Compliance with security policies and standards", "A.17", "administrative");
    this.addControl("A.17.2.3", "Technical compliance review", "A.17", "technical");
  }

  private addControl(id: string, name: string, clause: string, category: "administrative" | "technical" | "physical"): void {
    const control: ISO27001Control = {
      controlId: id,
      controlName: name,
      clause,
      category,
      description: `Control ${id}: ${name}`,
    };
    this.allControls.push(control);
    this.controlCache.set(id, control);
  }

  /**
   * Get all controls
   */
  getAllControls(): ISO27001Control[] {
    return this.allControls;
  }

  /**
   * Get controls by clause
   */
  getControlsByClause(clause: string): ISO27001Control[] {
    return this.allControls.filter((c) => c.clause === clause);
  }

  /**
   * Get controls by category
   */
  getControlsByCategory(category: "administrative" | "technical" | "physical"): ISO27001Control[] {
    return this.allControls.filter((c) => c.category === category);
  }

  /**
   * Calculate risk score
   */
  calculateRiskScore(likelihood: string, impact: string): number {
    const likelihoodScore: Record<string, number> = {
      rare: 1,
      unlikely: 2,
      possible: 3,
      likely: 4,
      almost_certain: 5,
    };

    const impactScore: Record<string, number> = {
      negligible: 1,
      minor: 2,
      moderate: 3,
      major: 4,
      catastrophic: 5,
    };

    return (likelihoodScore[likelihood] || 0) * (impactScore[impact] || 0);
  }

  /**
   * Identify control gaps
   */
  identifyControlGaps(currentControls: Map<string, string>): ControlGap[] {
    const gaps: ControlGap[] = [];

    for (const control of this.allControls) {
      const currentStatus = currentControls.get(control.controlId) || "not_implemented";
      
      if (currentStatus !== "implemented" && currentStatus !== "optimized") {
        gaps.push({
          controlId: control.controlId,
          currentStatus: currentStatus as "not_implemented" | "partial" | "implemented",
          requiredStatus: "implemented",
          remediationEffort: this.estimateRemediationEffort(control.category),
          remediationCost: this.estimateRemediationCost(control.category),
        });
      }
    }

    return gaps.sort((a, b) => b.remediationCost - a.remediationCost);
  }

  private estimateRemediationEffort(category: string): "low" | "medium" | "high" {
    switch (category) {
      case "administrative":
        return "low";
      case "physical":
        return "medium";
      case "technical":
        return "high";
      default:
        return "medium";
    }
  }

  private estimateRemediationCost(category: string): number {
    switch (category) {
      case "administrative":
        return 5000;
      case "physical":
        return 15000;
      case "technical":
        return 25000;
      default:
        return 10000;
    }
  }

  /**
   * Generate compliance score
   */
  generateComplianceScore(implementedControls: number, totalControls: number): number {
    return Math.round((implementedControls / totalControls) * 100);
  }
}

export function getISO27001Service(): ISO27001Service {
  return ISO27001Service.getInstance();
}
