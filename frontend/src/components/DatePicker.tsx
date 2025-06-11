// /src/components/DatePicker.tsx
import { HiOutlineCalendar } from 'react-icons/hi';

export default function DatePicker({ 
  label, 
  value, 
  onChange,
  required = false
}: { 
  label: string; 
  value?: string; 
  onChange?: (date: string) => void;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <HiOutlineCalendar size={20} />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  );
}