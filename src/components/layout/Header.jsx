import { Bell, ChevronDown, CircleHelp, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { navigation } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onMenu }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { profile, user, signOut } = useAuth();
  const title = navigation.find((item) => pathname.startsWith(item.path))?.label || 'HC Operation Dashboard';
  const name = profile?.full_name || user?.email || 'User';
  const initials = name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-3">
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
        <h2 className="text-base font-bold text-navy sm:text-lg">{title}</h2>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button className="icon-btn" aria-label="Help"><CircleHelp size={19} /></button>
        <button className="icon-btn" aria-label="Notifications"><Bell size={19} /></button>
        <div className="relative">
          <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-xs font-bold text-white">{initials}</span>
            <span className="hidden text-left md:block"><span className="block max-w-40 truncate text-sm font-semibold text-ink">{name}</span><span className="block text-xs text-muted">{profile?.function || 'Function not set'}</span></span>
            <ChevronDown className="hidden text-muted sm:block" size={15} />
          </button>
          {open && (
            <div className="card absolute right-0 mt-2 w-52 p-2">
              <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted">{profile?.role || 'viewer'}</div>
              <button className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brandRed hover:bg-red-50" onClick={signOut}><LogOut size={16} />Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
