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
