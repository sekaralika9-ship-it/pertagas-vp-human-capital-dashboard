import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function FormModal({ open, title, description, children, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-navy/50" role="presentation" onMouseDown={onClose}>
      <section className="h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-white px-5 py-5 sm:px-7">
          <div><h2 id="form-title" className="text-xl font-bold text-navy">{title}</h2>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close form"><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}
