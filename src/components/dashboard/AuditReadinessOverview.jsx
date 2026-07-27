import ChartShell from './ChartShell';

export default function AuditReadinessOverview({ records }) {
  const groups = records.reduce((all, item) => {
    if (item.score === null || item.score === undefined || !item.function) return all;
    all[item.function] ||= [];
    all[item.function].push(Number(item.score));
    return all;
  }, {});
  const data = Object.entries(groups).map(([name, scores]) => ({ name, score: scores.reduce((a, b) => a + b, 0) / scores.length })).sort((a, b) => b.score - a.score);
  return (
    <ChartShell title="Audit Readiness Overview" subtitle="Average readiness score by function" empty={!data.length}>
      <div className="space-y-4">{data.map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-ink">{item.name}</span><span className="text-muted">{Math.round(item.score)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brandGreen" style={{ width: `${Math.min(100, item.score)}%` }} /></div></div>)}</div>
    </ChartShell>
  );
}
