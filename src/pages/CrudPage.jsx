import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import SearchInput from '../components/common/SearchInput';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import FormModal from '../components/common/FormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import RecordForm from '../features/shared/RecordForm';
import RecordTable from '../features/shared/RecordTable';
import { useRecords } from '../hooks/useRecords';
import { useAuth } from '../hooks/useAuth';
import { employeeService } from '../services/employeeService';

const PAGE_SIZE = 10;

export default function CrudPage({ config }) {
  const { user, canWrite, canDelete } = useAuth();
  const { records, loading, error, refresh } = useRecords(config.service);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: config.columns[0].key, direction: 'asc' });
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  useEffect(() => {
    if (!config.fields.some((field) => field.relation === 'employees')) return;
    employeeService.getAll().then((items) => setEmployeeOptions(items.map((item) => ({
      value: item.id,
      label: `${item.full_name} (${item.employee_number})`,
    })))).catch((caught) => console.error('Unable to load employee options', caught));
  }, [config.fields]);
  const formFields = config.fields.map((field) => field.relation === 'employees' ? { ...field, options: employeeOptions } : field);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = term ? records.filter((row) => config.search.some((key) => String(row[key] || '').toLowerCase().includes(term))) : records;
    return [...rows].sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true }) * (sort.direction === 'asc' ? 1 : -1));
  }, [records, query, sort, config.search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const save = async (values) => {
    setBusy(true);
    try {
      if (editing) await config.service.update(editing.id, values);
      else await config.service.create({ ...values, created_by: user.id });
      toast.success(editing ? 'Record updated successfully.' : 'Record added successfully.');
      setFormOpen(false);
      setEditing(null);
      await refresh();
    } catch (caught) {
      console.error('Unable to save record', caught);
      toast.error(caught?.code === '23505' ? 'A record with this unique value already exists.' : 'The record could not be saved. Check your access and try again.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await config.service.remove(deleting.id);
      toast.success('Record deleted.');
      setDeleting(null);
      await refresh();
    } catch (caught) {
      console.error('Unable to delete record', caught);
      toast.error('The record could not be deleted. Check your access and try again.');
    } finally { setBusy(false); }
  };

  const addButton = canWrite ? <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={17} />Add Data</button> : null;
  return (
    <>
      <PageHeader title={config.title} description={config.description} action={addButton} />
      <FilterBar>
        <SearchInput value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
        <button className="btn-secondary sm:ml-auto" onClick={refresh}><RefreshCw size={16} />Refresh</button>
      </FilterBar>
      {loading ? <div className="card"><LoadingState /></div> : error ? <ErrorState onRetry={refresh} /> : (
        <div className="table-wrap">
          {!filtered.length ? <EmptyState description={query ? 'No records match your search.' : config.empty} action={!query && addButton} /> : (
            <>
              <RecordTable columns={config.columns} records={visible} canWrite={canWrite} canDelete={canDelete} sort={sort} onSort={(key) => setSort((previous) => ({ key, direction: previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc' }))} onEdit={(record) => { setEditing(record); setFormOpen(true); }} onDelete={setDeleting} />
              <Pagination page={page} pages={pages} total={filtered.length} onChange={setPage} />
            </>
          )}
        </div>
      )}
      <FormModal open={formOpen} title={`${editing ? 'Edit' : 'Add'} ${config.singular}`} description="Fields marked with an asterisk are required." onClose={() => !busy && setFormOpen(false)}>
        <RecordForm fields={formFields} record={editing} busy={busy} onCancel={() => setFormOpen(false)} onSubmit={save} />
      </FormModal>
      <ConfirmDialog open={Boolean(deleting)} busy={busy} description={`Delete this ${config.singular}? This action cannot be undone.`} onCancel={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
