import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title = 'Delete this record?', description, busy, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/50 p-4" role="presentation" onMouseDown={onCancel}>
      <div className="card w-full max-w-md p-6" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex justify-between">
          <div className="rounded-xl bg-red-50 p-3 text-brandRed"><AlertTriangle size={22} /></div>
          <button className="icon-btn" onClick={onCancel} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <h2 id="confirm-title" className="mt-5 text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description || 'This action cannot be undone.'}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
