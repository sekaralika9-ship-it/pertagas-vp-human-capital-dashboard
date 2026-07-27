import { format, parseISO } from 'date-fns';

export const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(typeof value === 'string' ? parseISO(value) : value, 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

export const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;

export const formatCurrency = (value, currency = 'IDR') =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(Number(value) || 0);

export const humanize = (value = '') =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const exportCsv = (filename, rows, columns) => {
  if (!rows.length) return false;
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const content = [
    columns.map((column) => escape(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => escape(row[column.key])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};
