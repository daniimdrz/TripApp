// /src/components/RadioGroup.tsx
export default function RadioGroup({ 
    options, 
    value, 
    onChange,
    label
  }: { 
    options: string[]; 
    value: string; 
    onChange: (value: string) => void;
    label?: string;
  }) {
    return (
      <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <div className="flex space-x-4">
          {options.map((option) => (
            <label key={option} className="flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="form-radio h-5 w-5 text-primary"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }