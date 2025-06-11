import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import AppBar from '../components/AppBar';
import SideMenu from '../components/SideMenu';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContexts';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  users: User;
}

export default function Amigos({ onNotificationsOpen, notificationCount }: { onNotificationsOpen?: () => void; notificationCount?: number }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener amistades donde el usuario es el remitente
      const { data: sentFriendships, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          users!friend_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (sentError) throw sentError;

      // Obtener amistades donde el usuario es el destinatario
      const { data: receivedFriendships, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          users!user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      if (receivedError) throw receivedError;

      // Combinar y procesar los resultados
      const allFriends = [
        ...(sentFriendships || []).map(f => (f.users as unknown as User)),
        ...(receivedFriendships || []).map(f => (f.users as unknown as User))
      ];

      setFriends(allFriends);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
      setError('Error al cargar la lista de amigos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          users!user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests((requests || []).map(request => ({
        ...request,
        users: request.users as unknown as User
      })));
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
    }
  };

  const handleRequest = async (friendshipId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      // Actualizar las listas
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
    } catch (error) {
      console.error('Error al procesar solicitud:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingRequest(true);
    setRequestError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // Buscar el usuario por email
      const { data: potentialFriend, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (searchError) throw new Error('Usuario no encontrado');
      if (potentialFriend.id === user.id) throw new Error('No puedes agregarte a ti mismo');

      // Verificar si ya existe una solicitud
      const { data: existingRequest, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${potentialFriend.id}),and(user_id.eq.${potentialFriend.id},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRequest) {
        if (existingRequest.status === 'accepted') {
          throw new Error('Ya son amigos');
        } else if (existingRequest.status === 'pending') {
          throw new Error('Ya existe una solicitud pendiente');
        }
      }

      // Enviar la solicitud
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: potentialFriend.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Limpiar y cerrar el modal
      setEmail('');
      setIsModalOpen(false);
      alert('Solicitud enviada correctamente');
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      setRequestError(error instanceof Error ? error.message : 'Error al enviar la solicitud');
    } finally {
      setSendingRequest(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppBar 
          title="Amigos"
          onMenuOpen={() => setIsSideMenuOpen(true)}
          onNotificationsOpen={onNotificationsOpen}
          notificationCount={notificationCount}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <SideMenu 
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppBar 
          title="Amigos"
          onMenuOpen={() => setIsSideMenuOpen(true)}
          onNotificationsOpen={onNotificationsOpen}
          notificationCount={notificationCount}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
        <SideMenu 
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppBar 
        title="Amigos"
        onMenuOpen={() => setIsSideMenuOpen(true)}
        onNotificationsOpen={onNotificationsOpen}
        notificationCount={notificationCount}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Amigos</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Agregar Amigo</span>
          </button>
        </div>

        {/* Solicitudes Pendientes */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Solicitudes Pendientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {request.users.avatar_url ? (
                        <img 
                          src={request.users.avatar_url} 
                          alt={request.users.name || ''} 
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {request.users.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{request.users.name || request.users.email}</h3>
                      <p className="text-sm text-gray-500">{request.users.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequest(request.id, true)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Aceptar"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Rechazar"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Amigos */}
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tienes amigos agregados aún.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-600 mt-2"
            >
              Agregar tu primer amigo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div 
                key={friend.id}
                className="bg-white rounded-lg shadow p-4 flex items-center space-x-4"
              >
                <div className="flex-shrink-0">
                  {friend.avatar_url ? (
                    <img 
                      src={friend.avatar_url} 
                      alt={friend.name || ''} 
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {friend.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{friend.name || friend.email}</h3>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Agregar Amigo */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Agregar Amigo</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSendRequest}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email del amigo
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ejemplo@email.com"
                    required
                  />
                </div>

                {requestError && (
                  <div className="mb-4 text-red-500 text-sm">
                    {requestError}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingRequest}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingRequest ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </div>
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