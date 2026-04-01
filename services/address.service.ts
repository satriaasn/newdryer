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

  async createKabupaten(name: string): Promise<Kabupaten> {
    const { data, error } = await supabase.from('kabupaten').insert({ name }).select().single();
    if (error) throw new Error(error.message);
    return data as Kabupaten;
  },

  async updateKabupaten(id: string, name: string): Promise<Kabupaten> {
    const { data, error } = await supabase.from('kabupaten').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Kabupaten;
  },

  async deleteKabupaten(id: string): Promise<void> {
    const { error } = await supabase.from('kabupaten').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createKecamatan(name: string, kabupatenId: string): Promise<Kecamatan> {
    const { data, error } = await supabase.from('kecamatan').insert({ name, kabupaten_id: kabupatenId }).select().single();
    if (error) throw new Error(error.message);
    return data as Kecamatan;
  },

  async updateKecamatan(id: string, name: string): Promise<Kecamatan> {
    const { data, error } = await supabase.from('kecamatan').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Kecamatan;
  },

  async deleteKecamatan(id: string): Promise<void> {
    const { error } = await supabase.from('kecamatan').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createDesa(name: string, kecamatanId: string): Promise<Desa> {
    const { data, error } = await supabase.from('desa').insert({ name, kecamatan_id: kecamatanId }).select().single();
    if (error) throw new Error(error.message);
    return data as Desa;
  },

  async updateDesa(id: string, name: string): Promise<Desa> {
    const { data, error } = await supabase.from('desa').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Desa;
  },

  async deleteDesa(id: string): Promise<void> {
    const { error } = await supabase.from('desa').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
