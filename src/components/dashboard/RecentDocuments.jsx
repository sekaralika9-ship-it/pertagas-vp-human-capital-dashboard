import { ExternalLink, FileText } from 'lucide-react';
import ChartShell from './ChartShell';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../lib/formatters';

export default function RecentDocuments({ records }) {
  const latest = [...records].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);
  return (
    <section className="card p-5 md:p-6"><h3 className="font-bold text-navy">Recent Documents</h3><p className="mt-1 text-xs text-muted">Five most recently added documents</p>
      {!latest.length ? <EmptyState title="No documents available" description="No documents have been added to the repository." /> : <div className="mt-5 divide-y divide-border">{latest.map((item) => <div key={item.id} className="flex items-center gap-3 py-3"><div className="rounded-xl bg-blue-50 p-2.5 text-brandBlue"><FileText size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{item.document_name}</p><p className="mt-0.5 text-xs text-muted">{item.file_type || 'File'} · {item.file_size ? `${item.file_size} bytes` : 'Size unavailable'} · {formatDate(item.created_at)}</p></div><a className="icon-btn" href={item.file_url} target="_blank" rel="noreferrer" aria-label={`Open ${item.document_name}`}><ExternalLink size={17} /></a></div>)}</div>}
    </section>
  );
}
