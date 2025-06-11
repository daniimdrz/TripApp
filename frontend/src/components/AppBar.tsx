// /src/components/AppBar.tsx
import { HiOutlineArrowLeft, HiOutlineMenuAlt3, HiOutlineBell } from 'react-icons/hi';

interface ButtonProps {
  icon?: React.ReactNode;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AppBar({ 
  title, 
  leftButton, 
  rightButton, 
  onMenuOpen,
  onNotificationsOpen,
  notificationCount = 0
}: { 
  title: string; 
  leftButton?: ButtonProps; 
  rightButton?: ButtonProps; 
  onMenuOpen?: () => void;
  onNotificationsOpen?: () => void;
  notificationCount?: number;
}) {
  return (
    <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Botón izquierdo */}
        {leftButton ? (
          <button 
            onClick={leftButton.onClick}
            disabled={leftButton.disabled}
            className="text-gray-700"
          >
            {leftButton.icon || <HiOutlineArrowLeft size={24} />}
          </button>
        ) : <div className="w-6"></div>}
        
        {/* Título centrado */}
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        
        {/* Botones derechos */}
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
    </header>
  );
}