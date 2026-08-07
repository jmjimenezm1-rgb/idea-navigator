UPDATE public.data_sources
SET status = 'No configurado',
    enabled = false,
    data = jsonb_set(
      jsonb_set(data, '{status}', '"No configurado"'::jsonb),
      '{config}',
      COALESCE(data->'config', '{}'::jsonb)
        || jsonb_build_object(
          'base_url', 'https://connector-gateway.lovable.dev/apify',
          'api_key_secret_name', 'APIFY_API_KEY',
          'rate_limit_per_min', 20,
          'respect_robots', true,
          'notes', 'Actores Apify (google-search-scraper y website-content-crawler) a traves de la pasarela de conectores. Nunca se guarda la clave: solo el nombre del secreto.',
          'updated_at', now()::text
        )
    ) || jsonb_build_object('enabled', false)
WHERE id = 'src-4';

UPDATE public.data_sources
SET data = jsonb_set(
      data,
      '{config}',
      COALESCE(data->'config', '{}'::jsonb)
        || jsonb_build_object(
          'base_url', 'https://www.googleapis.com/customsearch/v1',
          'api_key_secret_name', 'GOOGLE_CSE_API_KEY',
          'rate_limit_per_min', 10,
          'respect_robots', true,
          'notes', 'Indicar el identificador del buscador programable en estas notas con el formato cx=XXXXXXXX.',
          'updated_at', now()::text
        )
    )
WHERE id = 'src-5';