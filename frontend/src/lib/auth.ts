import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  try {
    console.log('Iniciando signUp en auth...')
    
  // 1. Crear usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
      options: {
        data: {
          email: email,
          name: email.split('@')[0]
        }
      }
    })

    console.log('Respuesta de auth.signUp:', { authData, authError })

    if (authError) {
      console.error('Error en auth.signUp:', authError)
      return { data: null, error: authError }
    }

    if (!authData.user) {
      console.error('No se creó el usuario en auth')
      return { data: null, error: new Error('No se pudo crear el usuario en auth') }
    }

    // 2. Verificar si el usuario ya existe en nuestra tabla users
    console.log('Verificando si el usuario ya existe...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar usuario existente:', checkError)
      return { data: null, error: checkError }
    }

    // Si el usuario ya existe, retornamos éxito
    if (existingUser) {
      console.log('Usuario ya existe en la tabla users')
      return { data: authData, error: null }
    }

    // 3. Crear usuario en nuestra tabla users
    console.log('Creando perfil de usuario...')
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      {
          id: authData.user.id,
        email: email,
          name: email.split('@')[0],
        avatar_url: null
      }
    ])

  if (profileError) {
      console.error('Error al crear perfil:', profileError)
    // Si falla la creación del perfil, intentamos eliminar el usuario de auth
    await supabase.auth.signOut()
    return { data: null, error: profileError }
  }

    // 4. Verificar que el usuario se creó correctamente en auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Verificación de usuario en auth:', { user, userError })

    if (userError || !user) {
      console.error('Error al verificar usuario en auth:', userError)
      return { data: null, error: userError || new Error('No se pudo verificar el usuario en auth') }
    }

    console.log('Registro completado exitosamente')
  return { data: authData, error: null }
  } catch (error) {
    console.error('Error inesperado en signUp:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 3. Limpiar la suscripción al desmontar
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}