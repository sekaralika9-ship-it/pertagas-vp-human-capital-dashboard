import { useEffect, useMemo, useState } from 'react';
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, GraduationCap, Search, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import StatusBadge from '../components/common/StatusBadge';
import { trainingService } from '../services/trainingService';
import { formatDate } from '../lib/formatters';

const statusTone = {
  completed: 'border-green-200 bg-green-50 text-green-800',
  ongoing: 'border-sky-200 bg-sky-50 text-sky-800',
  approved: 'border-blue-200 bg-blue-50 text-blue-800',
  planned: 'border-amber-200 bg-amber-50 text-amber-800',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default function TrainingCalendarPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState('');
  const [query, setQuery] = useState('');
  const [fn, setFn] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    setError(false);
    trainingService.getAll()
      .then(setRecords)
      .catch((caught) => {
        console.error('Unable to load training calendar', caught);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const availableMonths = useMemo(() => [...new Set(
    records.map((record) => record.start_date?.slice(0, 7)).filter(Boolean),
  )].sort().reverse(), [records]);
  const effectiveMonth = month || availableMonths[0] || format(new Date(), 'yyyy-MM');
  const calendarMonthOptions = [...new Set([effectiveMonth, ...availableMonths])].sort().reverse();
  const monthDate = parseISO(`${effectiveMonth}-01`);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }),
  });
  const functions = useMemo(() => [...new Set(records.map((record) => record.owner_function).filter(Boolean))].sort(), [records]);
  const statuses = useMemo(() => [...new Set(records.map((record) => record.status).filter(Boolean))].sort(), [records]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((record) => {
      const searchable = [record.training_title, record.provider, record.category, record.owner_function]
        .join(' ').toLowerCase();
      return (!term || searchable.includes(term))
        && (!fn || record.owner_function === fn)
        && (!status || record.status === status);
    });
  }, [records, query, fn, status]);

  const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
  const monthRecords = filtered
    .filter((record) => record.start_date <= monthEnd && (record.end_date || record.start_date) >= monthStart)
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
  const summary = {
    programmes: monthRecords.length,
    ongoing: monthRecords.filter((record) => record.status === 'ongoing').length,
    completed: monthRecords.filter((record) => record.status === 'completed').length,
    participants: monthRecords.reduce((total, record) => total + Number(record.participant_count || 0), 0),
  };

  const changeMonth = (date) => setMonth(format(date, 'yyyy-MM'));

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <>
      <PageHeader
        title="Training Calendar"
        description="Monthly delivery schedule generated from Training Realization start and end dates."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={CalendarDays} label="Programmes this month" value={summary.programmes} />
        <Stat icon={GraduationCap} label="Ongoing" value={summary.ongoing} tone="sky" />
        <Stat icon={GraduationCap} label="Completed" value={summary.completed} tone="green" />
        <Stat icon={Users} label="Planned participants" value={summary.participants} tone="navy" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-2">
            <button className="icon-btn border border-border" onClick={() => changeMonth(subMonths(monthDate, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
            <div className="min-w-40 text-center">
              <h2 className="font-bold text-navy">{format(monthDate, 'MMMM yyyy')}</h2>
            </div>
            <button className="icon-btn border border-border" onClick={() => changeMonth(addMonths(monthDate, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
          </div>
          <select className="field xl:ml-2 xl:w-48" value={effectiveMonth} onChange={(event) => setMonth(event.target.value)}>
            {calendarMonthOptions.map((item) => <option key={item} value={item}>{format(parseISO(`${item}-01`), 'MMMM yyyy')}</option>)}
          </select>
          <label className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input className="field pl-10" placeholder="Search training or vendor…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="field xl:w-56" value={fn} onChange={(event) => setFn(event.target.value)}>
            <option value="">All functions</option>
            {functions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="field xl:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-7 border-b border-border bg-slate-50">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const iso = format(day, 'yyyy-MM-dd');
                const events = filtered.filter((record) =>
                  record.start_date <= iso && (record.end_date || record.start_date) >= iso);
                const currentMonth = format(day, 'yyyy-MM') === effectiveMonth;
                return (
                  <div key={iso} className={`min-h-32 border-b border-r border-border p-2 ${currentMonth ? 'bg-white' : 'bg-slate-50/70'}`}>
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${iso === format(new Date(), 'yyyy-MM-dd') ? 'bg-brandBlue text-white' : currentMonth ? 'text-ink' : 'text-slate-400'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className={`truncate rounded-md border px-2 py-1 text-[10px] font-medium ${statusTone[event.status] || statusTone.cancelled}`} title={event.training_title}>
                          {event.training_title}
                        </div>
                      ))}
                      {events.length > 3 && <p className="px-1 text-[10px] font-semibold text-brandBlue">+{events.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-bold text-navy">Monthly Agenda</h2>
          <p className="mt-1 text-xs text-muted">All programmes overlapping {format(monthDate, 'MMMM yyyy')}.</p>
        </div>
        {!monthRecords.length ? <EmptyState title="No scheduled training" description="No training matches this month and the selected filters." /> : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead><tr><th>Training</th><th>Function</th><th>Vendor</th><th>Start</th><th>End</th><th>Participants</th><th>Status</th></tr></thead>
              <tbody>
                {monthRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="max-w-sm !whitespace-normal font-medium leading-5 text-ink">{record.training_title}</td>
                    <td>{record.owner_function}</td>
                    <td>{record.provider || '—'}</td>
                    <td>{formatDate(record.start_date)}</td>
                    <td>{formatDate(record.end_date)}</td>
                    <td>{record.participant_count || 0}</td>
                    <td><StatusBadge value={record.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    sky: 'bg-sky-50 text-sky-700',
    green: 'bg-green-50 text-green-700',
    navy: 'bg-slate-100 text-navy',
  };
  return (
    <article className="card flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
      <div><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-navy">{value}</p></div>
    </article>
  );
}
