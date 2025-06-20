import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContexts';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  user_id: string;
  type: 'trip_added';
  title: string;
  message: string;
  metadata: {
    trip_id: string;
    trip_name: string;
    trip_type: string;
  };
  read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead: () => void;
}

export default function NotificationsPanel({ isOpen, onClose, onNotificationRead }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      console.log('Cargando notificaciones para usuario:', user?.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar notificaciones:', error);
        return;
      }

      console.log('Notificaciones encontradas:', data);
      setNotifications(data || []);
      
      // No es necesario actualizar unreadCount localmente, se calculará al renderizar
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error al marcar notificación como leída:', error);
        return;
      }

      // Actualizar el estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Notificar al componente padre para que actualice el contador global
      onNotificationRead();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      className={`fixed inset-0 bg-black/70 z-50 transition-opacity duration-300 backdrop-blur-md ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`w-80 max-w-xs bg-white h-full shadow-xl absolute right-0 top-0 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay notificaciones</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 