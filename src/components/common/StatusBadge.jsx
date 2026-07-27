import { humanize } from '../../lib/formatters';

const tones = {
  active: 'bg-green-50 text-green-700',
  completed: 'bg-green-50 text-green-700',
  ready: 'bg-green-50 text-green-700',
  approved: 'bg-blue-50 text-blue-700',
  ongoing: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-amber-50 text-amber-700',
  overdue: 'bg-red-50 text-red-700',
  inactive: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[value] || 'bg-slate-100 text-slate-700'}`}>{humanize(value)}</span>;
}
