// /src/components/DestinationRow.tsx
export default function DestinationRow({ 
    name, 
    flag, 
    onClick 
  }: { 
    name: string; 
    flag: string; 
    onClick?: () => void; 
  }) {
    return (
      <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <div className="flex items-center space-x-3">
          <span role="img" aria-label={name} className="text-xl">{flag}</span>
          <span className="text-gray-800">{name}</span>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    );
  }