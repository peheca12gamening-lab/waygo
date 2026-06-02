import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-20">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(176, 144, 255, 0.18)',
          border: '1.5px solid rgba(224, 224, 248, 0.8)',
        }}
      >
        <Search size={18} style={{ color: '#B090FF' }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Search...'}
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        />
        {value && (
          <button onClick={() => onChange('')}>
            <X size={16} style={{ color: '#9898C0' }} />
          </button>
        )}
      </div>
    </div>
  );
}
