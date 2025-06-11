import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface SearchResultProps {
  id: string;
  name: string;
  type: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function SearchResult({
  id,
  name,
  type,
  isFavorite,
  onToggleFavorite
}: SearchResultProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'country':
        return 'País';
      case 'city':
        return 'Ciudad';
      case 'region':
        return 'Región';
      default:
        return type;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{getTypeLabel(type)}</p>
      </div>
      <button
        onClick={onToggleFavorite}
        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        {isFavorite ? (
          <StarIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
} 