import { supabase } from "@/lib/supabaseClient";
import type { Gapoktan, GapoktanKomoditas, Komoditas, CommodityTarget } from "@/lib/types";

export const gapoktanService = {
  async getAll(): Promise<Gapoktan[]> {
    const { data, error } = await supabase
      .from('gapoktan')
      .select('*, desa(*, kecamatan(*, kabupaten(*))), gapoktan_komoditas(*, komoditas(*)), dryer_units(*)')
      .order('name');
    if (error) throw new Error(error.message);
    return (data || []).map((g: any) => ({
      ...g,
      komoditas: g.gapoktan_komoditas?.map((gk: any) => gk.komoditas) || [],
    }));
  },

  async getById(id: string): Promise<Gapoktan | null> {
    const { data, error } = await supabase
      .from('gapoktan')
      .select('*, desa(*, kecamatan(*, kabupaten(*))), gapoktan_komoditas(*, komoditas(*)), dryer_units(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return {
      ...data,
      komoditas: data.gapoktan_komoditas?.map((gk: any) => gk.komoditas) || [],
    } as Gapoktan;
  },

  async create(gapoktan: any): Promise<Gapoktan> {
    const { komoditas_ids, ...rest } = gapoktan;
    const { data, error } = await supabase
      .from('gapoktan')
      .insert(rest)
      .select()
      .single();
    if (error) throw new Error(error.message);
    
    if (komoditas_ids && Array.isArray(komoditas_ids) && komoditas_ids.length > 0) {
      const links = komoditas_ids.map((kid: string) => ({ 
        gapoktan_id: data.id, 
        komoditas_id: kid 
      }));
      await supabase.from('gapoktan_komoditas').insert(links);
    }
    
    return data as Gapoktan;
  },

  async update(id: string, updates: any): Promise<Gapoktan> {
    const { komoditas_ids, ...rest } = updates;
    const { data, error } = await supabase
      .from('gapoktan')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (komoditas_ids !== undefined && Array.isArray(komoditas_ids)) {
      // Sync komoditas: first remove then add
      await supabase.from('gapoktan_komoditas').delete().eq('gapoktan_id', id);
      if (komoditas_ids.length > 0) {
        const links = komoditas_ids.map((kid: string) => ({ 
          gapoktan_id: id, 
          komoditas_id: kid 
        }));
        await supabase.from('gapoktan_komoditas').insert(links);
      }
    }

    return data as Gapoktan;
  },

  async addKomoditas(gapoktanId: string, komoditasId: string): Promise<void> {
    const { error } = await supabase
      .from('gapoktan_komoditas')
      .insert({ gapoktan_id: gapoktanId, komoditas_id: komoditasId });
    if (error) throw new Error(error.message);
  },

  async removeKomoditas(gapoktanId: string, komoditasId: string): Promise<void> {
    const { error } = await supabase
      .from('gapoktan_komoditas')
      .delete()
      .eq('gapoktan_id', gapoktanId)
      .eq('komoditas_id', komoditasId);
    if (error) throw new Error(error.message);
  },

  async getAllKomoditas(): Promise<Komoditas[]> {
    const { data, error } = await supabase
      .from('komoditas')
      .select('*, commodity_targets(*)')
      .order('name');
    if (error) throw new Error(error.message);
    return data as Komoditas[];
  },

  async getKomoditasByGapoktan(gapoktanId: string): Promise<Komoditas[]> {
    const { data, error } = await supabase
      .from('gapoktan_komoditas')
      .select('komoditas(*, commodity_targets(*))')
      .eq('gapoktan_id', gapoktanId);
    if (error) throw new Error(error.message);
    return (data || []).map((gk: any) => gk.komoditas) as Komoditas[];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('gapoktan').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createKomoditas(params: {
    name: string;
    target_monthly?: number;
    cost_operational?: number;
    cost_labor?: number;
    cost_management?: number;
  }): Promise<Komoditas> {
    try {
      const { data, error } = await supabase.from('komoditas').insert(params).select().single();
      if (error) throw error;
      return data as Komoditas;
    } catch (err: any) {
      if (err.message?.includes('column') && err.message?.includes('cost_')) {
        const { data, error } = await supabase
          .from('komoditas')
          .insert({ name: params.name, target_monthly: params.target_monthly })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Komoditas;
      }
      throw new Error(err.message);
    }
  },

  async updateKomoditas(params: {
    id: string;
    name: string;
    target_monthly?: number;
    cost_operational?: number;
    cost_labor?: number;
    cost_management?: number;
  }): Promise<Komoditas> {
    try {
      const { id, ...rest } = params;
      const { data, error } = await supabase.from('komoditas').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Komoditas;
    } catch (err: any) {
      if (err.message?.includes('column') && err.message?.includes('cost_')) {
        const { data, error } = await supabase
          .from('komoditas')
          .update({ name: params.name, target_monthly: params.target_monthly })
          .eq('id', params.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data as Komoditas;
      }
      throw new Error(err.message);
    }
  },

  async deleteKomoditas(id: string): Promise<void> {
    const { error } = await supabase.from('komoditas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async saveCommodityTarget(komoditas_id: string, period: string, target_ton: number): Promise<CommodityTarget> {
    const { data, error } = await supabase
      .from('commodity_targets')
      .upsert({ komoditas_id, period, target_ton })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CommodityTarget;
  },

  async deleteCommodityTarget(id: string): Promise<void> {
    const { error } = await supabase.from('commodity_targets').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
