
CREATE POLICY "Admins can create jobs"
ON public.job_postings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
