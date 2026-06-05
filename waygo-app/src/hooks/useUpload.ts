import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUpload(bucket: string = 'checkin-photos') {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, path?: string): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const filePath = path ?? `${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [bucket]);

  const uploadFromCamera = useCallback(async (blob: Blob): Promise<string | null> => {
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    return uploadFile(file);
  }, [uploadFile]);

  return { uploadFile, uploadFromCamera, uploading, error };
}
