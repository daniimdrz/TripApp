// /src/components/SideMenu.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContexts';
import { 
  HomeIcon,
  CalendarIcon,
  MapIcon,
  StarIcon,
  UserIcon,
  UserGroupIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const router = useRouter();
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div 
        className={`absolute right-0 top-0 h-full w-64 bg-gradient-to-b from-white to-gray-50 shadow-[0_0_50px_rgba(0,0,0,0.15)] transform transition-all duration-300 ease-in-out rounded-l-2xl backdrop-blur-md ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="px-2 py-4">
          <div className="space-y-1">
            {[
              { href: "/", icon: HomeIcon, label: "Inicio" },
              { href: "/favoritos", icon: StarIcon, label: "Favoritos" },
              { href: "/mapa", icon: MapIcon, label: "Mapa" },
              { href: "/profile", icon: UserIcon, label: "Perfil" },
              { href: "/amigos", icon: UserGroupIcon, label: "Amigos" }
            ].map((item, i) => (
              <div
                key={item.href}
                className="transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  transitionDelay: `${i * 50}ms`,
                  opacity: isOpen ? 1 : 0,
                  transform: `translateX(${isOpen ? 0 : 20}px)`
                }}
              >
                <Link 
                  href={item.href} 
                  className={`flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors ${
                    router.pathname === item.href ? 'bg-white/80 text-primary' : ''
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${
                    router.pathname === item.href ? 'text-primary' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </div>
            ))}
          </div>

          {user && (
            <div 
              className="mt-6 px-4 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                transitionDelay: '250ms',
                opacity: isOpen ? 1 : 0,
                transform: `translateX(${isOpen ? 0 : 20}px)`
              }}
            >
              <button
                onClick={handleSignOut}
                className="w-full text-left text-gray-700 hover:text-red-600 px-4 py-2.5 rounded-lg transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}