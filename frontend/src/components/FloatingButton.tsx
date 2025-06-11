// /src/components/FloatingButton.tsx
export default function FloatingButton({ 
    onClick, 
    color = 'primary' 
  }: { 
    onClick: () => void; 
    color?: 'primary' | 'accent'; 
  }) {
    const bgColor = color === 'primary' ? 'bg-primary' : 'bg-accent';
    
    return (
      <button
        onClick={onClick}
        className={`${bgColor} text-white rounded-full w-14 h-14 fixed right-6 bottom-6 shadow-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-${color}/50 transform transition-all duration-200 hover:scale-105 active:scale-95 animate-pulse-subtle z-40`}
        aria-label="Crear viaje"
      >
        <span className="text-2xl">+</span>
      </button>
    );
  }