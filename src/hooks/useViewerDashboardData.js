import { useCallback, useEffect, useState } from 'react';
import { viewerDashboardService } from '../services/viewerDashboardService';

export function useViewerDashboardData(year) {
  const [state, setState] = useState({ loading: true, error: false, data: null });

  const refresh = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: false }));
    try {
      const data = await viewerDashboardService.get(year);
      setState({ loading: false, error: false, data });
    } catch (error) {
      console.error('Unable to load viewer dashboard', error);
      setState({ loading: false, error: true, data: null });
    }
  }, [year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
