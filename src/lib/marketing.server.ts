// Servidor: acceso a datos y llamadas reales a la IA (Lovable AI Gateway).
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type AiCallResult<T> = { ok: true; value: T; model: string } | { ok: false; error: string; status: number };

export async function callAiJson<T>(opts: {
  model: string;
  system: string;
  user: string;
}): Promise<AiCallResult<T>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "Falta la clave de la pasarela de IA.", status: 500 };

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: `${opts.system}\n\nResponde EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional ni markdown.` },
        { role: "user", content: opts.user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[AI] ${response.status}: ${body}`);
    const error =
      response.status === 429
        ? "Límite de peticiones de IA alcanzado. Inténtalo de nuevo en unos minutos."
        : response.status === 402
          ? "Créditos de IA agotados. Añade créditos al espacio de trabajo."
          : `Error de la pasarela de IA (${response.status}).`;
    return { ok: false, error, status: response.status };
  }

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  try {
    return { ok: true, value: JSON.parse(stripFences(raw)) as T, model: opts.model };
  } catch {
    console.error("[AI] respuesta no parseable:", raw.slice(0, 500));
    return { ok: false, error: "La IA devolvió una respuesta no interpretable.", status: 502 };
  }
}

export async function callAiText(opts: { model: string; system: string; user: string }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false as const, error: "Falta la clave de la pasarela de IA." };

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[AI] ${response.status}: ${body}`);
    return {
      ok: false as const,
      error:
        response.status === 429
          ? "Límite de peticiones de IA alcanzado. Inténtalo de nuevo en unos minutos."
          : response.status === 402
            ? "Créditos de IA agotados. Añade créditos al espacio de trabajo."
            : `Error de la pasarela de IA (${response.status}).`,
    };
  }

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true as const, text: (payload.choices?.[0]?.message?.content ?? "").trim() };
}

function stripFences(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
}

export function renderTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => values[key] ?? `[${key} no disponible]`);
}

export async function getPrompt(id: string) {
  const { data, error } = await supabaseAdmin.from("ai_prompts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Prompt ${id} no encontrado en el catálogo.`);
  return data as { id: string; modelo: string; version: string; data: Record<string, unknown> };
}

/**
 * Prompts de los motores internos (enriquecimiento y búsqueda de leads).
 * Se registran en el catálogo de la base de datos para que sean editables y
 * versionables desde la pantalla de Administración IA.
 */
export const CORE_PROMPTS = [
  {
    id: "prompt-7",
    nombre: "Enriquecimiento de clientes potenciales",
    categoria: "Enriquecimiento",
    tipo: "Análisis",
    modelo: "google/gemini-3.6-flash",
    sistema:
      "Eres analista de prospección B2B. Enriqueces fichas de empresa SOLO con información corporativa pública y con el contexto verificable aportado. Está prohibido inventar datos personales, emails, teléfonos o cifras concretas no verificables. Si un dato no consta, dilo explícitamente. Escribe en español.",
    plantilla: `Empresa: {{empresa}} ({{nombre_comercial}}).
Sector: {{sector}}. País: {{pais}}, ciudad: {{ciudad}}.
Tamaño: {{tamano}}. Web: {{web}}.
Descripción actual: {{descripcion}}.
Necesidad detectada actual: {{necesidad}}.
Fuente del dato: {{fuente}}.
Fuentes de datos habilitadas en el sistema: {{fuentes_habilitadas}}.
Idea/producto a encajar: {{idea}}. Cliente objetivo: {{cliente_objetivo}}.
{{contexto_web}}

Devuelve JSON: {"company_description":string,"detected_need":string,"fit_reason":string,"fit_level":"Alto"|"Medio"|"Bajo","opportunity_score":number,"why_fits":string,"probable_need":string,"objections":string[],"next_action":string,"enrichment_notes":string,"confidence_level":"alta"|"media"|"baja"}
opportunity_score de 0 a 100. enrichment_notes debe indicar qué se ha inferido y qué queda sin verificar, citando la web corporativa como fuente cuando exista extracción.`,
  },
  {
    id: "prompt-8",
    nombre: "Búsqueda y estructuración de nuevos leads",
    categoria: "Enriquecimiento",
    tipo: "Prospección",
    modelo: "google/gemini-3.6-flash",
    sistema:
      "Eres analista de prospección B2B en la UE. A partir de resultados de búsqueda web públicos, identificas EMPRESAS (nunca personas ni autónomos identificables) que encajan con una propuesta de valor. Prohibido inventar nombres de personas, emails, teléfonos o URLs que no aparezcan en los resultados. Descarta directorios, agregadores, medios, blogs y páginas que no sean la web de una empresa concreta. Escribe en español.",
    plantilla: `Idea/producto: {{idea}}
Cliente objetivo: {{cliente_objetivo}}. Propuesta de valor: {{propuesta_valor}}.
Criterios de búsqueda: sector "{{sector}}", país "{{pais}}", tamaño "{{tamano}}", palabras clave "{{palabras_clave}}".

Resultados de búsqueda pública (usa SOLO estos):
"""
{{resultados}}
"""

Devuelve como máximo {{limite}} empresas válidas en JSON:
{"leads":[{"company_name":string,"website":string,"source_index":number,"sector":string,"subsector":string,"country":string,"city":string,"company_size":string,"company_description":string,"detected_need":string,"fit_reason":string,"fit_level":"Alto"|"Medio"|"Bajo","opportunity_score":number}]}
source_index es el número del resultado del que procede cada empresa. website debe ser exactamente la URL de ese resultado. opportunity_score de 0 a 100. Si un resultado no es una empresa concreta, omítelo.`,
  },
] as const;

function extractVariables(template: string) {
  return Array.from(new Set([...template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]!)));
}

/** Registra en el catálogo los prompts de los motores internos que aún no existan. */
export async function ensureCorePrompts() {
  const { data, error } = await supabaseAdmin.from("ai_prompts").select("id");
  if (error) return;
  const existing = new Set((data ?? []).map((r) => r.id));
  const missing = CORE_PROMPTS.filter((p) => !existing.has(p.id));
  if (!missing.length) return;
  const today = new Date().toISOString().slice(0, 10);
  const rows = missing.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    version: "1.0",
    estado: "produccion",
    modelo: p.modelo,
    data: {
      ...p,
      version: "1.0",
      estado: "produccion",
      variables: extractVariables(p.plantilla),
      owner: "sistema",
      fecha_actualizacion: today,
      ultimo_cambio: "Registro automático del prompt del motor",
      snapshots: [],
      versions: [
        { version: "1.0", cambios: "Registro automático del prompt del motor", autor: "sistema", fecha: today, activo: true },
      ],
    },
  }));
  await supabaseAdmin.from("ai_prompts").upsert(rows, { onConflict: "id" });
}

/** Obtiene un prompt del catálogo, registrándolo antes si es un prompt de motor interno. */
export async function getPromptOrSeed(id: string) {
  await ensureCorePrompts();
  return getPrompt(id);
}
