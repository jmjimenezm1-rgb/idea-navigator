import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listIdeas = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin
    .from("business_ideas")
    .select("id, name, status, sector, created_by, data, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id }));
});

export const getIdeaDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ ideaId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const [idea, analysis, leads] = await Promise.all([
      supabaseAdmin.from("business_ideas").select("*").eq("id", data.ideaId).maybeSingle(),
      supabaseAdmin
        .from("viability_analyses")
        .select("*")
        .eq("business_idea_id", data.ideaId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabaseAdmin.from("potential_leads").select("id").eq("business_idea_id", data.ideaId),
    ]);
    if (idea.error) throw new Error(idea.error.message);
    return {
      idea: idea.data ? { ...(idea.data.data as Record<string, unknown>), id: idea.data.id } : null,
      analysis: analysis.data?.[0]
        ? { ...(analysis.data[0].data as Record<string, unknown>), id: analysis.data[0].id }
        : null,
      leadCount: leads.data?.length ?? 0,
    };
  });

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin
    .from("potential_leads")
    .select("id, data")
    .order("opportunity_score", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id }));
});

export const getLeadDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ leadId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const [lead, drafts, events] = await Promise.all([
      supabaseAdmin.from("potential_leads").select("*").eq("id", data.leadId).maybeSingle(),
      supabaseAdmin
        .from("ai_drafts")
        .select("id, data, created_at")
        .eq("potential_lead_id", data.leadId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("lead_events")
        .select("*")
        .eq("potential_lead_id", data.leadId)
        .order("created_at", { ascending: false }),
    ]);
    if (lead.error) throw new Error(lead.error.message);
    return {
      lead: lead.data ? { ...(lead.data.data as Record<string, unknown>), id: lead.data.id } : null,
      drafts: (drafts.data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id })),
      events: events.data ?? [],
    };
  });

export const listPrompts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin.from("ai_prompts").select("id, data").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id }));
});

export const listSources = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin.from("data_sources").select("id, data").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id }));
});

const IdeaInput = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  problem_solved: z.string().default(""),
  main_benefit: z.string().default(""),
  differentiator: z.string().default(""),
  target_customer: z.string().default(""),
  sector: z.string().default(""),
  geography: z.string().default(""),
  company_size: z.string().default(""),
  target_role: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  excluded_keywords: z.array(z.string()).default([]),
  language: z.string().default("Español"),
  channel: z.string().default("Email"),
  maturity_level: z.string().default("Idea"),
  objective: z.string().default("Captar leads"),
  legal_constraints: z.string().default(""),
  competitors: z.string().default(""),
});

/** Crea la idea en base de datos y ejecuta un análisis de viabilidad real con IA. */
export const createIdeaWithAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdeaInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, callAiJson, getPrompt, renderTemplate } = await import("./marketing.server");

    const ideaId = `idea-${crypto.randomUUID().slice(0, 8)}`;
    const ideaRecord = {
      ...data,
      id: ideaId,
      status: "En curso",
      created_at: new Date().toISOString().slice(0, 10),
      created_by: "demo@marketinghub.ai",
    };

    const insert = await supabaseAdmin.from("business_ideas").insert({
      id: ideaId,
      name: data.name,
      status: "En curso",
      sector: data.sector,
      created_by: "demo@marketinghub.ai",
      data: ideaRecord,
    });
    if (insert.error) throw new Error(insert.error.message);

    const prompt = await getPrompt("prompt-5");
    const promptData = prompt.data as { sistema: string; plantilla: string };
    const user = `${renderTemplate(promptData.plantilla, {
      idea: `${data.name}. ${data.description}`,
      problema: data.problem_solved,
      cliente: data.target_customer,
      sector: data.sector,
      geografia: data.geography,
    })}

Restricciones legales declaradas: ${data.legal_constraints || "ninguna"}.
Competidores: ${data.competitors || "no indicados"}.
Objetivo: ${data.objective}. Canal: ${data.channel}.

Devuelve JSON con esta forma exacta:
{"executive_summary":string,"viability_score":number,"clarity_score":number,"product_market_fit_score":number,"lead_identification_score":number,"legal_risk_level":"bajo"|"medio"|"alto","commercial_risk_level":"bajo"|"medio"|"alto","initial_potential":"bajo"|"medio"|"alto","hypotheses":string[],"barriers":string[],"sales_arguments":string[],"objections":string[],"positioning":string[],"channels":string[],"recommendation":"Seguir"|"Ajustar"|"Descartar","recommendation_reason":string,"next_steps":string[],"segments":[{"name":string,"description":string,"icp":string,"priority_sectors":string[],"company_types":string[],"roles":string[],"fit_score":number,"preliminary_message":string}]}
Las puntuaciones son estimaciones orientativas de 0 a 100. Máximo 3 segmentos.`;

    const result = await callAiJson<Record<string, unknown>>({
      model: prompt.modelo || "google/gemini-3.6-flash",
      system: promptData.sistema,
      user,
    });

    if (!result.ok) return { ideaId, analysisId: null as string | null, aiError: result.error };

    const analysisId = `analysis-${ideaId}`;
    const analysisRecord = {
      ...result.value,
      id: analysisId,
      business_idea_id: ideaId,
      ai_model: result.model,
      prompt_version: prompt.version,
      created_at: new Date().toISOString(),
    };
    const score = Number(result.value["viability_score"] ?? 0);
    const saved = await supabaseAdmin.from("viability_analyses").insert({
      id: analysisId,
      business_idea_id: ideaId,
      viability_score: Number.isFinite(score) ? Math.round(score) : 0,
      ai_model: result.model,
      prompt_version: prompt.version,
      data: analysisRecord,
    });
    if (saved.error) throw new Error(saved.error.message);

    return { ideaId, analysisId, aiError: null as string | null };
  });

/** Genera un borrador de mensaje real con IA para un lead, usando el prompt versionado del catálogo. */
export const generateDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ leadId: z.string().min(1), channel: z.enum(["Email", "LinkedIn", "Llamada"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, callAiText, getPrompt, renderTemplate } = await import("./marketing.server");

    const { data: leadRow, error } = await supabaseAdmin
      .from("potential_leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!leadRow) throw new Error("Lead no encontrado.");

    const lead = leadRow.data as Record<string, any>;
    if (leadRow.contact_allowed === "no") {
      return { ok: false as const, error: "Lead bloqueado por cumplimiento: no se generan mensajes." };
    }

    const promptId = data.channel === "LinkedIn" ? "prompt-2" : data.channel === "Llamada" ? "prompt-3" : "prompt-1";
    const prompt = await getPrompt(promptId);
    const promptData = prompt.data as { sistema: string; plantilla: string };
    const contact = lead["contacts"]?.[0] ?? {};

    const ideaRow = await supabaseAdmin
      .from("business_ideas")
      .select("data")
      .eq("id", leadRow.business_idea_id)
      .maybeSingle();
    const idea = (ideaRow.data?.data ?? {}) as Record<string, any>;

    const rendered = renderTemplate(promptData.plantilla, {
      empresa: lead["company_name"] ?? "",
      sector: lead["sector"] ?? "",
      cargo: contact["job_title"] ?? "Responsable",
      producto: `${idea["name"] ?? ""}. ${idea["description"] ?? ""}`,
      objetivo: idea["objective"] ?? "Explorar interés",
      necesidad: lead["detected_need"] ?? "",
    });

    const result = await callAiText({
      model: prompt.modelo || "google/gemini-3.6-flash",
      system: `${promptData.sistema}\nEscribe en español. No inventes datos de la empresa. Indica siempre el origen público del dato y el derecho de oposición cuando el canal sea email.`,
      user: `${rendered}\n\nContexto verificable del lead: necesidad detectada "${lead["detected_need"] ?? ""}", fuente "${lead["source_name"] ?? ""}" (${lead["source_url"] ?? ""}), obtenido el ${lead["retrieved_at"] ?? ""}.`,
    });
    if (!result.ok) return { ok: false as const, error: result.error };

    const draftId = `draft-${crypto.randomUUID().slice(0, 8)}`;
    const record = {
      id: draftId,
      potential_lead_id: data.leadId,
      business_idea_id: leadRow.business_idea_id,
      channel: data.channel,
      message_type: "Primer contacto",
      draft_text: result.text,
      status: "borrador",
      risk_warning:
        leadRow.contact_allowed === "pendiente"
          ? "Lead pendiente de validación legal: no enviar hasta confirmar la base jurídica."
          : null,
      prompt_id: prompt.id,
      prompt_version: prompt.version,
      ai_model: prompt.modelo,
      created_at: new Date().toISOString(),
    };

    const saved = await supabaseAdmin.from("ai_drafts").insert({
      id: draftId,
      potential_lead_id: data.leadId,
      business_idea_id: leadRow.business_idea_id,
      channel: data.channel,
      data: record,
    });
    if (saved.error) throw new Error(saved.error.message);
    await supabaseAdmin.from("lead_events").insert({
      potential_lead_id: data.leadId,
      action: `Borrador de IA generado (${data.channel})`,
      previous_status: leadRow.validation_status,
      new_status: leadRow.validation_status,
      actor: "IA",
    });

    return { ok: true as const, draft: record };
  });

/** Validación legal del lead con IA + persistencia del estado y del historial. */
export const validateLeadWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ leadId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, callAiJson, getPrompt, renderTemplate } = await import("./marketing.server");

    const { data: leadRow, error } = await supabaseAdmin
      .from("potential_leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!leadRow) throw new Error("Lead no encontrado.");
    const lead = leadRow.data as Record<string, any>;

    const prompt = await getPrompt("prompt-6");
    const promptData = prompt.data as { sistema: string; plantilla: string };
    const rendered = renderTemplate(promptData.plantilla, {
      empresa: lead["company_name"] ?? "",
      fuente: `${lead["source_name"] ?? ""} (${lead["source_url"] ?? ""})`,
      tipo_dato: lead["contacts"]?.[0]?.corporate_email ? "email corporativo nominal" : "datos corporativos generales",
    });

    const result = await callAiJson<{
      contact_allowed: "sí" | "no" | "pendiente";
      risk_level: "bajo" | "medio" | "alto";
      validation_status: string;
      legal_basis: string;
      legal_recommendation: string;
    }>({
      model: prompt.modelo || "google/gemini-3.6-flash",
      system: `${promptData.sistema} Aplica RGPD y LSSI-CE españolas.`,
      user: `${rendered}

Datos: consentimiento disponible=${lead["consent_available"]}, requiere consentimiento=${lead["requires_consent"]}, finalidad=${lead["purpose"] ?? "prospección B2B"}, fecha de obtención=${lead["retrieved_at"]}.

Devuelve JSON: {"contact_allowed":"sí"|"no"|"pendiente","risk_level":"bajo"|"medio"|"alto","validation_status":string,"legal_basis":string,"legal_recommendation":string}`,
    });

    if (!result.ok) return { ok: false as const, error: result.error };

    const updated = {
      ...lead,
      contact_allowed: result.value.contact_allowed,
      risk_level: result.value.risk_level,
      validation_status: result.value.validation_status,
      legal_basis: result.value.legal_basis,
      legal_recommendation: result.value.legal_recommendation,
    };

    const saved = await supabaseAdmin
      .from("potential_leads")
      .update({
        contact_allowed: result.value.contact_allowed,
        risk_level: result.value.risk_level,
        validation_status: result.value.validation_status,
        data: updated,
      })
      .eq("id", data.leadId);
    if (saved.error) throw new Error(saved.error.message);

    await supabaseAdmin.from("lead_events").insert({
      potential_lead_id: data.leadId,
      action: "Validación legal automática (IA)",
      previous_status: leadRow.validation_status,
      new_status: result.value.validation_status,
      actor: "IA · Compliance",
    });

    return { ok: true as const, result: result.value };
  });

/** Cambio manual de estado de validación con registro de auditoría. */
export const updateLeadStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        leadId: z.string().min(1),
        validation_status: z.string().min(1),
        contact_allowed: z.enum(["sí", "no", "pendiente"]).optional(),
        actor: z.string().default("Usuario demo"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const { data: leadRow, error } = await supabaseAdmin
      .from("potential_leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!leadRow) throw new Error("Lead no encontrado.");

    const lead = leadRow.data as Record<string, any>;
    const contactAllowed = data.contact_allowed ?? leadRow.contact_allowed;
    const updated = { ...lead, validation_status: data.validation_status, contact_allowed: contactAllowed };

    const saved = await supabaseAdmin
      .from("potential_leads")
      .update({ validation_status: data.validation_status, contact_allowed: contactAllowed, data: updated })
      .eq("id", data.leadId);
    if (saved.error) throw new Error(saved.error.message);

    await supabaseAdmin.from("lead_events").insert({
      potential_lead_id: data.leadId,
      action: "Cambio manual de estado",
      previous_status: leadRow.validation_status,
      new_status: data.validation_status,
      actor: data.actor,
    });

    return { ok: true as const };
  });

/** Exportación server-side: solo leads con base jurídica válida. */
export const exportEligibleLeads = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin
    .from("potential_leads")
    .select("id, data")
    .eq("contact_allowed", "sí")
    .order("opportunity_score", { ascending: false });
  if (error) throw new Error(error.message);

  const header = [
    "empresa",
    "sector",
    "pais",
    "web",
    "score",
    "estado",
    "fuente",
    "url_origen",
    "fecha",
    "apto_contacto",
  ];
  const rows = (data ?? []).map((row) => {
    const l = row.data as Record<string, any>;
    return [
      l["company_name"],
      l["sector"],
      l["country"],
      l["website"],
      l["opportunity_score"],
      l["validation_status"],
      l["source_name"],
      l["source_url"],
      l["retrieved_at"],
      l["contact_allowed"],
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
  });

  return { csv: [header.join(","), ...rows].join("\n"), count: rows.length };
});

export const listAnalyses = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data, error } = await supabaseAdmin.from("viability_analyses").select("id, data").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...(row.data as Record<string, unknown>), id: row.id }));
});
