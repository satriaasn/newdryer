import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface AppSettings {
  id?: number;
  app_name: string;
  app_slogan: string;
  copyright: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  app_name: "Dashboard Monitoring Hibah Dryer",
  app_slogan: "Real-time oversight of national agricultural drying infrastructure",
  copyright: "© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved."
};

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.warn("Settings not found or error, using defaults:", error?.message);
      return DEFAULT_SETTINGS;
    }

    return data;
  },

  async updateSettings(settings: Partial<AppSettings>) {
    const supabase = createClientComponentClient();
    
    // Check if ID 1 exists
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('id', 1)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create it if it doesn't exist
      const { data, error } = await supabase
        .from('app_settings')
        .insert([{ id: 1, ...DEFAULT_SETTINGS, ...settings }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
