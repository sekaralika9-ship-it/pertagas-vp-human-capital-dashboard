import { useEffect, useMemo, useState } from 'react';
import { trainingService } from '../../services/trainingService';
import { budgetService } from '../../services/budgetService';
import { formatCurrency } from '../../lib/formatters';

export default function TrainingSpendByFunction() {
  const [records, setRecords] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    Promise.all([trainingService.getAll(), budgetService.getAll()])
      .then(([training, budgetRecords]) => {
        setRecords(training);
        setBudgets(budgetRecords);
      })
      .catch((error) => console.error('Unable to load function training spend', error));
  }, []);

  const data = useMemo(() => {
    const groups = new Map();
    records.filter((record) => record.status === 'completed' && Number(record.actual_cost || 0) > 0).forEach((record) => {
      const name = record.owner_function || 'Unspecified';
      const current = groups.get(name) || { name, hc: 0, function: 0, total: 0, programmes: 0 };
      current.hc += Number(record.hc_cost || 0);
      current.function += Number(record.function_cost || 0);
      current.total += Number(record.actual_cost || 0);
      current.programmes += 1;
      groups.set(name, current);
    });
    return [...groups.values()].sort((a, b) => b.total - a.total);
  }, [records]);

  const grandTotal = data.reduce((total, item) => total + item.total, 0);
  const recapTotal = budgets.reduce((total, item) => total + Number(item.used_amount || 0), 0);
  const difference = Math.abs(grandTotal - recapTotal);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <h2 className="font-bold text-navy">Training Budget Used by Function</h2>
          <p className="mt-1 text-sm text-muted">Actual completed-training expenditure grouped by its budget owner.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total used</p>
          <p className="mt-1 text-xl font-bold text-brandBlue">{formatCurrency(grandTotal)}</p>
        </div>
      </div>
      {data.length > 0 ? (
        <>
          {recapTotal > 0 && difference >= 1 && (
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900">
              Source reconciliation required: detailed programme costs differ from the Rekap Prognosa total by <strong>{formatCurrency(difference)}</strong>.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Function / Budget Owner</th><th>Programmes</th><th>HC Funded</th><th>Function Funded</th><th>Total Used</th></tr></thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.name}>
                    <td className="font-semibold text-ink">{item.name}</td>
                    <td>{item.programmes}</td>
                    <td>{formatCurrency(item.hc)}</td>
                    <td>{formatCurrency(item.function)}</td>
                    <td className="font-semibold text-brandBlue">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="p-6 text-sm text-muted">Re-import the approved realization workbook to populate spending by function.</p>
      )}
    </section>
  );
}
