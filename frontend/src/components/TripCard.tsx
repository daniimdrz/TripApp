// /src/components/TripCard.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PencilIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function TripCard({ 
    id,
    name, 
    start_date, 
    end_date, 
    country,
    city,
    cover_image_url,
    status,
    onEdit,
    type,
    index
  }: { 
    id: string;
    name: string; 
    start_date: string | null; 
    end_date: string | null; 
    country: string;
    city: string;
    cover_image_url?: string | null;
    status: string;
    onEdit: (tripId: string) => void;
    type: string;
    index: number;
  }) {
    const router = useRouter();

    const formatDate = (date: string | null) => {
      if (!date) return '';
      return format(new Date(date), 'd MMM yyyy', { locale: es });
    };

    const getDateDisplay = () => {
      const start = formatDate(start_date);
      const end = formatDate(end_date);

      if (!start && !end) return 'Sin fechas definidas';
      if (!start) return `Hasta ${end}`;
      if (!end) return `Desde ${start}`;
      return `${start} – ${end}`;
    };

    const badgeColor = {
      Próximo: 'bg-primary text-white',
      Activo: 'bg-accent text-white',
      Finalizado: 'bg-gray-300 text-gray-700',
    };

    const handleCardClick = (e: React.MouseEvent) => {
      // Si el clic fue en el botón de editar, no navegar
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      router.push(`/viaje/${id}`);
    };
  
    return (
      <div 
        className="bg-white rounded-xl shadow-card overflow-hidden mb-4 cursor-pointer hover:shadow-lg transition-shadow slide-in-card"
        onClick={handleCardClick}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {cover_image_url && (
          <div className="h-32 w-full">
            <img 
              src={cover_image_url} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="font-semibold text-neutral-dark">{name}</h2>
                <p className="text-sm text-gray-500">{getDateDisplay()}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{city}, {country}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {type === 'En pareja' && (
                <UsersIcon className="h-5 w-5 text-gray-500" title="Viaje en pareja" />
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor[status as keyof typeof badgeColor]}`}>
                {status}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Editar viaje"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }