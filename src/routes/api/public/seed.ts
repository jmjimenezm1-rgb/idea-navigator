import { createFileRoute } from "@tanstack/react-router";

// Carga inicial idempotente del dataset de demostración en la base de datos.
// Solo inserta cuando las tablas están vacías; nunca borra ni sobrescribe datos.
export const Route = createFileRoute("/api/public/seed")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/lib/marketing.server");
        const demo = await import("@/lib/demo-data");

        const existing = await supabaseAdmin.from("business_ideas").select("id").limit(1);
        if (existing.error) {
          return Response.json({ ok: false, error: existing.error.message }, { status: 500 });
        }
        if ((existing.data ?? []).length > 0) {
          return Response.json({ ok: true, seeded: false, reason: "already-populated" });
        }

        const steps: [string, unknown[]][] = [
          [
            "business_ideas",
            demo.businessIdeas.map((o) => ({
              id: o.id,
              name: o.name,
              status: o.status,
              sector: o.sector,
              created_by: o.created_by,
              data: o,
            })),
          ],
          [
            "potential_leads",
            demo.potentialLeads.map((o) => ({
              id: o.id,
              business_idea_id: o.business_idea_id,
              company_name: o.company_name,
              sector: o.sector,
              country: o.country,
              opportunity_score: o.opportunity_score,
              validation_status: o.validation_status,
              contact_allowed: o.contact_allowed,
              risk_level: o.risk_level,
              data: o,
            })),
          ],
          [
            "viability_analyses",
            demo.viabilityAnalyses.map((o) => ({
              id: o.id,
              business_idea_id: o.business_idea_id,
              viability_score: o.viability_score,
              ai_model: o.ai_model,
              prompt_version: o.prompt_version,
              data: o,
            })),
          ],
          [
            "ai_drafts",
            demo.aiDrafts.map((o) => ({
              id: o.id,
              potential_lead_id: o.potential_lead_id,
              business_idea_id: o.business_idea_id,
              channel: o.channel,
              data: o,
            })),
          ],
          [
            "data_sources",
            demo.dataSources.map((o) => ({
              id: o.id,
              name: o.name,
              type: o.type,
              enabled: o.enabled,
              status: o.status,
              data: o,
            })),
          ],
          [
            "ai_prompts",
            demo.aiPrompts.map((o) => ({
              id: o.id,
              nombre: o.nombre,
              categoria: o.categoria,
              version: o.version,
              estado: o.estado,
              modelo: o.modelo,
              data: o,
            })),
          ],
        ];

        for (const [table, rows] of steps) {
          const { error } = await supabaseAdmin.from(table as never).insert(rows as never);
          if (error) return Response.json({ ok: false, table, error: error.message }, { status: 500 });
        }

        const events = demo.potentialLeads.flatMap((l) =>
          l.history.map((h) => ({
            potential_lead_id: l.id,
            action: h.action,
            previous_status: h.previous_status,
            new_status: h.new_status,
            actor: h.user,
            created_at: new Date(h.created_at).toISOString(),
          })),
        );
        if (events.length) {
          const { error } = await supabaseAdmin.from("lead_events").insert(events);
          if (error) return Response.json({ ok: false, table: "lead_events", error: error.message }, { status: 500 });
        }

        return Response.json({ ok: true, seeded: true });
      },
    },
  },
});
