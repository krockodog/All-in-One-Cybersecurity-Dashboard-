import React from 'react';
import { Camera, GitCompareArrows, RotateCcw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const snapshots = [
  {
    id: 'snap-001',
    name: 'Initial Recon Baseline',
    createdAt: 'heute · 19:12',
    diff: '+12 neue Findings',
    status: 'baseline',
  },
  {
    id: 'snap-002',
    name: 'Deep Analysis Delta',
    createdAt: 'heute · 19:34',
    diff: '+4 bestätigte Schwachstellen',
    status: 'delta',
  },
  {
    id: 'snap-003',
    name: 'ISO Mapping Snapshot',
    createdAt: 'heute · 19:58',
    diff: '3 neue Controls betroffen',
    status: 'report',
  },
];

const statusStyle = {
  baseline: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/30',
  delta: 'bg-orange-500/20 text-orange-100 border-orange-400/30',
  report: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30',
};

export function InvestigationSnapshotsPanel() {
  return (
    <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-cyan-300" />
          Investigation Snapshots
        </CardTitle>
        <CardDescription>
          Reproduzierbare Zwischenstände für Re-Run, Vergleich und Delta-Analyse zwischen Untersuchungsphasen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button>
            <Save className="mr-2 h-4 w-4" /> Snapshot speichern
          </Button>
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Re-Run vorbereiten
          </Button>
          <Button variant="outline">
            <GitCompareArrows className="mr-2 h-4 w-4" /> Diff anzeigen
          </Button>
        </div>

        <div className="space-y-3">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{snapshot.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{snapshot.createdAt} • {snapshot.diff}</p>
                </div>
                <Badge className={`border ${statusStyle[snapshot.status as keyof typeof statusStyle]}`}>
                  {snapshot.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
