import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useDashboardData } from '../hooks/useDashboardData';
import { exportCsv } from '../lib/formatters';

export default function ReportsPage() {
  const { data, loading, error, refresh } = useDashboardData();
  const [year, setYear] = useState('');
  const [fn, setFn] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const rows = useMemo(() => {
    if (!data) return [];
    const filter = (items, dateKey) => items.filter((item) => {
      const dateValue = dateKey ? item[dateKey] : '';
      return (!fn || item.function === fn || item.owner_function === fn)
        && (!year || String(item.year || dateValue?.slice(0, 4)) === year)
        && (!startDate || !dateKey || (dateValue && dateValue >= startDate))
        && (!endDate || !dateKey || (dateValue && dateValue <= endDate));
    });
    const employees = filter(data.employees, 'join_date');
    const tna = filter(data.tna, 'target_completion_date');
    const budgets = filter(data.budgets);
    const training = filter(data.training, 'start_date');
    const competency = filter(data.competencies, 'assessment_date');
    const audits = filter(data.audits, 'due_date');
    const documents = filter(data.documents, 'effective_date');
    return [
      { module: 'Employees', total: employees.length, summary: `${employees.filter((item) => item.employment_status === 'active').length} active` },
      { module: 'TNA', total: tna.length, summary: `${tna.filter((item) => item.status === 'completed').length} completed` },
      { module: 'Budget', total: budgets.length, summary: `${budgets.reduce((sum, item) => sum + Number(item.used_amount || 0), 0)} used` },
      { module: 'Training', total: training.length, summary: `${training.filter((item) => item.status === 'completed').length} completed` },
      { module: 'Competency', total: competency.length, summary: `${competency.filter((item) => item.current_level >= item.target_level).length} achieved` },
      { module: 'Audit Readiness', total: audits.length, summary: `${audits.filter((item) => item.readiness_status === 'ready').length} ready` },
      { module: 'Documents', total: documents.length, summary: `${documents.filter((item) => item.status === 'active').length} active` },
    ];
  }, [data, year, fn, startDate, endDate]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refresh} />;
  const functions = [...new Set([...data.employees.map((item) => item.function), ...data.audits.map((item) => item.function)].filter(Boolean))].sort();
  return (
    <>
      <PageHeader title="Reports" description="Review summaries calculated from the operational records visible to you." action={<div className="flex gap-2 print:hidden"><button className="btn-secondary" onClick={() => { if (!exportCsv('hc-operation-report.csv', rows, [{ key: 'module', label: 'Module' }, { key: 'total', label: 'Total Records' }, { key: 'summary', label: 'Summary' }])) toast.error('There is no visible data to export.'); }}><Download size={16} />Export CSV</button><button className="btn-secondary" onClick={() => window.print()}><Printer size={16} />Print</button></div>} />
      <div className="card flex flex-wrap gap-3 p-4 print:hidden"><select className="field w-auto" value={year} onChange={(event) => setYear(event.target.value)}><option value="">All years</option>{[...new Set([...data.tna.map((item) => item.year), ...data.budgets.map((item) => item.year), ...data.training.map((item) => item.start_date?.slice(0, 4))].filter(Boolean))].sort().reverse().map((item) => <option key={item}>{item}</option>)}</select><select className="field w-auto" value={fn} onChange={(event) => setFn(event.target.value)}><option value="">All functions</option>{functions.map((item) => <option key={item}>{item}</option>)}</select><label className="flex items-center gap-2 text-xs text-muted">From <input className="field w-auto" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="flex items-center gap-2 text-xs text-muted">To <input className="field w-auto" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
      <div className="table-wrap">{rows.every((row) => row.total === 0) ? <EmptyState title="No report data available" description="No operational records match the selected filters." /> : <table className="data-table"><thead><tr><th>Module</th><th>Total Records</th><th>Summary</th></tr></thead><tbody>{rows.map((row) => <tr key={row.module}><td className="font-semibold text-ink">{row.module}</td><td>{row.total}</td><td>{row.summary}</td></tr>)}</tbody></table>}</div>
    </>
  );
}
