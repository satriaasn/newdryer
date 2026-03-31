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

  async create(gapoktan: { name: string; desa_id: string; ketua?: string; phone?: string }): Promise<Gapoktan> {
    const { data, error } = await supabase
      .from('gapoktan')
      .insert(gapoktan)
      .select()
      .single();
    if (error) throw new Error(error.message);
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
};
