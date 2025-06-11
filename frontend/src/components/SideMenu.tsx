// /src/components/SideMenu.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContexts';
import { HiOutlineX } from "react-icons/hi";
import { 
  HomeIcon,
  CalendarIcon,
  MapIcon,
  StarIcon,
  UserIcon,
  UserGroupIcon
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineX size={24} />
          </button>
        </div>

        <nav className="px-2 py-4">
          <div className="space-y-1">
            <Link href="/" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <HomeIcon className="h-6 w-6" />
              <span>Inicio</span>
            </Link>
            <Link href="/favoritos" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <StarIcon className="h-6 w-6" />
              <span>Favoritos</span>
            </Link>
            <Link href="/mis-viajes" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <CalendarIcon className="h-6 w-6" />
              <span>Mis Viajes</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <UserIcon className="h-5 w-5" />
              <span>Perfil</span>
              
            </Link>

            <Link href="/amigos" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100">
              <UserGroupIcon className="h-5 w-5" />
              <span>Amigos</span>
              
            </Link>
          </div>

          {user && (
            <div className="mt-6 px-4">
              <button
                onClick={handleSignOut}
                className="w-full text-left text-gray-700 hover:text-red-600 px-4 py-2"
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