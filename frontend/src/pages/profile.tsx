import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '../contexts/AuthContexts'
import AppBar from '../components/AppBar'
import SideMenu from '../components/SideMenu'
import { supabase } from '../lib/supabase'
import { PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    id: string
    email: string
    name: string
    avatar_url: string | null
  } | null>(null)
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  
  const router = useRouter()
  const { user, signOut } = useAuthContext()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)

        // Obtener los últimos 3 viajes
        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (tripsError) throw tripsError
        setRecentTrips(trips)
      } catch (error: any) {
        console.error('Error al cargar el perfil:', error)
        setError('Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  const handleAvatarClick = () => {
    router.push('/profile/edit')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppBar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppBar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppBar 
        onMenuOpen={() => setIsSideMenuOpen(true)}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div 
              onClick={handleAvatarClick}
              className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group"
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-500">{profile?.email}</p>
          </div>

          {/* Historial de viajes recientes */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Viajes Recientes</h2>
              <Link 
                href="/mis-viajes" 
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>
            {recentTrips.length > 0 ? (
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/trips/${trip.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      {trip.cover_image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={trip.cover_image_url} 
                            alt={trip.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{trip.name}</h3>
                        <p className="text-sm text-gray-500">
                          {trip.city}, {trip.country}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No tienes viajes recientes
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-4">
              <button
                onClick={() => router.push('/profile/edit')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Editar perfil
              </button>
              <button
                onClick={() => router.push('/profile/change-password')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cambiar contraseña
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <SideMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
    </div>
  )
} 