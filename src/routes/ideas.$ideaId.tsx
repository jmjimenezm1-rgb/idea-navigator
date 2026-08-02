import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Target } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Pill, RiskBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnalysisByIdea, getIdea, potentialLeads } from "@/lib/demo-data";

export const Route = createFileRoute("/ideas/$ideaId")({
  loader: ({ params }) => {
    const idea = getIdea(params.ideaId);
    if (!idea) throw notFound();
    return { ideaName: idea.name };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.ideaName} · Análisis de viabilidad` : "Análisis de viabilidad";
    return {
      meta: [
        { title: `${title} | MarketingHub AI` },
        {
          name: "description",
          content: "Diagnóstico de viabilidad comercial con puntuaciones orientativas, segmentos recomendados y perfil de cliente ideal.",
        },
        { property: "og:title", content: `${title} | MarketingHub AI` },
        { property: "og:description", content: "Diagnóstico IA de viabilidad y segmentos de cliente recomendados." },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: AnalisisViabilidad,
  notFoundComponent: () => (
    <AppShell title="Exploración no encontrada">
      <p className="text-sm text-muted-foreground">La exploración solicitada no existe en los datos demo.</p>
    </AppShell>
  ),
});

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
        <p className="font-display text-xl font-semibold">{value}</p>
      </div>
      <Progress value={value} className="mt-2 h-2" />
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">·</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalisisViabilidad() {
  const { ideaId } = Route.useParams();
  const idea = getIdea(ideaId)!;
  const analysis = getAnalysisByIdea(ideaId);
  const leads = potentialLeads.filter((l) => l.business_idea_id === ideaId);

  if (!analysis) {
    return (
      <AppShell title={idea.name} subtitle="Sin análisis de viabilidad todavía">
        <p className="text-sm text-muted-foreground">Esta idea aún no tiene un análisis generado.</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={idea.name}
      subtitle={`${idea.sector} · ${idea.geography} · ${idea.maturity_level} · datos demo`}
      actions={
        <Button asChild variant="outline">
          <Link to="/leads">Ver {leads.length} leads</Link>
        </Button>
      }
    >
      <Tabs defaultValue="viabilidad" className="space-y-4">
        <TabsList>
          <TabsTrigger value="viabilidad">Análisis de viabilidad</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentos recomendados</TabsTrigger>
          <TabsTrigger value="idea">Datos de la idea</TabsTrigger>
        </TabsList>

        <TabsContent value="viabilidad" className="space-y-4">
          <div className="rounded-lg border border-info/30 bg-info/8 p-3 text-xs text-muted-foreground">
            Las puntuaciones son una <strong>estimación orientativa</strong> generada por IA a partir de la información
            introducida. No constituyen una verdad absoluta ni un asesoramiento legal o financiero.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ScoreCard label="Viabilidad comercial" value={analysis.viability_score} />
            <ScoreCard label="Claridad de propuesta" value={analysis.clarity_score} />
            <ScoreCard label="Encaje mercado-producto" value={analysis.product_market_fit_score} />
            <ScoreCard label="Identificación de clientes" value={analysis.lead_identification_score} />
          </div>

          <div className="flex flex-wrap gap-2">
            <RiskBadge level={analysis.legal_risk_level} />
            <Pill tone="neutral">Riesgo comercial: {analysis.commercial_risk_level}</Pill>
            <Pill tone="info">Potencial inicial: {analysis.initial_potential}</Pill>
            <Pill tone={analysis.recommendation === "Seguir" ? "success" : analysis.recommendation === "Ajustar" ? "warning" : "danger"}>
              Recomendación: {analysis.recommendation}
            </Pill>
            <Pill tone="neutral">{analysis.ai_model}</Pill>
            <Pill tone="neutral">Prompt {analysis.prompt_version}</Pill>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumen ejecutivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{analysis.executive_summary}</p>
              <p className="rounded-md bg-muted p-3 text-muted-foreground">{analysis.recommendation_reason}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-4 p-5">
                <List title="Hipótesis comerciales a validar" items={analysis.hypotheses} />
                <List title="Barreras de entrada" items={analysis.barriers} />
                <List title="Canales recomendados" items={analysis.channels} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-5">
                <List title="Argumentos de venta iniciales" items={analysis.sales_arguments} />
                <List title="Objeciones previsibles" items={analysis.objections} />
                <List title="Recomendaciones de posicionamiento" items={analysis.positioning} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ArrowRight className="size-4" /> Siguientes pasos recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <List title="" items={analysis.next_steps} />
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Riesgos legales detectados: contactar sin base jurídica documentada, uso de datos no corporativos y envío
              de comunicaciones sin consentimiento. El módulo bloquea estas acciones por defecto.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="segmentos" className="space-y-4">
          {analysis.segments.map((s) => (
            <Card key={s.name}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="size-4 text-primary" /> {s.name}
                  </CardTitle>
                  <Pill tone={s.fit_score >= 75 ? "success" : s.fit_score >= 60 ? "warning" : "neutral"}>
                    Encaje {s.fit_score}/100
                  </Pill>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{s.description}</p>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Perfil de cliente ideal (ICP)</p>
                  <p className="mt-1">{s.icp}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Sectores prioritarios</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.priority_sectors.map((x) => (
                        <Pill key={x} tone="info">{x}</Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Tipos de empresa</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.company_types.map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Roles recomendados</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.roles.map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Mensaje comercial preliminar (borrador)</p>
                  <p className="mt-1 italic">{s.preliminary_message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="idea">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["Descripción", idea.description],
                ["Problema que resuelve", idea.problem_solved],
                ["Beneficio principal", idea.main_benefit],
                ["Diferencial", idea.differentiator],
                ["Tipo de cliente", idea.target_customer],
                ["Sector", idea.sector],
                ["Geografía", idea.geography],
                ["Tamaño de empresa", idea.company_size],
                ["Cargo objetivo", idea.target_role],
                ["Idioma", idea.language],
                ["Canal previsto", idea.channel],
                ["Nivel de madurez", idea.maturity_level],
                ["Objetivo comercial", idea.objective],
                ["Restricciones legales", idea.legal_constraints],
                ["Competidores conocidos", idea.competitors],
                ["Creado por", `${idea.created_by} · ${idea.created_at}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{k}</p>
                  <p className="mt-0.5 text-sm">{v}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Palabras clave</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {idea.keywords.map((k) => (
                    <Pill key={k} tone="info">{k}</Pill>
                  ))}
                  {idea.excluded_keywords.map((k) => (
                    <Pill key={k} tone="danger">− {k}</Pill>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
