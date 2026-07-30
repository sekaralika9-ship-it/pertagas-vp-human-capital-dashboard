import {
  Award, Building2, ClipboardCheck, FileText, GraduationCap, History, ShieldCheck,
  Target, Users, WalletCards,
} from 'lucide-react';
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
import TrainingRealizationByFunctionChart from '../components/dashboard/TrainingRealizationByFunctionChart';
import VendorRealizationChart from '../components/dashboard/VendorRealizationChart';
import TrainingScheduleOverview from '../components/dashboard/TrainingScheduleOverview';
import CertificationOverview from '../components/dashboard/CertificationOverview';
import ModuleOverview from '../components/dashboard/ModuleOverview';
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
  const completedTna = data.tna.filter((record) => record.status === 'completed').length;
  const tnaRate = data.tna.length ? (completedTna / data.tna.length) * 100 : 0;
  const vendors = new Set(data.training.map((record) => String(record.provider || '').trim().toLowerCase()).filter(Boolean)).size;
  const certifications = data.training.filter((record) => record.training_method === 'certification'
    || Boolean(record.certificate_link)
    || /certif|sertif/i.test(`${record.training_title || ''} ${record.category || ''}`)).length;
  return (
    <>
      <PageHeader title="HC Operation Dashboard" description={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ''}. Here is your current HC operational overview.`} />
      <VisionBanner settings={data.settings} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Active Employees" value={data.metrics.totalEmployees} icon={Users} />
        <KpiCard label="Training History" value={data.participations.length} icon={History} tone="navy" />
        <KpiCard label="Training Realization" value={formatPercent(data.metrics.trainingRealization)} icon={GraduationCap} tone="green" />
        <KpiCard label="TNA Realization" value={formatPercent(tnaRate)} icon={Target} tone="green" />
        <KpiCard label="Budget Utilization" value={formatPercent(data.metrics.budgetUtilisation)} icon={WalletCards} />
        <KpiCard label="Training Vendors" value={vendors} icon={Building2} tone="navy" />
        <KpiCard label="Certifications" value={certifications} icon={Award} tone="green" />
        <KpiCard label="Audit Readiness" value={formatPercent(data.metrics.auditReadiness)} icon={ClipboardCheck} tone="red" />
        <KpiCard label="Competency Coverage" value={formatPercent(data.metrics.competencyCoverage)} icon={ShieldCheck} tone="navy" />
        <KpiCard label="Documents" value={data.documents.length} icon={FileText} />
      </div>
      <ModuleOverview data={data} />
      <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><TrainingTrendChart records={data.training} year={year} onYear={setChosenYear} /></div><BudgetUtilisationChart metrics={data.metrics} currency={data.settings?.default_currency || 'IDR'} /></div>
      <div className="grid gap-6 xl:grid-cols-2"><TrainingRealizationByFunctionChart records={data.training} /><TnaProgressChart records={data.tna} /></div>
      <div className="grid gap-6 xl:grid-cols-2"><VendorRealizationChart records={data.training} /><AuditReadinessOverview records={data.audits} /></div>
      <div className="grid gap-6 xl:grid-cols-5"><div className="xl:col-span-3"><TrainingScheduleOverview records={data.training} /></div><div className="xl:col-span-2"><CertificationOverview records={data.training} /></div></div>
      <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><RecentDocuments records={data.documents} /></div><QuickActions /></div>
    </>
  );
}
