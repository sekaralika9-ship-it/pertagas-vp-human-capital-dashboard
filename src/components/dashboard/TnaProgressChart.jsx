import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ChartShell from './ChartShell';

export default function TnaProgressChart({ records = [], summary }) {
  const grouped = records.reduce((all, item) => {
    if (!item.function || item.status === 'cancelled') return all;
    if (!all[item.function]) all[item.function] = { name: item.function, completed: 0, inProgress: 0, pending: 0 };
    if (item.status === 'completed') all[item.function].completed += 1;
    else if (item.status === 'in_progress') all[item.function].inProgress += 1;
    else all[item.function].pending += 1;
    return all;
  }, {});
  const data = summary
    ? summary.map((item) => ({ name: item.name, total: item.value }))
    : Object.values(grouped).sort((a, b) =>
      (b.completed + b.inProgress + b.pending) - (a.completed + a.inProgress + a.pending));
  const byFunction = !summary;
  return (
    <ChartShell
      title={byFunction ? 'TNA Progress by Function' : 'TNA Progress by Category'}
      subtitle={byFunction ? 'Completed, in-progress, and pending needs per function' : 'Recorded needs by competency category'}
      empty={!data.length}
    >
      <div style={{ height: Math.max(288, data.length * 34) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 15 }}>
            <CartesianGrid stroke="#E5EAF2" horizontal={false} />
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={125} axisLine={false} tickLine={false} fontSize={11} />
            <Tooltip />
            {byFunction ? (
              <>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="Completed" stackId="tna" fill="#79BE28" radius={[0, 0, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" stackId="tna" fill="#38BDF8" />
                <Bar dataKey="pending" name="Pending" stackId="tna" fill="#F59E0B" radius={[0, 7, 7, 0]} />
              </>
            ) : <Bar dataKey="total" name="Needs" fill="#155EEF" radius={[0, 7, 7, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
