import { useState } from 'react';
import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-[266px] border-r border-border lg:block"><Sidebar /></aside>
      <div className="lg:pl-[266px]">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-7"><Outlet /></main>
      </div>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
