
-- Add status column to employer_requests for tracking
ALTER TABLE public.employer_requests 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Add status column to candidate_applications for tracking
ALTER TABLE public.candidate_applications 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Allow admins to update employer_requests
CREATE POLICY "Admins can update employer requests"
ON public.employer_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete employer_requests
CREATE POLICY "Admins can delete employer requests"
ON public.employer_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update candidate_applications
CREATE POLICY "Admins can update candidate applications"
ON public.candidate_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete candidate_applications
CREATE POLICY "Admins can delete candidate applications"
ON public.candidate_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete contact_messages
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
