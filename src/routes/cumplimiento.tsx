import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Pill, RiskBadge, StatusBadge, TriBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { roles } from "@/lib/demo-data";
import { ideasQuery, leadsQuery } from "@/lib/marketing-queries";
import { runComplianceRules, updateLeadStatus } from "@/lib/marketing.functions";

export const Route = createFileRoute("/cumplimiento")({
  head: () => ({
    meta: [
      { title: "Validación de datos y revisión legal | MarketingHub AI" },
      {
        name: "description",
        content:
          "Revisión de trazabilidad de fuentes, base jurídica, consentimiento y aptitud para contacto de cada cliente potencial.",
      },
      { property: "og:title", content: "Validación de datos y revisión legal | MarketingHub AI" },
      { property: "og:description", content: "Control de fuentes, consentimiento y riesgo legal de los leads." },
    ],
  }),
  component: Cumplimiento,
});

function Cumplimiento() {
  const queryClient = useQueryClient();
  const { data: potentialLeads = [] } = useQuery(leadsQuery);
  const { data: ideas = [] } = useQuery(ideasQuery);
  const [ideaId, setIdeaId] = useState("todas");
  const [riskFilter, setRiskFilter] = useState("todos");
  const [contactFilter, setContactFilter] = useState("todos");
  const [onlyActive, setOnlyActive] = useState(true);
  const [notesFilter, setNotesFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["leads"] });

  const rulesMutation = useMutation({
    mutationFn: () => runComplianceRules({ data: ideaId === "todas" ? {} : { ideaId } }),
    onSuccess: (r) => {
      toast.success(
        `Validación ejecutada sobre ${r.evaluated} leads · ${r.changed} actualizados${r.ideaId ? " (idea seleccionada)" : ""}`,
      );
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (leadId: string) => updateLeadStatus({ data: { leadId, validation_status: "Validado" } }),
    onSuccess: () => {
      toast.success("Lead marcado como validado");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeIdeas = useMemo(
    () => ideas.filter((i) => i.status === "En curso" && !i.archived),
    [ideas],
  );
  const visibleIdeas = onlyActive ? activeIdeas : ideas;
  const activeIdeaIds = useMemo(() => new Set(activeIdeas.map((i) => i.id)), [activeIdeas]);

  useEffect(() => {
    if (onlyActive && ideaId !== "todas" && !activeIdeaIds.has(ideaId)) setIdeaId("todas");
  }, [onlyActive, ideaId, activeIdeaIds]);

  const scoped = useMemo(() => {
    const notes = notesFilter.trim().toLowerCase();
    const zone = zoneFilter.trim().toLowerCase();
    return potentialLeads.filter((l) => {
      if (l.archived) return false;
      if (onlyActive && !activeIdeaIds.has(l.business_idea_id)) return false;
      if (ideaId !== "todas" && l.business_idea_id !== ideaId) return false;
      if (riskFilter !== "todos" && l.risk_level !== riskFilter) return false;
      if (contactFilter !== "todos" && l.contact_allowed !== contactFilter) return false;
      if (notes && !`${l.notes ?? ""} ${l.legal_recommendation ?? ""}`.toLowerCase().includes(notes)) return false;
      if (
        zone &&
        ![l.region, l.province, l.postal_code, l.city, l.country]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(zone))
      )
        return false;
      return true;
    });
  }, [potentialLeads, ideaId, riskFilter, contactFilter, onlyActive, activeIdeaIds, notesFilter, zoneFilter]);

  const sinFuente = scoped.filter((l) => !l.source_url);
  const pendientes = scoped.filter((l) => l.contact_allowed === "pendiente");
  const bloqueados = scoped.filter((l) => l.contact_allowed === "no");
  const cola = contactFilter === "todos" ? [...bloqueados, ...pendientes] : scoped;
  const ideaName = ideas.find((i) => i.id === ideaId)?.name;

  return (
    <AppShell
      title="Validación de datos y revisión legal"
      subtitle="Trazabilidad de fuentes, base jurídica y consentimiento"
      actions={
        <Button disabled={rulesMutation.isPending} onClick={() => rulesMutation.mutate()}>
          {rulesMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {ideaId === "todas" ? "Ejecutar validaciones legales" : "Validar leads de esta idea"}
        </Button>
      }
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm sm:col-span-3">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-primary)]"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              Mostrar solo clientes de ideas en curso
            </label>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Idea de negocio</p>
              <Select value={ideaId} onValueChange={setIdeaId}>
                <SelectTrigger><SelectValue placeholder="Todas las ideas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las ideas</SelectItem>
                  {visibleIdeas.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Nivel de riesgo</p>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="bajo">Bajo</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Aptitud de contacto</p>
              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="sí">Apto</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="no">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Notas</p>
              <Input
                className="h-9"
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                placeholder="Texto en las notas del lead…"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Región, provincia o código postal</p>
              <Input
                className="h-9"
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                placeholder="Ej. Cataluña, Málaga, 28004"
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-3">
              {scoped.length} leads en el ámbito seleccionado{ideaName ? ` · idea "${ideaName}"` : " · todas las ideas"}.
              Las validaciones legales se ejecutan solo sobre este ámbito.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Sin fuente trazable</p><p className="font-display text-2xl font-semibold text-destructive">{sinFuente.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Pendientes de validación</p><p className="font-display text-2xl font-semibold text-warning-foreground">{pendientes.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Bloqueados para contacto</p><p className="font-display text-2xl font-semibold text-destructive">{bloqueados.length}</p></CardContent></Card>
        </div>


        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Reglas aplicadas automáticamente</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Sin consentimiento para email marketing → No apto para campaña email directa.",
              "Sin opt-in específico de WhatsApp → No apto para WhatsApp marketing.",
              "Dato sin fuente → No válido.",
              "Fuente poco clara → Pendiente de validación.",
              "Contacto personal no corporativo → No apto.",
              "Solicitud de baja → bloqueo permanente de campañas posteriores.",
            ].map((r) => (
              <p key={r} className="rounded-md border border-border p-2.5">{r}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cola de revisión legal</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Base jurídica</TableHead>
                  <TableHead>Consentimiento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cola.slice(0, 20).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="max-w-52 truncate text-sm font-medium">{l.company_name}</TableCell>
                    <TableCell className="max-w-40 truncate text-xs">{l.source_name}</TableCell>
                    <TableCell className="max-w-40 truncate text-xs">{l.legal_basis}</TableCell>
                    <TableCell className="text-xs">{l.consent_available}</TableCell>
                    <TableCell><TriBadge value={l.email_marketing_allowed} /></TableCell>
                    <TableCell><TriBadge value={l.whatsapp_marketing_allowed} /></TableCell>
                    <TableCell><TriBadge value={l.contact_allowed} /></TableCell>
                    <TableCell><RiskBadge level={l.risk_level} /></TableCell>
                    <TableCell><StatusBadge status={l.validation_status} /></TableCell>
                    <TableCell className="space-x-1 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" asChild><Link to="/leads/$leadId" params={{ leadId: l.id }}>Ver</Link></Button>
                      <Button size="sm" variant="outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate(l.id)}>Apto</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Roles del módulo</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <div key={r.name} className="rounded-md border border-border p-3">
                <Pill tone="info">{r.name}</Pill>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
