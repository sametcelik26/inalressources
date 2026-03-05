
-- Create employer_requests table
CREATE TABLE public.employer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  company_address TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  job_title TEXT,
  industry TEXT,
  employees_needed INTEGER,
  preferred_contact TEXT DEFAULT 'either',
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert employer requests"
  ON public.employer_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view employer requests"
  ON public.employer_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create candidate_applications table
CREATE TABLE public.candidate_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT,
  license_class TEXT,
  industry TEXT,
  work_location TEXT,
  legal_right_to_work BOOLEAN DEFAULT false,
  cv_url TEXT,
  preferred_contact TEXT DEFAULT 'either',
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert candidate applications"
  ON public.candidate_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view candidate applications"
  ON public.candidate_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for candidate CVs (public read for simplicity)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-cvs', 'candidate-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to candidate-cvs bucket
CREATE POLICY "Anyone can upload candidate CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'candidate-cvs');

-- Allow admins to read candidate CVs
CREATE POLICY "Admins can read candidate CVs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-cvs' AND has_role(auth.uid(), 'admin'::app_role));
