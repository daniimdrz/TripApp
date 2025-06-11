// /src/components/FormInput.tsx
export default function FormInput({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    icon 
  }: { 
    label: string; 
    placeholder: string; 
    value?: string; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    icon?: React.ReactNode; 
  }) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              icon ? 'pl-10' : ''
            }`}
          />
        </div>
      </div>
    );
  }