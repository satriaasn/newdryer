import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface WhatsAppSettings {
  id?: number;
  api_key: string | null;
  target_number: string | null;
  is_active: boolean;
  send_on_input: boolean;
  send_daily_summary: boolean;
  daily_summary_time: string;
  message_template: string;
}

const DEFAULT_WA_SETTINGS: WhatsAppSettings = {
  api_key: null,
  target_number: null,
  is_active: false,
  send_on_input: true,
  send_daily_summary: false,
  daily_summary_time: '18:00',
  message_template: 'Laporan Produksi: {{gapoktan}} baru saja mengolah {{qty}} Ton {{komoditas}}. [Catatan: {{notes}}]'
};

export const whatsappService = {
  async getSettings(): Promise<WhatsAppSettings> {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.warn("WhatsApp settings not found, using defaults:", error?.message);
      return DEFAULT_WA_SETTINGS;
    }

    return data;
  },

  async updateSettings(settings: Partial<WhatsAppSettings>) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('whatsapp_settings')
      .upsert({ 
        id: 1, 
        ...settings, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async sendTestMessage(target: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('message', 'Halo! Ini adalah pesan ujicoba sistem laporan AgroDryer. Jika pesan ini sampai, berarti pengaturan WA Gateway Anda sudah benar.');
      formData.append('countryCode', '62');

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': apiKey.trim(),
        },
        body: formData,
      });

      const resData = await response.json();
      if (resData.status === true) {
        return { success: true, message: 'Pesan ujicoba berhasil dikirim!' };
      } else {
        return { success: false, message: 'Gagal mengirim: ' + (resData.reason || 'Cek kembali API Key dan Nomor Tujuan.') };
      }
    } catch (err: any) {
      return { success: false, message: 'Error: ' + err.message };
    }
  },

  async sendProductionReport(p: any): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.is_active || !settings.send_on_input || !settings.api_key || !settings.target_number) {
        return false;
      }

      // Format message from template - using replaceAll for reliability
      let message = (settings.message_template || "")
        .replaceAll('{{gapoktan}}', p.gapoktan?.name || '-')
        .replaceAll('{{qty}}', Number(p.qty_after || p.qty_before).toFixed(1))
        .replaceAll('{{komoditas}}', p.komoditas?.name || '-')
        .replaceAll('{{notes}}', p.notes || '-');

      const formData = new FormData();
      formData.append('target', settings.target_number);
      formData.append('message', message);
      formData.append('countryCode', '62');

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': settings.api_key.trim(),
        },
        body: formData,
      });

      const resData = await response.json();
      return resData.status === true;
    } catch (err) {
      console.error("WhatsApp failed to send:", err);
      return false;
    }
  }
};
