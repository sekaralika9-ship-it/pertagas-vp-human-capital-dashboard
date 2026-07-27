import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ label = 'Loading data…', fullPage = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm text-muted ${fullPage ? 'min-h-screen' : 'min-h-52'}`} role="status">
      <LoaderCircle className="animate-spin text-brandBlue" size={20} />
      <span>{label}</span>
    </div>
  );
}
