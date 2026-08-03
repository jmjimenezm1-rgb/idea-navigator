CREATE TABLE public.business_ideas (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Borrador',
  sector text NOT NULL DEFAULT '',
  created_by text NOT NULL DEFAULT 'demo@marketinghub.ai',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_ideas TO anon, authenticated;
GRANT ALL ON public.business_ideas TO service_role;
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read business_ideas" ON public.business_ideas FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.viability_analyses (
  id text PRIMARY KEY,
  business_idea_id text NOT NULL REFERENCES public.business_ideas(id) ON DELETE CASCADE,
  viability_score integer NOT NULL DEFAULT 0,
  ai_model text NOT NULL DEFAULT '',
  prompt_version text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.viability_analyses TO anon, authenticated;
GRANT ALL ON public.viability_analyses TO service_role;
ALTER TABLE public.viability_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read viability_analyses" ON public.viability_analyses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.potential_leads (
  id text PRIMARY KEY,
  business_idea_id text NOT NULL REFERENCES public.business_ideas(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  sector text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  opportunity_score integer NOT NULL DEFAULT 0,
  validation_status text NOT NULL DEFAULT 'Nuevo',
  contact_allowed text NOT NULL DEFAULT 'pendiente',
  risk_level text NOT NULL DEFAULT 'medio',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX potential_leads_idea_idx ON public.potential_leads(business_idea_id);
GRANT SELECT ON public.potential_leads TO anon, authenticated;
GRANT ALL ON public.potential_leads TO service_role;
ALTER TABLE public.potential_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read potential_leads" ON public.potential_leads FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ai_drafts (
  id text PRIMARY KEY,
  potential_lead_id text NOT NULL REFERENCES public.potential_leads(id) ON DELETE CASCADE,
  business_idea_id text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'Email',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_drafts_lead_idx ON public.ai_drafts(potential_lead_id);
GRANT SELECT ON public.ai_drafts TO anon, authenticated;
GRANT ALL ON public.ai_drafts TO service_role;
ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read ai_drafts" ON public.ai_drafts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.data_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'Planificado',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.data_sources TO anon, authenticated;
GRANT ALL ON public.data_sources TO service_role;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read data_sources" ON public.data_sources FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ai_prompts (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT 'v1.0',
  estado text NOT NULL DEFAULT 'borrador',
  modelo text NOT NULL DEFAULT 'google/gemini-3.6-flash',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_prompts TO anon, authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read ai_prompts" ON public.ai_prompts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  potential_lead_id text NOT NULL REFERENCES public.potential_leads(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status text NOT NULL DEFAULT '',
  new_status text NOT NULL DEFAULT '',
  actor text NOT NULL DEFAULT 'sistema',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lead_events_lead_idx ON public.lead_events(potential_lead_id, created_at DESC);
GRANT SELECT ON public.lead_events TO anon, authenticated;
GRANT ALL ON public.lead_events TO service_role;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read lead_events" ON public.lead_events FOR SELECT TO anon, authenticated USING (true);