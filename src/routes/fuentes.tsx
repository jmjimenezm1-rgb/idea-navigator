import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { dataSources } from "@/lib/demo-data";

export const Route = createFileRoute("/fuentes")({
  head: () => ({
    meta: [
      { title: "Configuración de fuentes de datos | MarketingHub AI" },
      { name: "description", content: "Modos de recuperación de datos: simulado, carga manual y conectores externos futuros con su política de uso." },
      { property: "og:title", content: "Configuración de fuentes de datos | MarketingHub AI" },
      { property: "og:description", content: "Conectores preparados: Firecrawl, Apify, Google CSE, CRM y Supabase." },
    ],
  }),
  component: Fuentes,
});

function Fuentes() {
  return (
    <AppShell title="Fuentes de datos" subtitle="Modo activo: datos simulados y carga manual">
      <div className="grid gap-3 lg:grid-cols-2">
        {dataSources.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">{s.name}</p>
                <Pill tone={s.status === "Conectado (demo)" ? "success" : s.status === "No configurado" ? "warning" : "neutral"}>
                  {s.status}
                </Pill>
                <Switch
                  className="ml-auto"
                  defaultChecked={s.enabled}
                  disabled={!s.enabled}
                  onCheckedChange={() => toast("Requiere clave de API para activarse")}
                />
              </div>
              <p className="text-xs text-muted-foreground">{s.type}{s.requires_api_key ? " · requiere clave de API" : ""}</p>
              <p className="text-sm text-muted-foreground">{s.usage_policy}</p>
              {!s.enabled && (
                <Button size="sm" variant="outline" onClick={() => toast("Configuración de credenciales disponible en la siguiente iteración")}>
                  Configurar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        Política de recuperación: respetar robots.txt y los términos de uso, limitar la frecuencia, registrar siempre la
        fuente y la fecha, y no extraer datos personales sensibles ni datos sin finalidad legítima.
      </p>
    </AppShell>
  );
}
