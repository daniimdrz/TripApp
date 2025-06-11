import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AppBar from '../../components/AppBar';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContexts';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddTripDetailModal from '../../components/AddTripDetailModal';
import SwipeableDetail from '../../components/SwipeableDetail';
import SideMenu from '../../components/SideMenu';

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

interface SupabaseTripDetail {
  id: string;
  title: string;
  description: string;
  created_at: string;
  trip_detail_photos: {
    id: string;
    photo_url: string;
  }[];
}

interface TripInfo {
  id: string;
  name: string;
  country: string;
  city: string;
  start_date: string | null;
  end_date: string | null;
  type: string;
  cover_image_url: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [trip, setTrip] = useState<TripInfo | null>(null);
  console.log(trip);
  const [tripDetails, setTripDetails] = useState<TripDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

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
      const { data: detailsDataRaw, error: detailsError } = await supabase
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
        .order('created_at', { ascending: true });

      if (detailsError) throw detailsError;

      const detailsData: SupabaseTripDetail[] = detailsDataRaw as SupabaseTripDetail[];

      setTripDetails(
        detailsData.map(detail => ({
          id: detail.id,
          title: detail.title,
          description: detail.description,
          created_at: detail.created_at,
          photos: detail.trip_detail_photos?.map(photo => ({
            id: photo.id,
            photo_url: photo.photo_url
          })) || []
        }))
      );

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
      <AppBar title={trip.name || "Detalle del Viaje"} 
      onMenuOpen={() => setIsSideMenuOpen(true)}/>
      <div className="container mx-auto px-4 py-8">
        {/* Sección de Detalles */}
        <section className="pt-4 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center w-full justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Añadir Sección
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

      <SideMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

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