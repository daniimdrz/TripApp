// /src/pages/buscar-destinos.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppBar from "../components/AppBar";
import SideMenu from "../components/SideMenu";
import SearchResult from "../components/SearchResult";
import { useAuthContext } from "../contexts/AuthContexts";
import { supabase } from "../lib/supabase";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  id: string;
  name: string;
  type: string;
}

interface Favorite {
  place_id: string;
  place_name: string;
  place_type: string;
}

export default function BuscarDestinos() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('place_id, place_name, place_type')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('Error al cargar favoritos');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Aquí deberías implementar la búsqueda real usando una API de lugares
      // Por ahora, usaremos datos de ejemplo
      const mockResults: SearchResult[] = [
        { id: '1', name: 'París', type: 'city' },
        { id: '2', name: 'Francia', type: 'country' },
        { id: '3', name: 'Roma', type: 'city' },
        { id: '4', name: 'Italia', type: 'country' },
        { id: '5', name: 'Barcelona', type: 'city' },
        { id: '6', name: 'España', type: 'country' },
      ].filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (placeId: string, placeName: string, placeType: string) => {
    try {
      const isFavorite = favorites.some(fav => fav.place_id === placeId);

      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user?.id)
          .eq('place_id', placeId);

        if (error) throw error;
        setFavorites(prev => prev.filter(fav => fav.place_id !== placeId));
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user?.id,
            place_id: placeId,
            place_name: placeName,
            place_type: placeType
          }]);

        if (error) throw error;
        setFavorites(prev => [...prev, { place_id: placeId, place_name: placeName, place_type: placeType }]);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      setError('Error al actualizar favoritos');
    }
  };

  const isFavorite = (placeId: string) => {
    return favorites.some(fav => fav.place_id === placeId);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppBar 
        onMenuOpen={() => setIsSideMenuOpen(true)}
      />
      
      <div className="p-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text"
            placeholder="Buscar países, ciudades..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {searchQuery ? (
          loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Buscando...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <SearchResult
                  key={result.id}
                  id={result.id}
                  name={result.name}
                  type={result.type}
                  isFavorite={isFavorite(result.id)}
                  onToggleFavorite={() => handleToggleFavorite(result.id, result.name, result.type)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron resultados</p>
            </div>
          )
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Mis Favoritos</h2>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <SearchResult
                    key={favorite.place_id}
                    id={favorite.place_id}
                    name={favorite.place_name}
                    type={favorite.place_type}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(
                      favorite.place_id,
                      favorite.place_name,
                      favorite.place_type
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes favoritos guardados</p>
                <p className="text-sm text-gray-400 mt-2">
                  Busca lugares y marca tus favoritos con la estrella
                </p>
              </div>
            )}
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