import { supabase, isSupabaseConfigured } from './supabase';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'text/plain',
  'text/csv',
  'application/json'
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)` };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type "${file.type || 'unknown'}" is not permitted. Permitted: Images, PDF, ZIP, TXT, CSV, JSON.` };
  }

  return { valid: true };
}

export async function uploadTaskAttachment(
  taskId: string,
  file: File,
  userId: string
): Promise<{ path: string; name: string; size: number; type: string }> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!isSupabaseConfigured) {
    // In Demo Mode, simulate successful upload and generate local object URL
    const mockPath = `demo/${taskId}/${Date.now()}_${file.name}`;
    return {
      path: mockPath,
      name: file.name,
      size: file.size,
      type: file.type
    };
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${taskId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('task-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  return {
    path: filePath,
    name: file.name,
    size: file.size,
    type: file.type
  };
}
