
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('job_seeker', 'employer', 'admin');

-- Create user_roles table (roles MUST be in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  -- Job seeker fields
  resume_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  education TEXT,
  bio TEXT,
  -- Employer fields
  company_name TEXT,
  company_description TEXT,
  company_logo_url TEXT,
  company_website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create job categories enum
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'contract', 'temporary', 'internship');
CREATE TYPE public.experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');

-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  job_type public.job_type NOT NULL DEFAULT 'full_time',
  category TEXT,
  experience_level public.experience_level DEFAULT 'entry',
  skills TEXT[],
  deadline TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  status public.application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, seeker_id)
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create saved_jobs (favorites) table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============ SECURITY DEFINER HELPER FUNCTIONS ============

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ============ RLS POLICIES ============

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- profiles policies
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- job_postings policies
CREATE POLICY "Anyone can view active jobs" ON public.job_postings
  FOR SELECT USING (is_active = true);
CREATE POLICY "Employers can view own jobs" ON public.job_postings
  FOR SELECT TO authenticated USING (employer_id = auth.uid());
CREATE POLICY "Admins can view all jobs" ON public.job_postings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employers can create jobs" ON public.job_postings
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer')
  );
CREATE POLICY "Employers can update own jobs" ON public.job_postings
  FOR UPDATE TO authenticated USING (
    employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer')
  );
CREATE POLICY "Admins can update any job" ON public.job_postings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employers can delete own jobs" ON public.job_postings
  FOR DELETE TO authenticated USING (
    employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer')
  );
CREATE POLICY "Admins can delete any job" ON public.job_postings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- job_applications policies
CREATE POLICY "Seekers can view own applications" ON public.job_applications
  FOR SELECT TO authenticated USING (seeker_id = auth.uid());
CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND employer_id = auth.uid()
    )
  );
CREATE POLICY "Admins can view all applications" ON public.job_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Seekers can create applications" ON public.job_applications
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = seeker_id AND public.has_role(auth.uid(), 'job_seeker')
  );
CREATE POLICY "Seekers can update own applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (seeker_id = auth.uid());
CREATE POLICY "Employers can update application status" ON public.job_applications
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND employer_id = auth.uid()
    )
  );
CREATE POLICY "Admins can update any application" ON public.job_applications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- messages policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- saved_jobs policies
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can save jobs" ON public.saved_jobs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsave jobs" ON public.saved_jobs
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ TRIGGERS ============

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'job_seeker'
  ));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE BUCKETS ============

INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Users can upload own resume" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users can view own resume" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Employers can view applicant resumes" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'resumes' AND public.has_role(auth.uid(), 'employer')
  );
CREATE POLICY "Anyone can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Employers can upload company logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );
