import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // 1. Obtener la sesión actual al cargar
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session) {
            setUser(session.user)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error al obtener la sesión:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 2. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    // 3. Limpiar la suscripción al desmontar
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}