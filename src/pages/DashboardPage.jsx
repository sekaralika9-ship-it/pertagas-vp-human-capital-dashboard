import { ClipboardCheck, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import VisionBanner from '../components/dashboard/VisionBanner';
import KpiCard from '../components/dashboard/KpiCard';
import TrainingTrendChart from '../components/dashboard/TrainingTrendChart';
import BudgetUtilisationChart from '../components/dashboard/BudgetUtilisationChart';
import AuditReadinessOverview from '../components/dashboard/AuditReadinessOverview';
import TnaProgressChart from '../components/dashboard/TnaProgressChart';
import RecentDocuments from '../components/dashboard/RecentDocuments';
import QuickActions from '../components/dashboard/QuickActions';
import { formatPercent } from '../lib/formatters';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data, loading, error, refresh } = useDashboardData();
  const initialYear = data?.settings?.default_dashboard_year || new Date().getFullYear();
  const [chosenYear, setChosenYear] = useState(null);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refresh} />;
  const year = chosenYear || initialYear;
  return (
    <>
      <PageHeader title="HC Operation Dashboard" description={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ''}. Here is your current HC operational overview.`} />
      <VisionBanner settings={data.settings} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Employees" value={data.metrics.totalEmployees} icon={Users} />
        <KpiCard label="Training Realization" value={formatPercent(data.metrics.trainingRealization)} icon={GraduationCap} tone="green" />
        <KpiCard label="Audit Readiness" value={formatPercent(data.metrics.auditReadiness)} icon={ClipboardCheck} tone="red" />
        <KpiCard label="Competency Coverage" value={formatPercent(data.metrics.competencyCoverage)} icon={ShieldCheck} tone="navy" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><TrainingTrendChart records={data.training} year={year} onYear={setChosenYear} /></div><BudgetUtilisationChart metrics={data.metrics} currency={data.settings?.default_currency || 'IDR'} /></div>
      <div className="grid gap-6 xl:grid-cols-2"><AuditReadinessOverview records={data.audits} /><TnaProgressChart records={data.tna} /></div>
      <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><RecentDocuments records={data.documents} /></div><QuickActions /></div>
    </>
  );
}
