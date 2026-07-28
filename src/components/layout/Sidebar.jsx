import {
  BarChart3, BookOpenCheck, ClipboardCheck, FileSpreadsheet, FolderOpen, GraduationCap, History,
  LayoutDashboard, LogOut, Settings, Target, Users, WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../hooks/useAuth';

export const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: Users },
  { label: 'Training History', path: '/employee-training', icon: History },
  { label: 'TNA', path: '/tna', icon: Target },
  { label: 'Budget', path: '/budget', icon: WalletCards },
  { label: 'Training Realization', path: '/training', icon: GraduationCap },
  { label: 'Competency', path: '/competency', icon: BookOpenCheck },
  { label: 'Audit Readiness', path: '/audit-readiness', icon: ClipboardCheck },
  { label: 'Document Center', path: '/documents', icon: FolderOpen },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Excel Import', path: '/imports', icon: FileSpreadsheet },
  { label: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
];

export default function Sidebar({ onNavigate }) {
  const { role, signOut } = useAuth();
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-6 py-5"><BrandLogo /></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {navigation.filter((item) => !item.adminOnly || role === 'admin').map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-50 text-brandBlue' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`}>
            <Icon size={19} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-brandRed" onClick={signOut}>
          <LogOut size={19} />Logout
        </button>
      </div>
    </div>
  );
}
