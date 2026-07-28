import { supabase } from '../lib/supabaseClient';
import { createCrudService } from './serviceFactory';

const crud = createCrudService('training_participations');

export const trainingParticipationService = {
  ...crud,
  async getDetailed() {
    const { data, error } = await supabase
      .from('training_participations')
      .select(`
        id,
        pre_test_score,
        post_test_score,
        result,
        employees (
          id,
          employee_number,
          full_name,
          function,
          position
        ),
        training_records (
          id,
          training_title,
          category,
          training_method,
          start_date,
          end_date,
          provider,
          tna_based
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
