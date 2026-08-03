import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Pill, RiskBadge, StatusBadge, TriBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { roles } from "@/lib/demo-data";
import { leadsQuery } from "@/lib/marketing-queries";

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
  const sinFuente = potentialLeads.filter((l) => !l.source_url);
  const pendientes = potentialLeads.filter((l) => l.contact_allowed === "pendiente");
  const bloqueados = potentialLeads.filter((l) => l.contact_allowed === "no");

  return (
    <AppShell title="Validación de datos y revisión legal" subtitle="Trazabilidad de fuentes, base jurídica y consentimiento">
      <div className="space-y-4">
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
                {[...bloqueados, ...pendientes].slice(0, 20).map((l) => (
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
                      <Button size="sm" variant="outline" onClick={() => toast.success("Lead marcado como apto (demo)")}>Apto</Button>
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
