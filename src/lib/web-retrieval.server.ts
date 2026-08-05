// Recuperación lícita de contenido corporativo público (Firecrawl).
// Soporta conexión directa (clave fc-*) y pasarela de conectores (clave lovc_*).

export type WebFetchResult =
  | { ok: true; markdown: string; sourceUrl: string; title?: string | undefined; provider: string; retrievedAt: string }
  | { ok: false; error: string };

export function firecrawlStatus() {
  const key = process.env["FIRECRAWL_API_KEY"];
  if (!key) return { configured: false as const, mode: "none" as const };
  return {
    configured: true as const,
    mode: key.startsWith("lovc_") ? ("gateway" as const) : ("direct" as const),
  };
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Extrae el contenido público de una web corporativa en markdown. */
export async function scrapeCorporateSite(rawUrl: string, opts?: { maxChars?: number }): Promise<WebFetchResult> {
  const url = normalizeUrl(rawUrl);
  if (!url) return { ok: false, error: "URL de empresa no válida." };

  const status = firecrawlStatus();
  if (!status.configured) {
    return { ok: false, error: "Conector Firecrawl no configurado: falta FIRECRAWL_API_KEY." };
  }

  const key = process.env["FIRECRAWL_API_KEY"]!;
  const body = JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true });

  let endpoint: string;
  let headers: Record<string, string>;

  if (status.mode === "gateway") {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) return { ok: false, error: "Falta LOVABLE_API_KEY para la pasarela de conectores." };
    endpoint = "https://connector-gateway.lovable.dev/firecrawl/v2/scrape";
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": key,
    };
  } else {
    endpoint = "https://api.firecrawl.dev/v2/scrape";
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, { method: "POST", headers, body });
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
          ? "Créditos de Firecrawl agotados."
          : response.status === 401 || response.status === 403
            ? "Credenciales de Firecrawl no válidas para este modo de conexión."
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
    markdown: markdown.slice(0, opts?.maxChars ?? 6000),
    sourceUrl: metadata.sourceURL ?? url,
    title: metadata.title,
    provider: status.mode === "gateway" ? "Firecrawl (pasarela de conectores)" : "Firecrawl (API directa)",
    retrievedAt: new Date().toISOString(),
  };
}
