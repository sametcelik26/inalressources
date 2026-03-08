
-- Add status column to job_submissions
ALTER TABLE public.job_submissions 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Allow admins to update job_submissions (for status changes)
CREATE POLICY "Admins can update job submissions"
ON public.job_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete job_submissions
CREATE POLICY "Admins can delete job submissions"
ON public.job_submissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
