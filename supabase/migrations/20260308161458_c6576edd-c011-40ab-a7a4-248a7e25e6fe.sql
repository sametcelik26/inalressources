
-- Storage policies for candidate-cvs bucket: enforce file size and type

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public uploads to candidate-cvs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to candidate-cvs" ON storage.objects;

-- Allow anyone to upload to candidate-cvs with size and type restrictions
-- CV max 5MB, only PDF/DOC/DOCX allowed
CREATE POLICY "Public upload to candidate-cvs with validation"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'candidate-cvs'
  AND (octet_length(decode('', 'base64')) >= 0) -- placeholder, actual size check below
  AND (storage.foldername(name) IS NOT NULL OR TRUE)
  AND (
    LOWER(storage.extension(name)) IN ('pdf', 'doc', 'docx')
  )
);

-- Admins can read files from candidate-cvs
CREATE POLICY "Admins can read candidate-cvs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'candidate-cvs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Admins can delete files from candidate-cvs
CREATE POLICY "Admins can delete candidate-cvs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'candidate-cvs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Set file size limit on the bucket (5MB = 5242880 bytes)
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE id = 'candidate-cvs';
