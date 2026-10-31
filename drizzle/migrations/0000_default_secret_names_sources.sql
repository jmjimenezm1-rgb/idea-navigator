UPDATE public.data_sources SET data = jsonb_set(coalesce(data,'{}'::jsonb), '{config}', coalesce(data->'config','{}'::jsonb) || jsonb_build_object('api_key_secret_name', v.secret))
FROM (VALUES ('src-5','GOOGLE_CSE_API_KEY'),('src-6','LINKEDIN_API_KEY'),('src-7','EMAIL_VALIDATION_API_KEY'),('src-8','CRM_API_KEY')) AS v(id, secret)
WHERE public.data_sources.id = v.id AND coalesce(public.data_sources.data->'config'->>'api_key_secret_name','') = '';
UPDATE public.data_sources SET data = jsonb_set(coalesce(data,'{}'::jsonb), '{config}', coalesce(data->'config','{}'::jsonb) || '{"api_key_secret_name":"APIFY_API_KEY"}'::jsonb)
WHERE (name ILIKE '%apify%') AND coalesce(data->'config'->>'api_key_secret_name','') = '';