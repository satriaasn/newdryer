import { supabase } from "@/lib/supabaseClient";
import type { Production, DashboardStats } from "@/lib/types";

export const productionService = {
  async getAll(): Promise<Production[]> {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        *,
        dryer_units(*),
        gapoktan(
          *,
          desa(*)
        ),
        komoditas(*)
      `)
      .order('production_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Production[];
  },

  async getByGapoktan(gapoktanId: string): Promise<Production[]> {
    const { data, error } = await supabase
      .from('productions')
      .select('*, dryer_units(*), gapoktan(*, desa(*, kecamatan(*, kabupaten(*)))), komoditas(*)')
      .eq('gapoktan_id', gapoktanId)
      .order('production_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Production[];
  },

  async create(production: {
    dryer_id: string;
    gapoktan_id: string;
    komoditas_id: string;
    qty_before: number;
    price_before: number;
    qty_after: number;
    price_after: number;
    production_date: string;
    notes?: string;
  }): Promise<Production> {
    const { data, error } = await supabase
      .from('productions')
      .insert(production)
      .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as Production;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const [gapoktanRes, dryerRes, prodRes, todayRes] = await Promise.all([
      supabase.from('gapoktan').select('id', { count: 'exact', head: true }),
      supabase.from('dryer_units').select('id', { count: 'exact', head: true }),
      supabase.from('productions').select('qty_before, qty_after, qty_diff_pct, price_diff_pct'),
      supabase.from('productions').select('qty_after').eq('production_date', today),
    ]);

    const productions = prodRes.data || [];
    const todayProductions = todayRes.data || [];
    
    const totalQtyBefore = productions.reduce((s, p) => s + Number(p.qty_before), 0);
    const totalQtyAfter = productions.reduce((s, p) => s + Number(p.qty_after), 0);
    const todayQtyAfter = todayProductions.reduce((s, p) => s + Number(p.qty_after), 0);
    
    const avgQtyDiff = productions.length > 0
      ? productions.reduce((s, p) => s + Number(p.qty_diff_pct), 0) / productions.length
      : 0;
    const avgPriceDiff = productions.length > 0
      ? productions.reduce((s, p) => s + Number(p.price_diff_pct), 0) / productions.length
      : 0;

    return {
      totalGapoktan: gapoktanRes.count || 0,
      totalDryers: dryerRes.count || 0,
      totalProductions: productions.length,
      todayProductions: todayProductions.length,
      avgQtyDiffPct: Math.round(avgQtyDiff * 100) / 100,
      avgPriceDiffPct: Math.round(avgPriceDiff * 100) / 100,
      totalQtyBefore,
      totalQtyAfter,
      todayQtyAfter,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('productions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async update(id: string, updates: Partial<Production>): Promise<Production> {
    const { data, error } = await supabase
      .from('productions')
      .update(updates)
      .eq('id', id)
      .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as Production;
  },
};
