"use client";

import { useEffect, useState } from "react";
import { userService, type Profile } from "@/services/user.service";
import { settingsService, type AppSettings } from "@/services/settings.service";
import { whatsappService, type WhatsAppSettings } from "@/services/whatsapp.service";
import { 
  User, 
  Settings, 
  Save, 
  Globe, 
  LayoutDashboard, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  BellRing,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    app_name: "Dashboard Monitoring Hibah Dryer",
    app_slogan: "Real-time oversight of national agricultural drying infrastructure",
    copyright: "© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved."
  });
  const [waSettings, setWaSettings] = useState<WhatsAppSettings>({
    api_key: "",
    target_number: "",
    is_active: false,
    send_on_input: true,
    send_daily_summary: false,
    daily_summary_time: "18:00",
    message_template: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      userService.getCurrentProfile(),
      settingsService.getSettings(),
      whatsappService.getSettings()
    ]).then(([p, s, wa]) => {
      setProfile(p);
      if (s) setSettings(s);
      if (wa) setWaSettings(wa);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await Promise.all([
        settingsService.updateSettings(settings),
        whatsappService.updateSettings(waSettings)
      ]);
      setMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWA = async () => {
    if (!waSettings.target_number || !waSettings.api_key) {
      alert("Masukkan Nomor Tujuan dan API Key terlebih dahulu.");
      return;
    }
    setTesting(true);
    try {
      const res = await whatsappService.sendTestMessage(waSettings.target_number, waSettings.api_key);
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.message);
      }
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Profil & Pengaturan</h1>
        <p className="text-muted-foreground font-medium">Kelola profil Anda dan konfigurasi branding aplikasi</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border p-6 shadow-sm border-t-4 border-t-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50" />
            
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-blue-300 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 ring-4 ring-background">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.full_name || 'Administrator'}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{profile?.role || 'Super Admin'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-dashed">
               <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">ID Profil</span>
                  <span className="font-mono text-foreground/70">{profile?.id?.substring(0, 8)}...</span>
               </div>
               <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Aktif
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
               <Settings className="h-6 w-6 text-primary" />
               <h2 className="text-lg font-bold">Branding Aplikasi</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 group-focus-within:text-primary transition-colors">Nama Aplikasi</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={settings.app_name}
                    onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                    placeholder="Contoh: Monitoring Dashboard"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 group-focus-within:text-primary transition-colors">Slogan Aplikasi</label>
                <textarea 
                   value={settings.app_slogan}
                   onChange={(e) => setSettings({...settings, app_slogan: e.target.value})}
                   rows={3}
                   className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
                   placeholder="Tuliskan slogan pendek di bawah nama aplikasi"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 group-focus-within:text-primary transition-colors">Copyright Footer</label>
                <input 
                  type="text" 
                  value={settings.copyright}
                  onChange={(e) => setSettings({...settings, copyright: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm italic"
                  placeholder="© 2026 Contoh Kementerian"
                />
              </div>

              {message && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300",
                  message.type === 'success' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                )}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <span className="text-sm font-bold tracking-tight">{message.text}</span>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {saving ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>
          </div>

          {/* WhatsApp Integration Block */}
          <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50" />
            
            <div className="flex items-center justify-between gap-3 mb-8 border-b pb-4 relative z-10">
               <div className="flex items-center gap-3">
                 <MessageSquare className="h-6 w-6 text-emerald-500" />
                 <h2 className="text-lg font-bold">Integrasi WhatsApp (Automatic Report)</h2>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{waSettings.is_active ? 'Aktif' : 'Nonaktif'}</span>
                 <button 
                   onClick={() => setWaSettings({...waSettings, is_active: !waSettings.is_active})}
                   className={cn(
                     "w-12 h-6 rounded-full transition-all relative ring-4 ring-background shadow-inner",
                     waSettings.is_active ? "bg-emerald-500" : "bg-muted"
                   )}
                 >
                   <div className={cn(
                     "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                     waSettings.is_active ? "left-7" : "left-1"
                   )} />
                 </button>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">WA Gateway API Key (Fonnté)</label>
                  <input 
                    type="password" 
                    value={waSettings.api_key || ""}
                    onChange={(e) => setWaSettings({...waSettings, api_key: e.target.value})}
                    placeholder="Masukkan API Key..."
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Nomor WA Atasan (628...)</label>
                  <input 
                    type="text" 
                    value={waSettings.target_number || ""}
                    onChange={(e) => setWaSettings({...waSettings, target_number: e.target.value})}
                    placeholder="628123456789"
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-emerald-500/20 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 italic">
                   <BellRing className="h-4 w-4 text-emerald-500" /> Kapan Laporan Dikirim?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-background rounded-xl border cursor-pointer hover:bg-muted/30 transition-all">
                    <input 
                      type="checkbox" 
                      checked={waSettings.send_on_input} 
                      onChange={(e) => setWaSettings({...waSettings, send_on_input: e.target.checked})}
                      className="h-4 w-4 rounded-full accent-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">Setiap Input Data</span>
                      <span className="text-[10px] text-muted-foreground italic">Kirim WA Real-time setelah operator simpan data.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-background rounded-xl border cursor-pointer hover:bg-muted/30 transition-all">
                    <input 
                      type="checkbox" 
                      checked={waSettings.send_daily_summary} 
                      onChange={(e) => setWaSettings({...waSettings, send_daily_summary: e.target.checked})}
                      className="h-4 w-4 rounded-full accent-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">Ringkasan Harian (Scheduled)</span>
                      <span className="text-[10px] text-muted-foreground italic">Kirim 1 WA berisi total produksi hari ini.</span>
                    </div>
                  </label>
                </div>
                {waSettings.send_daily_summary && (
                  <div className="flex items-center gap-3 px-1 animate-in slide-in-from-top-2 duration-300">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Jam Pengiriman:</span>
                    <input 
                      type="time" 
                      value={waSettings.daily_summary_time}
                      onChange={(e) => setWaSettings({...waSettings, daily_summary_time: e.target.value})}
                      className="bg-background border rounded-lg px-2 py-1 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-xs"
                >
                  {saving ? <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" /> : <Save className="h-4 w-4" />}
                  Simpan Konfigurasi WA
                </button>
                <button 
                  type="button"
                  onClick={handleTestWA}
                  disabled={testing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-background border border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all text-xs"
                >
                  {testing ? <div className="animate-spin h-3 w-3 border-b-2 border-emerald-500 rounded-full" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
