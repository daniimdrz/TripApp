import { HiOutlineX } from "react-icons/hi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro (overlay) */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 relative">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                aria-label="Cerrar modal"
              >
                <HiOutlineX size={24} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 