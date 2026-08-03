import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { promptsQuery } from "@/lib/marketing-queries";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Administración IA · catálogo de prompts | MarketingHub AI" },
      { name: "description", content: "Catálogo versionado de prompts almacenados en base de datos: system prompt, plantilla, variables, modelo, estado y auditoría." },
      { property: "og:title", content: "Administración IA · catálogo de prompts | MarketingHub AI" },
      { property: "og:description", content: "Gobierno de prompts con versionado, variables parametrizadas y trazabilidad." },
    ],
  }),
  component: Prompts,
});

function Prompts() {
  return (
    <AppShell title="Administración IA" subtitle="Catálogo de prompts versionados · ningún prompt vive en el código">
      <div className="space-y-3">
        {aiPrompts.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display font-semibold">{p.nombre}</p>
                <Pill tone="info">{p.categoria}</Pill>
                <Pill tone="neutral">{p.tipo}</Pill>
                <Pill tone={p.estado === "produccion" ? "success" : "warning"}>{p.estado}</Pill>
                <Pill tone="neutral">v{p.version}</Pill>
                <span className="ml-auto text-xs text-muted-foreground">{p.owner} · {p.fecha_actualizacion}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">System prompt</p>
                  <pre className="mt-1 rounded-md bg-muted p-3 font-sans text-sm whitespace-pre-wrap">{p.sistema}</pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Plantilla</p>
                  <pre className="mt-1 rounded-md bg-muted p-3 font-sans text-sm whitespace-pre-wrap">{p.plantilla}</pre>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.variables.map((v) => (
                  <Pill key={v} tone="neutral">{`{{${v}}}`}</Pill>
                ))}
                <Pill tone="info">{p.modelo}</Pill>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Historial de versiones</p>
                <div className="mt-1 space-y-1">
                  {p.versions.map((v) => (
                    <div key={v.version} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-xs">
                      <Pill tone={v.activo ? "success" : "neutral"}>v{v.version}</Pill>
                      <span>{v.cambios}</span>
                      <span className="ml-auto text-muted-foreground">{v.autor} · {v.fecha}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        Preparado para persistir en las tablas <code>ai_prompts</code>, <code>prompt_versions</code> y{" "}
        <code>prompt_evaluations</code> con A/B testing y métricas de calidad y coste.
      </p>
    </AppShell>
  );
}
