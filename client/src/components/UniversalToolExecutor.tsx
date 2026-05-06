/**
 * Universal Tool Executor Component
 * Execute any tool with dynamic parameter input and live output
 */

import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveTerminal } from './LiveTerminal';
import { ToolParameterEditor, validateToolParameters, type ToolParameterField, type ToolParameterValue } from './ToolParameterEditor';
import { Play, Square, RotateCcw } from 'lucide-react';

interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters: Array<Omit<ToolParameterField, 'type'> & { type: string }>;
}

interface ExecutorState {
  isRunning: boolean;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  sessionId?: string;
  parameters: Record<string, ToolParameterValue>;
  errors: Record<string, string>;
}

interface UniversalToolExecutorProps {
  tool: ToolDefinition;
  onExecutionComplete?: (output: string) => void;
}

const normalizeParameterType = (type: string): ToolParameterField['type'] => {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'select':
    case 'string':
    case 'number':
    case 'boolean':
    case 'multiselect':
    case 'file':
      return type;
    default:
      return 'text';
  }
};

const normalizeToolParameters = (tool: ToolDefinition): ToolParameterField[] =>
  tool.parameters.map(parameter => ({
    ...parameter,
    type: normalizeParameterType(parameter.type),
  }));

const createInitialParameters = (parametersSchema: ToolParameterField[]) =>
  parametersSchema.reduce<Record<string, ToolParameterValue>>((accumulator, parameter) => {
    if (parameter.default !== undefined) {
      accumulator[parameter.name] = parameter.default;
    } else if (parameter.type === 'boolean') {
      accumulator[parameter.name] = false;
    } else if (parameter.type === 'multiselect') {
      accumulator[parameter.name] = [];
    } else {
      accumulator[parameter.name] = '';
    }
    return accumulator;
  }, {});

const getPrimaryTarget = (parametersSchema: ToolParameterField[], parameters: Record<string, ToolParameterValue>) => {
  const priority = ['target', 'domain', 'url', 'host', 'hostname', 'query', 'email', 'username'];
  const key =
    priority.find(candidate => parametersSchema.some(parameter => parameter.name === candidate)) ??
    parametersSchema[0]?.name;
  return String(parameters[key ?? ''] ?? '').trim();
};

const buildOptions = (parametersSchema: ToolParameterField[], parameters: Record<string, ToolParameterValue>) => {
  const primaryTarget = getPrimaryTarget(parametersSchema, parameters);

  return parametersSchema
    .filter(parameter => String(parameters[parameter.name] ?? '').trim() !== primaryTarget)
    .flatMap(parameter => {
      const value = parameters[parameter.name];

      if (value === null || value === undefined) return [];
      if (typeof value === 'boolean') return value ? [`--${parameter.name}`] : [];
      if (Array.isArray(value)) return value.flatMap(entry => [`--${parameter.name}`, entry]);
      if (value instanceof File) return [`--${parameter.name}`, value.name];

      const normalized = String(value).trim();
      if (!normalized || normalized === primaryTarget) return [];
      return [`--${parameter.name}`, normalized];
    })
    .join(' ');
};

export const UniversalToolExecutor: React.FC<UniversalToolExecutorProps> = ({
  tool,
  onExecutionComplete,
}) => {
  const executeMutation = trpc.tools.run.useMutation();
  const normalizedParameters = useMemo(() => normalizeToolParameters(tool), [tool]);
  const initialParameters = useMemo(() => createInitialParameters(normalizedParameters), [normalizedParameters]);
  const [state, setState] = useState<ExecutorState>({
    isRunning: false,
    output: '',
    status: 'pending',
    parameters: initialParameters,
    errors: {},
  });

  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      parameters: createInitialParameters(normalizedParameters),
      errors: {},
      output: '',
      status: 'pending',
      isRunning: false,
      sessionId: undefined,
    }));
  }, [normalizedParameters]);

  const handleParameterChange = (paramName: string, value: ToolParameterValue) => {
    setState(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value,
      },
      errors: Object.fromEntries(Object.entries(prev.errors).filter(([key]) => key !== paramName)),
    }));
  };

  const handleExecute = async () => {
    const errors = validateToolParameters(normalizedParameters, state.parameters);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    const target = getPrimaryTarget(normalizedParameters, state.parameters);
    const options = buildOptions(normalizedParameters, state.parameters);
    const sessionId = `session-${Date.now()}`;

    setState(prev => ({
      ...prev,
      isRunning: true,
      status: 'running',
      errors: {},
      output: `[${new Date().toISOString()}] Starting ${tool.name}...\n[${new Date().toISOString()}] Target: ${target || 'n/a'}\n[${new Date().toISOString()}] Options: ${options || '(none)'}\n`,
      sessionId,
    }));

    try {
      const result = await executeMutation.mutateAsync({
        toolId: tool.id,
        toolName: tool.name,
        baseCommand: tool.id,
        target,
        options,
        category: tool.category as any,
      });

      setState(prev => {
        const nextOutput = result.output || `${prev.output}\n[${new Date().toISOString()}] Execution completed\n`;
        onExecutionComplete?.(nextOutput);
        return {
          ...prev,
          isRunning: false,
          status: result.status === 'success' ? 'completed' : 'failed',
          output: nextOutput,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        status: 'failed',
        output: `${prev.output}\n[ERROR] ${(error as Error).message}\n`,
      }));
    }
  };

  const handleCancel = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      status: 'cancelled',
      output: `${prev.output}\n[${new Date().toISOString()}] Execution cancelled\n`,
    }));
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      output: '',
      status: 'pending',
    }));
  };

  const handleResetParameters = () => {
    setState(prev => ({
      ...prev,
      parameters: createInitialParameters(normalizedParameters),
      errors: {},
    }));
  };

  const handleExport = () => {
    const element = document.createElement('a');
    const file = new Blob([state.output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${tool.id}-output-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{tool.name}</CardTitle>
              <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
            </div>
            <Badge>{tool.category}</Badge>
          </div>
        </CardHeader>
      </Card>

      <ToolParameterEditor
        parameters={normalizedParameters}
        values={state.parameters}
        errors={state.errors}
        disabled={state.isRunning}
        description="Dynamische Eingabefelder inklusive Pflichtfeld- und Typvalidierung für das ausgewählte Tool."
        onChange={handleParameterChange}
        onReset={handleResetParameters}
      />

      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleExecute}
          disabled={state.isRunning || executeMutation.isPending}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Execute
        </Button>

        {state.isRunning ? (
          <Button
            onClick={handleCancel}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Cancel
          </Button>
        ) : null}

        {!state.isRunning && state.output ? (
          <Button
            onClick={handleClear}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="h-96">
        <LiveTerminal
          output={state.output}
          isRunning={state.isRunning}
          status={state.status}
          onCancel={handleCancel}
          onClear={handleClear}
          onExport={handleExport}
          sessionId={state.sessionId}
        />
      </div>
    </div>
  );
};
