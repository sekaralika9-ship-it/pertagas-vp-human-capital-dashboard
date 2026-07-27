import { useState } from 'react';
import { FileCheck2, FileSpreadsheet, LoaderCircle, ShieldCheck, Upload } from 'lucide-react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { parsePertagasWorkbooks } from '../features/imports/pertagasWorkbookParser';
import { employeeService } from '../services/employeeService';
import { trainingService } from '../services/trainingService';
import { tnaService } from '../services/tnaService';
import { budgetService } from '../services/budgetService';

const chunk = (items, size = 100) => {
  const groups = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
};
const key = {
  employees: (row) => String(row.employee_number),
  training: (row) => `${row.training_title}|${row.start_date}|${row.end_date}`.toLowerCase(),
  tna: (row) => `${row.year}|${row.function}|${row.department}|${row.competency_category}|${row.proposed_training}`.toLowerCase(),
  budgets: (row) => `${row.year}|${row.budget_category}|${row.programme_name}`.toLowerCase(),
};

async function insertNew(service, incoming, getKey, userId) {
  const existing = await service.getAll();
  const existingKeys = new Set(existing.map(getKey));
  const unique = incoming.filter((row) => !existingKeys.has(getKey(row)));
  let inserted = 0;
  for (const group of chunk(unique)) {
    const result = await service.createMany(group.map((row) => ({ ...row, created_by: userId })));
    inserted += result.length;
  }
  return { inserted, skipped: incoming.length - unique.length };
}

export default function ImportDataPage() {
  const { user, role } = useAuth();
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;

  const analyse = async () => {
    if (!files.length) return toast.error('Select the Pertagas Excel workbooks first.');
    setProcessing(true);
    setPreview(null);
    setResult(null);
    try {
      const parsed = await parsePertagasWorkbooks(files);
      setPreview(parsed);
      toast.success('Workbook analysis complete. Review the counts before importing.');
    } catch (error) {
      console.error('Workbook analysis failed', error);
      toast.error(error.message || 'The workbooks could not be analysed.');
    } finally { setProcessing(false); }
  };

  const runImport = async () => {
    setImporting(true);
    const summary = {};
    try {
      setProgress('Importing employees…');
      summary.employees = await insertNew(employeeService, preview.employees, key.employees, user.id);
      setProgress('Importing training records…');
      summary.training = await insertNew(trainingService, preview.training, key.training, user.id);
      setProgress('Importing TNA records…');
      summary.tna = await insertNew(tnaService, preview.tna, key.tna, user.id);
      setProgress('Importing budget records…');
      summary.budgets = await insertNew(budgetService, preview.budgets, key.budgets, user.id);
      setResult(summary);
      toast.success('Import completed successfully.');
    } catch (error) {
      console.error('Data import failed', error);
      toast.error('Import stopped because a database operation failed. Existing duplicate checks will prevent re-importing completed records.');
    } finally {
      setImporting(false);
      setProgress('');
    }
  };

  const counts = preview ? [
    ['Employees', preview.employees.length],
    ['Training records', preview.training.length],
    ['TNA records', preview.tna.length],
    ['Budget records', preview.budgets.length],
  ] : [];

  return (
    <>
      <PageHeader title="Excel Data Import" description="Securely analyse and import approved Pertagas workbooks directly from your browser into Supabase." />
      <section className="card p-5 md:p-7">
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <ShieldCheck className="mt-0.5 shrink-0" size={19} />
          <p>Files are parsed locally in this browser. They are not uploaded to Vercel or stored in GitHub. Phone numbers, pivot sheets, raw history sheets, and unsupported personal fields are excluded.</p>
        </div>
        <label className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-6 text-center hover:bg-blue-50">
          <FileSpreadsheet className="text-brandBlue" size={32} />
          <span className="mt-3 font-semibold text-navy">Select Pertagas Excel workbooks</span>
          <span className="mt-1 text-xs text-muted">Select the Main Data, Realisasi, Report IDP, TNA Toolkit and Proper files together.</span>
          <input className="sr-only" type="file" multiple accept=".xlsx" onChange={(event) => { setFiles([...event.target.files]); setPreview(null); setResult(null); }} />
        </label>
        {files.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-slate-700"><FileCheck2 className="shrink-0 text-brandGreen" size={16} /><span className="truncate">{file.name}</span></div>)}</div>}
        <button className="btn-primary mt-5" disabled={processing || !files.length} onClick={analyse}>{processing ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}{processing ? 'Analysing workbooks…' : 'Analyse files'}</button>
      </section>

      {preview && (
        <section className="card p-5 md:p-7">
          <h2 className="text-lg font-bold text-navy">Import preview</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{counts.map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-slate-50 p-4"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold text-navy">{value}</p></div>)}</div>
          <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div><p className="font-semibold text-ink">Recognised workbooks</p><ul className="mt-2 space-y-1 text-muted">{preview.recognized.map((name) => <li key={name}>• {name}</li>)}</ul></div>
            <div><p className="font-semibold text-ink">Reference-only files</p><ul className="mt-2 space-y-1 text-muted">{preview.ignored.length ? preview.ignored.map((name) => <li key={name}>• {name}</li>) : <li>None</li>}</ul></div>
          </div>
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Import creates current employees, aggregated training events, grouped IDP/TNA requirements and the annual training-budget summary. Audit and competency coverage remain empty because the supplied files do not contain reliable audit scores or competency target levels.</p>
          <button className="btn-primary mt-5" disabled={importing} onClick={runImport}>{importing && <LoaderCircle className="animate-spin" size={17} />}{importing ? progress : 'Import approved data'}</button>
        </section>
      )}
      {result && <section className="card p-5 md:p-7"><h2 className="text-lg font-bold text-navy">Import complete</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(result).map(([name, values]) => <div key={name} className="rounded-xl bg-green-50 p-4 text-sm"><strong className="capitalize text-green-900">{name}</strong><p className="mt-2 text-green-800">{values.inserted} inserted · {values.skipped} duplicates skipped</p></div>)}</div></section>}
      {!files.length && <div className="card"><EmptyState title="No workbooks selected" description="Choose the approved Excel files to prepare a secure import preview." /></div>}
    </>
  );
}
