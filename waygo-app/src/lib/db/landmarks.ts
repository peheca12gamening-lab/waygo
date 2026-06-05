import { supabase } from '../supabase';
import type { Landmark } from '../../types';

export const getLandmarks = async (): Promise<Landmark[]> => {
  const { data } = await supabase
    .from('landmarks')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return (data ?? []) as Landmark[];
};

export const getLandmarkById = async (id: string): Promise<Landmark | null> => {
  const { data } = await supabase
    .from('landmarks')
    .select('*')
    .eq('id', id)
    .single();
  return data as Landmark | null;
};
