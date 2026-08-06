import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { sourcesQuery } from "@/lib/marketing-queries";
import { getConnectorStatus, updateDataSource } from "@/lib/marketing.functions";

export const Route = createFileRoute("/fuentes")({
  head: () => ({
    meta: [
      { title: "Configuración de fuentes de datos | MarketingHub AI" },
      { name: "description", content: "Modos de recuperación de datos: simulado, carga manual y conectores externos con su política de uso y límites." },
      { property: "og:title", content: "Configuración de fuentes de datos | MarketingHub AI" },
      { property: "og:description", content: "Conectores preparados: Firecrawl, Apify, Google CSE, CRM y base de datos interna." },
    ],
  }),
  component: Fuentes,
});

type SourceConfig = {
  base_url?: string;
  rate_limit_per_min?: number;
  respect_robots?: boolean;
  api_key_secret_name?: string;
  notes?: string;
  updated_at?: string;
};

type SourceRow = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  requires_api_key: boolean;
  status: string;
  usage_policy: string;
  config?: SourceConfig;
};

function Fuentes() {
  const queryClient = useQueryClient();
  const { data: dataSources = [] } = useQuery(sourcesQuery);
  const { data: connectors } = useQuery({
    queryKey: ["connector-status"],
    queryFn: () => getConnectorStatus(),
  });
  const [editing, setEditing] = useState<SourceRow | null>(null);
  const [form, setForm] = useState<Required<SourceConfig> & { usage_policy: string }>({
    base_url: "",
    rate_limit_per_min: 30,
    respect_robots: true,
    api_key_secret_name: "",
    notes: "",
    updated_at: "",
    usage_policy: "",
  });

  const mutation = useMutation({
    mutationFn: updateDataSource,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Configuración de la fuente guardada");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["sources"] });
      void queryClient.invalidateQueries({ queryKey: ["connector-status"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const open = (s: SourceRow) => {
    setForm({
      base_url: s.config?.base_url ?? "",
      rate_limit_per_min: s.config?.rate_limit_per_min ?? 30,
      respect_robots: s.config?.respect_robots ?? true,
      api_key_secret_name: s.config?.api_key_secret_name ?? "",
      notes: s.config?.notes ?? "",
      updated_at: s.config?.updated_at ?? "",
      usage_policy: s.usage_policy ?? "",
    });
    setEditing(s);
  };

  return (
    <AppShell title="Fuentes de datos" subtitle="Activación, credenciales, límites de frecuencia y política de uso">
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <p className="text-sm font-medium">Conectores del backend</p>
          <Pill tone={connectors?.firecrawl.configured ? "success" : "warning"}>
            Extracción web: {connectors?.firecrawl.label ?? "comprobando…"}
          </Pill>
          <Pill tone={connectors?.aiGateway.configured ? "success" : "warning"}>
            Motor de IA: {connectors?.aiGateway.configured ? "Conectado" : "No conectado"}
          </Pill>
          {connectors?.firecrawl.configured ? (
            <p className="w-full text-xs text-muted-foreground">
              Extracción operando con los datos de conexión dados de alta: endpoint {connectors.firecrawl.endpoint} ·
              secreto {connectors.firecrawl.secretName} · {connectors.firecrawl.rateLimitPerMin} req/min ·{" "}
              {connectors.firecrawl.respectRobots ? "respeta robots.txt" : "robots.txt ignorado"}.
            </p>
          ) : (
            connectors && (
              <p className="w-full text-xs text-muted-foreground">
                Sin el conector de extracción web, el enriquecimiento de leads funciona solo por inferencia sobre datos
                internos y se marca con confianza baja.
              </p>
            )
          )}

        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">

        {(dataSources as unknown as SourceRow[]).map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">{s.name}</p>
                <Pill tone={s.status === "Conectado (demo)" ? "success" : s.status === "No configurado" ? "warning" : "neutral"}>
                  {s.status}
                </Pill>
                <Switch
                  className="ml-auto"
                  checked={s.enabled}
                  disabled={mutation.isPending}
                  onCheckedChange={(enabled) => {
                    if (enabled && s.requires_api_key && !s.config?.api_key_secret_name) {
                      toast.error("Configura primero el secreto con la clave de API");
                      open(s);
                      return;
                    }
                    mutation.mutate({ data: { id: s.id, enabled } });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {s.type}
                {s.requires_api_key ? " · requiere clave de API" : ""}
                {s.config?.rate_limit_per_min ? ` · ${s.config.rate_limit_per_min} req/min` : ""}
                {s.config?.respect_robots === false ? " · robots.txt ignorado" : " · respeta robots.txt"}
              </p>
              <p className="text-sm text-muted-foreground">{s.usage_policy}</p>
              {s.config?.updated_at && (
                <p className="text-xs text-muted-foreground">Última configuración: {s.config.updated_at.slice(0, 10)}</p>
              )}
              <Button size="sm" variant="outline" onClick={() => open(s)}>
                Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        Política de recuperación: respetar robots.txt y los términos de uso, limitar la frecuencia, registrar siempre la
        fuente y la fecha, y no extraer datos personales sensibles ni datos sin finalidad legítima.
      </p>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="base_url">URL base / endpoint</Label>
              <Input id="base_url" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.proveedor.com/v1" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="secret">Nombre del secreto con la clave de API</Label>
              <Input id="secret" value={form.api_key_secret_name} onChange={(e) => setForm({ ...form, api_key_secret_name: e.target.value })} placeholder="FIRECRAWL_API_KEY" />
              <p className="text-xs text-muted-foreground">Nunca se guarda la clave: solo el nombre del secreto del backend.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="rate">Límite de peticiones por minuto</Label>
                <Input id="rate" type="number" min={0} value={form.rate_limit_per_min} onChange={(e) => setForm({ ...form, rate_limit_per_min: Number(e.target.value) })} />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch id="robots" checked={form.respect_robots} onCheckedChange={(v) => setForm({ ...form, respect_robots: v })} />
                <Label htmlFor="robots">Respetar robots.txt</Label>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="policy">Política de uso</Label>
              <Textarea id="policy" rows={3} value={form.usage_policy} onChange={(e) => setForm({ ...form, usage_policy: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notas internas</Label>
              <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              disabled={mutation.isPending}
              onClick={() =>
                editing &&
                mutation.mutate({
                  data: {
                    id: editing.id,
                    base_url: form.base_url,
                    rate_limit_per_min: form.rate_limit_per_min,
                    respect_robots: form.respect_robots,
                    api_key_secret_name: form.api_key_secret_name,
                    notes: form.notes,
                    usage_policy: form.usage_policy,
                  },
                })
              }
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />} Guardar configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
