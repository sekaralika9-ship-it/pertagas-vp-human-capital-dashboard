import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, GraduationCap, Search, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { trainingParticipationService } from '../services/trainingParticipationService';
import { formatDate, humanize } from '../lib/formatters';

export default function EmployeeTrainingHistoryPage() {
  const [searchParams] = useSearchParams();
  const selectedEmployeeId = searchParams.get('employee') || '';
  const selectedEmployeeName = searchParams.get('name') || '';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [functionFilter, setFunctionFilter] = useState('');

  const load = () => {
    setLoading(true);
    setError(false);
    trainingParticipationService.getDetailed()
      .then(setRecords)
      .catch((caught) => {
        console.error('Unable to load employee training history', caught);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const scopedRecords = useMemo(
    () => selectedEmployeeId
      ? records.filter((record) => record.employees?.id === selectedEmployeeId)
      : records,
    [records, selectedEmployeeId],
  );

  const functions = useMemo(() => [...new Set(
    scopedRecords.map((record) => record.employees?.function).filter(Boolean),
  )].sort(), [scopedRecords]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return scopedRecords.filter((record) => {
      const employee = record.employees || {};
      const training = record.training_records || {};
      const matchesTerm = !term || [
        employee.employee_number,
        employee.full_name,
        employee.function,
        training.training_title,
        training.category,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      return matchesTerm && (!functionFilter || employee.function === functionFilter);
    });
  }, [scopedRecords, query, functionFilter]);

  const trainedWorkers = new Set(scopedRecords.map((record) => record.employees?.id).filter(Boolean)).size;
  const trainingTypes = new Set(scopedRecords.map((record) => record.training_records?.category).filter(Boolean)).size;

  return (
    <>
      <PageHeader
        title={selectedEmployeeName ? `${selectedEmployeeName}'s Training History` : 'Employee Training History'}
        description={selectedEmployeeName
          ? 'Training programmes and types recorded for this employee.'
          : 'Review the training types and programmes previously attended by each employee.'}
        action={selectedEmployeeId ? <Link className="btn-secondary" to="/employees"><ArrowLeft size={16} />Back to Employees</Link> : null}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Workers with history" value={trainedWorkers} />
        <Stat icon={GraduationCap} label="Participation records" value={records.length} tone="green" />
        <Stat icon={Search} label="Training types" value={trainingTypes} tone="navy" />
      </div>
      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            className="field pl-10"
            placeholder="Search employee number, name, function, or training…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="field sm:w-64" value={functionFilter} onChange={(event) => setFunctionFilter(event.target.value)}>
          <option value="">All functions</option>
          {functions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {loading ? <div className="card"><LoadingState /></div> : error ? <ErrorState onRetry={load} /> : (
        <div className="table-wrap">
          {!filtered.length ? (
            <EmptyState
              title="No training history available"
              description={selectedEmployeeName
                ? `No completed training is recorded for ${selectedEmployeeName}.`
                : records.length ? 'No records match the selected filters.' : 'Re-import the realization workbook to link employees with completed training.'}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Employee No.</th><th>Employee</th><th>Function</th><th>Training</th><th>Type</th><th>Date</th><th>Method</th><th>Result</th></tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const employee = record.employees || {};
                  const training = record.training_records || {};
                  return (
                    <tr key={record.id}>
                      <td>{employee.employee_number}</td>
                      <td><strong className="text-ink">{employee.full_name}</strong><span className="mt-1 block text-xs text-muted">{employee.position}</span></td>
                      <td>{employee.function}</td>
                      <td className="max-w-sm whitespace-normal font-medium text-ink">{training.training_title}</td>
                      <td>{training.category}</td>
                      <td>{formatDate(training.start_date)}</td>
                      <td>{humanize(training.training_method || '')}</td>
                      <td>{record.result || 'Completed'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

function Stat({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    green: 'bg-green-50 text-green-700',
    navy: 'bg-slate-100 text-navy',
  };
  return (
    <article className="card flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
      <div><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-navy">{value}</p></div>
    </article>
  );
}
