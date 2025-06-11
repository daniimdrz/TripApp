// /src/pages/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppBar from '../components/AppBar';
import TripCard from '../components/TripCard';
import TripFilter from '../components/TripFilter';
import FloatingButton from '../components/FloatingButton';
import SideMenu from '../components/SideMenu';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import DatePicker from '../components/DatePicker';
import RadioGroup from '../components/RadioGroup';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContexts';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface TripFormData {
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  country: string;
  city: string;
  cover_image_url: string | null;
  status: string;
}

export default function Home({ onNotificationsOpen, notificationCount }: { onNotificationsOpen?: () => void; notificationCount?: number }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    start_date: "",
    end_date: "",
    type: "Viaje solo",
    country: "",
    city: "",
    cover_image_url: null,
    status: "Próximo"
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any | null>(null);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);

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
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTrips = () => {
    return trips.filter(trip => {
      switch (activeFilter) {
        case "Próximos":
          return trip.status === "Próximo";
        case "Activos":
          return trip.status === "Activo";
        case "Finalizados":
          return trip.status === "Finalizado";
        default:
          return true;
      }
    });
  };

  const handleEditClick = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      console.log('Editando viaje:', trip); // Para debugging
      setFormData({
        name: trip.name,
        start_date: trip.start_date || "",
        end_date: trip.end_date || "",
        type: trip.type,
        country: trip.country,
        city: trip.city,
        cover_image_url: trip.cover_image_url,
        status: trip.status
      });
      setEditingTripId(tripId);
      setIsEditModalOpen(true);
    }
  };

  const handleInputChange = (field: keyof TripFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/trip-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('trip-covers')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        cover_image_url: data.publicUrl
      }));
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      setError('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    if (!formData.country.trim()) return false;
    if (!formData.city.trim()) return false;

    switch (formData.status) {
      case "Finalizado":
        if (!formData.start_date || !formData.end_date) return false;
        if (new Date(formData.start_date) > new Date(formData.end_date)) return false;
        break;
      case "Activo":
        if (!formData.start_date) return false;
        if (formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) return false;
        break;
      case "Próximo":
        if (formData.start_date && formData.end_date) {
          if (new Date(formData.start_date) > new Date(formData.end_date)) return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('No hay usuario autenticado');
      if (!validateForm()) throw new Error('Por favor completa todos los campos correctamente');

      const tripData = {
        name: formData.name,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        type: formData.type,
        country: formData.country,
        city: formData.city,
        cover_image_url: formData.cover_image_url,
        status: formData.status
      };

      const { error } = await supabase
        .from('trips')
        .update(tripData)
        .eq('id', editingTripId);

      if (error) throw error;

      setIsEditModalOpen(false);
      fetchTrips();
    } catch (error: any) {
      console.error('Error al actualizar viaje:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (trip: any) => {
    console.log('Trip to delete:', trip); // Para debugging
    if (!trip) {
        console.error('No se proporcionó un viaje para eliminar');
        return;
    }
    setTripToDelete(trip);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('Error de autenticación:', authError);
            alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
            return;
        }

        console.log('Usuario autenticado:', user.id);
        console.log('Eliminando viaje:', tripToDelete.id);
        
        // 1. Primero eliminar los miembros del viaje
        const { error: membersError } = await supabase
            .from('trip_members')
            .delete()
            .eq('trip_id', tripToDelete.id)
            .select();

        if (membersError) {
            console.error('Error al eliminar miembros:', membersError);
            throw membersError;
        }

        console.log('Miembros eliminados correctamente');

        // 2. Luego eliminar las invitaciones
        const { error: invitationsError } = await supabase
            .from('trip_invitations')
            .delete()
            .eq('trip_id', tripToDelete.id)
            .select();

        if (invitationsError) {
            console.error('Error al eliminar invitaciones:', invitationsError);
            throw invitationsError;
        }

        console.log('Invitaciones eliminadas correctamente');

        // 3. Eliminar las entradas en user_trips
        const { error: userTripsError } = await supabase
            .from('user_trips')
            .delete()
            .eq('trip_id', tripToDelete.id)
            .select();

        if (userTripsError) {
            console.error('Error al eliminar entradas en user_trips:', userTripsError);
            throw userTripsError;
        }

        console.log('Entradas en user_trips eliminadas correctamente');

        // 4. Finalmente eliminar el viaje
        const { error: tripError } = await supabase
            .from('trips')
            .delete()
            .eq('id', tripToDelete.id)
            .select();

        if (tripError) {
            console.error('Error al eliminar viaje:', tripError);
            throw tripError;
        }

        console.log('Viaje eliminado correctamente');

        // Actualizar la lista de viajes
        setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
        setIsDeleteDialogOpen(false);
        setTripToDelete(null);
    } catch (error) {
        console.error('Error al eliminar viaje:', error);
        alert('Error al eliminar el viaje. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 page-enter-animation">
      <AppBar 
        onMenuOpen={() => setIsSideMenuOpen(true)}
        onNotificationsOpen={onNotificationsOpen}
        notificationCount={notificationCount}
      />

      <div className="p-4">
        <TripFilter 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando viajes...</p>
          </div>
        ) : getFilteredTrips().length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay viajes {activeFilter !== "Todos" ? "en esta categoría" : ""}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTrips().map((trip, index) => (
              <TripCard 
                key={trip.id}
                id={trip.id}
                name={trip.name}
                start_date={trip.start_date}
                end_date={trip.end_date}
                country={trip.country}
                city={trip.city}
                cover_image_url={trip.cover_image_url}
                status={trip.status}
                type={trip.type}
                onEdit={() => handleEditClick(trip.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <SideMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTripId(null);
          setFormData({
            name: "",
            start_date: "",
            end_date: "",
            type: "Viaje solo",
            country: "",
            city: "",
            cover_image_url: null,
            status: "Próximo"
          });
        }}
        title="Editar viaje"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de portada
            </label>
            <div
              className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => document.getElementById('cover-image')?.click()}
            >
              {formData.cover_image_url ? (
                <img 
                  src={formData.cover_image_url} 
                  alt="Portada" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-500">
                    Haz clic para subir una imagen
                  </span>
                </div>
              )}
              <input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {uploadingImage && (
              <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>
            )}
          </div>

          <FormInput 
            label="Nombre del viaje" 
            placeholder="Ej: Vacaciones en París 2025"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />

          <RadioGroup 
            label="Estado del viaje"
            options={["Próximo", "Activo", "Finalizado"]} 
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <DatePicker 
              label="Fecha inicio" 
              value={formData.start_date}
              onChange={(date) => handleInputChange('start_date', date)}
              required={formData.status === "Finalizado" || formData.status === "Activo"}
            />
            <DatePicker 
              label="Fecha fin" 
              value={formData.end_date}
              onChange={(date) => handleInputChange('end_date', date)}
              required={formData.status === "Finalizado"}
            />
          </div>

          <FormInput 
            label="País" 
            placeholder="Ej: Francia"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
          />

          <FormInput 
            label="Ciudad" 
            placeholder="Ej: París"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />

          <RadioGroup 
            label="Tipo de viaje"
            options={["Viaje solo", "En pareja", "En grupo"]} 
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
          />

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const tripToDelete = trips.find(t => t.id === editingTripId);
                if (tripToDelete) {
                  handleDeleteClick(tripToDelete);
                  setIsEditModalOpen(false);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none"
            >
              Eliminar viaje
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTripId(null);
                  setFormData({
                    name: "",
                    start_date: "",
                    end_date: "",
                    type: "Viaje solo",
                    country: "",
                    city: "",
                    cover_image_url: null,
                    status: "Próximo"
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateForm() || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
            setIsDeleteDialogOpen(false);
            setTripToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar viaje"
        message={`¿Estás seguro de que quieres eliminar el viaje "${tripToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}