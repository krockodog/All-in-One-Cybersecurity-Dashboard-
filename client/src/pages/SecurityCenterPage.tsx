import React from 'react';
import { BellRing, Clock3, Fingerprint, Shield, ShieldCheck, UserCog } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const activeSessions = [
  {
    id: 'sess-01',
    label: 'Primäre Web-Session',
    lastActivity: 'vor 32 Sekunden',
    location: 'Berlin, DE',
    risk: 'niedrig',
  },
  {
    id: 'sess-02',
    label: 'API Token Session',
    lastActivity: 'vor 4 Minuten',
    location: 'Frankfurt, DE',
    risk: 'mittel',
  },
];

const auditEvents = [
  {
    id: 'audit-01',
    title: 'Scope-Freigabe validiert',
    actor: 'Lor_dix',
    time: 'heute · 19:42',
    category: 'Scope',
  },
  {
    id: 'audit-02',
    title: 'Automatisierter Pentest gestartet',
    actor: 'Execution Engine',
    time: 'heute · 19:48',
    category: 'Execution',
  },
  {
    id: 'audit-03',
    title: 'ISO-27001-Report exportiert',
    actor: 'Reporting Service',
    time: 'heute · 19:57',
    category: 'Reporting',
  },
];

const onboardingSteps = [
  'Scope definieren und rechtlich freigeben',
  'Automatisierten Pentest starten',
  'Selection Reasoning und Tool-Overrides prüfen',
  'Findings kontextualisieren und priorisieren',
  'ISO 27001 Report exportieren',
];

const riskStyle = {
  niedrig: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30',
  mittel: 'bg-amber-500/20 text-amber-100 border-amber-400/30',
};

export default function SecurityCenterPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Security Center</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Session, MFA & Audit</h1>
          <p className="mt-2 text-sm text-slate-400">
            Operatives Sicherheitszentrum mit Session-Indikatoren, MFA-Status, Audit-Log-Übersicht und Guided Onboarding.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-cyan-300" />
                  Session-Indikatoren
                </CardTitle>
                <CardDescription>Timeout, letzte Aktivität und aktive Sitzungen für schnelle Risikobewertung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Session Timeout</p>
                    <p className="mt-2 text-3xl font-semibold text-white">09:32</p>
                    <p className="mt-1 text-xs text-slate-400">Automatischer Logout bei Inaktivität</p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Letzte Anmeldung</p>
                    <p className="mt-2 text-3xl font-semibold text-white">21:47</p>
                    <p className="mt-1 text-xs text-slate-400">Google SSO • Admin</p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Aktive Sessions</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{activeSessions.length}</p>
                    <p className="mt-1 text-xs text-slate-400">Einschließlich API- und Browser-Sitzungen</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{session.label}</p>
                          <p className="mt-1 text-sm text-slate-400">{session.location} • Aktiv {session.lastActivity}</p>
                        </div>
                        <Badge className={`border ${riskStyle[session.risk as keyof typeof riskStyle]}`}>{session.risk}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-300" />
                  Audit-Log-Übersicht
                </CardTitle>
                <CardDescription>Append-only Überblick über kritische Betriebsereignisse und Export-relevante Aktionen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{event.actor} • {event.time}</p>
                      </div>
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-200">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">Audit-Log exportieren</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-cyan-300" />
                  MFA & Sicherheitsstatus
                </CardTitle>
                <CardDescription>TOTP, Backup-Codes und Security-Event-Indikatoren im operativen Überblick.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">MFA Status: Aktiv</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-100/85">TOTP registriert, 8 Backup-Codes verbleibend, letzte Verifikation heute.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button>Backup-Codes anzeigen</Button>
                  <Button variant="outline">Neues TOTP-Gerät koppeln</Button>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <BellRing className="h-4 w-4" />
                    <span className="font-medium">Security Events</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Keine anomalen Login-Muster in den letzten 24 Stunden erkannt.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-[rgba(15,15,18,0.85)] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-cyan-300" />
                  Guided Onboarding
                </CardTitle>
                <CardDescription>Strukturierte Ersteinstiegs-Hilfe für sichere und reproduzierbare Abläufe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {onboardingSteps.map((step, index) => (
                  <div key={step} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Schritt {index + 1}</p>
                    <p className="mt-2 text-sm text-white">{step}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">Sandbox-Modus starten</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
