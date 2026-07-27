import { ClipboardCheck, GraduationCap, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import VisionBanner from '../components/dashboard/VisionBanner';
import KpiCard from '../components/dashboard/KpiCard';
import ViewerTrainingTrendChart from '../components/dashboard/ViewerTrainingTrendChart';
import BudgetUtilisationChart from '../components/dashboard/BudgetUtilisationChart';
import AuditReadinessOverview from '../components/dashboard/AuditReadinessOverview';
import TnaProgressChart from '../components/dashboard/TnaProgressChart';
import { formatPercent } from '../lib/formatters';
import { useViewerDashboardData } from '../hooks/useViewerDashboardData';
import { useAuth } from '../hooks/useAuth';

export default function ViewerDashboardPage() {
  const { profile } = useAuth();
  const [chosenYear, setChosenYear] = useState(null);
  const { data, loading, error, refresh } = useViewerDashboardData(chosenYear);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refresh} />;

  const metrics = data?.metrics || {};
  const year = data?.year || new Date().getFullYear();

  return (
    <>
      <PageHeader
        title="HC Insights"
        description={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ''}. Track organisation-wide HC progress through approved summary indicators.`}
      />
      <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <LockKeyhole className="mt-0.5 shrink-0 text-brandBlue" size={18} />
        <div>
          <strong className="font-semibold">Secure summary access</strong>
          <p className="mt-0.5 leading-6 text-blue-800">
            This workspace shows approved totals and trends only. Employee details, source files, and imported records remain protected.
          </p>
        </div>
      </section>
      <VisionBanner settings={data?.settings} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Employees" value={metrics.totalEmployees || 0} icon={Users} />
        <KpiCard label="Training Realization" value={formatPercent(metrics.trainingRealization)} icon={GraduationCap} tone="green" />
        <KpiCard label="Audit Readiness" value={formatPercent(metrics.auditReadiness)} icon={ClipboardCheck} tone="red" />
        <KpiCard label="Competency Coverage" value={formatPercent(metrics.competencyCoverage)} icon={ShieldCheck} tone="navy" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ViewerTrainingTrendChart
            data={data?.trainingTrend || []}
            year={year}
            years={data?.availableYears || []}
            onYear={setChosenYear}
          />
        </div>
        <BudgetUtilisationChart metrics={metrics} currency={data?.settings?.default_currency || 'IDR'} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AuditReadinessOverview summary={data?.auditByFunction || []} />
        <TnaProgressChart summary={data?.tnaByCategory || []} />
      </div>
    </>
  );
}
