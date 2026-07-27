import { useCallback, useEffect, useState } from 'react';
import { employeeService } from '../services/employeeService';
import { trainingService } from '../services/trainingService';
import { auditService } from '../services/auditService';
import { competencyService } from '../services/competencyService';
import { budgetService } from '../services/budgetService';
import { tnaService } from '../services/tnaService';
import { documentService } from '../services/documentService';
import { settingsService } from '../services/settingsService';
import { calculateDashboardMetrics } from '../lib/calculations';

export function useDashboardData() {
  const [state, setState] = useState({ loading: true, error: false, data: null });
  const refresh = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: false }));
    try {
      const [employees, training, audits, competencies, budgets, tna, documents, settings] = await Promise.all([
        employeeService.getAll(), trainingService.getAll(), auditService.getAll(), competencyService.getAll(),
        budgetService.getAll(), tnaService.getAll(), documentService.getAll(), settingsService.get(),
      ]);
      setState({ loading: false, error: false, data: {
        employees, training, audits, competencies, budgets, tna, documents, settings,
        metrics: calculateDashboardMetrics({ employees, training, audits, competencies, budgets }),
      } });
    } catch (error) {
      console.error('Unable to load dashboard', error);
      setState({ loading: false, error: true, data: null });
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { ...state, refresh };
}
