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

function authHeaders(connector: WebConnector, key: string): { ok: true; headers: Record<string, string>; gateway: boolean } | { ok: false; error: string } {
  const gateway = key.startsWith("lovc_");
  if (gateway) {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) return { ok: false, error: "Falta LOVABLE_API_KEY para la pasarela de conectores." };
    return {
      ok: true,
      gateway,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": key },
    };
  }
  return { ok: true, gateway, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` } };
}

function providerError(connector: WebConnector, status: number, body: string, what: string) {
  console.error(`[${connector.provider}:${what}] ${status}: ${body.slice(0, 500)}`);
  return status === 402
    ? `Créditos del proveedor ${connector.name} agotados.`
    : status === 401 || status === 403
      ? `Credenciales no válidas para el endpoint configurado (${connector.baseUrl}).`
      : status === 429
        ? `El proveedor ${connector.name} ha limitado la frecuencia de peticiones (429).`
        : `Error del proveedor ${connector.name} (${status}).`;
}

function providerLabel(connector: WebConnector, gateway: boolean) {
  return `${connector.name} · ${gateway ? "pasarela de conectores" : "API directa"}`;
}

/** Extrae el contenido público de una web corporativa en markdown usando la fuente configurada. */
export async function scrapeCorporateSite(
  rawUrl: string,
  opts: { maxChars?: number; connector: WebConnector },
): Promise<WebFetchResult> {
  const { connector } = opts;
  const url = normalizeUrl(rawUrl);
  if (!url) return { ok: false, error: "URL de empresa no válida." };
  if (!connector.canScrape) return { ok: false, error: `La fuente "${connector.name}" no permite extracción de contenido.` };

  const key = connector.apiKeySecretName ? process.env[connector.apiKeySecretName] : undefined;
  if (!key) {
    return {
      ok: false,
      error: `Conector "${connector.name}" sin credencial: falta el secreto ${connector.apiKeySecretName || "de API"}.`,
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

  const auth = authHeaders(connector, key);
  if (!auth.ok) return { ok: false, error: auth.error };

  const isApify = connector.provider === "apify";
  const endpoint = isApify
    ? `${connector.baseUrl}/acts/apify~website-content-crawler/run-sync-get-dataset-items?timeout=120`
    : `${connector.baseUrl}/scrape`;
  const body = isApify
    ? {
        startUrls: [{ url: url.toString() }],
        maxCrawlPages: 1,
        maxCrawlDepth: 0,
        crawlerType: "cheerio",
        respectRobotsTxtFile: connector.respectRobots,
        saveMarkdown: true,
      }
    : { url: url.toString(), formats: ["markdown"], onlyMainContent: true };

  let response: Response;
  try {
    response = await fetch(endpoint, { method: "POST", headers: auth.headers, body: JSON.stringify(body) });
  } catch (e) {
    return { ok: false, error: `No se pudo contactar con el proveedor de extracción: ${(e as Error).message}` };
  }

  if (!response.ok) {
    return { ok: false, error: providerError(connector, response.status, await response.text(), "scrape") };
  }

  const payload = (await response.json()) as any;
  let markdown = "";
  let title: string | undefined;
  let sourceUrl = url.toString();

  if (isApify) {
    const item = Array.isArray(payload) ? payload[0] : payload;
    markdown = String(item?.markdown ?? item?.text ?? "");
    title = item?.metadata?.title ?? item?.title;
    sourceUrl = String(item?.url ?? sourceUrl);
  } else {
    markdown = payload.markdown ?? payload.data?.markdown ?? "";
    const metadata = payload.metadata ?? payload.data?.metadata ?? {};
    title = metadata.title;
    sourceUrl = metadata.sourceURL ?? sourceUrl;
  }

  if (!markdown.trim()) return { ok: false, error: "La web no devolvió contenido público utilizable." };

  return {
    ok: true,
    markdown: markdown.slice(0, opts.maxChars ?? 6000),
    sourceUrl,
    title,
    provider: providerLabel(connector, auth.gateway),
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
  if (!connector.canSearch) return { ok: false, error: `La fuente "${connector.name}" no permite búsqueda de empresas.` };

  const key = connector.apiKeySecretName ? process.env[connector.apiKeySecretName] : undefined;
  if (!key) {
    return { ok: false, error: `Conector "${connector.name}" sin credencial: falta el secreto ${connector.apiKeySecretName || "de API"}.` };
  }
  if (!(await consumeRateLimit(connector))) {
    return { ok: false, error: `Límite de ${connector.rateLimitPerMin} peticiones/minuto alcanzado en la fuente "${connector.name}".` };
  }

  const limit = Math.min(Math.max(opts.limit ?? 8, 1), 20);
  const auth = authHeaders(connector, key);
  if (!auth.ok) return { ok: false, error: auth.error };

  let response: Response;
  try {
    if (connector.provider === "google_cse") {
      const cx = /cx\s*[=:]\s*([\w-]+)/i.exec(connector.notes)?.[1];
      if (!cx) return { ok: false, error: "Falta el identificador del buscador (cx=...) en las notas de la fuente Google Custom Search." };
      const url = new URL(connector.baseUrl || "https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", key);
      url.searchParams.set("cx", cx);
      url.searchParams.set("q", query);
      url.searchParams.set("num", String(Math.min(limit, 10)));
      response = await fetch(url.toString());
    } else if (connector.provider === "apify") {
      response = await fetch(`${connector.baseUrl}/acts/apify~google-search-scraper/run-sync-get-dataset-items?timeout=120`, {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ queries: query, maxPagesPerQuery: 1, resultsPerPage: limit, saveHtml: false }),
      });
    } else {
      response = await fetch(`${connector.baseUrl}/search`, {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ query, limit }),
      });
    }
  } catch (e) {
    return { ok: false, error: `No se pudo contactar con el proveedor de búsqueda: ${(e as Error).message}` };
  }

  if (!response.ok) {
    return { ok: false, error: providerError(connector, response.status, await response.text(), "search") };
  }

  const payload = (await response.json()) as any;
  let raw: any[] = [];
  if (connector.provider === "google_cse") {
    raw = (payload?.items ?? []).map((i: any) => ({ title: i?.title, url: i?.link, description: i?.snippet }));
  } else if (connector.provider === "apify") {
    const items: any[] = Array.isArray(payload) ? payload : [];
    raw = items.flatMap((i) => i?.organicResults ?? []);
  } else {
    raw = Array.isArray(payload.data) ? payload.data : (payload.data?.web ?? payload.web ?? []);
  }

  const hits: WebSearchHit[] = raw
    .map((r) => ({
      title: String(r?.title ?? ""),
      url: String(r?.url ?? r?.link ?? ""),
      description: String(r?.description ?? r?.snippet ?? "").slice(0, 400),
    }))
    .filter((h) => h.url)
    .slice(0, limit);

  if (!hits.length) return { ok: false, error: "La búsqueda no devolvió resultados públicos utilizables." };

  return {
    ok: true,
    hits,
    provider: providerLabel(connector, auth.gateway),
    retrievedAt: new Date().toISOString(),
  };
}
