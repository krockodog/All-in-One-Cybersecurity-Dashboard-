import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingScreen } from "./components/cyber/CyberShell";
import { NotificationToast } from "./components/NotificationToast";
import { AuditProvider } from "./contexts/AuditContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AIChatWindow } from "./components/AIChatWindow";
import DashboardPage from "./pages/DashboardPage";
import OsintGuidePage from "./pages/OsintGuidePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PipelineBuilderPage from "./pages/PipelineBuilderPage";
import EngagementDashboard from "./pages/EngagementDashboard";
import PentestGuideImproved from "./pages/PentestGuideImproved";
import Templates from "./pages/Templates";
import AISettings from "./pages/AISettings";
import AIChatPage from "./pages/AIChatPage";
import { OsintToolsPage, PentestToolsPage, ReconnaissancePage } from "./pages/ToolWorkspacePages";
import ToolExecutionPage from "./pages/ToolExecutionPage";
import AutomatedPentestPage from "./pages/AutomatedPentestPage";
import ISO27001ReportPage from "./pages/ISO27001ReportPage";
import SecurityCenterPage from "./pages/SecurityCenterPage";

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
      <Route path="/engagements" element={<EngagementDashboard />} />
      <Route path="/pentest-guide" element={<PentestGuideImproved />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/ai-settings" element={<AISettings />} />
      <Route path="/ai-chat" element={<AIChatPage />} />
      <Route path="/osint-tools" element={<OsintToolsPage />} />
      <Route path="/pentest-tools" element={<PentestToolsPage />} />
      <Route path="/reconnaissance" element={<ReconnaissancePage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/osint-guide" element={<OsintGuidePage />} />
      <Route path="/tool-execution" element={<ToolExecutionPage />} />
      <Route path="/hexstrike-workflow" element={<Navigate to="/automated-pentest" replace />} />
      <Route path="/automated-pentest" element={<AutomatedPentestPage />} />
      <Route path="/iso-27001-report" element={<ISO27001ReportPage />} />
      <Route path="/security-center" element={<SecurityCenterPage />} />
      <Route path="/pipeline-builder" element={<PipelineBuilderPage />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuditProvider>
          <Toaster />
          <NotificationToast />
          <AIChatWindow />
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
