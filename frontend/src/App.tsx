import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import TargetsPage from "@/pages/TargetsPage";
import PentestsPage from "@/pages/PentestsPage";
import FindingsPage from "@/pages/FindingsPage";
import RiskMatrixPage from "@/pages/RiskMatrixPage";
import PluginsPage from "@/pages/PluginsPage";
import SettingsPage from "@/pages/SettingsPage";
import QualityPage from "@/pages/QualityPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import { LoginGate } from "@/components/auth/LoginGate";

export default function App(): ReactElement {
  return (
    <LoginGate>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/targets" element={<TargetsPage />} />
          <Route path="/pentests" element={<PentestsPage />} />
          <Route path="/findings" element={<FindingsPage />} />
          <Route path="/risk-matrix" element={<RiskMatrixPage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LoginGate>
  );
}

