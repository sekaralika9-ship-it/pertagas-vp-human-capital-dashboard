import { useMemo, useState } from 'react';
import {
  BarChart3, CheckCircle2, Download, GraduationCap, Printer, Target, TrendingUp, Users, WalletCards,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ChartShell from '../components/dashboard/ChartShell';
import { useDashboardData } from '../hooks/useDashboardData';
import { exportCsv, formatCurrency, formatPercent, humanize } from '../lib/formatters';

const statusColors = {
  completed: '#79BE28',
  approved: '#155EEF',
  in_progress: '#38BDF8',
  proposed: '#F59E0B',
  draft: '#94A3B8',
  cancelled: '#E31E24',
};

export default function ReportsPage() {
  const { data, loading, error, refresh } = useDashboardData();
  const [year, setYear] = useState('');
  const [fn, setFn] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    if (!data) return null;
    const filter = (items, dateKey) => items.filter((item) => {
      const dateValue = dateKey ? item[dateKey] : '';
      return (!fn || item.function === fn || item.owner_function === fn || item.cost_centre === fn)
        && (!year || String(item.year || dateValue?.slice(0, 4)) === year)
        && (!startDate || !dateKey || (dateValue && dateValue >= startDate))
        && (!endDate || !dateKey || (dateValue && dateValue <= endDate));
    });
    return {
      employees: filter(data.employees, 'join_date'),
      tna: filter(data.tna, 'target_completion_date'),
      budgets: filter(data.budgets),
      training: filter(data.training, 'start_date'),
      competencies: filter(data.competencies, 'assessment_date'),
      audits: filter(data.audits, 'due_date'),
      documents: filter(data.documents, 'effective_date'),
    };
  }, [data, year, fn, startDate, endDate]);

  const report = useMemo(() => {
    if (!filtered) return null;
    const activeEmployees = filtered.employees.filter((item) => item.employment_status === 'active').length;
    const completedTraining = filtered.training.filter((item) => item.status === 'completed');
    const completedTna = filtered.tna.filter((item) => item.status === 'completed').length;
    const allocated = filtered.budgets.reduce((sum, item) => sum + Number(item.allocated_amount || 0), 0);
    const used = filtered.budgets.reduce((sum, item) => sum + Number(item.used_amount || 0), 0);

    const rows = [
      { module: 'Employees', total: filtered.employees.length, summary: `${activeEmployees} active` },
      { module: 'TNA', total: filtered.tna.length, summary: `${completedTna} completed` },
      { module: 'Budget', total: filtered.budgets.length, summary: `${formatCurrency(used)} used` },
      { module: 'Training', total: filtered.training.length, summary: `${completedTraining.length} completed` },
      { module: 'Competency', total: filtered.competencies.length, summary: `${filtered.competencies.filter((item) => item.current_level >= item.target_level).length} achieved` },
      { module: 'Audit Readiness', total: filtered.audits.length, summary: `${filtered.audits.filter((item) => item.readiness_status === 'ready').length} ready` },
      { module: 'Documents', total: filtered.documents.length, summary: `${filtered.documents.filter((item) => item.status === 'active').length} active` },
    ];

    const tnaGroups = filtered.tna.reduce((groups, item) => {
      groups[item.status] = (groups[item.status] || 0) + 1;
      return groups;
    }, {});
    const tnaStatus = Object.entries(tnaGroups).map(([name, value]) => ({ name, value }));

    const employeeGroups = filtered.employees.reduce((groups, item) => {
      const name = item.function || 'Unspecified';
      groups[name] = (groups[name] || 0) + 1;
      return groups;
    }, {});
    const workforce = Object.entries(employeeGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const spendGroups = completedTraining.reduce((groups, item) => {
      const name = item.owner_function || 'Unspecified';
      const amount = Number(item.actual_cost || 0);
      if (amount > 0) groups[name] = (groups[name] || 0) + amount;
      return groups;
    }, {});
    const spend = Object.entries(spendGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      rows,
      activeEmployees,
      completedTraining: completedTraining.length,
      trainingRate: filtered.training.length ? (completedTraining.length / filtered.training.length) * 100 : 0,
      tnaRate: filtered.tna.length ? (completedTna / filtered.tna.length) * 100 : 0,
      budgetRate: allocated ? (used / allocated) * 100 : 0,
      used,
      tnaStatus,
      workforce,
      spend,
    };
  }, [filtered]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refresh} />;

  const functions = [...new Set([
    ...data.employees.map((item) => item.function),
    ...data.audits.map((item) => item.function),
    ...data.training.map((item) => item.owner_function),
  ].filter(Boolean))].sort();
  const years = [...new Set([
    ...data.tna.map((item) => item.year),
    ...data.budgets.map((item) => item.year),
    ...data.training.map((item) => item.start_date?.slice(0, 4)),
  ].filter(Boolean))].sort().reverse();

  const exportReport = () => {
    if (!exportCsv('hc-operation-report.csv', report.rows, [
      { key: 'module', label: 'Module' },
      { key: 'total', label: 'Total Records' },
      { key: 'summary', label: 'Summary' },
    ])) toast.error('There is no visible data to export.');
  };

  return (
    <>
      <PageHeader
        title="HC Executive Report"
        description="A visual summary of workforce, learning, budget, and operational readiness."
        action={(
          <div className="flex gap-2 print:hidden">
            <button className="btn-secondary" onClick={exportReport}><Download size={16} />Export CSV</button>
            <button className="btn-secondary" onClick={() => window.print()}><Printer size={16} />Print</button>
          </div>
        )}
      />

      <div className="card flex flex-wrap gap-3 p-4 print:hidden">
        <select className="field w-auto" value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="">All years</option>
          {years.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="field w-auto max-w-xs" value={fn} onChange={(event) => setFn(event.target.value)}>
          <option value="">All functions</option>
          {functions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-muted">From <input className="field w-auto" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label className="flex items-center gap-2 text-xs text-muted">To <input className="field w-auto" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-blue-950 to-brandBlue p-6 text-white shadow-card md:p-8">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-blue-100">
              <TrendingUp size={15} />Executive snapshot
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
              People and learning performance at a glance.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              {report.completedTraining} completed training programmes support {report.activeEmployees} active employees, with {formatPercent(report.tnaRate)} of recorded TNA needs completed.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Training budget used</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(report.used)}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-brandGreen" style={{ width: `${Math.min(100, report.budgetRate)}%` }} />
            </div>
            <p className="mt-2 text-xs text-blue-100">{formatPercent(report.budgetRate)} of allocation</p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfographicCard icon={Users} label="Active Employees" value={report.activeEmployees} caption="Current active workforce" />
        <InfographicCard icon={GraduationCap} label="Training Completed" value={report.completedTraining} caption={`${formatPercent(report.trainingRate)} realization rate`} tone="green" />
        <InfographicCard icon={Target} label="TNA Realization" value={formatPercent(report.tnaRate)} caption="Completed identified needs" tone="amber" />
        <InfographicCard icon={WalletCards} label="Budget Utilization" value={formatPercent(report.budgetRate)} caption={formatCurrency(report.used)} tone="navy" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartShell title="Operational Data Landscape" subtitle="Record volume across HC modules" empty={!report.rows.some((row) => row.total)}>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={report.rows} margin={{ left: -15, right: 8 }}>
                  <CartesianGrid stroke="#E5EAF2" vertical={false} />
                  <XAxis dataKey="module" axisLine={false} tickLine={false} fontSize={11} interval={0} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#155EEF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartShell>
        </div>
        <div className="xl:col-span-2">
          <ChartShell title="TNA Progress Mix" subtitle="Distribution of needs by current status" empty={!report.tnaStatus.length}>
            <div className="relative h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={report.tnaStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2}>
                    {report.tnaStatus.map((item) => <Cell key={item.name} fill={statusColors[item.name] || '#94A3B8'} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, humanize(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div><strong className="block text-2xl text-navy">{formatPercent(report.tnaRate)}</strong><span className="text-xs text-muted">completed</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {report.tnaStatus.map((item) => (
                <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <i className="h-2 w-2 rounded-full" style={{ background: statusColors[item.name] || '#94A3B8' }} />
                  {humanize(item.name)} ({item.value})
                </span>
              ))}
            </div>
          </ChartShell>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <HorizontalChart
          title="Workforce by Function"
          subtitle="Top functions by employee population"
          data={report.workforce}
          color="#0B1F4D"
          formatter={(value) => `${value} employees`}
        />
        <HorizontalChart
          title="Training Spend by Function"
          subtitle="Completed-programme cost by budget owner"
          data={report.spend}
          color="#79BE28"
          formatter={(value) => formatCurrency(value)}
        />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5 md:p-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-brandBlue"><BarChart3 size={19} /></div>
          <div><h2 className="font-bold text-navy">Detailed Module Snapshot</h2><p className="mt-0.5 text-xs text-muted">Supporting totals behind the infographic</p></div>
        </div>
        {report.rows.every((row) => row.total === 0) ? (
          <EmptyState title="No report data available" description="No operational records match the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Module</th><th>Total Records</th><th>Key Result</th></tr></thead>
              <tbody>{report.rows.map((row) => <tr key={row.module}><td className="font-semibold text-ink">{row.module}</td><td>{row.total}</td><td>{row.summary}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function InfographicCard({ icon: Icon, label, value, caption, tone = 'blue' }) {
  const tones = {
    blue: 'from-blue-50 to-white text-brandBlue',
    green: 'from-green-50 to-white text-green-700',
    amber: 'from-amber-50 to-white text-amber-700',
    navy: 'from-slate-100 to-white text-navy',
  };
  return (
    <article className={`card relative overflow-hidden bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm"><Icon size={21} /></div>
      <p className="mt-5 text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-navy">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><CheckCircle2 size={13} />{caption}</p>
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-current opacity-[.05]" />
    </article>
  );
}

function HorizontalChart({ title, subtitle, data, color, formatter }) {
  return (
    <ChartShell title={title} subtitle={subtitle} empty={!data.length}>
      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 15, right: 28 }}>
            <CartesianGrid stroke="#E5EAF2" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1_000_000 ? `${Math.round(value / 1_000_000)}m` : value} />
            <YAxis type="category" dataKey="name" width={130} axisLine={false} tickLine={false} fontSize={11} />
            <Tooltip formatter={(value) => formatter(Number(value))} />
            <Bar dataKey="value" fill={color} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
