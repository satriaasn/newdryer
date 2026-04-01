import { supabase } from "@/lib/supabaseClient";
import type { DryerUnit } from "@/lib/types";

export const dryerService = {
  async getAll(): Promise<DryerUnit[]> {
    const { data, error } = await supabase
      .from('dryer_units')
      .select('*, gapoktan(*, desa(*, kecamatan(*, kabupaten(*))))')
      .order('name');
    if (error) throw new Error(error.message);
    return data as DryerUnit[];
  },

  async getByGapoktan(gapoktanId: string): Promise<DryerUnit[]> {
    const { data, error } = await supabase
      .from('dryer_units')
      .select('*')
      .eq('gapoktan_id', gapoktanId)
      .order('name');
    if (error) throw new Error(error.message);
    return data as DryerUnit[];
  },

  async create(dryer: { name: string; gapoktan_id: string; capacity_ton?: number }): Promise<DryerUnit> {
    const { data, error } = await supabase
      .from('dryer_units')
      .insert(dryer)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as DryerUnit;
  },

  async update(id: string, updates: Partial<DryerUnit>): Promise<DryerUnit> {
    const { data, error } = await supabase
      .from('dryer_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as DryerUnit;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('dryer_units').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
