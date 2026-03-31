import { supabase } from "@/lib/supabaseClient";
import { DryerUnitSchema, CreateDryerSchema } from "@/lib/validators";
import { z } from "zod";

export type DryerUnit = z.infer<typeof DryerUnitSchema>;

export const dryerService = {
  /**
   * Fetch all dryer units
   */
  async getDryerUnits(): Promise<DryerUnit[]> {
    const { data, error } = await supabase
      .from('dryer_units')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Gagal mengambil data unit pengering:', error);
      throw new Error(error.message);
    }
    return data as DryerUnit[];
  },

  /**
   * Update a dryer unit
   */
  async updateDryer(id: string, updates: Partial<DryerUnit>): Promise<DryerUnit> {
    const { data, error } = await supabase
      .from('dryer_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Gagal memperbarui unit pengering ${id}:`, error);
      throw new Error(error.message);
    }
    return data as DryerUnit;
  },

  /**
   * Create a new dryer unit (Admin only)
   */
  async createDryer(dryer: z.infer<typeof CreateDryerSchema>): Promise<DryerUnit> {
    const { data, error } = await supabase
      .from('dryer_units')
      .insert(dryer)
      .select()
      .single();

    if (error) {
      console.error('Gagal membuat unit pengering baru:', error);
      throw new Error(error.message);
    }
    return data as DryerUnit;
  },

  /**
   * Berlangganan perubahan status unit pengering secara real-time
   */
  subscribeToDryerUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('dryer_units_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dryer_units' },
        callback
      )
      .subscribe();
  }
};
