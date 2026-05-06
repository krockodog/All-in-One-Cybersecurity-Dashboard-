/**
 * Workflow Automation Engine
 * Automatically chain results from one tool to the next
 */

export interface AutomationRule {
  id: string;
  name: string;
  trigger: TriggerCondition;
  actions: AutomationAction[];
  enabled: boolean;
  priority: number;
}

export interface TriggerCondition {
  type: 'tool_completed' | 'finding_detected' | 'risk_threshold' | 'scheduled';
  tool?: string;
  findingType?: string;
  threshold?: number;
  schedule?: string;
}

export interface AutomationAction {
  type: 'run_tool' | 'export_results' | 'notify_user' | 'create_ticket' | 'run_workflow';
  target: string;
  parameters?: Record<string, any>;
  condition?: string;
}

export interface WorkflowExecution {
  id: string;
  rules: AutomationRule[];
  executions: ExecutionLog[];
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

export interface ExecutionLog {
  ruleID: string;
  action: AutomationAction;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export class WorkflowAutomationEngine {
  private static rules: Map<string, AutomationRule> = new Map();
  private static executions: Map<string, WorkflowExecution> = new Map();

  /**
   * Register automation rule
   */
  static registerRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
    console.log(`[Automation] Registered rule: ${rule.name}`);
  }

  /**
   * Execute automation workflow
   */
  static async executeWorkflow(triggerData: any): Promise<WorkflowExecution> {
    const executionID = `exec-${Date.now()}`;
    const execution: WorkflowExecution = {
      id: executionID,
      rules: [],
      executions: [],
      status: 'running',
      startTime: new Date(),
    };

    console.log(`[Automation] Starting workflow execution: ${executionID}`);

    // Find matching rules
    const matchingRules = Array.from(this.rules.values()).filter(
      (rule) => rule.enabled && this.matchesTrigger(rule.trigger, triggerData)
    );

    execution.rules = matchingRules;

    // Execute rules in priority order
    for (const rule of matchingRules.sort((a, b) => b.priority - a.priority)) {
      for (const action of rule.actions) {
        const log: ExecutionLog = {
          ruleID: rule.id,
          action,
          status: 'pending',
          startTime: new Date(),
        };

        try {
          log.status = 'running';
          log.result = await this.executeAction(action, triggerData);
          log.status = 'completed';
          log.endTime = new Date();

          console.log(`[Automation] Action completed: ${action.type} for rule ${rule.id}`);
        } catch (error) {
          log.status = 'failed';
          log.error = String(error);
          log.endTime = new Date();

          console.error(`[Automation] Action failed: ${action.type} for rule ${rule.id}`, error);
        }

        execution.executions.push(log);
      }
    }

    execution.status = execution.executions.some((e) => e.status === 'failed') ? 'failed' : 'completed';
    execution.endTime = new Date();

    this.executions.set(executionID, execution);

    return execution;
  }

  /**
   * Check if trigger matches
   */
  private static matchesTrigger(trigger: TriggerCondition, data: any): boolean {
    switch (trigger.type) {
      case 'tool_completed':
        return data.tool === trigger.tool;

      case 'finding_detected':
        return data.findingType === trigger.findingType;

      case 'risk_threshold':
        return data.riskScore && data.riskScore >= (trigger.threshold || 0);

      case 'scheduled':
        // Simplified scheduling check
        return true;

      default:
        return false;
    }
  }

  /**
   * Execute action
   */
  private static async executeAction(action: AutomationAction, triggerData: any): Promise<any> {
    switch (action.type) {
      case 'run_tool':
        return this.runTool(action.target, action.parameters, triggerData);

      case 'export_results':
        return this.exportResults(action.target, action.parameters, triggerData);

      case 'notify_user':
        return this.notifyUser(action.target, action.parameters, triggerData);

      case 'create_ticket':
        return this.createTicket(action.target, action.parameters, triggerData);

      case 'run_workflow':
        return this.runWorkflow(action.target, action.parameters, triggerData);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Run tool
   */
  private static async runTool(tool: string, parameters: any = {}, triggerData: any): Promise<any> {
    console.log(`[Automation] Running tool: ${tool}`);

    // Simulate tool execution
    return {
      tool,
      status: 'completed',
      results: {
        ...triggerData,
        toolExecuted: tool,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Export results
   */
  private static async exportResults(format: string, parameters: any = {}, triggerData: any): Promise<any> {
    console.log(`[Automation] Exporting results to format: ${format}`);

    // Simulate export
    return {
      format,
      status: 'completed',
      filename: `export_${Date.now()}.${format}`,
      size: Math.floor(Math.random() * 1000000),
    };
  }

  /**
   * Notify user
   */
  private static async notifyUser(channel: string, parameters: any = {}, triggerData: any): Promise<any> {
    console.log(`[Automation] Notifying user via: ${channel}`);

    // Simulate notification
    return {
      channel,
      status: 'sent',
      notificationID: `notif-${Date.now()}`,
      message: parameters.message || 'Automation action completed',
    };
  }

  /**
   * Create ticket
   */
  private static async createTicket(system: string, parameters: any = {}, triggerData: any): Promise<any> {
    console.log(`[Automation] Creating ticket in: ${system}`);

    // Simulate ticket creation
    return {
      system,
      status: 'created',
      ticketID: `TKT-${Date.now()}`,
      title: parameters.title || 'Security Finding',
      priority: parameters.priority || 'medium',
    };
  }

  /**
   * Run workflow
   */
  private static async runWorkflow(workflow: string, parameters: any = {}, triggerData: any): Promise<any> {
    console.log(`[Automation] Running workflow: ${workflow}`);

    // Simulate workflow execution
    return {
      workflow,
      status: 'started',
      workflowID: `wf-${Date.now()}`,
      parameters,
    };
  }

  /**
   * Get default automation rules
   */
  static getDefaultRules(): AutomationRule[] {
    return [
      {
        id: 'rule-1',
        name: 'Auto-Export High Risk Findings',
        trigger: {
          type: 'risk_threshold',
          threshold: 70,
        },
        actions: [
          {
            type: 'export_results',
            target: 'txt',
            parameters: { includeMetadata: true },
          },
          {
            type: 'notify_user',
            target: 'email',
            parameters: { message: 'High risk findings detected' },
          },
        ],
        enabled: true,
        priority: 10,
      },
      {
        id: 'rule-2',
        name: 'Auto-Run Vulnerability Analysis',
        trigger: {
          type: 'tool_completed',
          tool: 'leakix',
        },
        actions: [
          {
            type: 'run_tool',
            target: 'nuclei',
            parameters: { templates: 'cves' },
          },
        ],
        enabled: true,
        priority: 8,
      },
      {
        id: 'rule-3',
        name: 'Auto-Create Tickets for Critical Findings',
        trigger: {
          type: 'finding_detected',
          findingType: 'critical',
        },
        actions: [
          {
            type: 'create_ticket',
            target: 'jira',
            parameters: {
              title: 'Critical Security Finding',
              priority: 'highest',
            },
          },
        ],
        enabled: true,
        priority: 9,
      },
      {
        id: 'rule-4',
        name: 'Auto-Run Red Team Analysis',
        trigger: {
          type: 'tool_completed',
          tool: 'shadowfinder',
        },
        actions: [
          {
            type: 'run_workflow',
            target: 'red-team-assessment',
            parameters: { includeExploitation: true },
          },
        ],
        enabled: true,
        priority: 7,
      },
    ];
  }

  /**
   * Get execution history
   */
  static getExecutionHistory(limit: number = 10): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  /**
   * Initialize default rules
   */
  static initializeDefaultRules(): void {
    const defaultRules = this.getDefaultRules();
    defaultRules.forEach((rule) => this.registerRule(rule));
    console.log(`[Automation] Initialized ${defaultRules.length} default rules`);
  }
}

export const workflowAutomationEngine = WorkflowAutomationEngine;
