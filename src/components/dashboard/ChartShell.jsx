import EmptyState from '../common/EmptyState';

export default function ChartShell({ title, subtitle, empty, children, action }) {
  return (
    <section className="card min-w-0 p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3"><div><h3 className="font-bold text-navy">{title}</h3>{subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}</div>{action}</div>
      {empty ? <EmptyState title="No data available" description="No data is available for this chart." /> : children}
    </section>
  );
}
