import { supabase } from '../lib/supabaseClient';

export const settingsService = {
  async get() {
    const { data, error } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },
  async update(id, values) {
    const query = id
      ? supabase.from('app_settings').update(values).eq('id', id)
      : supabase.from('app_settings').insert(values);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },
};
