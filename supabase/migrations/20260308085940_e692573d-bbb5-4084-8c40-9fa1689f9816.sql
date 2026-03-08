
ALTER TABLE public.job_postings 
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities_fr TEXT,
  ADD COLUMN IF NOT EXISTS skills_required_fr TEXT,
  ADD COLUMN IF NOT EXISTS conditions_fr TEXT,
  ADD COLUMN IF NOT EXISTS benefits_fr TEXT,
  ADD COLUMN IF NOT EXISTS requirements_fr TEXT,
  ADD COLUMN IF NOT EXISTS language_option TEXT NOT NULL DEFAULT 'en';
