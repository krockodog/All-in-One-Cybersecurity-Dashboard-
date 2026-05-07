/**
 * Workflow Automation Manager UI Component
 * Manage and configure automated workflow rules
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Play, Pause, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  lastRun?: Date;
  status: 'active' | 'inactive' | 'error';
}

export function WorkflowAutomationManager() {
  const [rules, setRules] = useState<WorkflowRule[]>([
    {
      id: '1',
      name: 'Auto-Export on Scan Complete',
      trigger: 'scan_complete',
      actions: ['export_pdf', 'export_json', 'send_notification'],
      enabled: true,
      status: 'active',
      lastRun: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      name: 'Critical Finding Alert',
      trigger: 'critical_finding_detected',
      actions: ['send_email', 'create_ticket', 'notify_team'],
      enabled: true,
      status: 'active',
    },
    {
      id: '3',
      name: 'Daily Report Generation',
      trigger: 'schedule_daily_9am',
      actions: ['generate_report', 'send_email', 'archive'],
      enabled: false,
      status: 'inactive',
    },
  ]);

  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? { ...rule, enabled: !rule.enabled, status: !rule.enabled ? 'active' : 'inactive' }
          : rule
      )
    );
    toast.success('Workflow rule updated');
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
    toast.success('Workflow rule deleted');
  };

  const handleSaveRule = (rule: WorkflowRule) => {
    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      toast.success('Workflow rule updated');
    } else {
      setRules((prev) => [...prev, { ...rule, id: Date.now().toString() }]);
      toast.success('Workflow rule created');
    }
    setEditingRule(null);
    setShowForm(false);
  };

  const activeRules = rules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {activeRules} of {rules.length} rules active
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    {rule.status === 'active' && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    {rule.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    Trigger: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{rule.trigger}</code>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.enabled ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingRule(rule);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action) => (
                      <span
                        key={action}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium"
                      >
                        {action.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                {rule.lastRun && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Last run: {rule.lastRun.toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowRuleForm
              rule={editingRule}
              onSave={handleSaveRule}
              onCancel={() => {
                setShowForm(false);
                setEditingRule(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Default Rules Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Default Rules</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Auto-Export:</strong> Automatically export scan results in multiple formats when scan completes
          </p>
          <p>
            <strong>Critical Alert:</strong> Immediately notify team when critical findings are detected
          </p>
          <p>
            <strong>Daily Report:</strong> Generate and send daily security reports at scheduled time
          </p>
          <p>
            <strong>Result Chaining:</strong> Pass results from one tool to another automatically
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface WorkflowRuleFormProps {
  rule?: WorkflowRule | null;
  onSave: (rule: WorkflowRule) => void;
  onCancel: () => void;
}

function WorkflowRuleForm({ rule, onSave, onCancel }: WorkflowRuleFormProps) {
  const [formData, setFormData] = useState<Partial<WorkflowRule>>(
    rule || {
      name: '',
      trigger: 'scan_complete',
      actions: [],
      enabled: true,
      status: 'active',
    }
  );

  const availableTriggers = [
    'scan_complete',
    'critical_finding_detected',
    'schedule_daily_9am',
    'schedule_weekly_monday',
    'manual_trigger',
  ];

  const availableActions = [
    'export_pdf',
    'export_json',
    'export_csv',
    'send_email',
    'send_notification',
    'create_ticket',
    'notify_team',
    'archive',
    'generate_report',
  ];

  const handleActionToggle = (action: string) => {
    const current = formData.actions || [];
    setFormData({
      ...formData,
      actions: current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rule Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
          placeholder="e.g., Auto-Export on Scan Complete"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Trigger Event</label>
        <select
          value={formData.trigger || 'scan_complete'}
          onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
        >
          {availableTriggers.map((trigger) => (
            <option key={trigger} value={trigger}>
              {trigger.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Actions</label>
        <div className="grid grid-cols-2 gap-2">
          {availableActions.map((action) => (
            <label key={action} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData.actions || []).includes(action)}
                onChange={() => handleActionToggle(action)}
                className="rounded"
              />
              <span className="text-sm">{action.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (formData.name && formData.actions?.length) {
              onSave(formData as WorkflowRule);
            } else {
              toast.error('Please fill in all fields');
            }
          }}
        >
          Save Rule
        </Button>
      </div>
    </div>
  );
}
