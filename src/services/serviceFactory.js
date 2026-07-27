import { supabase } from '../lib/supabaseClient';

export const createCrudService = (table, defaultOrder = 'created_at') => ({
  async getAll(filters = {}) {
    let query = supabase.from(table).select('*').order(defaultOrder, { ascending: false });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async getById(id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(values) {
    const { data, error } = await supabase.from(table).insert(values).select().single();
    if (error) throw error;
    return data;
  },
  async createMany(values) {
    if (!values.length) return [];
    const { data, error } = await supabase.from(table).insert(values).select();
    if (error) throw error;
    return data || [];
  },
  async update(id, values) {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
  async search(term, columns = []) {
    let query = supabase.from(table).select('*').order(defaultOrder, { ascending: false });
    if (term && columns.length) query = query.or(columns.map((column) => `${column}.ilike.%${term}%`).join(','));
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
});
