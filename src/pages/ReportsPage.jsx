import { useMemo, useState } from 'react';
import {
  BarChart3, CheckCircle2, Download, GraduationCap, Printer, Target, TrendingUp, Users, WalletCards,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ChartShell from '../components/dashboard/ChartShell';
import { useDashboardData } from '../hooks/useDashboardData';
import { exportCsv, formatCurrency, formatPercent } from '../lib/formatters';

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
      if (item.status === 'cancelled') return groups;
      const name = item.function || 'Unspecified';
      if (!groups[name]) groups[name] = { name, completed: 0, inProgress: 0, pending: 0 };
      if (item.status === 'completed') groups[name].completed += 1;
      else if (item.status === 'in_progress') groups[name].inProgress += 1;
      else groups[name].pending += 1;
      return groups;
    }, {});
    const tnaByFunction = Object.values(tnaGroups)
      .map((item) => ({ ...item, total: item.completed + item.inProgress + item.pending }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

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

    const functionNames = new Set([
      ...data.employees.map((item) => item.function),
      ...data.tna.map((item) => item.function),
      ...data.audits.map((item) => item.function),
      ...data.training.map((item) => item.owner_function),
    ].filter((name) => name && (!fn || name === fn)));
    const initialTrainingByFunctionGroups = Object.fromEntries(
      [...functionNames].map((name) => [name, {
        name,
        total: 0,
        ongoing: 0,
        completed: 0,
      }]),
    );
    const trainingByFunctionGroups = filtered.training.reduce((groups, item) => {
      if (item.status === 'cancelled') return groups;
      const name = item.owner_function || 'Unspecified';
      if (!groups[name]) {
        groups[name] = {
          name,
          total: 0,
          ongoing: 0,
          completed: 0,
        };
      }
      groups[name].total += 1;
      if (item.status === 'ongoing') groups[name].ongoing += 1;
      if (item.status === 'completed') groups[name].completed += 1;
      return groups;
    }, initialTrainingByFunctionGroups);
    const trainingByFunction = Object.values(trainingByFunctionGroups)
      .map((item) => {
        const realized = item.ongoing + item.completed;
        return {
          ...item,
          realized,
          remaining: item.total - realized,
          realizationRate: item.total ? (realized / item.total) * 100 : 0,
        };
      })
      .sort((a, b) => b.realized - a.realized || a.name.localeCompare(b.name));
    const trainingRealizationTotal = trainingByFunction.reduce((totals, item) => ({
      total: totals.total + item.total,
      ongoing: totals.ongoing + item.ongoing,
      completed: totals.completed + item.completed,
      realized: totals.realized + item.realized,
      remaining: totals.remaining + item.remaining,
    }), {
      total: 0,
      ongoing: 0,
      completed: 0,
      realized: 0,
      remaining: 0,
    });

    return {
      rows,
      activeEmployees,
      completedTraining: completedTraining.length,
      trainingRate: filtered.training.length ? (completedTraining.length / filtered.training.length) * 100 : 0,
      tnaRate: filtered.tna.length ? (completedTna / filtered.tna.length) * 100 : 0,
      budgetRate: allocated ? (used / allocated) * 100 : 0,
      used,
      tnaByFunction,
      workforce,
      spend,
      trainingByFunction,
      trainingRealizationTotal: {
        ...trainingRealizationTotal,
        realizationRate: trainingRealizationTotal.total
          ? (trainingRealizationTotal.realized / trainingRealizationTotal.total) * 100
          : 0,
      },
    };
  }, [filtered]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refresh} />;

  const functions = [...new Set([
    ...data.employees.map((item) => item.function),
    ...data.tna.map((item) => item.function),
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

  const exportTrainingRealization = () => {
    if (!exportCsv('training-realization-by-function.csv', report.trainingByFunction, [
      { key: 'name', label: 'Function' },
      { key: 'total', label: 'Total Programmes' },
      { key: 'ongoing', label: 'Ongoing' },
      { key: 'completed', label: 'Completed' },
      { key: 'realized', label: 'Already Run' },
      { key: 'remaining', label: 'Not Yet Run' },
      { key: 'realizationRate', label: 'Realization (%)' },
    ])) toast.error('There is no training realization data to export.');
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
          <ChartShell title="TNA Progress by Function" subtitle="Completed, in-progress, and pending needs" empty={!report.tnaByFunction.length}>
            <div style={{ height: Math.max(288, report.tnaByFunction.length * 34) }}>
              <ResponsiveContainer>
                <BarChart data={report.tnaByFunction} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid stroke="#E5EAF2" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={115} axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completed" name="Completed" stackId="tna" fill="#79BE28" />
                  <Bar dataKey="inProgress" name="In Progress" stackId="tna" fill="#38BDF8" />
                  <Bar dataKey="pending" name="Pending" stackId="tna" fill="#F59E0B" radius={[0, 7, 7, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700"><GraduationCap size={19} /></div>
            <div>
              <h2 className="font-bold text-navy">Training Realization by Function</h2>
              <p className="mt-0.5 text-xs text-muted">Programmes already run include ongoing and completed training; cancelled programmes are excluded.</p>
            </div>
          </div>
          <button className="btn-secondary print:hidden" onClick={exportTrainingRealization}>
            <Download size={16} />Export Training Realization
          </button>
        </div>
        {!report.trainingByFunction.length ? (
          <EmptyState title="No training realization data" description="No training programmes match the selected filters." />
        ) : (
          <>
            <div className="border-b border-border p-5 md:p-6">
              <div style={{ height: Math.max(300, report.trainingByFunction.length * 42) }}>
                <ResponsiveContainer>
                  <BarChart data={report.trainingByFunction} layout="vertical" margin={{ left: 25, right: 20 }}>
                    <CartesianGrid stroke="#E5EAF2" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={145} axisLine={false} tickLine={false} fontSize={11} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="completed" name="Completed" stackId="training" fill="#79BE28" />
                    <Bar dataKey="ongoing" name="Ongoing" stackId="training" fill="#38BDF8" />
                    <Bar dataKey="remaining" name="Not Yet Run" stackId="training" fill="#CBD5E1" radius={[0, 7, 7, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Total Programmes</th>
                  <th>Ongoing</th>
                  <th>Completed</th>
                  <th>Already Run</th>
                  <th>Not Yet Run</th>
                  <th>Realization</th>
                </tr>
              </thead>
              <tbody>
                {report.trainingByFunction.map((item) => (
                  <tr key={item.name}>
                    <td className="font-semibold text-ink">{item.name}</td>
                    <td>{item.total}</td>
                    <td><CountPill value={item.ongoing} tone="blue" /></td>
                    <td><CountPill value={item.completed} tone="green" /></td>
                    <td className="font-semibold text-navy">{item.realized}</td>
                    <td>{item.remaining}</td>
                    <td>
                      <div className="flex min-w-36 items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brandGreen"
                            style={{ width: `${Math.min(100, item.realizationRate)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-navy">{formatPercent(item.realizationRate)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold text-navy">
                  <td className="px-4 py-3.5">Total</td>
                  <td className="px-4 py-3.5">{report.trainingRealizationTotal.total}</td>
                  <td className="px-4 py-3.5">{report.trainingRealizationTotal.ongoing}</td>
                  <td className="px-4 py-3.5">{report.trainingRealizationTotal.completed}</td>
                  <td className="px-4 py-3.5">{report.trainingRealizationTotal.realized}</td>
                  <td className="px-4 py-3.5">{report.trainingRealizationTotal.remaining}</td>
                  <td className="px-4 py-3.5">{formatPercent(report.trainingRealizationTotal.realizationRate)}</td>
                </tr>
              </tfoot>
              </table>
            </div>
          </>
        )}
      </section>

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

function CountPill({ value, tone }) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`inline-flex min-w-9 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{value}</span>;
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
