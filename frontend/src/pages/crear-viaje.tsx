// /src/pages/crear-viaje.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "../contexts/AuthContexts";
import AppBar from "../components/AppBar";
import FormInput from "../components/FormInput";
import DatePicker from "../components/DatePicker";
import RadioGroup from "../components/RadioGroup";
import SideMenu from "../components/SideMenu";
import { supabase } from "../lib/supabase";
import { PhotoIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import type { PlaceFeature } from '../components/PlaceAutocomplete';
import { searchCityImage } from '../services/unsplash';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

interface TripFormData {
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  country: string;
  city: string;
  cover_image_url: string | null;
  status: string;
  selectedFriends: User[];
}

export default function CrearViaje({ onNotificationsOpen, notificationCount }: { onNotificationsOpen?: () => void; notificationCount?: number }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    start_date: "",
    end_date: "",
    type: "Viaje solo",
    country: "",
    city: "",
    cover_image_url: null,
    status: "Próximo",
    selectedFriends: []
  });
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user && (formData.type === "En pareja" || formData.type === "En grupo")) {
      fetchFriends();
    }
  }, [user, formData.type]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const { data: sentFriendships, error: sentError } = await supabase
        .from('friendships')
        .select('users!friend_id(*)')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      if (sentError) throw sentError;

      const { data: receivedFriendships, error: receivedError } = await supabase
        .from('friendships')
        .select('users!user_id(*)')
        .eq('friend_id', user?.id)
        .eq('status', 'accepted');

      if (receivedError) throw receivedError;

      const allFriends = [
        ...(sentFriendships || []).map(f => f.users as unknown as User),
        ...(receivedFriendships || []).map(f => f.users as unknown as User)
      ];

      setFriends(allFriends);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
      setError('Error al cargar la lista de amigos');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleInputChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFriendSelection = (friend: User) => {
    setFormData(prev => {
      const isSelected = prev.selectedFriends.some(f => f.id === friend.id);
      let newSelectedFriends: User[];

      if (isSelected) {
        newSelectedFriends = prev.selectedFriends.filter(f => f.id !== friend.id);
      } else {
        if (prev.type === "En pareja" && prev.selectedFriends.length >= 1) {
          return prev; // No permitir más de un amigo en viajes en pareja
        }
        newSelectedFriends = [...prev.selectedFriends, friend];
      }

      return {
        ...prev,
        selectedFriends: newSelectedFriends
      };
    });
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

      // Subir imagen
      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
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

    // Validaciones según el estado del viaje
    switch (formData.status) {
      case "Finalizado":
        // Para viajes finalizados, ambas fechas son obligatorias
        if (!formData.start_date || !formData.end_date) return false;
        if (new Date(formData.start_date) > new Date(formData.end_date)) return false;
        break;
      case "Activo":
        // Para viajes activos, solo la fecha de inicio es obligatoria
        if (!formData.start_date) return false;
        // Si hay fecha de fin, debe ser posterior a la de inicio
        if (formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) return false;
        break;
      case "Próximo":
        // Para viajes próximos, las fechas son opcionales
        // Pero si se proporcionan, deben ser válidas
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

      let coverImageUrl = formData.cover_image_url;

      if (!coverImageUrl) {
        try {
          const cityImage = await searchCityImage(formData.city);
          if (cityImage) {
            coverImageUrl = cityImage;
          }
        } catch (imageError) {
          console.error('Error al procesar la imagen:', imageError);
        }
      }

      const tripData = {
        name: formData.name,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        type: formData.type,
        country: formData.country,
        city: formData.city,
        cover_image_url: coverImageUrl,
        status: formData.status,
        created_by: user.id,
        lat: cityCoords?.lat ?? null,
        lng: cityCoords?.lng ?? null
      };

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (tripError) throw tripError;

      // Si hay amigos seleccionados, crear invitaciones
      if (formData.selectedFriends.length > 0) {
        const invitations = formData.selectedFriends.map(friend => ({
          trip_id: trip.id,
          inviter_id: user.id,
          invitee_id: friend.id,
          status: 'pending'
        }));

        const { error: invitationError } = await supabase
          .from('trip_invitations')
          .insert(invitations);

        if (invitationError) throw invitationError;

        // Si es un viaje en pareja, añadir automáticamente al amigo seleccionado
        if (tripData.type === 'En pareja' && formData.selectedFriends.length > 0) {
          const selectedFriend = formData.selectedFriends[0];
          
          // Añadir al miembro al viaje
          const { error: memberError } = await supabase
            .from('trip_members')
            .insert({
              trip_id: trip.id,
              user_id: selectedFriend.id,
              role: 'member'
            });

          if (memberError) {
            console.error('Error al añadir miembro:', memberError);
            throw new Error('Error al añadir miembro al viaje');
          }

          // Crear notificación para el usuario añadido
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: selectedFriend.id,
              type: 'trip_added',
              title: 'Nuevo viaje compartido',
              message: `Has sido añadido al viaje "${tripData.name}"`,
              metadata: {
                trip_id: trip.id,
                trip_name: tripData.name,
                trip_type: tripData.type
              },
              read: false
            });

          if (notificationError) {
            console.error('Error al crear notificación:', notificationError);
            throw notificationError;
          }

          // Añadir el viaje a la lista de viajes del usuario
          const { error: userTripError } = await supabase
            .from('user_trips')
            .insert({
              user_id: selectedFriend.id,
              trip_id: trip.id,
              role: 'member'
            });

          if (userTripError) {
            console.error('Error al añadir viaje al usuario:', userTripError);
          }
        }
      }

      router.push('/');
    } catch (error: any) {
      console.error('Error al crear viaje:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppBar 
        title="Nuevo viaje" 
        leftButton={{ 
          text: "Cancelar", 
          onClick: () => router.back() 
        }} 
        rightButton={{ 
          text: "Guardar", 
          disabled: !validateForm() || loading, 
          onClick: handleSubmit 
        }}
        onMenuOpen={() => setIsSideMenuOpen(true)}
        onNotificationsOpen={onNotificationsOpen}
        notificationCount={notificationCount}
      />
      
      <div className="max-w-2xl mx-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Imagen de portada */}
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

          {/* Autocompletado de país */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
            <PlaceAutocomplete
              placeholder="Ej: Francia"
              value={formData.country}
              type="country"
              mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
              onSelect={(place: PlaceFeature) => {
                handleInputChange('country', place.text);
                if (place.properties?.short_code) {
                  setCountryCode(place.properties.short_code.toUpperCase());
                }
                handleInputChange('city', '');
                setCityCoords(null);
              }}
            />
          </div>

          {/* Autocompletado de ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
            <PlaceAutocomplete
              placeholder="Ej: París"
              value={formData.city}
              type="city"
              country={countryCode}
              mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
              onSelect={(place: PlaceFeature) => {
                handleInputChange('city', place.text);
                if (place.center) {
                  setCityCoords({ lat: place.center[1], lng: place.center[0] });
                }
              }}
            />
            {!formData.country && (
              <p className="text-xs text-gray-400 mt-1">Selecciona primero un país</p>
            )}
          </div>

          <RadioGroup 
            label="Tipo de viaje"
            options={["Viaje solo", "En pareja", "En grupo"]} 
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
          />

          {(formData.type === "En pareja" || formData.type === "En grupo") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar {formData.type === "En pareja" ? "compañero" : "compañeros"}
              </label>
              {loadingFriends ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Cargando amigos...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No tienes amigos agregados
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.selectedFriends.some(f => f.id === friend.id)
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleFriendSelection(friend)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt={friend.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <UserPlusIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{friend.full_name}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formData.type === "En pareja" && formData.selectedFriends.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Solo puedes seleccionar un compañero para viajes en pareja
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <SideMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
    </div>
  );
}