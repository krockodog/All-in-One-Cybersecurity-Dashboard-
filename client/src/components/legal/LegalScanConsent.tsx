import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";

/**
 * Rechtlicher Warnhinweis vor jedem aktiven Scan gegen Drittsysteme.
 *
 * Nutzung:
 *   const requestScanConsent = useLegalScanConsent();
 *   if (!(await requestScanConsent({ target, tool }))) return;
 *   await mutation.mutateAsync({ ...input, legalConsent: true });
 *
 * Die Bestätigung gilt immer nur für genau einen Scan.
 */
export type ScanConsentRequest = { target?: string; tool?: string };
type RequestFn = (req: ScanConsentRequest) => Promise<boolean>;

const LegalScanConsentContext = createContext<RequestFn | null>(null);

export function LegalScanConsentProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [request, setRequest] = useState<ScanConsentRequest>({});
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const finish = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOpen(false);
    setChecked(false);
  }, []);

  const requestConsent = useCallback<RequestFn>((req) => {
    // Eine evtl. noch offene Anfrage gilt als abgebrochen.
    resolverRef.current?.(false);
    setRequest(req);
    setChecked(false);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <LegalScanConsentContext.Provider value={requestConsent}>
      {children}
      <AlertDialog open={open} onOpenChange={(next) => { if (!next) finish(false); }}>
        <AlertDialogContent className="border-amber-400/30 bg-[rgba(12,10,6,0.96)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-200">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
              Achtung: Nur autorisierte Ziele scannen
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                {(request.target || request.tool) && (
                  <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-cyan-100">
                    {request.tool ? <div>Tool: {request.tool}</div> : null}
                    {request.target ? <div>Ziel: {request.target}</div> : null}
                  </div>
                )}
                <p>
                  Unbefugtes Scannen oder Eindringen in fremde Systeme ist in Deutschland strafbar, insbesondere nach
                  {" "}<strong className="text-amber-100">§ 202a StGB</strong> (Ausspähen von Daten),
                  {" "}<strong className="text-amber-100">§ 202b StGB</strong> (Abfangen von Daten),
                  {" "}<strong className="text-amber-100">§ 202c StGB</strong> (Vorbereiten des Ausspähens und Abfangens von Daten) und
                  {" "}<strong className="text-amber-100">§ 303b StGB</strong> (Computersabotage).
                </p>
                <p>
                  Scanne nur eigene Systeme oder Ziele, für die du eine schriftliche Erlaubnis des Eigentümers hast.
                  Jeder aktive Scan wird mit Zeitpunkt, IP-Adresse, Ziel und Tool protokolliert.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-3">
            <Checkbox
              id="legal-scan-consent"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="legal-scan-consent" className="text-sm font-normal leading-5 text-slate-100">
              Ich bestätige, dass ich zum Scannen dieses Ziels berechtigt bin.
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => finish(false)}>Abbrechen</AlertDialogCancel>
            <Button
              type="button"
              disabled={!checked}
              onClick={() => finish(true)}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              Scan starten
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LegalScanConsentContext.Provider>
  );
}

export function useLegalScanConsent(): RequestFn {
  const ctx = useContext(LegalScanConsentContext);
  if (!ctx) {
    // Ohne Provider niemals stillschweigend scannen.
    return async () => false;
  }
  return ctx;
}
