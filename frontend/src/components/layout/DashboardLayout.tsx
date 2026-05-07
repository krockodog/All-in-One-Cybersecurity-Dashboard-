import { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const DashboardLayout = (): ReactElement => {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_1fr]" data-testid="dashboard-layout">
      <div className="min-h-[120px] lg:min-h-full">
        <Sidebar />
      </div>
      <div className="space-y-4">
        <TopBar />
        <main className="panel min-h-[calc(100vh-120px)] p-4" data-testid="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
