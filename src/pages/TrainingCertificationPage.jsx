import { useEffect, useMemo, useState } from 'react';
import {
  Award, BadgeCheck, Download, ExternalLink, GraduationCap, Search, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import StatusBadge from '../components/common/StatusBadge';
import { trainingService } from '../services/trainingService';
import { exportCsv, formatDate } from '../lib/formatters';

const isCertification = (record) => record.training_method === 'certification'
  || Boolean(record.certificate_link)
  || /certif|sertif/i.test(`${record.training_title || ''} ${record.category || ''}`);

export default function TrainingCertificationPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [fn, setFn] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    setError(false);
    trainingService.getAll()
      .then(setRecords)
      .catch((caught) => {
        console.error('Unable to load training certifications', caught);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const certifications = useMemo(
    () => records.filter(isCertification).sort((a, b) => String(b.start_date || '').localeCompare(String(a.start_date || ''))),
    [records],
  );
  const functions = useMemo(() => [...new Set(certifications.map((record) => record.owner_function).filter(Boolean))].sort(), [certifications]);
  const statuses = useMemo(() => [...new Set(certifications.map((record) => record.status).filter(Boolean))].sort(), [certifications]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return certifications.filter((record) => {
      const searchable = [record.training_title, record.category, record.provider, record.owner_function].join(' ').toLowerCase();
      return (!term || searchable.includes(term))
        && (!fn || record.owner_function === fn)
        && (!status || record.status === status);
    });
  }, [certifications, query, fn, status]);

  const summary = {
    completed: certifications.filter((record) => record.status === 'completed').length,
    participants: certifications.reduce((total, record) => total + Number(record.participant_count || 0), 0),
    linked: certifications.filter((record) => record.certificate_link).length,
  };

  const exportCertifications = () => {
    if (!exportCsv('training-certifications.csv', filtered, [
      { key: 'training_title', label: 'Certification Training' },
      { key: 'category', label: 'Category' },
      { key: 'provider', label: 'Provider' },
      { key: 'owner_function', label: 'Function' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'participant_count', label: 'Participants' },
      { key: 'status', label: 'Status' },
      { key: 'certificate_link', label: 'Certificate Link' },
    ])) toast.error('There is no certification data to export.');
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <>
      <PageHeader
        title="Training Certification"
        description="Certification programmes and certificate links identified from Training Realization data."
        action={<button className="btn-secondary" onClick={exportCertifications}><Download size={16} />Export CSV</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Award} label="Certification programmes" value={certifications.length} />
        <Stat icon={BadgeCheck} label="Completed" value={summary.completed} tone="green" />
        <Stat icon={Users} label="Participants" value={summary.participants} tone="navy" />
        <Stat icon={GraduationCap} label="Certificate links" value={summary.linked} tone="amber" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              className="field pl-10"
              placeholder="Search certification, provider, or category…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="field lg:w-60" value={fn} onChange={(event) => setFn(event.target.value)}>
            <option value="">All functions</option>
            {functions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="field lg:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>

        {!filtered.length ? (
          <EmptyState
            title="No certification training found"
            description={certifications.length
              ? 'No certification records match the selected filters.'
              : 'Set Training Method to Certification, use a certification category/title, or add a certificate link in Training Realization.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[1050px] table-fixed">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead><tr><th>Certification</th><th>Provider</th><th>Category</th><th>Function</th><th>Date</th><th>Participants</th><th>Status</th><th>Certificate</th></tr></thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td className="!whitespace-normal align-top font-medium leading-5 text-ink">{record.training_title}</td>
                    <td className="!whitespace-normal align-top">{record.provider || '—'}</td>
                    <td className="!whitespace-normal align-top">{record.category}</td>
                    <td className="!whitespace-normal align-top">{record.owner_function}</td>
                    <td className="align-top">{formatDate(record.start_date)}</td>
                    <td className="align-top">{record.participant_count || 0}</td>
                    <td className="align-top"><StatusBadge value={record.status} /></td>
                    <td className="align-top">
                      {record.certificate_link ? (
                        <a className="inline-flex items-center gap-1 font-semibold text-brandBlue hover:underline" href={record.certificate_link} target="_blank" rel="noreferrer">
                          Open <ExternalLink size={13} />
                        </a>
                      ) : <span className="text-muted">—</span>}
                    </td>
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
    green: 'bg-green-50 text-green-700',
    navy: 'bg-slate-100 text-navy',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <article className="card flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
      <div><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-navy">{value}</p></div>
    </article>
  );
}
