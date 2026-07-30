import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ChartShell from './ChartShell';

export default function VendorRealizationChart({ records = [] }) {
  const grouped = records.reduce((groups, record) => {
    const name = String(record.provider || '').trim();
    if (!name || record.status === 'cancelled') return groups;
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (!groups[key]) groups[key] = { name, completed: 0, ongoing: 0, planned: 0 };
    if (record.status === 'completed') groups[key].completed += 1;
    else if (record.status === 'ongoing') groups[key].ongoing += 1;
    else groups[key].planned += 1;
    return groups;
  }, {});
  const data = Object.values(grouped)
    .sort((a, b) => (b.completed + b.ongoing + b.planned) - (a.completed + a.ongoing + a.planned))
    .slice(0, 8);

  return (
    <ChartShell
      title="Vendor Training Realization"
      subtitle="Top providers by recorded programmes"
      empty={!data.length}
    >
      <div style={{ height: Math.max(300, data.length * 38) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 30, right: 15 }}>
            <CartesianGrid stroke="#E5EAF2" horizontal={false} />
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={145} axisLine={false} tickLine={false} fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="completed" name="Completed" stackId="vendor" fill="#79BE28" />
            <Bar dataKey="ongoing" name="Ongoing" stackId="vendor" fill="#38BDF8" />
            <Bar dataKey="planned" name="Planned" stackId="vendor" fill="#F59E0B" radius={[0, 7, 7, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
