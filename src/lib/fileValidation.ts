/**
 * Shared file validation for CV and document uploads.
 * Enforces size limits and allowed file types on the client side.
 * Server-side enforcement is handled via Supabase storage bucket config.
 */

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const CV_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface FileValidationResult {
  valid: boolean;
  errorKey?: 'invalidType' | 'fileTooLarge';
}

export function validateCVFile(file: File): FileValidationResult {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, errorKey: 'invalidType' };
  }
  if (file.size > CV_MAX_SIZE) {
    return { valid: false, errorKey: 'fileTooLarge' };
  }
  return { valid: true };
}

export const FILE_VALIDATION_MESSAGES = {
  en: {
    invalidType: 'Only PDF, DOC, and DOCX files are accepted.',
    fileTooLarge: 'File size must not exceed 5 MB.',
  },
  fr: {
    invalidType: 'Seuls les fichiers PDF, DOC et DOCX sont acceptés.',
    fileTooLarge: 'La taille du fichier ne doit pas dépasser 5 Mo.',
  },
} as const;
