// Recuperación lícita de contenido corporativo público (Firecrawl, Apify, Google CSE).
// Toda la configuración operativa (endpoint, secreto, límite de frecuencia y robots.txt)
// se lee de la fuente de datos dada de alta en la pantalla "Fuentes de datos".

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type WebFetchResult =
  | { ok: true; markdown: string; sourceUrl: string; title?: string | undefined; provider: string; retrievedAt: string }
  | { ok: false; error: string };

export type ConnectorProvider = "firecrawl" | "apify" | "google_cse" | "other";

export type WebConnector = {
  id: string;
  name: string;
  provider: ConnectorProvider;
  enabled: boolean;
  baseUrl: string;
  apiKeySecretName: string;
  rateLimitPerMin: number;
  respectRobots: boolean;
  hasKey: boolean;
  canSearch: boolean;
  canScrape: boolean;
  notes: string;
};

const DEFAULTS: Record<ConnectorProvider, { gateway: string; direct: string }> = {
  firecrawl: { gateway: "https://connector-gateway.lovable.dev/firecrawl/v2", direct: "https://api.firecrawl.dev/v2" },
  apify: { gateway: "https://connector-gateway.lovable.dev/apify", direct: "https://api.apify.com/v2" },
  google_cse: { gateway: "https://www.googleapis.com/customsearch/v1", direct: "https://www.googleapis.com/customsearch/v1" },
  other: { gateway: "", direct: "" },
};

export function detectProvider(text: string): ConnectorProvider {
  if (/firecrawl/i.test(text)) return "firecrawl";
  if (/apify/i.test(text)) return "apify";
  if (/google\s*(custom)?\s*search|cse/i.test(text)) return "google_cse";
  if (/scrap|extracci/i.test(text)) return "firecrawl";
  return "other";
}

export function firecrawlStatus(secretName = "FIRECRAWL_API_KEY") {
  const key = process.env[secretName];
  if (!key) return { configured: false as const, mode: "none" as const };
  return {
    configured: true as const,
    mode: key.startsWith("lovc_") ? ("gateway" as const) : ("direct" as const),
  };
}

export function connectorMode(connector: WebConnector) {
  const key = process.env[connector.apiKeySecretName];
  if (!key) return "none" as const;
  return key.startsWith("lovc_") ? ("gateway" as const) : ("direct" as const);
}

function toConnector(row: { id: string; name: string; type: string; enabled: boolean; data: any }): WebConnector {
  const payload = (row.data ?? {}) as Record<string, any>;
  const config = (payload["config"] ?? {}) as Record<string, any>;
  const provider = detectProvider(`${row.id} ${row.name} ${row.type}`);
  const apiKeySecretName = String(
    config["api_key_secret_name"] || (provider === "firecrawl" ? "FIRECRAWL_API_KEY" : provider === "apify" ? "APIFY_API_KEY" : ""),
  );
  const key = apiKeySecretName ? process.env[apiKeySecretName] : undefined;
  const mode = key ? (key.startsWith("lovc_") ? "gateway" : "direct") : "gateway";
  const defaults = DEFAULTS[provider];

  return {
    id: row.id,
    name: row.name,
    provider,
    enabled: !!row.enabled,
    baseUrl: String(config["base_url"] || (mode === "direct" ? defaults.direct : defaults.gateway)).replace(/\/+$/, ""),
    apiKeySecretName,
    rateLimitPerMin: Number(config["rate_limit_per_min"] ?? 20),
    respectRobots: config["respect_robots"] !== false,
    hasKey: !!key,
    canSearch: provider === "firecrawl" || provider === "apify" || provider === "google_cse",
    canScrape: provider === "firecrawl" || provider === "apify",
    notes: String(config["notes"] ?? ""),
  };
}

/** Todos los conectores de recuperación web dados de alta, con su configuración real. */
export async function loadWebConnectors(): Promise<WebConnector[]> {
  const { data } = await supabaseAdmin.from("data_sources").select("id, name, type, enabled, data");
  return (data ?? [])
    .map((row) => toConnector(row as any))
    .filter((c) => c.provider !== "other");
}

/** Elige el conector operativo para una capacidad concreta (preferencia: Firecrawl → Apify → Google CSE). */
export async function pickConnector(capability: "scrape" | "search"): Promise<WebConnector | null> {
  const all = await loadWebConnectors();
  const capable = all.filter((c) => (capability === "scrape" ? c.canScrape : c.canSearch));
  const order: ConnectorProvider[] = ["firecrawl", "apify", "google_cse"];
  const ready = capable
    .filter((c) => c.enabled && c.hasKey)
    .sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider));
  return ready[0] ?? capable.sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider))[0] ?? null;
}

/** Compatibilidad: conector principal de extracción web. */
export async function loadWebConnector(): Promise<WebConnector | null> {
  return pickConnector("scrape");
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

export type WebSearchHit = { title: string; url: string; description: string };
export type WebSearchResult = { ok: true; hits: WebSearchHit[]; provider: string; retrievedAt: string } | { ok: false; error: string };

/** Búsqueda web pública (directorios, webs corporativas) con la fuente configurada en "Fuentes de datos". */
export async function searchWeb(
  query: string,
  opts: { limit?: number; connector: WebConnector },
): Promise<WebSearchResult> {
  const { connector } = opts;
  const key = process.env[connector.apiKeySecretName];
  if (!key) {
    return { ok: false, error: `Conector "${connector.name}" sin credencial: falta el secreto ${connector.apiKeySecretName}.` };
  }
  if (!(await consumeRateLimit(connector))) {
    return { ok: false, error: `Límite de ${connector.rateLimitPerMin} peticiones/minuto alcanzado en la fuente "${connector.name}".` };
  }

  const gateway = key.startsWith("lovc_");
  let headers: Record<string, string>;
  if (gateway) {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) return { ok: false, error: "Falta LOVABLE_API_KEY para la pasarela de conectores." };
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": key };
  } else {
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
  }

  let response: Response;
  try {
    response = await fetch(`${connector.baseUrl}/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, limit: Math.min(Math.max(opts.limit ?? 8, 1), 20) }),
    });
  } catch (e) {
    return { ok: false, error: `No se pudo contactar con el proveedor de búsqueda: ${(e as Error).message}` };
  }

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Firecrawl search] ${response.status}: ${text.slice(0, 500)}`);
    return {
      ok: false,
      error:
        response.status === 402
          ? "Créditos del proveedor de búsqueda agotados."
          : response.status === 401 || response.status === 403
            ? `Credenciales no válidas para el endpoint configurado (${connector.baseUrl}).`
            : `Error del proveedor de búsqueda (${response.status}).`,
    };
  }

  const payload = (await response.json()) as {
    data?: { web?: any[] } | any[];
    web?: any[];
  };
  const raw: any[] = Array.isArray(payload.data)
    ? payload.data
    : ((payload.data as any)?.web ?? payload.web ?? []);

  const hits: WebSearchHit[] = raw
    .map((r) => ({
      title: String(r?.title ?? ""),
      url: String(r?.url ?? ""),
      description: String(r?.description ?? r?.snippet ?? "").slice(0, 400),
    }))
    .filter((h) => h.url);

  if (!hits.length) return { ok: false, error: "La búsqueda no devolvió resultados públicos utilizables." };

  return {
    ok: true,
    hits,
    provider: `${connector.name} · ${gateway ? "pasarela de conectores" : "API directa"}`,
    retrievedAt: new Date().toISOString(),
  };
}
