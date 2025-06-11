// /src/components/AppBar.tsx
import { HiOutlineArrowLeft, HiOutlineMenuAlt3, HiOutlineBell } from 'react-icons/hi';

interface ButtonProps {
  icon?: React.ReactNode;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AppBar({ 
  leftButton, 
  rightButton, 
  onMenuOpen,
  onNotificationsOpen,
  notificationCount = 0
}: { 
  leftButton?: ButtonProps; 
  rightButton?: ButtonProps; 
  onMenuOpen?: () => void;
  onNotificationsOpen?: () => void;
  notificationCount?: number;
}) {
  return (
    <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Espacio para el botón izquierdo */}
        <div className="flex-1 flex justify-start">
          {leftButton ? (
            <button 
              onClick={leftButton.onClick}
              disabled={leftButton.disabled}
              className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-90"
            >
              {leftButton.icon || <HiOutlineArrowLeft size={24} />}
            </button>
          ) : null}
        </div>
        
        {/* Título centrado */}
        <h1 className="text-3xl font-script text-gray-800">TripApp</h1>
        
        {/* Espacio para los botones derechos */}
        <div className="flex-1 flex justify-end">
          <div className="flex items-center space-x-2">
            {onNotificationsOpen && (
              <button 
                onClick={onNotificationsOpen}
                className="relative text-gray-700 hover:text-gray-900"
                aria-label="Notificaciones"
              >
                <HiOutlineBell size={24} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            {rightButton ? (
              <button 
                onClick={rightButton.onClick}
                disabled={rightButton.disabled}
                className={`text-primary ${rightButton.disabled ? 'opacity-50' : ''}`}
              >
                {rightButton.text}
              </button>
            ) : (
              <button 
                onClick={onMenuOpen}
                className="text-primary"
                aria-label="Abrir menú"
              >
                <HiOutlineMenuAlt3 size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}