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

/** Enriquecimiento real de un lead con IA a partir de datos públicos ya trazados. */
export const enrichLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ leadId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, callAiJson } = await import("./marketing.server");

    const { data: leadRow, error } = await supabaseAdmin
      .from("potential_leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!leadRow) throw new Error("Lead no encontrado.");
    const lead = leadRow.data as Record<string, any>;

    const sources = await supabaseAdmin.from("data_sources").select("id, data").eq("enabled", true);
    const enabledRows: Record<string, any>[] = (sources.data ?? []).map((s) => ({
      ...(s.data as Record<string, any>),
      id: s.id,
    }));
    const enabledSources = enabledRows.map((s) => s["name"] as string).filter(Boolean);

    const ideaRow = await supabaseAdmin
      .from("business_ideas")
      .select("data")
      .eq("id", leadRow.business_idea_id)
      .maybeSingle();
    const idea = (ideaRow.data?.data ?? {}) as Record<string, any>;

    // Recuperación real de contenido corporativo público con la fuente configurada en "Fuentes de datos".
    const { scrapeCorporateSite, loadWebConnector } = await import("./web-retrieval.server");
    const connector = await loadWebConnector();
    let webContext = "";
    let webEvidence: Record<string, string> | null = null;
    let retrievalNote = "";
    if (!lead["website"]) {
      retrievalNote = "El lead no tiene web corporativa registrada.";
    } else if (!connector || !connector.enabled) {
      retrievalNote = "Extracción web desactivada: no hay ninguna fuente de extracción habilitada.";
    } else if (!connector.hasKey) {
      retrievalNote = `Extracción web desactivada: falta el secreto ${connector?.apiKeySecretName ?? "de la fuente"}.`;
    } else {
      const scraped = await scrapeCorporateSite(String(lead["website"]), { maxChars: 6000, connector });
      if (scraped.ok) {
        webContext = `\n\nContenido público extraído de la web corporativa (${scraped.sourceUrl}, ${scraped.retrievedAt}):\n"""${scraped.markdown}"""`;
        webEvidence = {
          source_url: scraped.sourceUrl,
          provider: scraped.provider,
          retrieved_at: scraped.retrievedAt,
          title: scraped.title ?? "",
          source_id: connector.id,
          endpoint: connector.baseUrl,
          robots_checked: connector.respectRobots ? "sí" : "no",
        };
      } else {
        retrievalNote = `Extracción web no disponible: ${scraped.error}`;
      }
    }



    const result = await callAiJson<{
      company_description: string;
      detected_need: string;
      fit_reason: string;
      fit_level: string;
      opportunity_score: number;
      why_fits: string;
      probable_need: string;
      objections: string[];
      next_action: string;
      enrichment_notes: string;
      confidence_level: "alta" | "media" | "baja";
    }>({
      model: "google/gemini-3.6-flash",
      system:
        "Eres analista de prospección B2B. Enriqueces fichas de empresa SOLO con información corporativa pública y con el contexto verificable aportado. Está prohibido inventar datos personales, emails, teléfonos o cifras concretas no verificables. Si un dato no consta, dilo explícitamente. Escribe en español.",
      user: `Empresa: ${lead["company_name"]} (${lead["commercial_name"] ?? ""}).
Sector: ${lead["sector"]} / ${lead["subsector"] ?? ""}. País: ${lead["country"]}, ciudad: ${lead["city"] ?? ""}.
Tamaño: ${lead["company_size"] ?? "desconocido"}. Web: ${lead["website"] ?? ""}.
Descripción actual: ${lead["company_description"] ?? "sin datos"}.
Necesidad detectada actual: ${lead["detected_need"] ?? "sin datos"}.
Fuente del dato: ${lead["source_name"] ?? ""} (${lead["source_url"] ?? ""}), obtenido el ${lead["retrieved_at"] ?? ""}.
Fuentes de datos habilitadas en el sistema: ${enabledSources.join(", ") || "solo datos internos"}.
Idea/producto a encajar: ${idea["name"] ?? ""}. ${idea["description"] ?? ""} Cliente objetivo: ${idea["target_customer"] ?? ""}.${webContext}

Devuelve JSON: {"company_description":string,"detected_need":string,"fit_reason":string,"fit_level":"Alto"|"Medio"|"Bajo","opportunity_score":number,"why_fits":string,"probable_need":string,"objections":string[],"next_action":string,"enrichment_notes":string,"confidence_level":"alta"|"media"|"baja"}
opportunity_score de 0 a 100. enrichment_notes debe indicar qué se ha inferido y qué queda sin verificar${webEvidence ? ", citando la web corporativa como fuente cuando proceda" : " (no hay extracción web disponible en esta ejecución)"}.`,
    });

    if (!result.ok) return { ok: false as const, error: result.error };

    const v = result.value;
    const score = Number.isFinite(Number(v.opportunity_score))
      ? Math.max(0, Math.min(100, Math.round(Number(v.opportunity_score))))
      : leadRow.opportunity_score;

    const updated = {
      ...lead,
      company_description: v.company_description || lead["company_description"],
      detected_need: v.detected_need || lead["detected_need"],
      fit_reason: v.fit_reason || lead["fit_reason"],
      fit_level: v.fit_level || lead["fit_level"],
      opportunity_score: score,
      ai_analysis: {
        why_fits: v.why_fits,
        probable_need: v.probable_need,
        objections: Array.isArray(v.objections) ? v.objections : [],
        next_action: v.next_action,
      },
      enrichment: {
        enriched_at: new Date().toISOString(),
        model: result.model,
        confidence_level: webEvidence ? (v.confidence_level ?? "media") : "baja",
        notes: [v.enrichment_notes ?? "", retrievalNote].filter(Boolean).join(" · "),
        sources_used: enabledSources,
        web_evidence: webEvidence,
        retrieval_mode: webEvidence ? "web pública verificada" : "solo inferencia sobre datos internos",
      },

    };

    const saved = await supabaseAdmin
      .from("potential_leads")
      .update({ opportunity_score: score, data: updated })
      .eq("id", data.leadId);
    if (saved.error) throw new Error(saved.error.message);

    await supabaseAdmin.from("lead_events").insert({
      potential_lead_id: data.leadId,
      action: webEvidence
        ? `Enriquecimiento con extracción web pública (${webEvidence["source_url"]})`
        : `Enriquecimiento IA sin extracción web${retrievalNote ? ` — ${retrievalNote}` : ""}`,
      previous_status: leadRow.validation_status,
      new_status: leadRow.validation_status,
      actor: "IA · Enriquecedor",
    });

    return {
      ok: true as const,
      enrichment: updated["enrichment"],
      score,
      webEvidence,
      retrievalNote,
    };
  });

/** Estado de los conectores externos disponibles para la recuperación de datos. */
export const getConnectorStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { loadWebConnectors, pickConnector, connectorMode } = await import("./web-retrieval.server");
  const all = await loadWebConnectors();
  const scraper = await pickConnector("scrape");
  const searcher = await pickConnector("search");

  const describe = (c: (typeof all)[number] | null) => {
    if (!c) return null;
    const mode = connectorMode(c);
    return {
      id: c.id,
      name: c.name,
      provider: c.provider,
      configured: c.enabled && c.hasKey,
      mode,
      endpoint: c.baseUrl,
      secretName: c.apiKeySecretName,
      rateLimitPerMin: c.rateLimitPerMin,
      respectRobots: c.respectRobots,
      canSearch: c.canSearch,
      canScrape: c.canScrape,
      label: !c.enabled
        ? `${c.name}: fuente desactivada`
        : !c.hasKey
          ? `${c.name}: falta el secreto ${c.apiKeySecretName || "de API"}`
          : `${c.name} · ${mode === "gateway" ? "pasarela de conectores" : "API directa"}`,
    };
  };

  const scraperInfo = describe(scraper);
  const searcherInfo = describe(searcher);

  return {
    connectors: all.map((c) => describe(c)!),
    scraper: scraperInfo,
    search: searcherInfo,
    // Compatibilidad con la interfaz existente.
    firecrawl: {
      configured: scraperInfo?.configured ?? false,
      mode: scraperInfo?.mode ?? ("none" as const),
      sourceName: scraperInfo?.name ?? "",
      endpoint: scraperInfo?.endpoint ?? "",
      secretName: scraperInfo?.secretName ?? "FIRECRAWL_API_KEY",
      rateLimitPerMin: scraperInfo?.rateLimitPerMin ?? 0,
      respectRobots: scraperInfo?.respectRobots ?? true,
      label: scraperInfo?.label ?? "Sin fuente de extracción dada de alta",
    },
    aiGateway: { configured: !!process.env["LOVABLE_API_KEY"] },
  };
});



/** Actualiza la configuración de una fuente de datos (activación, credenciales, límites y política). */
export const updateDataSource = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        enabled: z.boolean().optional(),
        status: z.string().optional(),
        usage_policy: z.string().max(2000).optional(),
        base_url: z.string().max(500).optional(),
        rate_limit_per_min: z.number().int().min(0).max(10000).optional(),
        respect_robots: z.boolean().optional(),
        api_key_secret_name: z.string().max(200).optional(),
        notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const { data: row, error } = await supabaseAdmin
      .from("data_sources")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Fuente de datos no encontrada.");

    const current = row.data as Record<string, any>;
    const config = {
      ...(current["config"] ?? {}),
      base_url: data.base_url ?? current["config"]?.base_url ?? "",
      rate_limit_per_min: data.rate_limit_per_min ?? current["config"]?.rate_limit_per_min ?? 30,
      respect_robots: data.respect_robots ?? current["config"]?.respect_robots ?? true,
      api_key_secret_name: data.api_key_secret_name ?? current["config"]?.api_key_secret_name ?? "",
      notes: data.notes ?? current["config"]?.notes ?? "",
      updated_at: new Date().toISOString(),
    };

    const enabled = data.enabled ?? row.enabled;
    if (enabled && current["requires_api_key"] && !config.api_key_secret_name) {
      return { ok: false as const, error: "Esta fuente requiere indicar el nombre del secreto con la clave de API." };
    }

    const status = data.status ?? (enabled ? "Conectado (demo)" : current["requires_api_key"] ? "No configurado" : row.status);
    const updated = {
      ...current,
      enabled,
      status,
      usage_policy: data.usage_policy ?? current["usage_policy"],
      config,
    };

    const saved = await supabaseAdmin
      .from("data_sources")
      .update({ enabled, status, data: updated })
      .eq("id", data.id);
    if (saved.error) throw new Error(saved.error.message);
    return { ok: true as const, source: { ...updated, id: row.id } };
  });

/** Motor determinista de validaciones legales (RGPD / LSSI-CE) sobre todos los leads. */
export const runComplianceRules = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("./marketing.server");
  const { data: rows, error } = await supabaseAdmin.from("potential_leads").select("*");
  if (error) throw new Error(error.message);

  let changed = 0;
  const summary = { bloqueados: 0, pendientes: 0, aptos: 0, sin_fuente: 0 };

  for (const row of rows ?? []) {
    const lead = row.data as Record<string, any>;
    const reasons: string[] = [];
    let contact: "sí" | "no" | "pendiente" = "sí";
    let email: "sí" | "no" | "pendiente" = "sí";
    let whatsapp: "sí" | "no" | "pendiente" = "no";
    let risk: "bajo" | "medio" | "alto" = "bajo";
    let status = "Validado";

    if (!lead["source_url"]) {
      reasons.push("Dato sin fuente trazable → no válido.");
      contact = "no";
      email = "no";
      risk = "alto";
      status = "No válido";
      summary.sin_fuente += 1;
    } else if ((lead["source_type"] ?? "").toLowerCase().includes("desconocid")) {
      reasons.push("Fuente poco clara → pendiente de validación.");
      contact = "pendiente";
      email = "pendiente";
      risk = "medio";
      status = "Pendiente de validación";
    }

    if (lead["consent_available"] !== "sí") {
      reasons.push("Sin consentimiento explícito → no apto para email marketing directo.");
      if (email === "sí") email = "no";
      if (risk === "bajo") risk = "medio";
    }
    if (lead["requires_consent"] === "sí" && lead["consent_available"] !== "sí") {
      reasons.push("Requiere consentimiento y no consta → contacto no permitido.");
      contact = "no";
      risk = "alto";
      status = "Bloqueado por cumplimiento";
    }
    whatsapp = lead["whatsapp_optin"] === true ? "sí" : lead["consent_available"] === "sí" ? "pendiente" : "no";
    if (whatsapp !== "sí") reasons.push("Sin opt-in específico de WhatsApp → no apto para WhatsApp marketing.");

    const personal = (lead["contacts"] ?? []).some(
      (c: Record<string, any>) => c["corporate_email"] && !String(c["corporate_email"]).includes(String(lead["website"] ?? "").replace(/^https?:\/\/(www\.)?/, "")),
    );
    if (personal) {
      reasons.push("Contacto no verificable como corporativo → revisar antes de contactar.");
      if (contact === "sí") contact = "pendiente";
      if (risk === "bajo") risk = "medio";
      if (status === "Validado") status = "Pendiente de validación";
    }

    if (String(lead["notes"] ?? "").toLowerCase().includes("baja")) {
      reasons.push("Solicitud de baja registrada → bloqueo permanente.");
      contact = "no";
      email = "no";
      whatsapp = "no";
      risk = "alto";
      status = "Bloqueado por cumplimiento";
    }

    if (contact === "no") summary.bloqueados += 1;
    else if (contact === "pendiente") summary.pendientes += 1;
    else summary.aptos += 1;

    const legalRecommendation = reasons.join(" ") || "Contacto B2B permitido por interés legítimo, con derecho de oposición informado.";
    const needsUpdate =
      row.contact_allowed !== contact ||
      row.risk_level !== risk ||
      row.validation_status !== status ||
      lead["email_marketing_allowed"] !== email ||
      lead["whatsapp_marketing_allowed"] !== whatsapp;

    if (!needsUpdate) continue;
    changed += 1;

    const updated = {
      ...lead,
      contact_allowed: contact,
      email_marketing_allowed: email,
      whatsapp_marketing_allowed: whatsapp,
      risk_level: risk,
      validation_status: status,
      legal_recommendation: legalRecommendation,
      compliance_checked_at: new Date().toISOString(),
    };

    await supabaseAdmin
      .from("potential_leads")
      .update({ contact_allowed: contact, risk_level: risk, validation_status: status, data: updated })
      .eq("id", row.id);
    await supabaseAdmin.from("lead_events").insert({
      potential_lead_id: row.id,
      action: "Validación legal automática (reglas RGPD/LSSI-CE)",
      previous_status: row.validation_status,
      new_status: status,
      actor: "Motor de cumplimiento",
    });
  }

  return { ok: true as const, evaluated: rows?.length ?? 0, changed, summary };
});

/** Guarda una nueva versión del prompt conservando siempre la anterior recuperable. */
export const updatePrompt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        sistema: z.string().min(10).max(8000),
        plantilla: z.string().min(10).max(8000),
        modelo: z.string().min(1).max(120),
        estado: z.enum(["borrador", "produccion"]),
        cambios: z.string().max(500).default("Actualización manual"),
        autor: z.string().max(120).default("Usuario demo"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const { data: row, error } = await supabaseAdmin.from("ai_prompts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Prompt no encontrado.");

    const current = row.data as Record<string, any>;
    const snapshots: Record<string, any>[] = Array.isArray(current["snapshots"]) ? current["snapshots"] : [];
    const previous = {
      version: current["version"],
      sistema: current["sistema"],
      plantilla: current["plantilla"],
      variables: current["variables"] ?? [],
      modelo: current["modelo"],
      estado: current["estado"],
      cambios: current["ultimo_cambio"] ?? "Versión anterior",
      autor: current["owner"] ?? "sistema",
      fecha: current["fecha_actualizacion"] ?? new Date().toISOString().slice(0, 10),
    };

    const [major, minor] = String(current["version"] ?? "1.0").replace(/^v/i, "").split(".");
    const nextVersion = `${major || "1"}.${Number(minor ?? 0) + 1}`;
    const variables = Array.from(new Set([...data.plantilla.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]!)));
    const today = new Date().toISOString().slice(0, 10);

    const updated = {
      ...current,
      sistema: data.sistema,
      plantilla: data.plantilla,
      modelo: data.modelo,
      estado: data.estado,
      variables,
      version: nextVersion,
      ultimo_cambio: data.cambios,
      owner: data.autor,
      fecha_actualizacion: today,
      snapshots: [previous, ...snapshots].slice(0, 30),
      versions: [
        { version: nextVersion, cambios: data.cambios, autor: data.autor, fecha: today, activo: true },
        ...(Array.isArray(current["versions"]) ? current["versions"] : []).map((v: Record<string, any>) => ({
          ...v,
          activo: false,
        })),
      ].slice(0, 30),
    };

    const saved = await supabaseAdmin
      .from("ai_prompts")
      .update({ modelo: data.modelo, estado: data.estado, version: nextVersion, data: updated })
      .eq("id", data.id);
    if (saved.error) throw new Error(saved.error.message);
    return { ok: true as const, version: nextVersion };
  });

/** Recupera una versión anterior guardándola como nueva versión activa. */
export const restorePromptVersion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().min(1), version: z.string().min(1), autor: z.string().max(120).default("Usuario demo") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const { data: row, error } = await supabaseAdmin.from("ai_prompts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Prompt no encontrado.");
    const current = row.data as Record<string, any>;
    const snapshots: Record<string, any>[] = Array.isArray(current["snapshots"]) ? current["snapshots"] : [];
    const target = snapshots.find((s) => String(s["version"]) === data.version);
    if (!target) return { ok: false as const, error: "No hay copia recuperable de esa versión." };

    const previous = {
      version: current["version"],
      sistema: current["sistema"],
      plantilla: current["plantilla"],
      variables: current["variables"] ?? [],
      modelo: current["modelo"],
      estado: current["estado"],
      cambios: current["ultimo_cambio"] ?? "Versión anterior",
      autor: current["owner"] ?? "sistema",
      fecha: current["fecha_actualizacion"] ?? new Date().toISOString().slice(0, 10),
    };
    const [major, minor] = String(current["version"] ?? "1.0").replace(/^v/i, "").split(".");
    const nextVersion = `${major || "1"}.${Number(minor ?? 0) + 1}`;
    const today = new Date().toISOString().slice(0, 10);

    const updated = {
      ...current,
      sistema: target["sistema"],
      plantilla: target["plantilla"],
      variables: target["variables"] ?? [],
      modelo: target["modelo"] ?? current["modelo"],
      version: nextVersion,
      ultimo_cambio: `Restauración de la versión ${data.version}`,
      owner: data.autor,
      fecha_actualizacion: today,
      snapshots: [previous, ...snapshots].slice(0, 30),
      versions: [
        { version: nextVersion, cambios: `Restauración de v${data.version}`, autor: data.autor, fecha: today, activo: true },
        ...(Array.isArray(current["versions"]) ? current["versions"] : []).map((v: Record<string, any>) => ({
          ...v,
          activo: false,
        })),
      ].slice(0, 30),
    };

    const saved = await supabaseAdmin
      .from("ai_prompts")
      .update({ modelo: updated["modelo"], version: nextVersion, data: updated })
      .eq("id", data.id);
    if (saved.error) throw new Error(saved.error.message);
    return { ok: true as const, version: nextVersion };
  });

/** Alta manual de un prompt nuevo en el catálogo versionado. */
export const createPrompt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        nombre: z.string().min(3).max(160),
        categoria: z.string().min(2).max(80),
        tipo: z.string().max(80).default("Generación"),
        sistema: z.string().min(10).max(8000),
        plantilla: z.string().min(10).max(8000),
        modelo: z.string().min(1).max(120).default("google/gemini-3.6-flash"),
        estado: z.enum(["borrador", "produccion"]).default("borrador"),
        autor: z.string().max(120).default("Usuario demo"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./marketing.server");
    const id = `prompt-${crypto.randomUUID().slice(0, 8)}`;
    const today = new Date().toISOString().slice(0, 10);
    const variables = Array.from(new Set([...data.plantilla.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]!)));
    const record = {
      id,
      nombre: data.nombre,
      categoria: data.categoria,
      tipo: data.tipo,
      version: "1.0",
      sistema: data.sistema,
      plantilla: data.plantilla,
      variables,
      modelo: data.modelo,
      estado: data.estado,
      owner: data.autor,
      fecha_actualizacion: today,
      ultimo_cambio: "Creación del prompt",
      snapshots: [],
      versions: [{ version: "1.0", cambios: "Creación del prompt", autor: data.autor, fecha: today, activo: true }],
    };
    const saved = await supabaseAdmin.from("ai_prompts").insert({
      id,
      nombre: data.nombre,
      categoria: data.categoria,
      version: "1.0",
      estado: data.estado,
      modelo: data.modelo,
      data: record,
    });
    if (saved.error) throw new Error(saved.error.message);
    return { ok: true as const, id };
  });

/** Generación asistida por IA de un prompt nuevo a partir de un objetivo en lenguaje natural. */
export const suggestPrompt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        objetivo: z.string().min(10).max(2000),
        categoria: z.string().max(80).default("Prospección"),
        canal: z.string().max(80).default("Email"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { callAiJson } = await import("./marketing.server");
    const result = await callAiJson<{
      nombre: string;
      categoria: string;
      tipo: string;
      sistema: string;
      plantilla: string;
      variables: string[];
      notas: string;
    }>({
      model: "google/gemini-3.6-flash",
      system:
        "Eres ingeniero de prompts especializado en SaaS B2B de prospección conforme a RGPD y LSSI-CE. Diseñas prompts en español, con un system prompt claro y una plantilla parametrizada con variables entre dobles llaves. Los prompts deben prohibir inventar datos personales y exigir indicar el origen público del dato.",
      user: `Objetivo del prompt: ${data.objetivo}
Categoría deseada: ${data.categoria}. Canal: ${data.canal}.

Devuelve JSON: {"nombre":string,"categoria":string,"tipo":string,"sistema":string,"plantilla":string,"variables":string[],"notas":string}
La plantilla debe usar variables del tipo {{empresa}}, {{sector}}, {{cargo}}, {{producto}} según convenga.`,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, suggestion: result.value };
  });

/**
 * Búsqueda y alta de nuevos clientes potenciales a partir de fuentes públicas.
 * Usa la fuente de extracción dada de alta en "Fuentes de datos" para localizar
 * empresas reales y la IA solo para estructurar y puntuar el encaje.
 */
export const discoverLeads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        ideaId: z.string().min(1),
        sector: z.string().trim().max(120).optional(),
        country: z.string().trim().max(80).optional(),
        companySize: z.string().trim().max(60).optional(),
        keywords: z.string().trim().max(300).optional(),
        limit: z.number().int().min(1).max(10).default(5),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, callAiJson } = await import("./marketing.server");

    const ideaRow = await supabaseAdmin
      .from("business_ideas")
      .select("id, name, sector, data")
      .eq("id", data.ideaId)
      .maybeSingle();
    if (!ideaRow.data) throw new Error("Idea de negocio no encontrada.");
    const idea = (ideaRow.data.data ?? {}) as Record<string, any>;

    const sector = data.sector || String(idea["sector"] ?? ideaRow.data.sector ?? "");
    const country = data.country || String(idea["target_market"] ?? "España");

    // 1) Recuperación pública real con el conector configurado.
    const { searchWeb, loadWebConnector } = await import("./web-retrieval.server");
    const connector = await loadWebConnector();
    const query = [
      "empresas",
      sector,
      data.companySize ?? "",
      country,
      data.keywords ?? "",
      "web oficial",
    ]
      .filter(Boolean)
      .join(" ");

    let evidence = "";
    let hits: { title: string; url: string; description: string }[] = [];
    let provider = "";
    let retrievedAt = new Date().toISOString();
    let retrievalNote = "";

    if (!connector || !connector.enabled) {
      retrievalNote = "Búsqueda web desactivada: no hay ninguna fuente de extracción habilitada.";
    } else if (!connector.hasKey) {
      retrievalNote = `Búsqueda web desactivada: falta el secreto ${connector.apiKeySecretName}.`;
    } else {
      const found = await searchWeb(query, { limit: Math.min(data.limit * 2, 20), connector });
      if (found.ok) {
        hits = found.hits;
        provider = found.provider;
        retrievedAt = found.retrievedAt;
        evidence = hits
          .map((h, i) => `${i + 1}. ${h.title} — ${h.url}\n${h.description}`)
          .join("\n\n");
      } else {
        retrievalNote = `Búsqueda web no disponible: ${found.error}`;
      }
    }

    if (!hits.length) {
      return {
        ok: false as const,
        error:
          retrievalNote ||
          "No se han obtenido resultados públicos verificables; no se dan de alta leads sin fuente trazable.",
      };
    }

    // 2) Estructuración con IA, sin inventar datos de contacto.
    const result = await callAiJson<{
      leads: {
        company_name: string;
        website: string;
        source_index: number;
        sector: string;
        subsector: string;
        country: string;
        city: string;
        company_size: string;
        company_description: string;
        detected_need: string;
        fit_reason: string;
        fit_level: string;
        opportunity_score: number;
        discard_reason?: string;
      }[];
    }>({
      model: "google/gemini-3.6-flash",
      system:
        "Eres analista de prospección B2B en la UE. A partir de resultados de búsqueda web públicos, identificas EMPRESAS (nunca personas ni autónomos identificables) que encajan con una propuesta de valor. Prohibido inventar nombres de personas, emails, teléfonos o URLs que no aparezcan en los resultados. Descarta directorios, agregadores, medios, blogs y páginas que no sean la web de una empresa concreta. Escribe en español.",
      user: `Idea/producto: ${ideaRow.data.name}. ${idea["description"] ?? ""}
Cliente objetivo: ${idea["target_customer"] ?? ""}. Propuesta de valor: ${idea["value_proposition"] ?? ""}.
Criterios de búsqueda: sector "${sector}", país "${country}", tamaño "${data.companySize ?? "cualquiera"}", palabras clave "${data.keywords ?? "-"}".

Resultados de búsqueda pública (usa SOLO estos):
"""
${evidence}
"""

Devuelve como máximo ${data.limit} empresas válidas en JSON:
{"leads":[{"company_name":string,"website":string,"source_index":number,"sector":string,"subsector":string,"country":string,"city":string,"company_size":string,"company_description":string,"detected_need":string,"fit_reason":string,"fit_level":"Alto"|"Medio"|"Bajo","opportunity_score":number}]}
source_index es el número del resultado del que procede cada empresa. website debe ser exactamente la URL de ese resultado. opportunity_score de 0 a 100. Si un resultado no es una empresa concreta, omítelo.`,
    });

    if (!result.ok) return { ok: false as const, error: result.error };

    const candidates = (result.value.leads ?? []).filter((l) => l.company_name && l.website).slice(0, data.limit);
    if (!candidates.length) {
      return { ok: false as const, error: "La búsqueda no ha localizado empresas concretas con fuente verificable." };
    }

    const existing = await supabaseAdmin.from("potential_leads").select("id, company_name, data");
    const known = new Set(
      (existing.data ?? []).map((r) =>
        `${r.company_name ?? ""}`.trim().toLowerCase(),
      ),
    );

    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);
    const inserted: { id: string; company_name: string; opportunity_score: number }[] = [];
    const skipped: string[] = [];

    for (const c of candidates) {
      const nameKey = c.company_name.trim().toLowerCase();
      if (known.has(nameKey)) {
        skipped.push(c.company_name);
        continue;
      }
      known.add(nameKey);

      const hit = hits[Math.max(0, Math.min(hits.length - 1, Number(c.source_index ?? 1) - 1))];
      const id = `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const score = Number.isFinite(Number(c.opportunity_score))
        ? Math.max(0, Math.min(100, Math.round(Number(c.opportunity_score))))
        : 50;

      const lead = {
        id,
        business_idea_id: data.ideaId,
        company_name: c.company_name,
        commercial_name: c.company_name,
        sector: c.sector || sector,
        subsector: c.subsector ?? "",
        country: c.country || country,
        city: c.city ?? "",
        website: c.website || hit?.url || "",
        linkedin_url: null,
        company_description: c.company_description ?? "",
        fit_reason: c.fit_reason ?? "",
        detected_need: c.detected_need ?? "",
        company_size: c.company_size || (data.companySize ?? "desconocido"),
        customer_type: "Empresa",
        fit_level: c.fit_level || "Medio",
        opportunity_score: score,
        source_name: connector?.name ?? "Búsqueda web pública",
        source_url: hit?.url ?? c.website,
        source_type: "Búsqueda web pública",
        retrieved_at: today,
        validation_status: "Nuevo",
        legal_basis: "Interés legítimo (pendiente de verificación)",
        purpose: "Prospección comercial B2B",
        requires_consent: "pendiente",
        consent_available: "no",
        email_marketing_allowed: "pendiente",
        whatsapp_marketing_allowed: "no",
        contact_allowed: "pendiente",
        risk_level: "medio",
        legal_recommendation:
          "Lead descubierto automáticamente: verificar datos de contacto corporativos y base jurídica antes de cualquier campaña.",
        notes: `Descubierto mediante búsqueda web pública (${provider}) el ${today}.`,
        contacts: [],
        ai_analysis: {
          why_fits: c.fit_reason ?? "",
          probable_need: c.detected_need ?? "",
          objections: [],
          next_action: "Enriquecer con la web corporativa y validar legalmente.",
        },
        discovery: {
          discovered_at: nowIso,
          query,
          provider,
          source_url: hit?.url ?? "",
          source_title: hit?.title ?? "",
          retrieved_at: retrievedAt,
          model: result.model,
          confidence_level: "media",
          source_id: connector?.id ?? "",
        },
        history: [],
      };

      const savedLead = await supabaseAdmin.from("potential_leads").insert({
        id,
        business_idea_id: data.ideaId,
        company_name: c.company_name,
        sector: lead.sector,
        country: lead.country,
        opportunity_score: score,
        validation_status: "Nuevo",
        contact_allowed: "pendiente",
        risk_level: "medio",
        data: lead,
      });
      if (savedLead.error) throw new Error(savedLead.error.message);

      await supabaseAdmin.from("lead_events").insert({
        potential_lead_id: id,
        action: `Alta por búsqueda web pública (${hit?.url ?? ""})`,
        previous_status: "",
        new_status: "Nuevo",
        actor: "IA · Buscador de leads",
      });

      inserted.push({ id, company_name: c.company_name, opportunity_score: score });
    }

    return {
      ok: true as const,
      created: inserted,
      skipped,
      query,
      provider,
      retrievalNote,
      hitCount: hits.length,
    };
  });
