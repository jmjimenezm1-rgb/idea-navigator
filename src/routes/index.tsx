import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, FileSearch, ShieldAlert, Users } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { DemoTag, Pill, StatusBadge } from "@/components/StatusBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { analysesQuery, ideasQuery, leadsQuery } from "@/lib/marketing-queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard de viabilidad y prospección | MarketingHub AI" },
      {
        name: "description",
        content:
          "Panel de control del módulo de exploración de viabilidad: ideas analizadas, leads identificados, estado de validación y alertas legales.",
      },
      { property: "og:title", content: "Dashboard de viabilidad y prospección | MarketingHub AI" },
      {
        property: "og:description",
        content: "KPIs de ideas exploradas, leads potenciales, validación de fuentes y cumplimiento legal.",
      },
    ],
  }),
  component: Dashboard,
});

function countBy<T>(items: T[], key: (t: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

const chartColors = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-accent-foreground)",
  "var(--color-neutral)",
];

function Kpi({ label, value, hint, tone }: { label: string; value: number | string; hint?: string; tone?: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className={`mt-1 font-display text-2xl font-semibold ${tone ?? ""}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const leads = potentialLeads;
  const validated = leads.filter((l) => ["Validado", "Consentimiento obtenido", "Convertido en cliente"].includes(l.validation_status));
  const pending = leads.filter((l) => l.validation_status.startsWith("Pendiente"));
  const notAllowed = leads.filter((l) => l.contact_allowed === "no");
  const noSource = leads.filter((l) => !l.source_url);
  const incomplete = leads.filter((l) => l.contacts.length === 0);

  const bySector = countBy(leads, (l) => l.sector);
  const byStatus = countBy(leads, (l) => l.validation_status);
  const byCountry = countBy(leads, (l) => l.country);
  const bySize = countBy(leads, (l) => l.company_size);
  const viability = viabilityAnalyses.map((a) => ({
    name: businessIdeas.find((b) => b.id === a.business_idea_id)?.name.slice(0, 22) ?? a.id,
    value: a.viability_score,
  }));

  return (
    <AppShell
      title="Exploración de viabilidad y prospección inicial"
      subtitle="Panel general del módulo · datos ficticios de demostración"
      actions={
        <Button asChild>
          <Link to="/ideas/nueva">Nueva exploración</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Ideas exploradas" value={businessIdeas.length} hint={`${businessIdeas.filter((i) => i.status === "En curso").length} en curso · ${businessIdeas.filter((i) => i.status === "Finalizada").length} finalizadas`} />
          <Kpi label="Leads identificados" value={leads.length} hint="Generados en modo datos simulados" />
          <Kpi label="Leads validados" value={validated.length} tone="text-success" hint="Con fuente y base jurídica" />
          <Kpi label="No aptos para campaña directa" value={notAllowed.length} tone="text-destructive" hint="Bloqueados hasta validación legal" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads por sector</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySector} margin={{ left: -20, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads por estado</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads por país</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCountry} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Viabilidad media por idea (orientativa)</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viability} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} height={50} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distribución por tamaño de empresa</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySize} dataKey="value" nameKey="name" outerRadius={78}>
                    {bySize.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Últimas exploraciones</CardTitle>
              <DemoTag />
            </CardHeader>
            <CardContent className="space-y-2">
              {businessIdeas.map((idea) => {
                const analysis = viabilityAnalyses.find((a) => a.business_idea_id === idea.id);
                return (
                  <Link
                    key={idea.id}
                    to="/ideas/$ideaId"
                    params={{ ideaId: idea.id }}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60"
                  >
                    <FileSearch className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{idea.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {idea.sector} · {idea.geography} · {idea.created_at}
                      </p>
                    </div>
                    <Pill tone={idea.status === "Finalizada" ? "success" : "info"}>{idea.status}</Pill>
                    {analysis && <Pill tone="neutral">Viabilidad {analysis.viability_score}</Pill>}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="size-4 text-warning-foreground" /> Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Alert icon={<ShieldAlert className="size-4 text-destructive" />} label="Alertas legales" value={`${notAllowed.length} leads sin base válida para contacto directo`} />
              <Alert icon={<Users className="size-4 text-warning-foreground" />} label="Datos incompletos" value={`${incomplete.length} leads sin contacto corporativo`} />
              <Alert icon={<AlertTriangle className="size-4 text-destructive" />} label="Sin fuente trazable" value={`${noSource.length} registros marcados como no válidos`} />
              <Alert icon={<FileSearch className="size-4 text-info" />} label="Pendientes de validar" value={`${pending.length} leads esperando revisión manual`} />
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/cumplimiento">Ir a validación y legal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sectores y zonas con mayor potencial</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {bySector.slice(0, 4).map((s) => (
              <Pill key={s.name} tone="success">
                {s.name} · {s.value} leads
              </Pill>
            ))}
            {byCountry.map((c) => (
              <Pill key={c.name} tone="info">
                {c.name} · {c.value} leads
              </Pill>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          <StatusBadge status="Validado" />
          <StatusBadge status="Pendiente de validar" />
          <StatusBadge status="No apto para campaña directa" />
          <StatusBadge status="Enriquecido" />
          <DemoTag />
          <span>Las puntuaciones son estimaciones orientativas, no una verdad absoluta.</span>
        </div>
      </div>
    </AppShell>
  );
}

function Alert({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border p-2.5">
      {icon}
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
