import { X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileSidebar({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button className="absolute inset-0 bg-navy/50" aria-label="Close navigation" onClick={onClose} />
      <aside className="relative h-full w-[min(86vw,290px)] shadow-2xl">
        <button className="icon-btn absolute right-2 top-2 z-10" onClick={onClose} aria-label="Close navigation"><X size={19} /></button>
        <Sidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}
