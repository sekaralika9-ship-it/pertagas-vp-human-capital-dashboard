import { ArrowDownUp, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, humanize } from '../../lib/formatters';

export default function RecordTable({ columns, records, canWrite, canDelete, sort, onSort, onEdit, onDelete }) {
  const render = (record, column) => {
    const value = record[column.key];
    if (column.kind === 'status') return <StatusBadge value={value} />;
    if (column.kind === 'date') return formatDate(value);
    if (column.kind === 'currency') return formatCurrency(value, record.currency || 'IDR');
    if (column.kind === 'employee-training-link') {
      const params = new URLSearchParams({ employee: record.id, name: record.full_name || '' });
      return (
        <Link
          className="font-semibold text-brandBlue hover:underline"
          to={`/employee-training?${params.toString()}`}
          title={`View ${record.full_name}'s training history`}
        >
          {record.full_name}
        </Link>
      );
    }
    if (column.kind === 'url') return value ? <a className="inline-flex items-center gap-1 font-medium text-brandBlue" href={value} target="_blank" rel="noreferrer">Open <ExternalLink size={13} /></a> : '—';
    if (column.render) return column.render(record);
    return value === null || value === undefined || value === '' ? '—' : humanize(String(value));
  };
  return (
    <table className="data-table">
      <thead><tr>{columns.map((column) => <th key={column.key}><button className="inline-flex items-center gap-1" onClick={() => onSort(column.key)}>{column.label}<ArrowDownUp size={12} className={sort.key === column.key ? 'text-brandBlue' : ''} /></button></th>)}{(canWrite || canDelete) && <th className="text-right">Actions</th>}</tr></thead>
      <tbody>{records.map((record) => (
        <tr key={record.id} className="hover:bg-slate-50/60">
          {columns.map((column) => <td key={column.key}>{render(record, column)}</td>)}
          {(canWrite || canDelete) && <td><div className="flex justify-end gap-1">{canWrite && <button className="icon-btn" onClick={() => onEdit(record)} aria-label="Edit record"><Pencil size={16} /></button>}{canDelete && <button className="icon-btn text-brandRed" onClick={() => onDelete(record)} aria-label="Delete record"><Trash2 size={16} /></button>}</div></td>}
        </tr>
      ))}</tbody>
    </table>
  );
}
