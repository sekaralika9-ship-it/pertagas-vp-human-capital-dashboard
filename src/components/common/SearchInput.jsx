import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search records…' }) {
  return (
    <label className="relative block min-w-0 flex-1 sm:max-w-sm">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
      <input className="field pl-10" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
