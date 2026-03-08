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

const CV_MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB total

interface FileValidationResult {
  valid: boolean;
  errorKey?: 'invalidType' | 'fileTooLarge' | 'totalTooLarge';
}

export function validateCVFile(file: File, existingFilesSize = 0): FileValidationResult {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, errorKey: 'invalidType' };
  }
  if (existingFilesSize + file.size > CV_MAX_TOTAL_SIZE) {
    return { valid: false, errorKey: 'totalTooLarge' };
  }
  return { valid: true };
}

export function getTotalSize(files: File[]): number {
  return files.reduce((sum, f) => sum + f.size, 0);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const CV_MAX_TOTAL = CV_MAX_TOTAL_SIZE;

export const FILE_VALIDATION_MESSAGES = {
  en: {
    invalidType: 'Only PDF, DOC, and DOCX files are accepted.',
    fileTooLarge: 'File size must not exceed 5 MB.',
    totalTooLarge: 'Total file size must not exceed 5 MB.',
  },
  fr: {
    invalidType: 'Seuls les fichiers PDF, DOC et DOCX sont acceptés.',
    fileTooLarge: 'La taille du fichier ne doit pas dépasser 5 Mo.',
    totalTooLarge: 'La taille totale des fichiers ne doit pas dépasser 5 Mo.',
  },
} as const;
