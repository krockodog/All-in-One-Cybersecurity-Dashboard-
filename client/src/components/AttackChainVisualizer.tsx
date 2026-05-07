/**
 * Attack Chain Visualization Component
 * Visualizes cyber kill chain, lateral movement, and persistence mechanisms
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  AlertCircle,
  Zap,
  Lock,
  Eye,
  Database,
  Server,
  GitBranch,
} from 'lucide-react';

interface AttackPhaseNode {
  id: string;
  phase: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  exploitability: number;
  detectionMethods: string[];
  evasionTechniques: string[];
}

interface AttackChainVisualizerProps {
  nodes: AttackPhaseNode[];
  title?: string;
  description?: string;
}

const PHASE_COLORS: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  reconnaissance: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    icon: <Eye className="w-5 h-5" />,
  },
  weaponization: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-300 dark:border-purple-700',
    icon: <Zap className="w-5 h-5" />,
  },
  delivery: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-300 dark:border-orange-700',
    icon: <Database className="w-5 h-5" />,
  },
  exploitation: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-300 dark:border-red-700',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  installation: {
    bg: 'bg-pink-50 dark:bg-pink-950',
    border: 'border-pink-300 dark:border-pink-700',
    icon: <Lock className="w-5 h-5" />,
  },
  command_and_control: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-300 dark:border-red-700',
    icon: <Server className="w-5 h-5" />,
  },
  actions_on_objectives: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-300 dark:border-red-700',
    icon: <Shield className="w-5 h-5" />,
  },
  lateral_movement: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: <GitBranch className="w-5 h-5" />,
  },
  persistence: {
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    border: 'border-indigo-300 dark:border-indigo-700',
    icon: <Lock className="w-5 h-5" />,
  },
};

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[severity] || colors.medium;
};

export function AttackChainVisualizer({
  nodes,
  title = 'Attack Chain Analysis',
  description = 'Cyber Kill Chain visualization showing attack progression',
}: AttackChainVisualizerProps) {
  const groupedByPhase = useMemo(() => {
    const groups: Record<string, AttackPhaseNode[]> = {};
    nodes.forEach((node) => {
      if (!groups[node.phase]) {
        groups[node.phase] = [];
      }
      groups[node.phase].push(node);
    });
    return groups;
  }, [nodes]);

  const phases = Object.keys(groupedByPhase);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Attack Chain Flow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Attack Progression</h3>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-2 min-w-max">
                {phases.map((phase, idx) => {
                  const phaseConfig = PHASE_COLORS[phase] || PHASE_COLORS.reconnaissance;
                  const phaseNodes = groupedByPhase[phase];

                  return (
                    <React.Fragment key={phase}>
                      <div
                        className={`p-4 rounded-lg border-2 min-w-[200px] ${phaseConfig.bg} ${phaseConfig.border}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {phaseConfig.icon}
                          <h4 className="font-semibold text-sm capitalize">
                            {phase.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {phaseNodes.map((node) => (
                            <div key={node.id} className="text-xs">
                              <p className="font-medium">{node.name}</p>
                              <Badge className={`mt-1 ${getSeverityColor(node.severity)}`}>
                                {node.severity.toUpperCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {idx < phases.length - 1 && (
                        <div className="flex items-center justify-center px-2">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Phase Analysis */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Detailed Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node) => {
                const phaseConfig = PHASE_COLORS[node.phase] || PHASE_COLORS.reconnaissance;

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-lg border-2 ${phaseConfig.bg} ${phaseConfig.border}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {phaseConfig.icon}
                        <div>
                          <h4 className="font-semibold text-sm">{node.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {node.phase.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(node.severity)}>
                        {node.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm mb-3">{node.description}</p>

                    {/* Exploitability Score */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">Exploitability</span>
                        <span className="text-xs font-bold">
                          {Math.round(node.exploitability * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${node.exploitability * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Detection Methods */}
                    {node.detectionMethods.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-1">Detection Methods:</p>
                        <div className="flex flex-wrap gap-1">
                          {node.detectionMethods.map((method, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evasion Techniques */}
                    {node.evasionTechniques.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1">Evasion Techniques:</p>
                        <div className="flex flex-wrap gap-1">
                          {node.evasionTechniques.map((technique, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Nodes</p>
              <p className="text-2xl font-bold">{nodes.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Exploitability</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  (nodes.reduce((sum, n) => sum + n.exploitability, 0) / nodes.length) * 100
                )}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Critical Nodes</p>
              <p className="text-2xl font-bold text-red-600">
                {nodes.filter((n) => n.severity === 'critical').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(PHASE_COLORS).map(([phase, config]) => (
              <div key={phase} className="flex items-center gap-2">
                {config.icon}
                <span className="text-sm capitalize">{phase.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
