import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { promptsQuery } from "@/lib/marketing-queries";
import { createPrompt, restorePromptVersion, suggestPrompt, updatePrompt } from "@/lib/marketing.functions";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Administración IA · catálogo de prompts | MarketingHub AI" },
      { name: "description", content: "Catálogo versionado de prompts en base de datos: edición con historial recuperable y creación manual o asistida por IA." },
      { property: "og:title", content: "Administración IA · catálogo de prompts | MarketingHub AI" },
      { property: "og:description", content: "Gobierno de prompts con versionado, restauración y asistente de generación." },
    ],
  }),
  component: Prompts,
});

type PromptRow = {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  version: string;
  sistema: string;
  plantilla: string;
  variables: string[];
  modelo: string;
  estado: "borrador" | "produccion";
  owner: string;
  fecha_actualizacion: string;
  versions: { version: string; cambios: string; autor: string; fecha: string; activo: boolean }[];
  snapshots?: { version: string; cambios: string; autor: string; fecha: string }[];
};

const MODELS = ["google/gemini-3.6-flash", "google/gemini-2.5-pro", "google/gemini-3.5-flash"];

function Prompts() {
  const queryClient = useQueryClient();
  const { data: aiPrompts = [] } = useQuery(promptsQuery);
  const prompts = aiPrompts as unknown as PromptRow[];

  const [editing, setEditing] = useState<PromptRow | null>(null);
  const [editForm, setEditForm] = useState({ sistema: "", plantilla: "", modelo: MODELS[0]!, estado: "borrador", cambios: "" });
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    nombre: "",
    categoria: "Prospección",
    tipo: "Generación",
    sistema: "",
    plantilla: "",
    modelo: MODELS[0]!,
    estado: "borrador" as "borrador" | "produccion",
  });
  const [objetivo, setObjetivo] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["prompts"] });

  const saveMutation = useMutation({
    mutationFn: updatePrompt,
    onSuccess: (r) => {
      toast.success(`Guardado como versión v${r.version}. La versión anterior queda recuperable.`);
      setEditing(null);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: restorePromptVersion,
    onSuccess: (r) => {
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Versión restaurada como v${r.version}`);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      toast.success("Prompt creado en el catálogo (v1.0)");
      setCreating(false);
      setNewForm({ nombre: "", categoria: "Prospección", tipo: "Generación", sistema: "", plantilla: "", modelo: MODELS[0]!, estado: "borrador" });
      setObjetivo("");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const suggestMutation = useMutation({
    mutationFn: suggestPrompt,
    onSuccess: (r) => {
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const s = r.suggestion;
      setNewForm((f) => ({
        ...f,
        nombre: s.nombre || f.nombre,
        categoria: s.categoria || f.categoria,
        tipo: s.tipo || f.tipo,
        sistema: s.sistema || f.sistema,
        plantilla: s.plantilla || f.plantilla,
      }));
      toast.success("Propuesta generada con IA. Revísala antes de guardarla.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (p: PromptRow) => {
    setEditForm({ sistema: p.sistema, plantilla: p.plantilla, modelo: p.modelo, estado: p.estado, cambios: "" });
    setEditing(p);
  };

  return (
    <AppShell
      title="Administración IA"
      subtitle="Catálogo de prompts versionados · ningún prompt vive en el código"
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Nuevo prompt
        </Button>
      }
    >
      <div className="min-w-0 space-y-3">
        {prompts.map((p) => (
          <Card key={p.id} className="min-w-0 overflow-hidden">
            <CardContent className="min-w-0 space-y-3 p-4 sm:p-5">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="min-w-0 break-words font-display font-semibold">{p.nombre}</p>
                <Pill tone="info">{p.categoria}</Pill>
                <Pill tone="neutral">{p.tipo}</Pill>
                <Pill tone={p.estado === "produccion" ? "success" : "warning"}>{p.estado}</Pill>
                <Pill tone="neutral">v{p.version}</Pill>
                <span className="basis-full break-words text-xs text-muted-foreground sm:basis-auto">{p.owner} · {p.fecha_actualizacion}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Editar</Button>
              </div>
              <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase">System prompt</p>
                  <pre className="mt-1 max-w-full overflow-hidden rounded-md bg-muted p-3 font-sans text-sm whitespace-pre-wrap break-all">{p.sistema}</pre>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Plantilla</p>
                  <pre className="mt-1 max-w-full overflow-hidden rounded-md bg-muted p-3 font-sans text-sm whitespace-pre-wrap break-all">{p.plantilla}</pre>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap gap-1">
                {(p.variables ?? []).map((v) => (
                  <Pill key={v} tone="neutral" className="max-w-full whitespace-normal break-all">{`{{${v}}}`}</Pill>
                ))}
                <Pill tone="info" className="max-w-full whitespace-normal break-all">{p.modelo}</Pill>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Historial de versiones</p>
                <div className="mt-1 space-y-1">
                  {(p.versions ?? []).map((v) => {
                    const recoverable = (p.snapshots ?? []).some((s) => s.version === v.version);
                    return (
                      <div key={`${v.version}-${v.fecha}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-border p-2 text-xs sm:flex sm:flex-wrap">
                        <Pill tone={v.activo ? "success" : "neutral"}>v{v.version}</Pill>
                        <span className="min-w-0 break-words">{v.cambios}</span>
                        <span className="col-span-2 break-words text-muted-foreground sm:ml-auto">{v.autor} · {v.fecha}</span>
                        {!v.activo && recoverable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={restoreMutation.isPending}
                            onClick={() => restoreMutation.mutate({ data: { id: p.id, version: v.version } })}
                          >
                            Recuperar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edición con versionado */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar {editing?.nombre} (actual v{editing?.version})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="e-sistema">System prompt</Label>
              <Textarea id="e-sistema" rows={6} value={editForm.sistema} onChange={(e) => setEditForm({ ...editForm, sistema: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-plantilla">Plantilla (variables entre dobles llaves)</Label>
              <Textarea id="e-plantilla" rows={8} value={editForm.plantilla} onChange={(e) => setEditForm({ ...editForm, plantilla: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="e-modelo">Modelo</Label>
                <select id="e-modelo" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={editForm.modelo} onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })}>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-estado">Estado</Label>
                <select id="e-estado" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}>
                  <option value="borrador">borrador</option>
                  <option value="produccion">produccion</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-cambios">Descripción del cambio</Label>
              <Input id="e-cambios" value={editForm.cambios} onChange={(e) => setEditForm({ ...editForm, cambios: e.target.value })} placeholder="Ajuste de tono y restricciones legales" />
            </div>
            <p className="rounded-md border border-border bg-muted/50 p-2 text-xs text-muted-foreground">
              Al guardar se crea una versión nueva y la actual se archiva como copia recuperable.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() =>
                editing &&
                saveMutation.mutate({
                  data: {
                    id: editing.id,
                    sistema: editForm.sistema,
                    plantilla: editForm.plantilla,
                    modelo: editForm.modelo,
                    estado: editForm.estado as "borrador" | "produccion",
                    cambios: editForm.cambios || "Actualización manual",
                  },
                })
              }
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />} Guardar nueva versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Creación manual o asistida por IA */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md border border-border p-3">
              <Label htmlFor="objetivo">Generación asistida por IA</Label>
              <Textarea id="objetivo" rows={3} className="mt-1" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Describe el objetivo: p. ej. redactar un primer email B2B a responsables de operaciones logísticas..." />
              <Button
                className="mt-2"
                size="sm"
                variant="outline"
                disabled={suggestMutation.isPending || objetivo.trim().length < 10}
                onClick={() => suggestMutation.mutate({ data: { objetivo, categoria: newForm.categoria, canal: newForm.tipo } })}
              >
                {suggestMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Proponer con IA
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="n-nombre">Nombre</Label>
                <Input id="n-nombre" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="n-categoria">Categoría</Label>
                <Input id="n-categoria" value={newForm.categoria} onChange={(e) => setNewForm({ ...newForm, categoria: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="n-sistema">System prompt</Label>
              <Textarea id="n-sistema" rows={6} value={newForm.sistema} onChange={(e) => setNewForm({ ...newForm, sistema: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="n-plantilla">Plantilla</Label>
              <Textarea id="n-plantilla" rows={8} value={newForm.plantilla} onChange={(e) => setNewForm({ ...newForm, plantilla: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="n-modelo">Modelo</Label>
                <select id="n-modelo" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={newForm.modelo} onChange={(e) => setNewForm({ ...newForm, modelo: e.target.value })}>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="n-estado">Estado</Label>
                <select id="n-estado" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={newForm.estado} onChange={(e) => setNewForm({ ...newForm, estado: e.target.value as "borrador" | "produccion" })}>
                  <option value="borrador">borrador</option>
                  <option value="produccion">produccion</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button
              disabled={createMutation.isPending || newForm.nombre.trim().length < 3 || newForm.sistema.trim().length < 10 || newForm.plantilla.trim().length < 10}
              onClick={() => createMutation.mutate({ data: newForm })}
            >
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />} Crear prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        Cada edición genera una versión nueva y archiva la anterior como copia recuperable en la tabla <code>ai_prompts</code>.
      </p>
    </AppShell>
  );
}
