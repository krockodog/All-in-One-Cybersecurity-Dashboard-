import React, { useMemo, useState } from 'react';
import { Activity, Clock3, Cpu, Database, HelpCircle, Search, TrendingUp, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const metrics = [
  { label: 'CPU', value: 37, suffix: '%', hint: 'Aktuelle Auslastung der Execution-Worker' },
  { label: 'Memory', value: 61, suffix: '%', hint: 'Belegter Arbeitsspeicher der aktiven Scan-Pipeline' },
  { label: 'Network', value: 184, suffix: ' Mbps', hint: 'Egress/Ingress der aktiven Tasks' },
  { label: 'Queue ETA', value: 14, suffix: ' min', hint: 'Geschätzte Wartezeit bis zur vollständigen Queue-Abarbeitung' },
];

const trendSeries = [18, 21, 17, 29, 33, 27, 35];

const queuedJobs = [
  { id: 'job-01', name: 'External Recon Batch', priority: 'hoch', eta: '02:10' },
  { id: 'job-02', name: 'Deep Analysis Web Surface', priority: 'kritisch', eta: '04:30' },
  { id: 'job-03', name: 'ISO 27001 Correlation', priority: 'mittel', eta: '06:45' },
  { id: 'job-04', name: 'Threat Intel Sync', priority: 'mittel', eta: '09:15' },
];

const searchableFeatures = [
  'Automatisierter Pentest',
  'Pipeline Builder',
  'Workflow Automation',
  'ISO 27001 Report',
  'Threat Intelligence',
  'CVSS v3.1 Scoring',
  'Alert-Fatigue-Prävention',
  'Investigation Snapshots',
];

const priorityStyle = {
  kritisch: 'bg-red-500/20 text-red-100 border-red-400/30',
  hoch: 'bg-orange-500/20 text-orange-100 border-orange-400/30',
  mittel: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/30',
};

export function OperationalIntelligencePanel() {
  const [query, setQuery] = useState('');

  const filteredFeatures = useMemo(() => {
    if (!query.trim()) return searchableFeatures;
    return searchableFeatures.filter((feature) =>
      feature.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [query]);

  const maxTrend = Math.max(...trendSeries);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-300" />
              Live System Metriken
            </CardTitle>
            <CardDescription>
              Funktionale Metriken statt dekorativer Binärblöcke – direkt für Operations und Performance nutzbar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{metric.label}</p>
                  <span title={metric.hint}>
                    <HelpCircle className="h-4 w-4 text-cyan-400/70" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {metric.value}
                  <span className="text-base font-normal text-slate-400">{metric.suffix}</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">{metric.hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
              Trendanalyse der Findings
            </CardTitle>
            <CardDescription>
              Zeitreihen statt bloßer Plus/Minus-Zahlen – entwickelt für Verlauf, Baseline und Priorisierung.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3 rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4 h-56">
              {trendSeries.map((value, index) => (
                <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-cyan-500 to-emerald-400"
                    style={{ height: `${(value / maxTrend) * 160}px` }}
                  />
                  <span className="text-xs text-slate-400">Tag {index + 1}</span>
                  <span className="text-xs font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">7-Tage Peak</p>
                <p className="mt-2 text-xl font-semibold text-white">35 Findings</p>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Baseline Delta</p>
                <p className="mt-2 text-xl font-semibold text-white">+11 gegenüber Vorwoche</p>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Trend</p>
                <p className="mt-2 text-xl font-semibold text-white">Ansteigend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-cyan-300" />
              Job Queue Visualisierung
            </CardTitle>
            <CardDescription>
              Prioritäten, ETA und aktuelle Position im Scan-Backlog für operative Steuerung.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queuedJobs.map((job, index) => (
              <div key={job.id} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">#{index + 1} {job.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Position in Queue • ETA {job.eta}</p>
                  </div>
                  <Badge className={`border ${priorityStyle[job.priority as keyof typeof priorityStyle]}`}>
                    {job.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-300" />
              Globale Suche & Feature-Filter
            </CardTitle>
            <CardDescription>
              Schneller Zugriff auf Evidence, Reports und Plattformfunktionen über ein zentrales Suchfeld.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Feature, Evidence oder Report suchen"
            />
            <div className="space-y-2">
              {filteredFeatures.map((feature) => (
                <div key={feature} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] px-3 py-2 text-sm text-slate-200">
                  {feature}
                </div>
              ))}
              {filteredFeatures.length === 0 && (
                <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] px-3 py-2 text-sm text-slate-400">
                  Kein Eintrag für die aktuelle Suche gefunden.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
