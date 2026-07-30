import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../lib/formatters';

export default function TrainingScheduleOverview({ records = [] }) {
  const today = new Date().toISOString().slice(0, 10);
  const active = records
    .filter((record) => record.status !== 'cancelled' && record.end_date >= today)
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
  const fallback = [...records]
    .filter((record) => record.status !== 'cancelled')
    .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)));
  const upcoming = (active.length ? active : fallback).slice(0, 5);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border p-5 md:p-6">
        <div>
          <h3 className="font-bold text-navy">{active.length ? 'Upcoming Training Calendar' : 'Latest Training Schedule'}</h3>
          <p className="mt-1 text-xs text-muted">{active.length ? 'Next scheduled and ongoing programmes' : 'Most recent programmes from available records'}</p>
        </div>
        <Link className="text-xs font-semibold text-brandBlue hover:underline" to="/training-calendar">Open calendar</Link>
      </div>
      {!upcoming.length ? <EmptyState title="No training schedule" description="No dated training programmes are available." /> : (
        <div className="divide-y divide-border">
          {upcoming.map((record) => (
            <div key={record.id} className="flex items-start gap-3 px-5 py-4 md:px-6">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-brandBlue"><CalendarDays size={18} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{record.training_title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span>{formatDate(record.start_date)} – {formatDate(record.end_date)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={12} />{record.provider || record.owner_function || 'Provider not set'}</span>
                </p>
              </div>
              <StatusBadge value={record.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
