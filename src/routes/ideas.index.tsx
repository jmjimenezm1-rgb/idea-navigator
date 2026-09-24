import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Archive, ArrowRight, FileSearch, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Pill } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { analysesQuery, ideasQuery, leadsQuery } from "@/lib/marketing-queries";
import { archiveIdea, deleteIdea, updateIdeaStatus } from "@/lib/marketing.functions";

export const Route = createFileRoute("/ideas/")({
  head: () => ({
    meta: [
      { title: "Ideas exploradas | MarketingHub AI" },
      {
        name: "description",
        content: "Consulta y gestión de ideas de negocio exploradas, su viabilidad, estado y clientes potenciales asociados.",
      },
      { property: "og:title", content: "Ideas exploradas | MarketingHub AI" },
      {
        property: "og:description",
        content: "Ideas de negocio exploradas con estado, viabilidad y acceso a sus clientes potenciales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IdeasPage,
});

const statuses = ["Todos", "En curso", "Finalizada", "Borrador"] as const;

function IdeasPage() {
  const queryClient = useQueryClient();
  const { data: ideas = [] } = useQuery(ideasQuery);
  const { data: leads = [] } = useQuery(leadsQuery);
  const { data: analyses = [] } = useQuery(analysesQuery);
  const [status, setStatus] = useState<(typeof statuses)[number]>("En curso");
  const [showArchived, setShowArchived] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["ideas"] });
    void queryClient.invalidateQueries({ queryKey: ["leads"] });
    void queryClient.invalidateQueries({ queryKey: ["analyses"] });
  };

  const statusMutation = useMutation({
    mutationFn: (vars: { ideaId: string; status: string }) => updateIdeaStatus({ data: vars }),
    onSuccess: (result) => {
      toast.success(`Idea marcada como "${result.status}"`);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const archiveMutation = useMutation({
    mutationFn: (vars: { ideaId: string; archived: boolean }) => archiveIdea({ data: vars }),
    onSuccess: (result) => {
      toast.success(result.archived ? "Idea y leads archivados" : "Idea recuperada del archivo");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (ideaId: string) => deleteIdea({ data: { ideaId } }),
    onSuccess: (result) => {
      toast.success(`Idea eliminada junto a ${result.deletedLeads} lead(s)`);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const visibleIdeas = useMemo(
    () => ideas.filter((idea) => (showArchived || !idea.archived) && (status === "Todos" || idea.status === status)),
    [ideas, showArchived, status],
  );

  return (
    <AppShell
      title="Ideas exploradas"
      subtitle={`${visibleIdeas.length} de ${ideas.length} ideas`}
      actions={
        <Button asChild size="sm">
          <Link to="/ideas/nueva"><Plus className="size-4" /> Nueva exploración</Link>
        </Button>
      }
    >
      <div className="min-w-0 space-y-4">
        <div className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-end">
          <div className="min-w-0">
            <Label htmlFor="idea-status" className="text-xs text-muted-foreground">Estado</Label>
            <select
              id="idea-status"
              className="mt-1 h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
            >
              {statuses.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <label className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground sm:justify-self-end">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--color-primary)]"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />
            <span className="min-w-0">Mostrar ideas archivadas</span>
          </label>
        </div>

        {visibleIdeas.length === 0 && (
          <Card><CardContent className="p-5 text-sm text-muted-foreground">No hay ideas que coincidan con los filtros.</CardContent></Card>
        )}

        <div className="grid min-w-0 gap-3">
          {visibleIdeas.map((idea) => {
            const analysis = analyses.find((item) => item.business_idea_id === idea.id);
            const leadCount = leads.filter((lead) => lead.business_idea_id === idea.id && !lead.archived).length;
            const nextStatus = idea.status === "En curso" ? "Finalizada" : idea.status === "Finalizada" ? "Borrador" : "En curso";

            return (
              <Card key={idea.id} className="min-w-0 overflow-hidden shadow-none">
                <CardContent className="grid min-w-0 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <FileSearch className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }} className="block min-w-0">
                        <h2 className="break-words font-display text-base font-semibold">{idea.name}</h2>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {idea.sector} · {idea.geography} · {idea.maturity_level}
                        </p>
                      </Link>
                      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto max-w-full p-0"
                          title={`Cambiar estado a ${nextStatus}`}
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ ideaId: idea.id, status: nextStatus })}
                        >
                          <Pill tone={idea.status === "Finalizada" ? "success" : "info"}>{idea.status}</Pill>
                        </Button>
                        {idea.archived && <Pill tone="neutral">Archivada</Pill>}
                        {analysis && <Pill tone="neutral">Viabilidad {analysis.viability_score}</Pill>}
                      </div>
                    </div>
                  </div>

                  <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_2.25rem_2.25rem] items-center gap-1 md:w-auto">
                    <Button asChild variant="outline" size="sm" className="min-w-0 justify-between">
                      <Link to="/leads" search={{ idea: idea.id }} className="min-w-0">
                        <span className="min-w-0 break-words">{leadCount} leads</span><ArrowRight className="size-4 shrink-0" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={idea.archived ? "Recuperar idea" : "Archivar idea y sus leads"}
                      disabled={archiveMutation.isPending}
                      onClick={() => archiveMutation.mutate({ ideaId: idea.id, archived: !idea.archived })}
                    >
                      {idea.archived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      title="Borrar idea y todos sus registros"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`¿Borrar "${idea.name}" y todos sus registros asociados?`)) deleteMutation.mutate(idea.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}