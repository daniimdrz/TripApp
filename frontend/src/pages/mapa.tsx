import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppBar from "../components/AppBar";
import SideMenu from "../components/SideMenu";
import { CityMap, TripLocation } from "../components/CityMap";
import { useAuthContext } from "../contexts/AuthContexts";
import { supabase } from "../lib/supabase";

export default function Mapa() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [trips, setTrips] = useState<TripLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Transformar los datos al formato que espera el mapa
      const tripsWithCoords = data
        .filter(trip => trip.lat && trip.lng) // Solo viajes con coordenadas
        .map(trip => ({
          id: trip.id,
          name: trip.name,
          city: trip.city,
          country: trip.country,
          latitude: trip.lat,
          longitude: trip.lng,
          status: trip.status
        }));

      setTrips(tripsWithCoords);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Error al cargar los viajes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppBar 
        title="Mapa de Viajes"
        onMenuOpen={() => setIsSideMenuOpen(true)}
      />
      
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando viajes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <CityMap
              mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
              trips={trips}
            />
          </div>
        )}
      </div>

      <SideMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
    </div>
  );
} 