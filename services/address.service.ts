import { supabase } from "@/lib/supabaseClient";
import type { Kabupaten, Kecamatan, Desa } from "@/lib/types";

export const addressService = {
  async getKabupaten(): Promise<Kabupaten[]> {
    const { data, error } = await supabase
      .from('kabupaten')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data as Kabupaten[];
  },

  async getKecamatan(kabupatenId?: string): Promise<Kecamatan[]> {
    let query = supabase
      .from('kecamatan')
      .select('*, kabupaten(*)')
      .order('name');
    if (kabupatenId) query = query.eq('kabupaten_id', kabupatenId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Kecamatan[];
  },

  async getDesa(kecamatanId?: string): Promise<Desa[]> {
    let query = supabase
      .from('desa')
      .select('*, kecamatan(*, kabupaten(*))')
      .order('name');
    if (kecamatanId) query = query.eq('kecamatan_id', kecamatanId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Desa[];
  },
};
