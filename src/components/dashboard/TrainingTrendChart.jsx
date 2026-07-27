import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import ChartShell from './ChartShell';

export default function TrainingTrendChart({ records, year, onYear }) {
  const years = [...new Set(records.map((item) => item.start_date?.slice(0, 4)).filter(Boolean))].sort().reverse();
  const data = useMemo(() => {
    const totals = {};
    records.filter((item) => item.status === 'completed' && item.start_date?.startsWith(String(year))).forEach((item) => {
      const key = item.start_date.slice(0, 7);
      totals[key] = (totals[key] || 0) + 1;
    });
    return Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)).map(([month, completed]) => ({ month: format(parseISO(`${month}-01`), 'MMM'), completed }));
  }, [records, year]);
  const select = <select className="field w-auto py-1.5" value={year} onChange={(event) => onYear(Number(event.target.value))}>{years.length ? years.map((item) => <option key={item}>{item}</option>) : <option>{year}</option>}</select>;
  return (
    <ChartShell title="Training Realization Trend" subtitle="Completed training records by month" empty={!data.length} action={select}>
      <div className="h-64"><ResponsiveContainer><LineChart data={data} margin={{ left: -22, right: 8 }}><CartesianGrid stroke="#E5EAF2" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="completed" stroke="#155EEF" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>
    </ChartShell>
  );
}
