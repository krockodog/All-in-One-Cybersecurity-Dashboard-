/**
 * Tool Execution Dashboard
 * Central platform for executing all 118 tools with live output
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UniversalToolExecutor } from '@/components/UniversalToolExecutor';
import { Search, Grid, List } from 'lucide-react';

// Mock tool definitions - in production, fetch from backend
const MOCK_TOOLS = [
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'recon',
    description: 'Network mapper - scan networks and hosts',
    parameters: [
      {
        name: 'target',
        type: 'string',
        label: 'Target Host/Network',
        description: 'IP address, hostname, or CIDR range',
        required: true,
        placeholder: '192.168.1.0/24',
      },
      {
        name: 'scanType',
        type: 'select',
        label: 'Scan Type',
        description: 'Type of scan to perform',
        required: true,
      },
      {
        name: 'ports',
        type: 'string',
        label: 'Ports',
        description: 'Specific ports to scan (e.g., 80,443,8080)',
        required: false,
        placeholder: '1-1000',
      },
      {
        name: 'aggressive',
        type: 'boolean',
        label: 'Aggressive Scan',
        description: 'Enable aggressive scan mode',
        required: false,
      },
    ],
  },
  {
    id: 'shodan',
    name: 'Shodan',
    category: 'osint',
    description: 'Search engine for internet-connected devices',
    parameters: [
      {
        name: 'query',
        type: 'string',
        label: 'Search Query',
        description: 'Shodan search query',
        required: true,
        placeholder: 'apache country:US',
      },
      {
        name: 'limit',
        type: 'number',
        label: 'Result Limit',
        description: 'Maximum number of results',
        required: false,
        default: '100',
      },
    ],
  },
  {
    id: 'sqlmap',
    name: 'SQLMap',
    category: 'pentest',
    description: 'Automatic SQL injection detection and exploitation',
    parameters: [
      {
        name: 'url',
        type: 'string',
        label: 'Target URL',
        description: 'URL to test for SQL injection',
        required: true,
        placeholder: 'http://target.com/page.php?id=1',
      },
      {
        name: 'technique',
        type: 'select',
        label: 'Injection Technique',
        description: 'SQL injection technique',
        required: false,
      },
      {
        name: 'riskLevel',
        type: 'number',
        label: 'Risk Level',
        description: 'Risk level (1-3)',
        required: false,
        default: '1',
      },
    ],
  },
  {
    id: 'leakix',
    name: 'LeakIX',
    category: 'osint',
    description: 'Search for exposed services and vulnerabilities',
    parameters: [
      {
        name: 'target',
        type: 'string',
        label: 'Target',
        description: 'Domain, IP, or hostname',
        required: true,
        placeholder: 'example.com',
      },
      {
        name: 'scope',
        type: 'select',
        label: 'Search Scope',
        description: 'What to search for',
        required: true,
      },
    ],
  },
];

interface ToolExecutionDashboardProps {}

export const ToolExecutionDashboard: React.FC<ToolExecutionDashboardProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTool, setSelectedTool] = useState<(typeof MOCK_TOOLS)[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter tools
  const filteredTools = MOCK_TOOLS.filter(tool => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(MOCK_TOOLS.map(t => t.category)));

  if (selectedTool) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => setSelectedTool(null)}>
          ← Back to Tools
        </Button>
        <UniversalToolExecutor
          tool={selectedTool}
          onExecutionComplete={() => {
            // Handle completion
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tool Execution Platform</h1>
        <p className="text-gray-600 mt-2">
          Führe 118 Security-Tools mit Live-Output und Echtzeit-Monitoring aus
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Tools
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:border-cyan-500 transition"
              onClick={() => setSelectedTool(tool)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                  </div>
                  <Badge>{tool.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  {tool.parameters.length} parameters
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTools.map(tool => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:border-cyan-500 transition"
              onClick={() => setSelectedTool(tool)}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{tool.name}</div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{tool.category}</Badge>
                  <span className="text-xs text-gray-500">{tool.parameters.length} params</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No tools found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
