// /src/components/PlaceCard.tsx
export default function PlaceCard({ 
    nombre, 
    tipo, 
    fechaVisita 
  }: { 
    nombre: string; 
    tipo: string; 
    fechaVisita: string; 
  }) {
    return (
      <div className="bg-white rounded-xl shadow-card p-4 mb-4">
        <div className="flex items-start">
          <div className="w-20 h-20 bg-gray-200 rounded-lg mr-4"></div>
          <div>
            <h3 className="font-semibold text-gray-800">{nombre}</h3>
            <p className="text-sm text-gray-600">{tipo}</p>
            <p className="text-xs text-gray-500 mt-1">{fechaVisita}</p>
          </div>
        </div>
      </div>
    );
  }