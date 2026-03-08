
ALTER TABLE public.job_submissions 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

UPDATE public.job_submissions SET first_name = full_name WHERE first_name IS NULL;
