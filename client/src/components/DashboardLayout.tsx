import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

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
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-4 sm:p-8">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Sign in to continue
            </h1>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg transition-all hover:shadow-xl"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

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
                  <span className="truncate text-sm font-semibold tracking-tight sm:text-base">Navigation</span>
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
                      className="h-9 text-sm font-normal transition-all active:bg-accent/80 sm:h-10 sm:text-base"
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
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {user?.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate text-xs font-medium sm:text-sm">{user?.name || "User"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.role || "user"}</p>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 w-8 rounded-lg transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/80"
                    aria-label="User menu"
                    type="button"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-sm">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
