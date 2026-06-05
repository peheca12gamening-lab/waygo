import { supabase } from '../supabase';
import type { Voucher } from '../../types';

export const getVouchers = async (userId: string): Promise<Voucher[]> => {
  const { data } = await supabase
    .from('user_vouchers')
    .select('*, vouchers!inner(*, businesses!inner(id, name))')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  return data ?? [];
};

export const redeemVoucher = async (voucherId: string, userId: string) => {
  const { data } = await supabase
    .from('user_vouchers')
    .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
    .eq('id', voucherId)
    .eq('user_id', userId)
    .select()
    .single();
  return data;
};
