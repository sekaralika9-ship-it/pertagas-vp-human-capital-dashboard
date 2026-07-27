import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartShell from './ChartShell';

const colors = ['#155EEF', '#79BE28', '#E31E24', '#0B1F4D', '#38BDF8', '#F59E0B'];
export default function TnaProgressChart({ records = [], summary }) {
  const grouped = records.reduce((all, item) => {
    if (item.competency_category) all[item.competency_category] = (all[item.competency_category] || 0) + 1;
    return all;
  }, {});
  const data = summary || Object.entries(grouped).map(([name, value]) => ({ name, value }));
  return (
    <ChartShell title="TNA Progress" subtitle="Records grouped by competency category" empty={!data.length}>
      <div className="h-64"><ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{data.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      <div className="flex flex-wrap gap-3">{data.map((item, index) => <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-muted"><i className="h-2 w-2 rounded-full" style={{ background: colors[index % colors.length] }} />{item.name}</span>)}</div>
    </ChartShell>
  );
}
