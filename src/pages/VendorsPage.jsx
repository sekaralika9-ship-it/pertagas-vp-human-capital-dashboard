import { useEffect, useMemo, useState } from 'react';
import {
  Building2, CalendarDays, Download, GraduationCap, Plus, Search, Users, WalletCards, X,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import StatusBadge from '../components/common/StatusBadge';
import ChartShell from '../components/dashboard/ChartShell';
import { trainingService } from '../services/trainingService';
import { exportCsv, formatCurrency, formatDate, humanize } from '../lib/formatters';
import { useAuth } from '../hooks/useAuth';

const cleanName = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const vendorKey = (value) => cleanName(value).toLowerCase();

const primaryCategory = (counts) => [...counts.entries()]
  .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || 'Unclassified';

function buildVendors(records) {
  const groups = new Map();
  records.forEach((record) => {
    const name = cleanName(record.provider);
    if (!name) return;
    const key = vendorKey(name);
    const group = groups.get(key) || {
      id: key,
      name,
      type: 'External',
      categoryCounts: new Map(),
      trainingCount: 0,
      completedCount: 0,
      ongoingCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      participants: 0,
      spend: 0,
      lastUsed: '',
      programmes: [],
      functions: new Set(),
      methods: new Set(),
    };
    const category = cleanName(record.category) || 'Unclassified';
    group.categoryCounts.set(category, (group.categoryCounts.get(category) || 0) + 1);
    group.trainingCount += 1;
    if (record.status === 'completed') group.completedCount += 1;
    else if (record.status === 'ongoing') group.ongoingCount += 1;
    else if (record.status === 'cancelled') group.cancelledCount += 1;
    else group.pendingCount += 1;
    group.participants += Number(record.participant_count || 0);
    group.spend += Number(record.actual_cost || 0);
    if (record.start_date && (!group.lastUsed || record.start_date > group.lastUsed)) group.lastUsed = record.start_date;
    if (record.owner_function) group.functions.add(record.owner_function);
    if (record.training_method) group.methods.add(record.training_method);
    group.programmes.push(record);
    groups.set(key, group);
  });
  return [...groups.values()]
    .map((group) => ({
      ...group,
      category: primaryCategory(group.categoryCounts),
      categories: [...group.categoryCounts.keys()].sort(),
      functions: [...group.functions].sort(),
      methods: [...group.methods].sort(),
      programmes: [...group.programmes].sort((a, b) => String(b.start_date || '').localeCompare(String(a.start_date || ''))),
    }))
    .sort((a, b) => b.trainingCount - a.trainingCount || a.name.localeCompare(b.name));
}

export default function VendorsPage() {
  const { canWrite } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    trainingService.getAll()
      .then(setRecords)
      .catch((caught) => {
        console.error('Unable to load vendor directory', caught);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const vendors = useMemo(() => buildVendors(records), [records]);
  const categories = useMemo(
    () => [...new Set(vendors.flatMap((vendor) => vendor.categories))].sort(),
    [vendors],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const searchable = [
        vendor.name,
        ...vendor.categories,
        ...vendor.functions,
        ...vendor.programmes.map((programme) => programme.training_title),
      ].join(' ').toLowerCase();
      return (!term || searchable.includes(term))
        && (!category || vendor.categories.includes(category));
    });
  }, [vendors, query, category]);

  const summary = useMemo(() => ({
    programmes: vendors.reduce((total, vendor) => total + vendor.trainingCount, 0),
    participants: vendors.reduce((total, vendor) => total + vendor.participants, 0),
    spend: vendors.reduce((total, vendor) => total + vendor.spend, 0),
  }), [vendors]);
  const vendorRealization = useMemo(
    () => vendors
      .filter((vendor) => vendor.completedCount || vendor.ongoingCount || vendor.pendingCount)
      .slice(0, 10),
    [vendors],
  );

  const exportVendors = () => {
    const exported = exportCsv('vendor-directory.csv', filtered.map((vendor) => ({
      ...vendor,
      categories: vendor.categories.join('; '),
      functions: vendor.functions.join('; '),
      methods: vendor.methods.map(humanize).join('; '),
    })), [
      { key: 'name', label: 'Vendor Name' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Primary Category' },
      { key: 'categories', label: 'All Categories' },
      { key: 'trainingCount', label: 'Training Programmes' },
      { key: 'completedCount', label: 'Completed Programmes' },
      { key: 'participants', label: 'Participants' },
      { key: 'spend', label: 'Actual Spend (IDR)' },
      { key: 'lastUsed', label: 'Last Used' },
      { key: 'functions', label: 'Functions' },
      { key: 'methods', label: 'Methods' },
    ]);
    if (!exported) toast.error('There is no vendor data to export.');
  };

  const action = (
    <div className="flex flex-wrap gap-2">
      <button className="btn-secondary" onClick={exportVendors}><Download size={16} />Export CSV</button>
      {canWrite && <Link className="btn-primary" to="/training"><Plus size={17} />Add via Training</Link>}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Vendor Directory"
        description="Training providers consolidated automatically from Training Realization records."
        action={action}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Building2} label="Registered vendors" value={vendors.length} />
        <Stat icon={GraduationCap} label="Training programmes" value={summary.programmes} tone="green" />
        <Stat icon={Users} label="Recorded participants" value={summary.participants} tone="navy" />
        <Stat icon={WalletCards} label="Actual vendor spend" value={formatCurrency(summary.spend)} tone="amber" />
      </div>

      <ChartShell
        title="Vendor Training Realization"
        subtitle="Completed, ongoing, and planned programmes by provider"
        empty={!vendorRealization.length}
      >
        <div style={{ height: Math.max(300, vendorRealization.length * 42) }}>
          <ResponsiveContainer>
            <BarChart data={vendorRealization} layout="vertical" margin={{ left: 35, right: 20 }}>
              <CartesianGrid stroke="#E5EAF2" horizontal={false} />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={155} axisLine={false} tickLine={false} fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="completedCount" name="Completed" stackId="vendor" fill="#79BE28" />
              <Bar dataKey="ongoingCount" name="Ongoing" stackId="vendor" fill="#38BDF8" />
              <Bar dataKey="pendingCount" name="Planned" stackId="vendor" fill="#F59E0B" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartShell>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              className="field pl-10"
              placeholder="Search vendor, category, function, or training…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="field sm:w-64" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState onRetry={load} /> : !filtered.length ? (
          <EmptyState
            title="No vendors found"
            description={vendors.length ? 'No vendors match the selected filters.' : 'Add provider names to Training Realization records to build the vendor directory.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[1050px] table-fixed">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                  <col className="w-[10%]" />
                  <col className="w-[11%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[5%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Training</th>
                    <th>Participants</th>
                    <th>Actual Spend</th>
                    <th>Last Used</th>
                    <th><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/60">
                      <td className="!whitespace-normal align-top">
                        <button className="text-left font-semibold text-brandBlue hover:underline" onClick={() => setSelected(vendor)}>
                          {vendor.name}
                        </button>
                        <span className="mt-1 block text-xs text-muted">{vendor.completedCount} completed{vendor.ongoingCount ? ` · ${vendor.ongoingCount} ongoing` : ''}</span>
                      </td>
                      <td className="align-top"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{vendor.type}</span></td>
                      <td className="!whitespace-normal align-top leading-5">{vendor.category}</td>
                      <td className="align-top font-semibold text-navy">{vendor.trainingCount}</td>
                      <td className="align-top">{vendor.participants}</td>
                      <td className="align-top">{formatCurrency(vendor.spend)}</td>
                      <td className="align-top">{formatDate(vendor.lastUsed)}</td>
                      <td className="align-top text-right">
                        <button className="icon-btn" onClick={() => setSelected(vendor)} aria-label={`View ${vendor.name}`}>
                          <span className="text-lg leading-none">›</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-3 text-xs text-muted">
              Showing {filtered.length} of {vendors.length} vendors · Type defaults to External because these names come from the workbook’s Vendor field.
            </div>
          </>
        )}
      </section>

      {selected && <VendorDetail vendor={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function VendorDetail({ vendor, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-navy/50" role="presentation" onMouseDown={onClose}>
      <section
        className="h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-brandBlue">Vendor profile</p>
            <h2 id="vendor-detail-title" className="mt-1 text-xl font-bold text-navy">{vendor.name}</h2>
            <p className="mt-1 text-sm text-muted">{vendor.type} provider · {vendor.category}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close vendor details"><X size={20} /></button>
        </header>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Programmes" value={vendor.trainingCount} />
            <MiniStat label="Participants" value={vendor.participants} />
            <MiniStat label="Actual Spend" value={formatCurrency(vendor.spend)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Categories" value={vendor.categories.join(', ')} />
            <Info label="Supported Functions" value={vendor.functions.join(', ') || 'Not specified'} />
            <Info label="Delivery Methods" value={vendor.methods.map(humanize).join(', ') || 'Not specified'} />
            <Info label="Contact Information" value="Not available in the supplied workbooks" />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="text-brandBlue" size={18} />
              <h3 className="font-bold text-navy">Training History</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="data-table min-w-[720px]">
                <thead><tr><th>Training</th><th>Date</th><th>Status</th><th>Participants</th><th>Spend</th></tr></thead>
                <tbody>
                  {vendor.programmes.map((programme) => (
                    <tr key={programme.id}>
                      <td className="max-w-sm !whitespace-normal font-medium leading-5 text-ink">{programme.training_title}</td>
                      <td>{formatDate(programme.start_date)}</td>
                      <td><StatusBadge value={programme.status} /></td>
                      <td>{programme.participant_count || 0}</td>
                      <td>{formatCurrency(programme.actual_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    green: 'bg-green-50 text-green-700',
    navy: 'bg-slate-100 text-navy',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <article className="card flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
      <div className="min-w-0"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 truncate text-2xl font-bold text-navy">{value}</p></div>
    </article>
  );
}

function MiniStat({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}

function Info({ label, value }) {
  return <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-2 text-sm leading-6 text-ink">{value}</p></div>;
}
