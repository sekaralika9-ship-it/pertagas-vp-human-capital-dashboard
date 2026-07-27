import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartShell from './ChartShell';

export default function ViewerTrainingTrendChart({ data, year, years, onYear }) {
  const options = years?.length ? years : [year];
  const select = (
    <select
      className="field w-auto py-1.5"
      value={year}
      onChange={(event) => onYear(Number(event.target.value))}
      aria-label="Dashboard year"
    >
      {options.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
  );

  return (
    <ChartShell
      title="Training Realization Trend"
      subtitle="Completed training activities by month"
      empty={!data?.length}
      action={select}
    >
      <div className="h-64">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: -22, right: 8 }}>
            <CartesianGrid stroke="#E5EAF2" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#155EEF" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
