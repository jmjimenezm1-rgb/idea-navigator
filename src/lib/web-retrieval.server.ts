// Recuperación lícita de contenido corporativo público (Firecrawl).
// Toda la configuración operativa (endpoint, secreto, límite de frecuencia y robots.txt)
// se lee de la fuente de datos dada de alta en la pantalla "Fuentes de datos".

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type WebFetchResult =
  | { ok: true; markdown: string; sourceUrl: string; title?: string | undefined; provider: string; retrievedAt: string }
  | { ok: false; error: string };

export type WebConnector = {
  id: string;
  name: string;
  enabled: boolean;
  baseUrl: string;
  apiKeySecretName: string;
  rateLimitPerMin: number;
  respectRobots: boolean;
  hasKey: boolean;
};

const DEFAULT_GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
const DEFAULT_DIRECT = "https://api.firecrawl.dev/v2";

export function firecrawlStatus(secretName = "FIRECRAWL_API_KEY") {
  const key = process.env[secretName];
  if (!key) return { configured: false as const, mode: "none" as const };
  return {
    configured: true as const,
    mode: key.startsWith("lovc_") ? ("gateway" as const) : ("direct" as const),
  };
}

/** Carga la fuente de extracción web habilitada y su configuración desde la base de datos. */
export async function loadWebConnector(): Promise<WebConnector | null> {
  const { data } = await supabaseAdmin.from("data_sources").select("id, name, type, enabled, data");
  const row = (data ?? []).find((s) =>
    /firecrawl|web|scrap/i.test(`${s.id} ${s.name} ${s.type}`),
  );
  if (!row) return null;

  const payload = (row.data ?? {}) as Record<string, any>;
  const config = (payload["config"] ?? {}) as Record<string, any>;
  const apiKeySecretName = String(config["api_key_secret_name"] || "FIRECRAWL_API_KEY");
  const mode = firecrawlStatus(apiKeySecretName).mode;

  return {
    id: row.id,
    name: row.name,
    enabled: !!row.enabled,
    baseUrl: String(config["base_url"] || (mode === "direct" ? DEFAULT_DIRECT : DEFAULT_GATEWAY)).replace(/\/+$/, ""),
    apiKeySecretName,
    rateLimitPerMin: Number(config["rate_limit_per_min"] ?? 20),
    respectRobots: config["respect_robots"] !== false,
    hasKey: !!process.env[apiKeySecretName],
  };
}

/**
 * Control de frecuencia persistido en la propia fuente de datos: ventana deslizante de un minuto.
 * Devuelve false cuando se ha alcanzado el límite configurado por el usuario.
 */
export async function consumeRateLimit(connector: WebConnector): Promise<boolean> {
  if (!connector.rateLimitPerMin || connector.rateLimitPerMin <= 0) return true;

  const { data } = await supabaseAdmin.from("data_sources").select("data").eq("id", connector.id).maybeSingle();
  const payload = (data?.data ?? {}) as Record<string, any>;
  const usage = (payload["usage"] ?? {}) as { window_start?: string; count?: number };

  const now = Date.now();
  const start = usage.window_start ? Date.parse(usage.window_start) : 0;
  const withinWindow = now - start < 60_000;
  const count = withinWindow ? Number(usage.count ?? 0) : 0;

  if (count >= connector.rateLimitPerMin) return false;

  await supabaseAdmin
    .from("data_sources")
    .update({
      data: {
        ...payload,
        usage: {
          window_start: withinWindow ? new Date(start).toISOString() : new Date(now).toISOString(),
          count: count + 1,
          last_call_at: new Date(now).toISOString(),
        },
      },
    })
    .eq("id", connector.id);

  return true;
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

/** Comprueba robots.txt del dominio antes de extraer contenido. */
export async function robotsAllows(target: URL): Promise<boolean> {
  try {
    const response = await fetch(new URL("/robots.txt", target.origin).toString(), {
      headers: { "User-Agent": "MarketingHubAI" },
    });
    if (!response.ok) return true;
    const text = await response.text();

    let applies = false;
    const disallow: string[] = [];
    for (const line of text.split("\n")) {
      const clean = line.split("#")[0]?.trim() ?? "";
      if (!clean) continue;
      const [rawKey, ...rest] = clean.split(":");
      const key = (rawKey ?? "").trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "user-agent") applies = value === "*" || /marketinghubai/i.test(value);
      else if (key === "disallow" && applies && value) disallow.push(value);
    }
    const path = target.pathname || "/";
    return !disallow.some((rule) => path.startsWith(rule));
  } catch {
    return true;
  }
}

/** Extrae el contenido público de una web corporativa en markdown usando la fuente configurada. */
export async function scrapeCorporateSite(
  rawUrl: string,
  opts: { maxChars?: number; connector: WebConnector },
): Promise<WebFetchResult> {
  const { connector } = opts;
  const url = normalizeUrl(rawUrl);
  if (!url) return { ok: false, error: "URL de empresa no válida." };

  const key = process.env[connector.apiKeySecretName];
  if (!key) {
    return {
      ok: false,
      error: `Conector "${connector.name}" sin credencial: falta el secreto ${connector.apiKeySecretName}.`,
    };
  }

  if (connector.respectRobots && !(await robotsAllows(url))) {
    return { ok: false, error: "robots.txt del dominio prohíbe la extracción de esta ruta." };
  }

  if (!(await consumeRateLimit(connector))) {
    return {
      ok: false,
      error: `Límite de ${connector.rateLimitPerMin} peticiones/minuto alcanzado en la fuente "${connector.name}".`,
    };
  }

  const gateway = key.startsWith("lovc_");
  let headers: Record<string, string>;
  if (gateway) {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) return { ok: false, error: "Falta LOVABLE_API_KEY para la pasarela de conectores." };
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": key,
    };
  } else {
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
  }

  let response: Response;
  try {
    response = await fetch(`${connector.baseUrl}/scrape`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: url.toString(), formats: ["markdown"], onlyMainContent: true }),
    });
  } catch (e) {
    return { ok: false, error: `No se pudo contactar con el proveedor de extracción: ${(e as Error).message}` };
  }

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Firecrawl] ${response.status}: ${text.slice(0, 500)}`);
    return {
      ok: false,
      error:
        response.status === 402
          ? "Créditos del proveedor de extracción agotados."
          : response.status === 401 || response.status === 403
            ? `Credenciales no válidas para el endpoint configurado (${connector.baseUrl}).`
            : `Error del proveedor de extracción (${response.status}).`,
    };
  }

  const payload = (await response.json()) as {
    markdown?: string;
    metadata?: { title?: string; sourceURL?: string };
    data?: { markdown?: string; metadata?: { title?: string; sourceURL?: string } };
  };
  const markdown = payload.markdown ?? payload.data?.markdown ?? "";
  const metadata = payload.metadata ?? payload.data?.metadata ?? {};
  if (!markdown.trim()) return { ok: false, error: "La web no devolvió contenido público utilizable." };

  return {
    ok: true,
    markdown: markdown.slice(0, opts.maxChars ?? 6000),
    sourceUrl: metadata.sourceURL ?? url.toString(),
    title: metadata.title,
    provider: `${connector.name} · ${gateway ? "pasarela de conectores" : "API directa"}`,
    retrievedAt: new Date().toISOString(),
  };
}
