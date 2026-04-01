import { supabase } from "@/lib/supabaseClient";
import type { Gapoktan, GapoktanKomoditas, Komoditas } from "@/lib/types";

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
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data as Komoditas[];
  },

  async getKomoditasByGapoktan(gapoktanId: string): Promise<Komoditas[]> {
    const { data, error } = await supabase
      .from('gapoktan_komoditas')
      .select('komoditas(*)')
      .eq('gapoktan_id', gapoktanId);
    if (error) throw new Error(error.message);
    return (data || []).map((gk: any) => gk.komoditas) as Komoditas[];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('gapoktan').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createKomoditas(name: string): Promise<Komoditas> {
    const { data, error } = await supabase.from('komoditas').insert({ name }).select().single();
    if (error) throw new Error(error.message);
    return data as Komoditas;
  },

  async updateKomoditas(id: string, name: string): Promise<Komoditas> {
    const { data, error } = await supabase.from('komoditas').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Komoditas;
  },

  async deleteKomoditas(id: string): Promise<void> {
    const { error } = await supabase.from('komoditas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
