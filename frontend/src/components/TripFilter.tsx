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
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FiFilter size={18} className="text-gray-500" />
        <span>{activeFilter}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <HiOutlineChevronDown 
            size={18}
            className="text-gray-500"
          />
        </div>
      </button>

      {/* Menú desplegable */}
      <div 
        className={`absolute z-10 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden transition-all duration-300 transform 
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'}`}
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <ul className="py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option}
              className={`px-4 py-2.5 cursor-pointer hover:bg-primary/10 transition-colors duration-150 flex items-center justify-between 
                ${activeFilter === option ? 'bg-primary text-white font-semibold' : 'text-gray-700 hover:text-primary'}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={activeFilter === option}
            >
              <span>{option}</span>
              {activeFilter === option && (
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}