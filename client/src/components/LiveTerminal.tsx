/**
 * Live Terminal Component
 * Real-time terminal output display with shell-like appearance
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, Pause, Play } from 'lucide-react';

interface LiveTerminalProps {
  output: string;
  isRunning: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  onCancel?: () => void;
  onClear?: () => void;
  onExport?: () => void;
  sessionId?: string;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({
  output,
  isRunning,
  status,
  onCancel,
  onClear,
  onExport,
  sessionId,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [displayOutput, setDisplayOutput] = useState(output);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isPaused && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, isPaused]);

  // Update display output
  useEffect(() => {
    if (!isPaused) {
      setDisplayOutput(output);
    }
  }, [output, isPaused]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayOutput);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([displayOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `terminal-output-${sessionId || Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'cancelled':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-cyan-500/20 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-900 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-gray-400 font-mono">terminal</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${getStatusColor()}`}>{getStatusText()}</span>
          {isRunning && (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-300 bg-black"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          lineHeight: '1.5',
        }}
      >
        {displayOutput || (
          <span className="text-gray-600">
            {isRunning ? 'Waiting for output...' : 'No output yet'}
          </span>
        )}
        {isRunning && <span className="animate-pulse">▌</span>}
      </div>

      {/* Terminal Footer */}
      <div className="bg-gray-900 border-t border-cyan-500/20 px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {displayOutput.split('\n').length} lines • {displayOutput.length} characters
        </div>

        <div className="flex gap-2">
          {isRunning && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="h-8 px-2"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onCancel}
                className="h-8 px-2"
              >
                Cancel
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 px-2"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-8 px-2"
            title="Download output"
          >
            <Download className="w-4 h-4" />
          </Button>

          {onClear && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClear}
              className="h-8 px-2"
              title="Clear output"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {onExport && (
            <Button
              size="sm"
              variant="default"
              onClick={onExport}
              className="h-8 px-3"
            >
              Export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
