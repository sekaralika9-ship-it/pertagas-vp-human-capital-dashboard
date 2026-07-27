import { ClipboardPlus, FileUp, GraduationCap, Target, UserPlus, WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

const actions = [
  ['/employees', 'Add Employee', UserPlus], ['/tna', 'Add TNA Record', Target],
  ['/training', 'Add Training Record', GraduationCap], ['/budget', 'Add Budget Record', WalletCards],
  ['/documents', 'Upload Document', FileUp], ['/audit-readiness', 'Add Audit Record', ClipboardPlus],
];
export default function QuickActions() {
  const { canWrite } = useAuth();
  if (!canWrite) return null;
  return <section className="card p-5 md:p-6"><h3 className="font-bold text-navy">Quick Actions</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{actions.map(([path, label, Icon]) => <Link key={label} to={path} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brandBlue"><Icon size={17} />{label}</Link>)}</div></section>;
}
