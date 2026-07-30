import {
  Award, BarChart3, BookOpenCheck, Building2, CalendarDays, ClipboardCheck, FileText,
  GraduationCap, History, Target, Users, WalletCards,
} from 'lucide-react';
import { Link } from 'react-router';
import { formatCurrency, formatPercent } from '../../lib/formatters';

const isCertification = (record) => record.training_method === 'certification'
  || Boolean(record.certificate_link)
  || /certif|sertif/i.test(`${record.training_title || ''} ${record.category || ''}`);

export default function ModuleOverview({ data }) {
  const vendors = new Set(data.training.map((record) => String(record.provider || '').trim().toLowerCase()).filter(Boolean)).size;
  const certifications = data.training.filter(isCertification).length;
  const tnaCompleted = data.tna.filter((record) => record.status === 'completed').length;
  const tnaRate = data.tna.length ? (tnaCompleted / data.tna.length) * 100 : 0;
  const completedTraining = data.training.filter((record) => record.status === 'completed').length;
  const modules = [
    { label: 'Employees', path: '/employees', icon: Users, value: data.metrics.totalEmployees, caption: 'Active workforce' },
    { label: 'Training History', path: '/employee-training', icon: History, value: data.participations.length, caption: 'Employee participation records' },
    { label: 'TNA', path: '/tna', icon: Target, value: formatPercent(tnaRate), caption: `${tnaCompleted} of ${data.tna.length} completed` },
    { label: 'Budget', path: '/budget', icon: WalletCards, value: formatPercent(data.metrics.budgetUtilisation), caption: `${formatCurrency(data.metrics.used)} used` },
    { label: 'Training Realization', path: '/training', icon: GraduationCap, value: completedTraining, caption: `${data.training.length} total programmes` },
    { label: 'Vendors', path: '/vendors', icon: Building2, value: vendors, caption: 'Recorded training providers' },
    { label: 'Training Calendar', path: '/training-calendar', icon: CalendarDays, value: data.training.length, caption: 'Dated programmes' },
    { label: 'Certification', path: '/training-certification', icon: Award, value: certifications, caption: 'Certification programmes' },
    { label: 'Competency', path: '/competency', icon: BookOpenCheck, value: formatPercent(data.metrics.competencyCoverage), caption: `${data.competencies.length} assessments` },
    { label: 'Audit Readiness', path: '/audit-readiness', icon: ClipboardCheck, value: formatPercent(data.metrics.auditReadiness), caption: `${data.audits.length} readiness records` },
    { label: 'Document Center', path: '/documents', icon: FileText, value: data.documents.length, caption: 'Controlled documents' },
    { label: 'Reports', path: '/reports', icon: BarChart3, value: 'Open', caption: 'Executive cross-module report' },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-navy">HC Module Overview</h2>
        <p className="mt-1 text-sm text-muted">A complete operational snapshot with direct access to every workspace.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {modules.map(({ label, path, icon: Icon, value, caption }) => (
          <Link key={path} to={path} className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brandBlue transition group-hover:bg-brandBlue group-hover:text-white">
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-ink">{label}</p>
                <strong className="text-lg text-navy">{value}</strong>
              </div>
              <p className="mt-1 truncate text-xs text-muted">{caption}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
