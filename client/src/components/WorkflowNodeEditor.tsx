import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Zap } from "lucide-react";
import { toolCatalog } from "@/lib/cyber-data";

export interface WorkflowNode {
  id: string;
  toolId: string;
  toolName: string;
  x: number;
  y: number;
  parameters: Record<string, any>;
  inputMapping: Record<string, string>; // Maps input param to previous node output
}

export interface WorkflowConnection {
  from: string; // node id
  to: string; // node id
  fromOutput: string;
  toInput: string;
}

interface WorkflowNodeEditorProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onConnectionsChange: (connections: WorkflowConnection[]) => void;
  onAddNode: (toolId: string) => void;
  onRemoveNode: (nodeId: string) => void;
}

export function WorkflowNodeEditor({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onAddNode,
  onRemoveNode,
}: WorkflowNodeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Draw connections on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw connections
    ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
    ctx.lineWidth = 2;
    connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (fromNode && toNode) {
        const fromX = fromNode.x + 150;
        const fromY = fromNode.y + 50;
        const toX = toNode.x;
        const toY = toNode.y + 50;

        // Draw bezier curve
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(
          fromX + 50,
          fromY,
          toX - 50,
          toY,
          toX,
          toY
        );
        ctx.stroke();
      }
    });
  }, [nodes, connections]);

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onNodesChange(
      nodes.map((n) =>
        n.id === draggingNode
          ? { ...n, x: Math.max(0, x - 75), y: Math.max(0, y - 25) }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);
  const selectedTool = selectedNodeData
    ? toolCatalog.find((t) => t.id === selectedNodeData.toolId)
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-500" />
            Workflow Visual Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative w-full h-96 bg-slate-950 border border-cyan-500/20 rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />

            {/* Nodes */}
            <div className="absolute inset-0 pointer-events-none">
              {nodes.map((node) => {
                const tool = toolCatalog.find((t) => t.id === node.toolId);
                const isSelected = node.id === selectedNode;

                return (
                  <div
                    key={node.id}
                    className={`absolute w-32 pointer-events-auto cursor-move rounded-lg border-2 p-2 text-xs transition ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/20"
                        : "border-slate-600 bg-slate-800/80"
                    }`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[0.65rem] text-cyan-300 truncate">
                          {node.id}
                        </p>
                        <p className="font-semibold text-white truncate">
                          {tool?.name || "Unknown"}
                        </p>
                      </div>
                      <button
                        className="shrink-0 text-slate-400 hover:text-red-400 pointer-events-auto"
                        onClick={() => {
                          onRemoveNode(node.id);
                          setSelectedNode(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm pointer-events-none">
                Ziehe Tools in den Editor, um einen Workflow zu erstellen
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              −
            </Button>
            <span className="text-xs text-slate-400 px-2 py-1">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              +
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNodeData && selectedTool && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selectedTool.name}</CardTitle>
              <Badge variant="outline">{selectedTool.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400">{selectedTool.description}</p>

            {/* Input Mapping */}
            {selectedTool.inputFields && selectedTool.inputFields.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">
                  Parameter-Mapping
                </p>
                {selectedTool.inputFields.map((field) => (
                  <div key={field.name} className="text-xs space-y-1">
                    <label className="text-slate-400">{field.label}</label>
                    <Input
                      placeholder={`z.B. {{node-1.output}}`}
                      value={selectedNodeData.inputMapping[field.name] || ""}
                      onChange={(e) => {
                        onNodesChange(
                          nodes.map((n) =>
                            n.id === selectedNodeData.id
                              ? {
                                  ...n,
                                  inputMapping: {
                                    ...n.inputMapping,
                                    [field.name]: e.target.value,
                                  },
                                }
                              : n
                          )
                        );
                      }}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Connections Info */}
            {connections.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-300">Verbindungen</p>
                {connections
                  .filter((c) => c.from === selectedNodeData.id || c.to === selectedNodeData.id)
                  .map((c, i) => (
                    <p key={i} className="text-slate-400">
                      {c.from === selectedNodeData.id
                        ? `→ zu ${nodes.find((n) => n.id === c.to)?.toolName}`
                        : `← von ${nodes.find((n) => n.id === c.from)?.toolName}`}
                    </p>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
