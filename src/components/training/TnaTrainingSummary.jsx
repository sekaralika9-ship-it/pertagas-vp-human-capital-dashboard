import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { trainingService } from '../../services/trainingService';
import { formatCurrency, formatDate } from '../../lib/formatters';

export default function TnaTrainingSummary() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    trainingService.getAll()
      .then(setRecords)
      .catch((error) => console.error('Unable to load TNA training summary', error));
  }, []);

  const completed = useMemo(
    () => records.filter((record) => record.tna_based && record.status === 'completed'),
    [records],
  );
  const participants = completed.reduce((total, record) => total + Number(record.participant_count || 0), 0);
  const used = completed.reduce((total, record) => total + Number(record.actual_cost || 0), 0);

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-border p-5 md:p-6">
        <h2 className="font-bold text-navy">Completed Training Based on TNA</h2>
        <p className="mt-1 text-sm text-muted">Completed Learning Priority programmes matched to the approved TNA plan.</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 md:p-6">
        <Summary icon={CheckCircle2} label="Completed programmes" value={completed.length} />
        <Summary icon={Users} label="Recorded participants" value={participants} tone="green" />
        <Summary icon={GraduationCap} label="Budget used" value={formatCurrency(used)} tone="navy" />
      </div>
      {completed.length > 0 && (
        <div className="overflow-x-auto border-t border-border">
          <table className="data-table">
            <thead><tr><th>Training</th><th>Function</th><th>Date</th><th>Participants</th><th>Used Budget</th></tr></thead>
            <tbody>
              {completed.map((record) => (
                <tr key={record.id}>
                  <td className="font-medium text-ink">{record.training_title}</td>
                  <td>{record.owner_function}</td>
                  <td>{formatDate(record.start_date)}</td>
                  <td>{record.participant_count}</td>
                  <td>{formatCurrency(record.actual_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Summary({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    green: 'bg-green-50 text-green-700',
    navy: 'bg-slate-100 text-navy',
  };
  return (
    <article className="rounded-xl border border-border bg-white p-4">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={18} /></div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-navy">{value}</p>
    </article>
  );
}
