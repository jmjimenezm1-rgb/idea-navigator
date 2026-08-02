import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  Users,
  ShieldCheck,
  Download,
  Plug,
  Sparkles,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/ideas/nueva", label: "Nueva exploración", icon: Lightbulb, exact: false },
  { to: "/leads", label: "Clientes potenciales", icon: Users, exact: false },
  { to: "/cumplimiento", label: "Validación y legal", icon: ShieldCheck, exact: false },
  { to: "/exportacion", label: "Exportación", icon: Download, exact: false },
  { to: "/fuentes", label: "Fuentes de datos", icon: Plug, exact: false },
  { to: "/prompts", label: "Administración IA", icon: Sparkles, exact: false },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">MarketingHub AI</p>
            <p className="text-xs opacity-60">Viabilidad y prospección</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "opacity-75 hover:bg-sidebar-accent/60 hover:opacity-100",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-xs opacity-70">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Entorno con <strong>datos demo ficticios</strong>. Sin envíos automáticos ni scraping.
            </p>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-card/90 px-4 py-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
