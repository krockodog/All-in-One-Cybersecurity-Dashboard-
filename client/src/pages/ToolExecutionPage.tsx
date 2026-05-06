/**
 * Tool Execution Page - Unified Tool Execution Platform
 * Server-side execution of 118 tools with Live Terminal Output
 */

import React, { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toolCatalog, type ToolDefinition as CatalogToolDefinition } from '@/lib/cyber-data';
import DashboardLayout from '@/components/DashboardLayout';
import { ToolParameterEditor, validateToolParameters, type ToolParameterField, type ToolParameterValue } from '@/components/ToolParameterEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Copy, Search, Grid3x3, List, ShieldCheck, Wrench } from 'lucide-react';

interface Tool extends Omit<CatalogToolDefinition, 'inputFields'> {
  parameters: ToolParameterField[];
  tags: string[];
}

interface ExecutionSession {
  sessionId: string;
  toolId: string;
  toolName: string;
  status: 'running' | 'completed' | 'error' | 'cancelled';
  output: string;
  summary: string;
  command: string;
  findings: string[];
  startTime: Date;
  endTime?: Date;
}

const TARGET_FIELD_PRIORITY = ['target', 'domain', 'url', 'host', 'hostname', 'query', 'username', 'email', 'entity', 'profile', 'interface'];

const mapCatalogTool = (tool: CatalogToolDefinition): Tool => ({
  ...tool,
  parameters: tool.inputFields.map(field => ({
    name: field.name,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder,
    options: field.options,
    description: field.placeholder
      ? `Empfohlene Eingabe: ${field.placeholder}`
      : `Parameter für ${tool.name}`,
    required: true,
  })),
  tags: [tool.category, tool.risk, tool.executionMode],
});

const createInitialValues = (tool: Tool | null) => {
  if (!tool) return {};

  return tool.parameters.reduce<Record<string, ToolParameterValue>>((accumulator, parameter) => {
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
};

const formatCliOptions = (tool: Tool, values: Record<string, ToolParameterValue>) => {
  const targetField = TARGET_FIELD_PRIORITY.find(name => tool.parameters.some(parameter => parameter.name === name)) ?? tool.parameters[0]?.name;

  const targetValue = String(values[targetField ?? ''] ?? '').trim();

  const options = tool.parameters
    .filter(parameter => parameter.name !== targetField)
    .flatMap(parameter => {
      const value = values[parameter.name];

      if (value === null || value === undefined) return [];
      if (typeof value === 'boolean') return value ? [`--${parameter.name}`] : [];
      if (Array.isArray(value)) return value.flatMap(entry => [`--${parameter.name}`, entry]);
      if (value instanceof File) return [`--${parameter.name}`, value.name];

      const normalized = String(value).trim();
      if (!normalized) return [];
      return [`--${parameter.name}`, normalized];
    })
    .join(' ');

  return {
    target: targetValue,
    options,
  };
};

export default function ToolExecutionPage() {
  const tools = useMemo(() => toolCatalog.map(mapCatalogTool), []);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(tools[0] ?? null);
  const [parameters, setParameters] = useState<Record<string, ToolParameterValue>>(createInitialValues(tools[0] ?? null));
  const [parameterErrors, setParameterErrors] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<ExecutionSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const executeMutation = trpc.tools.run.useMutation();

  const filteredTools = useMemo(
    () =>
      tools.filter(tool =>
        [tool.name, tool.description, ...tool.tags].some(value =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ),
    [searchQuery, tools]
  );

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setParameters(createInitialValues(tool));
    setParameterErrors({});
  };

  const handleParameterChange = (paramName: string, value: ToolParameterValue) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
    setParameterErrors(prev => {
      if (!prev[paramName]) return prev;
      const next = { ...prev };
      delete next[paramName];
      return next;
    });
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    const errors = validateToolParameters(selectedTool.parameters, parameters);
    setParameterErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const { target, options } = formatCliOptions(selectedTool, parameters);
    const sessionId = `session-${Date.now()}`;
    const startTime = new Date();

    setSessions(prev => [
      {
        sessionId,
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        status: 'running',
        output: `[*] Starte ${selectedTool.name} gegen ${target || 'unbekanntes Ziel'}\n[*] Optionen: ${options || '(keine)'}\n`,
        summary: 'Ausführung wurde initialisiert.',
        command: `${selectedTool.id} ${options} ${target}`.trim(),
        findings: [],
        startTime,
      },
      ...prev,
    ]);

    try {
      const result = await executeMutation.mutateAsync({
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        baseCommand: selectedTool.id,
        target,
        options,
        category: selectedTool.category,
      });

      setSessions(prev =>
        prev.map(session =>
          session.sessionId === sessionId
            ? {
                ...session,
                status: result.status === 'success' ? 'completed' : 'error',
                output: result.output,
                summary: result.summary,
                command: result.command,
                findings: result.findings,
                endTime: new Date(),
              }
            : session
        )
      );
    } catch (error) {
      setSessions(prev =>
        prev.map(session =>
          session.sessionId === sessionId
            ? {
                ...session,
                status: 'error',
                output: `${session.output}\n[ERROR] ${(error as Error).message}`,
                summary: 'Die serverseitige Ausführung ist fehlgeschlagen.',
                endTime: new Date(),
              }
            : session
        )
      );
    }
  };

  const handleExport = (sessionId: string, format: 'json' | 'csv' | 'txt' | 'html') => {
    const session = sessions.find(entry => entry.sessionId === sessionId);
    if (!session) return;

    const content =
      format === 'json'
        ? JSON.stringify(session, null, 2)
        : `Tool: ${session.toolName}\nSession: ${session.sessionId}\nStatus: ${session.status}\nBefehl: ${session.command}\n\n${session.output}`;

    const mimeType = format === 'json' ? 'application/json' : format === 'html' ? 'text/html' : 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${session.toolId}-${session.sessionId}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6 p-6 bg-background">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Tool Execution Platform</h1>
          <p className="text-muted-foreground">
            Führe 118 Security-Tools mit einem dynamischen Parameter-Editor aus und starte echte serverseitige Läufe statt Platzhalter-Workflows.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tool-Katalog</CardDescription>
              <CardTitle className="text-2xl">118</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Registry-basierte Auswahl
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gefiltert</CardDescription>
              <CardTitle className="text-2xl">{filteredTools.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Sofort nach Name, Beschreibung und Tags
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Aktives Tool</CardDescription>
              <CardTitle className="text-2xl">{selectedTool?.name ?? '—'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                {selectedTool?.parameters.length ?? 0} Parameter konfigurierbar
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Letzte Läufe</CardDescription>
              <CardTitle className="text-2xl">{sessions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Verlauf mit Export und Kopierfunktion
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
                <CardDescription>Wähle ein Tool aus dem 118er Katalog.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-2 max-h-[70vh] overflow-auto pr-1' : 'flex flex-col gap-2 max-h-[70vh] overflow-auto pr-1'}>
                  {filteredTools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={selectedTool?.id === tool.id ? 'default' : 'outline'}
                      className="justify-start h-auto px-3 py-3 text-left"
                      onClick={() => handleToolSelect(tool)}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="font-semibold">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tool.tags.map(tag => (
                            <Badge key={`${tool.id}-${tag}`} variant="secondary" className="text-[10px] uppercase tracking-wide">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            {selectedTool ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{selectedTool.name}</CardTitle>
                        <CardDescription>{selectedTool.description}</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{selectedTool.category}</Badge>
                        <Badge variant="secondary">{selectedTool.executionMode}</Badge>
                        <Badge variant="outline">Risk: {selectedTool.risk}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <ToolParameterEditor
                  parameters={selectedTool.parameters}
                  values={parameters}
                  errors={parameterErrors}
                  disabled={executeMutation.isPending}
                  title="Parameter Editor"
                  description="Alle Felder werden dynamisch aus dem zentralen 118er Tool-Katalog erzeugt. Pflichtfelder werden vor der Ausführung validiert."
                  onChange={handleParameterChange}
                  onReset={() => {
                    setParameters(createInitialValues(selectedTool));
                    setParameterErrors({});
                  }}
                />

                <Button
                  onClick={handleExecute}
                  disabled={executeMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  {executeMutation.isPending ? 'Executing...' : 'Execute Tool'}
                </Button>

                {sessions.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Execution History</CardTitle>
                      <CardDescription>Reale serverseitige Läufe mit Export- und Copy-Funktionen.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {sessions.map(session => (
                        <div key={session.sessionId} className="rounded-lg border p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  session.status === 'completed'
                                    ? 'default'
                                    : session.status === 'error'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {session.status}
                              </Badge>
                              <span className="text-sm font-semibold">{session.toolName}</span>
                              <span className="text-xs text-muted-foreground">
                                {session.startTime.toLocaleString('de-DE')}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleExport(session.sessionId, 'json')}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(session.output)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mb-3 space-y-1 text-sm">
                            <p><span className="font-medium">Summary:</span> {session.summary}</p>
                            <p className="break-all"><span className="font-medium">Command:</span> {session.command}</p>
                          </div>

                          {session.findings.length > 0 ? (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {session.findings.slice(0, 6).map((finding, index) => (
                                <Badge key={`${session.sessionId}-finding-${index}`} variant="outline" className="max-w-full truncate">
                                  {finding}
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          <div className="max-h-52 overflow-auto rounded bg-black p-3 font-mono text-xs text-green-400">
                            {session.output}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : (
              <Card>
                <CardContent className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">Select a tool to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
