import { supabase } from '../lib/supabaseClient';
import { settingsService } from './settingsService';

export const viewerDashboardService = {
  async get(year = null) {
    const [{ data, error }, settings] = await Promise.all([
      supabase.rpc('viewer_dashboard_summary', { p_year: year }),
      settingsService.get(),
    ]);
    if (error) throw error;
    return { ...data, settings };
  },
};
