// /src/pages/_app.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuthContext } from '../contexts/AuthContexts';
import { supabase } from '../lib/supabase';
import NotificationsPanel from '../components/NotificationsPanel';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

function AppContent({ Component, pageProps }: AppProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      // Suscribirse a cambios en las notificaciones
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            // Actualizar el contador de notificaciones
            fetchNotificationCount();
          }
        )
        .subscribe();

      // Cargar el contador inicial
      fetchNotificationCount();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotificationCount(count || 0);
    } catch (error) {
      console.error('Error al obtener el contador de notificaciones:', error);
    }
  };

  const handleNotificationsOpen = () => {
    console.log('Abriendo panel de notificaciones');
    setIsNotificationsOpen(true);
  };

  return (
    <AuthProvider>
      <Component 
        {...pageProps} 
        onNotificationsOpen={handleNotificationsOpen}
        notificationCount={notificationCount}
      />
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => {
          console.log('Cerrando panel de notificaciones');
          setIsNotificationsOpen(false);
        }}
      />
    </AuthProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <Layout>
      <AppContent {...props} />
    </Layout>
  );
}