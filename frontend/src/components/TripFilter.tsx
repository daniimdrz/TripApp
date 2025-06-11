// /src/components/TripFilter.tsx
import { HiOutlineChevronDown } from 'react-icons/hi';
import { FiFilter } from 'react-icons/fi';
import { useState } from 'react';


interface TripFilterProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function TripFilter({ 
  activeFilter, 
  setActiveFilter 
}: TripFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = ["Todos", "Próximos", "Activos", "Finalizados"];

  const handleSelect = (filter: string) => {
    setActiveFilter(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      {/* Botón del dropdown */}
      <button
        type="button"
        className="inline-flex items-center gap-2 px-4 py-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FiFilter size={16} color="#6B7280" />
        <span className="text-gray-700 font-medium">{activeFilter}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <HiOutlineChevronDown 
            size={16}
            color="#4B5563"
          />
        </div>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div 
          className="absolute z-10 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden"
          role="listbox"
          aria-labelledby="listbox-label"
        >
          <ul className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <li
                key={option}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                  activeFilter === option ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600'
                }`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={activeFilter === option}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}