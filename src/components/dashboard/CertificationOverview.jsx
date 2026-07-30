import { Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../lib/formatters';

const isCertification = (record) => record.training_method === 'certification'
  || Boolean(record.certificate_link)
  || /certif|sertif/i.test(`${record.training_title || ''} ${record.category || ''}`);

export default function CertificationOverview({ records = [] }) {
  const certifications = records
    .filter(isCertification)
    .sort((a, b) => String(b.start_date || '').localeCompare(String(a.start_date || '')))
    .slice(0, 5);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border p-5 md:p-6">
        <div>
          <h3 className="font-bold text-navy">Training Certification</h3>
          <p className="mt-1 text-xs text-muted">Recent certification programmes and links</p>
        </div>
        <Link className="text-xs font-semibold text-brandBlue hover:underline" to="/training-certification">View all</Link>
      </div>
      {!certifications.length ? <EmptyState title="No certification records" description="Certification training has not been identified yet." /> : (
        <div className="divide-y divide-border">
          {certifications.map((record) => (
            <div key={record.id} className="flex items-start gap-3 px-5 py-4 md:px-6">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Award size={18} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{record.training_title}</p>
                <p className="mt-1 text-xs text-muted">{record.provider || 'Provider not set'} · {formatDate(record.start_date)}</p>
              </div>
              {record.certificate_link ? (
                <a className="icon-btn" href={record.certificate_link} target="_blank" rel="noreferrer" aria-label={`Open certificate for ${record.training_title}`}>
                  <ExternalLink size={16} />
                </a>
              ) : <StatusBadge value={record.status} />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
