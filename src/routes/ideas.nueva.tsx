import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Save, Search, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createIdeaWithAnalysis } from "@/lib/marketing.functions";
import { sourcesQuery } from "@/lib/marketing-queries";

import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/ideas/nueva")({
  head: () => ({
    meta: [
      { title: "Nueva exploración de idea | MarketingHub AI" },
      {
        name: "description",
        content:
          "Formulario guiado para describir una idea de negocio, definir el cliente objetivo, los criterios de búsqueda y las restricciones legales antes de lanzar el análisis.",
      },
      { property: "og:title", content: "Nueva exploración de idea | MarketingHub AI" },
      { property: "og:description", content: "Wizard de 5 pasos para explorar la viabilidad de una idea de negocio." },
    ],
  }),
  component: NuevaExploracion,
});

const steps = ["Descripción de la idea", "Cliente objetivo", "Criterios de búsqueda", "Restricciones", "Lanzar análisis"];

type SourceOption = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  requires_api_key: boolean;
  status: string;
  usage_policy?: string;
  config?: { has_api_key?: boolean; api_key_secret_name?: string };
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function NuevaExploracion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [confidence, setConfidence] = useState([60]);
  const [maxResults, setMaxResults] = useState([50]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [customer, setCustomer] = useState("");
  const [sector, setSector] = useState("");
  const [geography, setGeography] = useState("");
  const [constraints, setConstraints] = useState("");
  const [competitors, setCompetitors] = useState("");

  // Fuentes dadas de alta en "Fuentes de datos": todas se pueden marcar, estén o no configuradas.
  const { data: sources = [] } = useQuery(sourcesQuery);
  const sourceList = sources as unknown as SourceOption[];
  const enabledSources = sourceList.filter((s) => s.enabled).map((s) => s.name);
  const [preferred, setPreferred] = useState<string[] | null>(null);
  const preferredSources = preferred ?? enabledSources;

  const toggleSource = (sourceName: string, on: boolean) =>
    setPreferred((prev) => {
      const base = prev ?? enabledSources;
      return on ? [...new Set([...base, sourceName])] : base.filter((n) => n !== sourceName);
    });

  const createIdea = useMutation({
    mutationFn: () =>
      createIdeaWithAnalysis({
        data: {
          name,
          description,
          problem_solved: problem,
          target_customer: customer,
          sector,
          geography,
          legal_constraints: constraints,
          competitors,
          preferred_sources: preferredSources,
        },
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
      if (result.aiError) toast.error(`Idea guardada, pero el análisis IA falló: ${result.aiError}`);
      else toast.success("Análisis de viabilidad generado con IA");
      void navigate({ to: "/ideas/$ideaId", params: { ideaId: result.ideaId } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const restrictions = [
    "Excluir empresas competidoras",
    "Excluir empresas ya contactadas",
    "Excluir empresas sin web corporativa",
    "Excluir contactos sin fuente trazable",
    "Excluir contactos personales no corporativos",
    "Excluir datos sin trazabilidad documentada",
  ];

  return (
    <AppShell title="Nueva exploración de idea" subtitle={`Paso ${step + 1} de 5 · ${steps[step]}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ol className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  i === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < step
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-3" /> : <span className="font-semibold">{i + 1}</span>}
                {s}
              </button>
            </li>
          ))}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{steps[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de la idea">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Mantenimiento predictivo industrial" />
                </Field>
                <Field label="Nivel de madurez">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>Idea inicial</option>
                    <option>Producto definido</option>
                    <option>MVP</option>
                    <option>Producto en mercado</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Descripción del producto o servicio">
                    <Textarea rows={3} placeholder="Qué hace y cómo funciona" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Problema que resuelve">
                    <Textarea rows={2} placeholder="Dolor concreto del cliente" value={problem} onChange={(e) => setProblem(e.target.value)} />
                  </Field>
                </div>
                <Field label="Beneficio principal">
                  <Input placeholder="Ej. Reducir un 30% las paradas" />
                </Field>
                <Field label="Diferencial frente a alternativas">
                  <Input placeholder="Ej. No requiere sustituir equipos" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de cliente">
                  <Input placeholder="Ej. Empresa industrial con planta propia" value={customer} onChange={(e) => setCustomer(e.target.value)} />
                </Field>
                <Field label="Sector o sectores objetivo">
                  <Input placeholder="Ej. Automoción, alimentación" value={sector} onChange={(e) => setSector(e.target.value)} />
                </Field>
                <Field label="País o zona geográfica">
                  <Input placeholder="Ej. España, Portugal" value={geography} onChange={(e) => setGeography(e.target.value)} />
                </Field>
                <Field label="Tamaño de empresa">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>10-49 empleados</option>
                    <option>50-199 empleados</option>
                    <option>200-499 empleados</option>
                    <option>500+ empleados</option>
                  </select>
                </Field>
                <Field label="Cargo o perfil objetivo">
                  <Input placeholder="Ej. Director de Operaciones" />
                </Field>
                <Field label="Nivel de decisión del contacto">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>Decisor</option>
                    <option>Prescriptor</option>
                    <option>Influenciador</option>
                    <option>Usuario</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Necesidad esperada">
                    <Textarea rows={2} placeholder="Qué esperas que necesite este cliente" />
                  </Field>
                </div>
                <Field label="Objetivo comercial">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>Validar interés</option>
                    <option>Captar leads</option>
                    <option>Vender</option>
                    <option>Generar reuniones</option>
                    <option>Analizar mercado</option>
                  </select>
                </Field>
                <Field label="Canal comercial previsto">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>Email</option>
                    <option>LinkedIn</option>
                    <option>Llamada</option>
                    <option>WhatsApp (requiere opt-in específico)</option>
                    <option>Otro</option>
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Palabras clave">
                  <Input placeholder="mantenimiento predictivo, OEE" />
                </Field>
                <Field label="Palabras excluidas">
                  <Input placeholder="formación, consultoría genérica" />
                </Field>
                <Field label="Ubicación">
                  <Input placeholder="Cataluña, País Vasco" />
                </Field>
                <Field label="Idioma">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option>Español</option>
                    <option>Inglés</option>
                    <option>Portugués</option>
                    <option>Francés</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label={`Fuentes preferidas · ${preferredSources.length} de ${sourceList.length || 0} marcadas`}
                    hint="Puedes marcar cualquier fuente, esté configurada o pendiente de configurar. Las marcadas se usan al buscar clientes para esta idea; si ninguna marcada tiene clave activa, se usa otra fuente operativa y queda registrado."
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      {sourceList.length === 0 && (
                        <p className="text-xs text-muted-foreground sm:col-span-2">
                          Cargando fuentes dadas de alta en «Fuentes de datos»…
                        </p>
                      )}
                      {sourceList.map((s) => {
                        const on = preferredSources.includes(s.name);
                        return (
                          <label
                            key={s.id}
                            className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm transition-colors ${
                              on ? "border-primary/50 bg-primary/5" : "border-border"
                            }`}
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={on}
                              onCheckedChange={(c) => toggleSource(s.name, c === true)}
                            />
                            <span className="min-w-0 break-words">
                              <span className="block font-medium">{s.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {s.status}
                                {s.requires_api_key
                                  ? s.config?.has_api_key
                                    ? " · clave guardada"
                                    : " · falta la clave"
                                  : " · sin clave"}
                                {s.config?.api_key_secret_name ? ` · secreto: ${s.config.api_key_secret_name}` : ""}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreferred(sourceList.map((s) => s.name))}
                      >
                        Marcar todas
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPreferred(enabledSources)}>
                        Solo las habilitadas
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPreferred([])}>
                        Ninguna
                      </Button>
                    </div>
                  </Field>
                </div>
                <Field label={`Número máximo de resultados: ${maxResults[0]}`}>
                  <Slider value={maxResults} onValueChange={setMaxResults} min={10} max={200} step={10} />
                </Field>
                <Field label={`Nivel mínimo de confianza: ${confidence[0]}`}>
                  <Slider value={confidence} onValueChange={setConfidence} min={0} max={100} step={5} />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Estas restricciones se aplican automáticamente durante la recuperación de datos y quedan registradas
                  como evidencia de cumplimiento.
                </p>
                {restrictions.map((r, i) => (
                  <label key={r} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                    <Checkbox defaultChecked={i > 2} />
                    {r}
                  </label>
                ))}
                <Field label="Restricciones legales o comerciales adicionales">
                  <Textarea rows={2} placeholder="Ej. No contactar por WhatsApp sin opt-in específico" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
                </Field>
                <Field label="Competidores conocidos">
                  <Input placeholder="Ej. Senseye, Augury" value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
                  <p className="font-medium">Antes de lanzar</p>
                  <p className="mt-1 text-muted-foreground">
                    El análisis genera estimaciones orientativas. La recuperación de datos se limita a información
                    empresarial pública y trazable. Ningún mensaje se envía automáticamente.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="info">Modo activo: análisis IA real</Pill>
                  <Pill tone="neutral">Prompt: Analisis_Viabilidad_Idea v1.2</Pill>
                  <Pill tone="neutral">Modelo: google/gemini-3.6-flash</Pill>
                  <Pill tone="neutral">Fuentes preferidas: {preferredSources.length}</Pill>
                </div>
                {preferredSources.length > 0 && (
                  <p className="text-xs text-muted-foreground break-words">
                    Fuentes marcadas: {preferredSources.join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={createIdea.isPending || !name.trim() || !description.trim()}
                    onClick={() => createIdea.mutate()}
                  >
                    {createIdea.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    Analizar viabilidad
                  </Button>
                  <Button variant="secondary" onClick={() => void navigate({ to: "/leads" })}>
                    <Search className="size-4" /> Buscar clientes potenciales
                  </Button>
                  <Button variant="outline" onClick={() => toast("Borrador guardado (demo)")}>
                    <Save className="size-4" /> Guardar como borrador
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <Button disabled={step === 4} onClick={() => setStep((s) => s + 1)}>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
