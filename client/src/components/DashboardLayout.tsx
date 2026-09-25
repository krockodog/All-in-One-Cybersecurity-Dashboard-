import { assetUrls } from "@/lib/cyber-data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useAuth } from "@/_core/hooks/useAuth";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: LayoutDashboard, label: "Engagements", path: "/engagements" },
  { icon: LayoutDashboard, label: "Tool-Ausführung", path: "/tool-execution" },
  { icon: LayoutDashboard, label: "Automatisierter Pentest", path: "/automated-pentest" },
  { icon: LayoutDashboard, label: "OSINT-Tools", path: "/osint-tools" },
  { icon: LayoutDashboard, label: "Pentest-Tools", path: "/pentest-tools" },
  { icon: LayoutDashboard, label: "Pipeline Builder", path: "/pipeline-builder" },
  { icon: LayoutDashboard, label: "KI-Chat", path: "/ai-chat" },
  { icon: LayoutDashboard, label: "Reports", path: "/reports" },
  { icon: LayoutDashboard, label: "ISO 27001 Report", path: "/iso-27001-report" },
  { icon: LayoutDashboard, label: "Security Center", path: "/security-center" },
  { icon: LayoutDashboard, label: "Settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  // No-login mode: the dashboard is always accessible, no auth gate / sign-in screen.

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  // No login is required, but visitors who still carry an old session cookie
  // get a way to end it.
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activePath = location.pathname;

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMobile) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing && !isMobile) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth, isMobile]);

  const handleMenuItemClick = (path: string) => {
    if (activePath !== path) {
      navigate(path);
    }
    if (isMobile && !isCollapsed) {
      toggleSidebar();
    }
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-14 justify-center px-2 sm:h-16">
            <div className="flex w-full items-center gap-2 transition-all sm:gap-3">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 shrink-0 rounded-lg transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/80"
                aria-label="Toggle navigation"
                type="button"
              >
                {isCollapsed ? (
                  <Menu className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {!isCollapsed ? (
                <div className="flex min-w-0 items-center gap-2">
                  <img src={assetUrls.krockodogLogo} alt="krockodog Logo" className="h-9 w-auto shrink-0 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]" />
                  <span className="truncate font-mono text-xs uppercase tracking-[0.2em] text-cyan-300/80">osint-for-all.live</span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 py-1">
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className="cyber-nav-link h-9 text-sm font-normal transition-all active:bg-accent/80 sm:h-10 sm:text-base"
                      asChild={false}
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      <>
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
            <div className="flex w-full items-center gap-2 px-1 py-1 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-primary" />
              {!isCollapsed && (
                <p className="min-w-0 flex-1 truncate text-xs">Kein Login erforderlich</p>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Bestehende Sitzung abmelden"
                  title="Bestehende Sitzung abmelden"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>

      <SidebarInset className="flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="h-full w-full">{children}</div>
        </main>
      </SidebarInset>
    </>
  );
}
