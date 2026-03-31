import { supabase } from "@/lib/supabaseClient";
import { ProductionLogSchema, BatchSchema } from "@/lib/validators";
import { z } from "zod";

export type ProductionLog = z.infer<typeof ProductionLogSchema>;
export type Batch = z.infer<typeof BatchSchema>;

export const productionService = {
  /**
   * Mengambil log produksi dengan filter opsional
   */
  async getProductionLogs(filters: {
    dryerId?: string;
    batchId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ProductionLog[]> {
    let query = supabase
      .from('production_logs')
      .select('*')
      .order('logged_at', { ascending: false });

    if (filters.dryerId) query = query.eq('dryer_id', filters.dryerId);
    if (filters.batchId) query = query.eq('batch_id', filters.batchId);
    if (filters.startDate) query = query.gte('logged_at', filters.startDate);
    if (filters.endDate) query = query.lte('logged_at', filters.endDate);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;

    if (error) {
      console.error('Gagal mengambil data log produksi:', error);
      throw new Error(error.message);
    }
    return data as ProductionLog[];
  },

  /**
   * Mengambil batch yang sedang aktif
   */
  async getActiveBatches(): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('is_active', true)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data batch aktif:', error);
      throw new Error(error.message);
    }
    return data as Batch[];
  },

  /**
   * Membuat log produksi baru (Biasanya dimasukkan oleh edge functions/gateway)
   */
  async logProduction(log: z.infer<typeof ProductionLogSchema>): Promise<ProductionLog> {
    const { data, error } = await supabase
      .from('production_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      console.error('Gagal mencatat data produksi:', error);
      throw new Error(error.message);
    }
    return data as ProductionLog;
  },

  /**
   * Memulai batch baru
   */
  async startBatch(dryerId: string, batchNumber: string): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .insert({
        dryer_id: dryerId,
        batch_number: batchNumber,
        is_active: true,
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Gagal memulai batch:', error);
      throw new Error(error.message);
    }
    return data as Batch;
  },

  /**
   * Berlangganan pembaharuan log produksi secara real-time
   */
  subscribeToLiveLogs(callback: (payload: any) => void) {
    return supabase
      .channel('production_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'production_logs' },
        callback
      )
      .subscribe();
  }
};
