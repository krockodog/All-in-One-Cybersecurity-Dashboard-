import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingScreen } from "./components/cyber/CyberShell";
import { AuditProvider } from "./contexts/AuditContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
import OsintGuidePage from "./pages/OsintGuidePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { OsintToolsPage, PentestToolsPage, ReconnaissancePage } from "./pages/ToolWorkspacePages";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * dunkle Bühne, präzise Routenstruktur, initiales Loading als kontrollierter Einsatzraum,
 * danach persistenter Workspace mit klaren Fluchtwegen zwischen allen Modulen.
 */
function AppRouter() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/osint-tools" element={<OsintToolsPage />} />
      <Route path="/pentest-tools" element={<PentestToolsPage />} />
      <Route path="/reconnaissance" element={<ReconnaissancePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/osint-guide" element={<OsintGuidePage />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 6200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuditProvider>
          <Toaster />
          {isBooting ? (
            <LoadingScreen />
          ) : (
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          )}
        </AuditProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
