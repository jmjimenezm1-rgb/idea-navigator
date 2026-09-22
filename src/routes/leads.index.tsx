import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Eye, Filter, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Pill, RiskBadge, StatusBadge } from "@/components/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { validationStatuses } from "@/lib/demo-data";
import { discoverLeads } from "@/lib/marketing.functions";
import { ideasQuery, leadsQuery } from "@/lib/marketing-queries";


type LeadsSearch = {
  idea?: string;
  status?: string;
  allowed?: string;
  risk?: string;
  sinFuente?: boolean;
};

export const Route = createFileRoute("/leads/")({
  head: () => ({
    meta: [
      { title: "Clientes potenciales | MarketingHub AI" },
      {
        name: "description",
        content:
          "Tabla filtrable de clientes potenciales con sector, país, score de oportunidad, estado de validación, estado legal y fuente trazable.",
      },
      { property: "og:title", content: "Clientes potenciales | MarketingHub AI" },
      { property: "og:description", content: "Leads empresariales con trazabilidad de fuente y estado legal." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): LeadsSearch => ({
    idea: typeof search["idea"] === "string" ? (search["idea"] as string) : undefined,
    status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
    allowed: typeof search["allowed"] === "string" ? (search["allowed"] as string) : undefined,
    risk: typeof search["risk"] === "string" ? (search["risk"] as string) : undefined,
    sinFuente: search["sinFuente"] === true || search["sinFuente"] === "true" ? true : undefined,
  }),
  component: LeadsPage,
});

const selectCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

function LeadsPage() {
  const { data: potentialLeads = [], isLoading } = useQuery(leadsQuery);
  const { data: businessIdeas = [] } = useQuery(ideasQuery);
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");
  const [allowed, setAllowed] = useState("");
  const [risk, setRisk] = useState("");
  const [idea, setIdea] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [q, setQ] = useState("");

  const queryClient = useQueryClient();
  const runDiscovery = useServerFn(discoverLeads);
  const [showSearch, setShowSearch] = useState(false);
  const [searchIdea, setSearchIdea] = useState("");
  const [searchSector, setSearchSector] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchSize, setSearchSize] = useState("");
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLimit, setSearchLimit] = useState(5);

  const discovery = useMutation({
    mutationFn: async () =>
      runDiscovery({
        data: {
          ideaId: searchIdea || businessIdeas[0]?.id || "",
          sector: searchSector,
          country: searchCountry,
          companySize: searchSize,
          keywords: searchKeywords,
          limit: searchLimit,
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(
        `${result.created.length} lead(s) dados de alta desde ${result.hitCount} resultados públicos${
          result.skipped.length ? ` · ${result.skipped.length} duplicado(s) omitido(s)` : ""
        }`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = useMemo(
    () =>
      potentialLeads.filter(
        (l) =>
          (!sector || l.sector === sector) &&
          (!country || l.country === country) &&
          (!size || l.company_size === size) &&
          (!status || l.validation_status === status) &&
          (!allowed || l.contact_allowed === allowed) &&
          (!risk || l.risk_level === risk) &&
          (!idea || l.business_idea_id === idea) &&
          l.opportunity_score >= minScore &&
          (!q || l.company_name.toLowerCase().includes(q.toLowerCase())),
      ),
    [potentialLeads, sector, country, size, status, allowed, risk, idea, minScore, q],
  );

  const uniq = (fn: (l: (typeof potentialLeads)[number]) => string) => [...new Set(potentialLeads.map(fn))];

  return (
    <AppShell
      title="Clientes potenciales"
      subtitle={`${rows.length} de ${potentialLeads.length} leads · datos en base de datos`}
      actions={
        <>
          <Button variant="outline" onClick={() => setShowSearch((v) => !v)}>
            <Search className="size-4" /> Buscar leads
          </Button>
          <Button asChild>
            <Link to="/exportacion">
              <Download className="size-4" /> Exportar
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {showSearch && (
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="size-4" /> Búsqueda de nuevos leads en fuentes públicas
              </div>
              <p className="text-xs text-muted-foreground">
                Localiza empresas mediante la fuente de extracción dada de alta en Fuentes de datos. Cada lead se guarda
                con URL de origen, proveedor y fecha; ninguno se marca apto para campaña directa hasta su validación
                legal.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Idea de negocio</Label>
                  <select className={selectCls} value={searchIdea} onChange={(e) => setSearchIdea(e.target.value)}>
                    <option value="">{businessIdeas[0]?.name ?? "Sin ideas disponibles"}</option>
                    {businessIdeas.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sector objetivo</Label>
                  <Input
                    className="h-9"
                    value={searchSector}
                    onChange={(e) => setSearchSector(e.target.value)}
                    placeholder="Ej. logística industrial"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">País / mercado</Label>
                  <Input
                    className="h-9"
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    placeholder="España"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tamaño de empresa</Label>
                  <Input
                    className="h-9"
                    value={searchSize}
                    onChange={(e) => setSearchSize(e.target.value)}
                    placeholder="Ej. 50-200 empleados"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Palabras clave</Label>
                  <Input
                    className="h-9"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    placeholder="Ej. exportación, ecommerce B2B"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nº máximo de leads: {searchLimit}</Label>
                  <Input
                    type="range"
                    min={1}
                    max={10}
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => discovery.mutate()}
                  disabled={discovery.isPending || (!searchIdea && businessIdeas.length === 0)}
                >
                  {discovery.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  {discovery.isPending ? "Buscando en fuentes públicas…" : "Buscar y dar de alta"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>

          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="size-4" /> Filtros
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <div>
                <Label className="text-xs text-muted-foreground">Buscar empresa</Label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre…" className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Idea asociada</Label>
                <select className={selectCls} value={idea} onChange={(e) => setIdea(e.target.value)}>
                  <option value="">Todas</option>
                  {businessIdeas.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sector</Label>
                <select className={selectCls} value={sector} onChange={(e) => setSector(e.target.value)}>
                  <option value="">Todos</option>
                  {uniq((l) => l.sector).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">País</Label>
                <select className={selectCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Todos</option>
                  {uniq((l) => l.country).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tamaño</Label>
                <select className={selectCls} value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="">Todos</option>
                  {uniq((l) => l.company_size).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  {validationStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Apto para contacto</Label>
                <select className={selectCls} value={allowed} onChange={(e) => setAllowed(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="sí">Sí</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Riesgo legal</Label>
                <select className={selectCls} value={risk} onChange={(e) => setRisk(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Score mínimo: {minScore}</Label>
                <Input
                  type="range"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Web</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email corporativo</TableHead>
                  <TableHead>Encaje</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estado legal</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => {
                  const c = l.contacts[0];
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="max-w-56">
                        <p className="truncate font-medium">{l.company_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{l.city}</p>
                      </TableCell>
                      <TableCell className="text-xs">{l.sector}</TableCell>
                      <TableCell className="text-xs">{l.country}</TableCell>
                      <TableCell className="max-w-32 truncate text-xs text-muted-foreground">{l.website}</TableCell>
                      <TableCell className="text-xs">
                        {c ? (
                          <>
                            <p>{c.contact_name}</p>
                            <p className="text-muted-foreground">{c.job_title}</p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-40 truncate text-xs">{c?.corporate_email ?? "—"}</TableCell>
                      <TableCell>
                        <Pill tone={l.fit_level === "alto" ? "success" : l.fit_level === "medio" ? "warning" : "neutral"}>
                          {l.fit_level}
                        </Pill>
                      </TableCell>
                      <TableCell className="font-display font-semibold">{l.opportunity_score}</TableCell>
                      <TableCell><StatusBadge status={l.validation_status} /></TableCell>
                      <TableCell><RiskBadge level={l.risk_level} /></TableCell>
                      <TableCell className="max-w-36 truncate text-xs">{l.source_name}</TableCell>
                      <TableCell className="text-xs">{l.retrieved_at}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/leads/$leadId" params={{ leadId: l.id }}>
                            <Eye className="size-4" /> Ver
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">{isLoading ? "Cargando leads…" : "Ningún lead cumple los filtros aplicados."}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
