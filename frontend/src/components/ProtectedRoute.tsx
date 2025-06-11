import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContexts';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Si está cargando, no renderizar nada
  if (loading) {
    return null;
  }

  // Si no hay usuario y la ruta no es pública, no renderizar nada
  if (!user && !publicRoutes.includes(router.pathname)) {
    return null;
  }

  // Si hay usuario o la ruta es pública, renderizar el contenido
  return <>{children}</>;
} 