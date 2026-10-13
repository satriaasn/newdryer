import { supabase } from "@/lib/supabaseClient";
import type { Production, DashboardStats } from "@/lib/types";
import { whatsappService } from "./whatsapp.service";
import { calculateProductionCostAndValueAdded, getDefaultCostRates } from "@/lib/cost-calculator";

function enrichProductionWithCost(p: any): Production {
  if (!p) return p;
  if (typeof p.total_cost === 'number' && p.total_cost > 0) {
    return p as Production;
  }
  const defaultRates = getDefaultCostRates(p.komoditas, p.komoditas?.name);
  const opsRate = typeof p.cost_operational_rate === 'number' ? p.cost_operational_rate : defaultRates.cost_operational;
  const laborRate = typeof p.cost_labor_rate === 'number' ? p.cost_labor_rate : defaultRates.cost_labor;
  const mgmtRate = typeof p.cost_management_rate === 'number' ? p.cost_management_rate : defaultRates.cost_management;

  const analysis = calculateProductionCostAndValueAdded({
    qty_before_ton: Number(p.qty_before) || 0,
    price_before_kg: Number(p.price_before) || 0,
    qty_after_ton: Number(p.qty_after) || 0,
    price_after_kg: Number(p.price_after) || 0,
    operational_rate: opsRate,
    labor_rate: laborRate,
    management_rate: mgmtRate,
  });

  return {
    ...p,
    cost_operational_rate: opsRate,
    cost_labor_rate: laborRate,
    cost_management_rate: mgmtRate,
    total_cost_operational: analysis.total_cost_operational,
    total_cost_labor: analysis.total_cost_labor,
    total_cost_management: analysis.total_cost_management,
    total_cost: analysis.total_cost,
    gross_value_diff: analysis.gross_value_diff,
    gross_value_diff_per_kg: analysis.gross_value_diff_per_kg,
    commodity_value_added_per_kg: analysis.commodity_value_added_per_kg,
    business_value_added: analysis.business_value_added,
    net_value_added: analysis.net_value_added,
    net_value_added_per_kg: analysis.net_value_added_per_kg,
  } as Production;
}

export const productionService = {
  async getAll(): Promise<Production[]> {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        *,
        dryer_units(*),
        gapoktan(
          *,
          desa(
            *,
            kecamatan(
              *,
              kabupaten(*)
            )
          )
        ),
        komoditas(*)
      `)
      .order('production_date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(enrichProductionWithCost) as Production[];
  },

  async getByGapoktan(gapoktanId: string): Promise<Production[]> {
    const { data, error } = await supabase
      .from('productions')
      .select('*, dryer_units(*), gapoktan(*, desa(*, kecamatan(*, kabupaten(*)))), komoditas(*)')
      .eq('gapoktan_id', gapoktanId)
      .order('production_date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(enrichProductionWithCost) as Production[];
  },

  async create(production: any): Promise<Production> {
    try {
      const { data, error } = await supabase
        .from('productions')
        .insert(production)
        .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
        .single();
      if (error) throw error;
      
      // Trigger WhatsApp notification if active
      whatsappService.sendProductionReport(data).catch(err => {
        console.warn("WhatsApp notification skipped:", err.message);
      });

      return enrichProductionWithCost(data);
    } catch (err: any) {
      // Fallback jika kolom biaya belum tersedia di tabel productions
      if (err.message?.includes('column') && (err.message?.includes('cost_') || err.message?.includes('value_'))) {
        const {
          cost_operational_rate, cost_labor_rate, cost_management_rate,
          total_cost_operational, total_cost_labor, total_cost_management,
          total_cost, gross_value_diff, net_value_added, net_value_added_per_kg,
          ...baseProduction
        } = production;

        const { data, error } = await supabase
          .from('productions')
          .insert(baseProduction)
          .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
          .single();
        if (error) throw new Error(error.message);

        whatsappService.sendProductionReport(data).catch(wErr => {
          console.warn("WhatsApp notification skipped:", wErr.message);
        });

        return enrichProductionWithCost(data);
      }
      throw new Error(err.message);
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const [gapoktanRes, dryerRes, prodRes, todayRes] = await Promise.all([
      supabase.from('gapoktan').select('id, desa(kecamatan(kabupaten_id))'),
      supabase.from('dryer_units').select('id', { count: 'exact', head: true }),
      supabase.from('productions').select('qty_before, qty_after, qty_diff_pct, price_diff_pct'),
      supabase.from('productions')
        .select('qty_before, qty_after')
        .eq('production_date', today),
    ]);

    const gapoktans = gapoktanRes.data || [];
    const productions = prodRes.data || [];
    const todayProductions = todayRes.data || [];
    
    // Calculate coverage Kabupaten
    const coverageKabSet = new Set();
    gapoktans.forEach((g: any) => {
      const kabId = g.desa?.kecamatan?.kabupaten_id;
      if (kabId) coverageKabSet.add(kabId);
    });

    const totalQtyBefore = productions.reduce((s: any, p: any) => s + Number(p.qty_before), 0);
    const totalQtyAfter = productions.reduce((s: any, p: any) => s + Number(p.qty_after || 0), 0);
    const todayQtyBefore = todayProductions.reduce((s: any, p: any) => s + Number(p.qty_before || 0), 0);
    const todayQtyAfter = todayProductions.reduce((s: any, p: any) => s + Number(p.qty_after || 0), 0);
    
    const avgQtyDiff = productions.length > 0
      ? productions.reduce((s: any, p: any) => s + Number(p.qty_diff_pct), 0) / productions.length
      : 0;
    const avgPriceDiff = productions.length > 0
      ? productions.reduce((s: any, p: any) => s + Number(p.price_diff_pct), 0) / productions.length
      : 0;

    return {
      totalGapoktan: gapoktans.length,
      totalDryers: dryerRes.count || 0,
      totalProductions: productions.length,
      todayProductions: todayProductions.length,
      avgQtyDiffPct: Math.round(avgQtyDiff * 100) / 100,
      avgPriceDiffPct: Math.round(avgPriceDiff * 100) / 100,
      totalQtyBefore,
      totalQtyAfter,
      todayQtyAfter: todayQtyBefore, // Using before as requested for 'tonase hari ini'
      coverageKabupaten: coverageKabSet.size,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('productions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async update(id: string, updates: Partial<Production>): Promise<Production> {
    try {
      const { data, error } = await supabase
        .from('productions')
        .update(updates)
        .eq('id', id)
        .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
        .single();
      if (error) throw error;
      return enrichProductionWithCost(data);
    } catch (err: any) {
      if (err.message?.includes('column') && (err.message?.includes('cost_') || err.message?.includes('value_'))) {
        const {
          cost_operational_rate, cost_labor_rate, cost_management_rate,
          total_cost_operational, total_cost_labor, total_cost_management,
          total_cost, gross_value_diff, net_value_added, net_value_added_per_kg,
          ...baseUpdates
        } = updates;
        const { data, error } = await supabase
          .from('productions')
          .update(baseUpdates)
          .eq('id', id)
          .select('*, dryer_units(*), gapoktan(*), komoditas(*)')
          .single();
        if (error) throw new Error(error.message);
        return enrichProductionWithCost(data);
      }
      throw new Error(err.message);
    }
  },
};
