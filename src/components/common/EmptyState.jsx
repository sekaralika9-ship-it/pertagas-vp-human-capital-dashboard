import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data available', description = 'Add your first record to begin.', action }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 rounded-2xl bg-blue-50 p-3 text-brandBlue"><Inbox size={24} /></div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
