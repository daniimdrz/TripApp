import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface PhotoUploaderProps {
  onPhotosUploaded: (urls: string[]) => void;
  tripDetailId?: string;
}

export default function PhotoUploader({ onPhotosUploaded, tripDetailId }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${tripDetailId || 'temp'}/${fileName}`;

        // Subir el archivo
        const { error: uploadError, data } = await supabase.storage
          .from('trip-details-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error al subir foto:', uploadError);
          throw new Error(`Error al subir la foto ${i + 1}: ${uploadError.message}`);
        }

        // Obtener la URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('trip-details-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setPreviewUrls(prev => [...prev, ...uploadedUrls]);
      onPhotosUploaded(uploadedUrls);
    } catch (error: any) {
      console.error('Error al subir fotos:', error);
      setError(error.message || 'Error al subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <PlusIcon className="w-8 h-8 mb-2 text-gray-500" />
            <p className="text-sm text-gray-500 font-semibold">Añadir Foto</p>
          </div>
          <input
            id="photo-upload"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="mt-4">
          {previewUrls.length === 1 ? (
            <img
              key={previewUrls[0]}
              src={previewUrls[0]}
              alt="Preview 1"
              className="w-full rounded-lg"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Subiendo fotos...</span>
        </div>
      )}
    </div>
  );
} 