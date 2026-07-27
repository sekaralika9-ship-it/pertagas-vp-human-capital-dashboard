import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import ChartShell from './ChartShell';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export default function BudgetUtilisationChart({ metrics, currency }) {
  const remaining = Math.max(0, metrics.allocated - metrics.used);
  const data = metrics.allocated ? [{ name: 'Used', value: metrics.used }, { name: 'Available', value: remaining }] : [];
  return (
    <ChartShell title="Budget Utilisation" subtitle="Used amount against total allocation" empty={!data.length}>
      <div className="relative h-44"><ResponsiveContainer><PieChart><Pie data={data} dataKey="value" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270}>{data.map((entry, index) => <Cell key={entry.name} fill={index ? '#E5EAF2' : '#155EEF'} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-items-center"><strong className="text-2xl text-navy">{formatPercent(metrics.budgetUtilisation)}</strong></div></div>
      <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-muted">Allocated</span><strong className="mt-1 block truncate text-navy">{formatCurrency(metrics.allocated, currency)}</strong></div><div className="rounded-xl bg-blue-50 p-3"><span className="block text-xs text-muted">Used</span><strong className="mt-1 block truncate text-brandBlue">{formatCurrency(metrics.used, currency)}</strong></div></div>
    </ChartShell>
  );
}
