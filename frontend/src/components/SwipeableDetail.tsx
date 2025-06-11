import { useState, useRef, TouchEvent } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface SwipeableDetailProps {
  id: string;
  title: string;
  description: string;
  photos: { id: string; photo_url: string; }[];
  onDelete: () => void;
}

export default function SwipeableDetail({ id, title, description, photos, onDelete }: SwipeableDetailProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;
  const maxSwipeDistance = 200; // Distancia máxima para el deslizamiento

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeProgress(0);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart) {
      const distance = touchStart - e.targetTouches[0].clientX;
      const progress = Math.min(Math.max(distance / maxSwipeDistance, 0), 1);
      setSwipeProgress(progress);
    }
  };

  const onTouchEnd = async () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      try {
        setIsDeleting(true);
        setError(null);

        // Primero eliminar las fotos
        if (photos.length > 0) {
          const { error: photosError } = await supabase
            .from('trip_detail_photos')
            .delete()
            .eq('trip_detail_id', id);

          if (photosError) throw photosError;
        }

        // Luego eliminar el detalle
        const { error: detailError } = await supabase
          .from('trip_details')
          .delete()
          .eq('id', id);

        if (detailError) throw detailError;

        onDelete();
      } catch (error: any) {
        console.error('Error al eliminar detalle:', error);
        setError('Error al eliminar el detalle');
      } finally {
        setIsDeleting(false);
      }
    }

    // Resetear los valores
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeProgress(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-xl shadow-card overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="p-6 transition-transform duration-200"
        style={{ transform: `translateX(-${swipeProgress * 100}px)` }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        {photos && photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.photo_url}
                alt={title}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isDeleting && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Eliminando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de deslizamiento */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center px-4 bg-red-500 text-white"
        style={{ 
          transform: `translateX(${(1 - swipeProgress) * 100}%)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <TrashIcon className="w-6 h-6" />
      </div>
    </div>
  );
} 