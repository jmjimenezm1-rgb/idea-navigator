import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Pill, RiskBadge, StatusBadge, TriBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getDraftsForLead, getIdea, getLead, validationStatuses } from "@/lib/demo-data";

export const Route = createFileRoute("/leads/$leadId")({
  loader: ({ params }) => {
    const lead = getLead(params.leadId);
    if (!lead) throw notFound();
    return { company: lead.company_name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.company ?? "Lead"} | MarketingHub AI` },
      {
        name: "description",
        content: "Ficha de cliente potencial: encaje, contactos corporativos trazables, análisis IA, cumplimiento legal e historial.",
      },
      { property: "og:title", content: `${loaderData?.company ?? "Lead"} | MarketingHub AI` },
      { property: "og:description", content: "Detalle de lead con validación de fuentes y estado de consentimiento." },
      ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
    ],
  }),
  component: LeadDetail,
  notFoundComponent: () => (
    <AppShell title="Lead no encontrado">
      <p className="text-sm text-muted-foreground">Este lead no existe en los datos demo.</p>
    </AppShell>
  ),
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
      <div className="mt-0.5 text-sm break-words">{value || "—"}</div>
    </div>
  );
}

function LeadDetail() {
  const { leadId } = Route.useParams();
  const lead = getLead(leadId)!;
  const idea = getIdea(lead.business_idea_id);
  const drafts = getDraftsForLead(leadId);
  const [status, setStatus] = useState(lead.validation_status);
  const [note, setNote] = useState("");

  const blocked = lead.contact_allowed !== "sí";

  return (
    <AppShell
      title={lead.company_name}
      subtitle={`${lead.sector} · ${lead.city}, ${lead.country} · ${lead.company_size} empleados`}
      actions={
        <Button variant="outline" asChild>
          <Link to="/leads">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {blocked && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>
              <strong>No apto para campaña directa.</strong> {lead.legal_recommendation}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <RiskBadge level={lead.risk_level} />
          <TriBadge value={lead.contact_allowed} label="Contacto inicial" />
          <TriBadge value={lead.email_marketing_allowed} label="Email marketing" />
          <TriBadge value={lead.whatsapp_marketing_allowed} label="WhatsApp" />
          <Pill tone="neutral">Score {lead.opportunity_score}/100</Pill>
          <Pill tone="neutral">datos demo</Pill>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <span className="text-sm font-medium">Cambiar estado:</span>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              toast.success(`Estado actualizado a "${e.target.value}" (demo)`);
            }}
          >
            {validationStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => toast("Enriquecimiento no disponible: conector no configurado")}>
            Enriquecer datos
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Revisión legal solicitada (demo)")}>
            Solicitar revisión legal
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={blocked}
            onClick={() => toast.success("Lead añadido a la cola de campaña futura (demo)")}
          >
            Enviar a campaña futura
          </Button>
        </div>

        <Tabs defaultValue="resumen" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="contacto">Datos de contacto</TabsTrigger>
            <TabsTrigger value="ia">Análisis IA</TabsTrigger>
            <TabsTrigger value="cumplimiento">Cumplimiento</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Row label="Nombre comercial" value={lead.commercial_name} />
                <Row label="Sector / subsector" value={`${lead.sector} · ${lead.subsector}`} />
                <Row label="Tipo de cliente" value={lead.customer_type} />
                <Row label="Web corporativa" value={<a className="text-primary underline" href={lead.website}>{lead.website}</a>} />
                <Row label="LinkedIn corporativo" value={lead.linkedin_url ?? "—"} />
                <Row label="Idea asociada" value={idea?.name} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <Row label="Descripción de la empresa" value={lead.company_description} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Row label="Motivo de encaje" value={lead.fit_reason} />
                </div>
                <Row label="Necesidad probable detectada" value={lead.detected_need} />
                <Row label="Nivel de encaje" value={lead.fit_level} />
                <Row label="Recomendación" value={lead.legal_recommendation} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <Row label="Observaciones" value={lead.notes} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacto" className="space-y-4">
            {lead.contacts.length === 0 && (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No hay contactos corporativos trazables para este lead. No se generan contactos inferidos ni datos
                  personales sin fuente.
                </CardContent>
              </Card>
            )}
            {lead.contacts.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {c.contact_name} · <span className="font-normal text-muted-foreground">{c.job_title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
                  <Row label="Email corporativo" value={c.corporate_email} />
                  <Row label="Teléfono corporativo" value={c.corporate_phone} />
                  <Row label="Perfil profesional público" value={c.profile_url} />
                  <Row label="Fuente" value={<a className="text-primary underline" href={c.source_url}>{c.source_url}</a>} />
                  <Row label="Tipo de fuente" value={c.source_type} />
                  <Row label="Nivel de confianza" value={<Pill tone={c.confidence_level === "alta" ? "success" : c.confidence_level === "media" ? "warning" : "danger"}>{c.confidence_level}</Pill>} />
                  <Row label="Consentimiento" value={c.consent_status} />
                  <Row label="Estado legal" value={c.legal_status} />
                  <Row label="Apto para contacto directo" value={<TriBadge value={c.contact_allowed} />} />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Row label="Motivo de la decisión" value={c.decision_reason} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ia" className="space-y-4">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <Row label="Por qué encaja" value={lead.ai_analysis.why_fits} />
                <Row label="Necesidad probable" value={lead.ai_analysis.probable_need} />
                <Row
                  label="Objeciones previsibles"
                  value={
                    <ul className="list-disc pl-4">
                      {lead.ai_analysis.objections.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  }
                />
                <Row label="Próxima acción recomendada" value={lead.ai_analysis.next_action} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mensajes preliminares (siempre en borrador)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {drafts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay borradores para este lead.{" "}
                    <button className="text-primary underline" onClick={() => toast.success("Borrador generado (demo). Requiere revisión humana.")}>
                      Generar borrador
                    </button>
                  </p>
                )}
                {drafts.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="info">{d.channel}</Pill>
                      <Pill tone="neutral">{d.message_type}</Pill>
                      <Pill tone="warning">borrador</Pill>
                      <Pill tone="neutral">prompt {d.prompt_id} v{d.prompt_version}</Pill>
                    </div>
                    {d.risk_warning && (
                      <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs">
                        {d.risk_warning}
                      </p>
                    )}
                    <pre className="mt-2 font-sans text-sm whitespace-pre-wrap">{d.draft_text}</pre>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.success("Borrador marcado como revisado (demo)")}>
                        Marcar como revisado
                      </Button>
                      <Button size="sm" variant="outline" disabled title="El envío automático está deshabilitado">
                        Envío deshabilitado
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cumplimiento">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Validación legal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
                <Row label="Origen del dato" value={lead.source_name} />
                <Row label="Tipo de fuente" value={lead.source_type} />
                <Row label="URL de origen" value={lead.source_url || "Sin fuente trazable"} />
                <Row label="Fecha de recuperación" value={lead.retrieved_at} />
                <Row label="Finalidad prevista" value={lead.purpose} />
                <Row label="Base jurídica propuesta" value={lead.legal_basis} />
                <Row label="Requiere consentimiento" value={<TriBadge value={lead.requires_consent} />} />
                <Row label="Consentimiento disponible" value={lead.consent_available} />
                <Row label="Apto campaña email" value={<TriBadge value={lead.email_marketing_allowed} />} />
                <Row label="Apto campaña WhatsApp" value={<TriBadge value={lead.whatsapp_marketing_allowed} />} />
                <Row label="Apto contacto comercial inicial" value={<TriBadge value={lead.contact_allowed} />} />
                <Row label="Riesgo legal" value={<RiskBadge level={lead.risk_level} />} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <Row label="Recomendación" value={lead.legal_recommendation} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <Textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Añadir nota de compliance…"
                  />
                  <Button size="sm" onClick={() => { toast.success("Nota registrada en el histórico (demo)"); setNote(""); }}>
                    Añadir nota
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card>
              <CardContent className="space-y-2 p-5">
                {lead.history.map((h, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3 text-sm">
                    <span className="text-xs text-muted-foreground">{h.created_at}</span>
                    <span className="font-medium">{h.action}</span>
                    <Pill tone="neutral">{h.previous_status} → {h.new_status}</Pill>
                    <span className="text-xs text-muted-foreground">por {h.user}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
