import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AppBar from '../../components/AppBar';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContexts';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddTripDetailModal from '../../components/AddTripDetailModal';
import SwipeableDetail from '../../components/SwipeableDetail';

interface TripDetail {
  id: string;
  title: string;
  description: string;
  created_at: string;
  photos: {
    id: string;
    photo_url: string;
  }[];
}

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [trip, setTrip] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<TripDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchTripAndDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (tripError) throw tripError;
      setTrip(tripData);

      // Fetch trip details with photos
      const { data: detailsData, error: detailsError } = await supabase
        .from('trip_details')
        .select(`
          id,
          title,
          description,
          created_at,
          trip_detail_photos (
            id,
            photo_url
          )
        `)
        .eq('trip_id', id)
        .order('created_at', { ascending: false });

      if (detailsError) throw detailsError;
      setTripDetails(detailsData.map(detail => ({
        id: detail.id,
        title: detail.title,
        description: detail.description,
        created_at: detail.created_at,
        photos: detail.trip_detail_photos || []
      })));

    } catch (error: unknown) {
      console.error('Error fetching trip details:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError, setTrip, setTripDetails, supabase]);

  useEffect(() => {
    if (id) {
      fetchTripAndDetails();
    }
  }, [id, fetchTripAndDetails]);

  const handleAddSuccess = () => {
    fetchTripAndDetails();
  };

  const handleDetailDeleted = () => {
    fetchTripAndDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar title="Cargando..." />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar title="Error" />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar title="Viaje no encontrado" />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600">Viaje no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar title={trip.name || "Detalle del Viaje"} />
      <div className="container mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h1>
          <p className="text-gray-600">{trip.city}, {trip.country}</p>
        </div>

        {/* Sección de Detalles */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Viaje</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Añadir Detalle
              </button>
            </div>

            <div className="space-y-6">
              {tripDetails.map((detail) => (
                <SwipeableDetail
                  key={detail.id}
                  id={detail.id}
                  title={detail.title}
                  description={detail.description}
                  photos={detail.photos}
                  onDelete={handleDetailDeleted}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Add Detail Modal */}
      <AddTripDetailModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={id as string}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
} 