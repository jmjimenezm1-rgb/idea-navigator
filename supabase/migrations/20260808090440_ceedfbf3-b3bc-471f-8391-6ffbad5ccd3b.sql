CREATE TABLE public.data_source_credentials (
  data_source_id text PRIMARY KEY REFERENCES public.data_sources(id) ON DELETE CASCADE,
  api_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.data_source_credentials TO service_role;

ALTER TABLE public.data_source_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credenciales solo servidor"
ON public.data_source_credentials
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);