import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ChartShell from './ChartShell';

export default function TrainingRealizationByFunctionChart({ records = [] }) {
  const grouped = records.reduce((groups, record) => {
    if (record.status === 'cancelled') return groups;
    const name = record.owner_function || 'Unspecified';
    if (!groups[name]) groups[name] = { name, completed: 0, ongoing: 0, pending: 0 };
    if (record.status === 'completed') groups[name].completed += 1;
    else if (record.status === 'ongoing') groups[name].ongoing += 1;
    else groups[name].pending += 1;
    return groups;
  }, {});
  const data = Object.values(grouped)
    .sort((a, b) => (b.completed + b.ongoing + b.pending) - (a.completed + a.ongoing + a.pending));

  return (
    <ChartShell
      title="Training Realization by Function"
      subtitle="Completed, ongoing, and not-yet-run programmes"
      empty={!data.length}
    >
      <div style={{ height: Math.max(300, data.length * 38) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 25, right: 15 }}>
            <CartesianGrid stroke="#E5EAF2" horizontal={false} />
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="completed" name="Completed" stackId="training" fill="#79BE28" />
            <Bar dataKey="ongoing" name="Ongoing" stackId="training" fill="#38BDF8" />
            <Bar dataKey="pending" name="Not Yet Run" stackId="training" fill="#CBD5E1" radius={[0, 7, 7, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
