import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import markUrl from "@/assets/syncreach-mark.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/media", label: "Media", icon: FolderOpen },
  { to: "/team", label: "Team", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-[#E8F0FF] text-[#0061FF]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? item.label : undefined}
          >
            {active && (
              <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-[#0061FF]" />
            )}
            <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-[#0061FF]")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-5">
      <img src={markUrl} alt="" className="h-9 w-9 object-contain" />
      {!collapsed && (
        <span className="font-display text-lg font-bold tracking-tight text-slate-900">
          Sync<span className="text-[#0061FF]">Reach</span>
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <SidebarBrand collapsed={collapsed} />
      <NavLinks collapsed={collapsed} onNavigate={onNavigate} />

      {!collapsed && (
        <div className="mx-3 mb-3 mt-auto rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#E8F0FF] to-white p-4">
          <div className="text-sm font-semibold text-slate-900">CMS ready</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Manage reviews & gallery for the public site. API wiring comes next.
          </p>
          <Button
            asChild
            className="mt-3 h-9 w-full rounded-xl bg-[#0061FF] text-xs font-semibold hover:bg-[#0052D6]"
          >
            <a
              href={import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:8080"}
              target="_blank"
              rel="noreferrer"
            >
              View public site
            </a>
          </Button>
        </div>
      )}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50",
            collapsed && "mt-auto",
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      )}
      {!onToggle && <div className="mt-auto" />}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    void navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/80 bg-[#F8F9FB] transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        <SidebarBody collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[#F8F9FB] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin menu</SheetTitle>
              </SheetHeader>
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:inline-flex"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative mx-auto hidden w-full max-w-xl sm:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search reviews, gallery, media…"
              className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10 pr-12 text-sm shadow-none focus-visible:ring-[#0061FF]/30"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline">
              /
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0061FF] ring-2 ring-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:bg-slate-50"
                >
                  <AdminUserAvatar
                    name={user?.name}
                    avatarUrl={user?.avatarUrl}
                    className="h-8 w-8"
                  />
                  <div className="hidden leading-tight text-left sm:block">
                    <div className="text-sm font-semibold text-slate-900">{user?.name ?? "Admin"}</div>
                    <div className="text-[11px] text-slate-500">{user?.role ?? "Admin"}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
