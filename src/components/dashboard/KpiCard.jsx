export default function KpiCard({ label, value, icon: Icon, tone = 'blue' }) {
  const tones = { blue: 'bg-blue-50 text-brandBlue', red: 'bg-red-50 text-brandRed', green: 'bg-green-50 text-green-700', navy: 'bg-slate-100 text-navy' };
  return (
    <article className="card p-5">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={21} /></div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{value}</p>
    </article>
  );
}
