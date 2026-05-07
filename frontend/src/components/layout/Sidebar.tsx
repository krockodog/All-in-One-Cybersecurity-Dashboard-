import { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon, Shield, Crosshair, Bug, AlertTriangle, Plug, Settings, FileText, Users, LayoutDashboard, ClipboardCheck } from "lucide-react";

interface NavClassState {
  isActive: boolean;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

const toNavTestId = (label: string): string => `nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`;

const links: SidebarLink[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets", label: "Targets", icon: Crosshair },
  { to: "/pentests", label: "Pentests", icon: Shield },
  { to: "/findings", label: "Findings", icon: Bug },
  { to: "/risk-matrix", label: "Risk Matrix", icon: AlertTriangle },
  { to: "/plugins", label: "Plugins", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/quality", label: "Quality", icon: ClipboardCheck },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/users", label: "Users", icon: Users }
];

export const Sidebar = (): ReactElement => {
  return (
    <aside className="panel h-full w-full p-4" data-testid="dashboard-sidebar">
      <h1 className="mono mb-6 text-xl font-bold text-neon" data-testid="sidebar-title">
        OMNIUS
      </h1>
      <nav className="space-y-2" data-testid="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              data-testid={toNavTestId(link.label)}
              className={({ isActive }: NavClassState) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-neon/20 text-neon" : "hover:bg-white/10"
                }`
              }
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
