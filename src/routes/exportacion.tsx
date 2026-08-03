import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { leadsQuery } from "@/lib/marketing-queries";
import { exportEligibleLeads } from "@/lib/marketing.functions";

export const Route = createFileRoute("/exportacion")({
  head: () => ({
    meta: [
      { title: "Exportación de leads | MarketingHub AI" },
      { name: "description", content: "Exporta leads validados con su fuente, fecha de obtención y estado de consentimiento." },
      { property: "og:title", content: "Exportación de leads | MarketingHub AI" },
      { property: "og:description", content: "Exportación trazable de leads validados para campañas futuras." },
    ],
  }),
  component: Exportacion,
});

function Exportacion() {
  const validados = potentialLeads.filter((l) => l.contact_allowed === "sí");
  const excluidos = potentialLeads.length - validados.length;

  const exportar = () => {
    const header = ["empresa", "sector", "pais", "web", "score", "estado", "fuente", "url_origen", "fecha", "apto_contacto"];
    const rows = validados.map((l) =>
      [l.company_name, l.sector, l.country, l.website, l.opportunity_score, l.validation_status, l.source_name, l.source_url, l.retrieved_at, l.contact_allowed]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-validados-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV de leads validados descargado (datos demo)");
  };

  return (
    <AppShell title="Exportación de leads" subtitle="Solo se exportan leads con base válida para contacto">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Exportables</p><p className="font-display text-2xl font-semibold text-success">{validados.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Excluidos por cumplimiento</p><p className="font-display text-2xl font-semibold text-destructive">{excluidos}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total en el módulo</p><p className="font-display text-2xl font-semibold">{potentialLeads.length}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Opciones de exportación</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={exportar}>Descargar CSV de leads aptos</Button>
            <Button variant="outline" onClick={() => toast("Conector CRM no configurado")}>Enviar al CRM</Button>
            <Button variant="outline" onClick={() => toast.success("Leads añadidos a la cola de campaña futura (demo)")}>Preparar campaña futura</Button>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          La exportación incluye siempre fuente, URL de origen, fecha de obtención y estado de consentimiento. Los leads
          marcados como no aptos quedan excluidos automáticamente.
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill tone="success">Aptos para contacto</Pill>
          <Pill tone="warning">Pendientes excluidos</Pill>
          <Pill tone="danger">Bloqueados excluidos</Pill>
        </div>
      </div>
    </AppShell>
  );
}
