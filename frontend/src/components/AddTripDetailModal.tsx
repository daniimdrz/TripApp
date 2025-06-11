import { useState } from 'react';
import Modal from './Modal';
import FormInput from './FormInput';
import PhotoUploader from './PhotoUploader';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContexts';

interface AddTripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess: () => void;
}

export default function AddTripDetailModal({ isOpen, onClose, tripId, onSuccess }: AddTripDetailModalProps) {
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!user) {
      setError('No hay usuario autenticado');
      return;
    }

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener el último display_order
      const { data: lastDetail } = await supabase
        .from('trip_details')
        .select('display_order')
        .eq('trip_id', tripId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const newDisplayOrder = (lastDetail?.display_order || 0) + 1;

      // Crear el nuevo detalle
      const { data: newDetail, error: detailError } = await supabase
        .from('trip_details')
        .insert({
          trip_id: tripId,
          title: title.trim(),
          description: description.trim(),
          created_by: user.id,
          display_order: newDisplayOrder
        })
        .select()
        .single();

      if (detailError) throw detailError;

      // Si hay fotos, guardarlas
      if (photoUrls.length > 0) {
        const photos = photoUrls.map((url, index) => ({
          trip_detail_id: newDetail.id,
          photo_url: url,
          display_order: index
        }));

        const { error: photosError } = await supabase
          .from('trip_detail_photos')
          .insert(photos);

        if (photosError) throw photosError;
      }

      // Limpiar el formulario y cerrar el modal
      setTitle('');
      setDescription('');
      setPhotoUrls([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear detalle:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir nuevo detalle">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Añadir nuevo detalle
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Comida del segundo día"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe este momento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
            />
          </div>

          <PhotoUploader
            onPhotosUploaded={(urls) => setPhotoUrls(prev => [...prev, ...urls])}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 