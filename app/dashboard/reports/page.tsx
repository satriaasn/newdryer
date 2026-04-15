"use client";

import { useEffect, useState } from "react";
import { whatsappService, type WhatsAppSettings } from "@/services/whatsapp.service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Factory, 
  CheckCircle2, 
  AlertCircle,
  X,
  ClipboardList,
  Edit3,
  Copy,
  Settings2,
  LayoutList,
  Hash,
  CalendarDays,
  PieChart,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WhatsAppReportingPage() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'log' | 'manual' | 'daily'>('log');
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [waSettings, setWaSettings] = useState<WhatsAppSettings | null>(null);
  
  // Specific for Log Selection
  const [selectedProd, setSelectedProd] = useState<any | null>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  
  // Specific for Manual/Daily Tab
  const [manualMessage, setManualMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [recapDate, setRecapDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-generate recap when switching to daily tab or when productions change
  useEffect(() => {
    if (activeTab === 'daily' && productions.length > 0) {
      generateDailyRecap(productions, recapDate);
    }
  }, [activeTab, productions.length]);

  const loadData = async () => {
    setLoading(true);
    const [prodRes, settingsRes] = await Promise.all([
      supabase
        .from('productions')
        .select(`
          *,
          gapoktan (id, name, address),
          komoditas (id, name),
          dryer_units (id, name)
        `)
        .order('production_date', { ascending: false })
        .limit(500),
      whatsappService.getSettings()
    ]);
    
    const prods = prodRes.data || [];
    setProductions(prods);
    if (settingsRes) {
      const defaultTemplate = "📋 *LAPORAN PRODUKSI*\n\nGapoktan: {{gapoktan}}\nKomoditas: {{komoditas}}\nVolume: {{qty}} Ton\nCatatan: {{notes}}\n\n_Dikirim otomatis dari Dashboard Monitoring Dryer_";
      setWaSettings({
        ...settingsRes,
        message_template: settingsRes.message_template || defaultTemplate
      });
      setManualMessage(settingsRes.message_template || defaultTemplate);
    }
    setLoading(false);
    return prods;
  };

  const handleOpenPreview = (p: any) => {
    setSelectedProd(p);
    if (!waSettings) return;
    
    // Fix: Use replaceAll for multiple occurrences
    let msg = (waSettings.message_template || "")
      .replaceAll('{{gapoktan}}', p.gapoktan?.name || '-')
      .replaceAll('{{qty}}', Number(p.qty_after || p.qty_before).toFixed(1))
      .replaceAll('{{komoditas}}', p.komoditas?.name || '-')
      .replaceAll('{{notes}}', p.notes || '-');
    
    setPreviewMessage(msg);
    setFeedback(null);
  };

  const generateDailyRecap = (freshData?: any[], selectedDate?: string) => {
    const data = freshData || productions;
    const targetDate = selectedDate || recapDate;
    // Use startsWith to handle dates like "2026-04-15T00:00:00+00:00" or "2026-04-15"
    const dateProds = data.filter(p => {
      const pd = (p.production_date || "").substring(0, 10);
      return pd === targetDate;
    });

    // Format date to Indonesian: "15 Apr 2026"
    const dateObj = new Date(targetDate + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    if (dateProds.length === 0) {
      setManualMessage(`Tidak ada data produksi untuk tanggal ${formattedDate}.`);
      return;
    }

    const totalQty = dateProds.reduce((acc, p) => acc + Number(p.qty_after || p.qty_before || 0), 0);
    const commodities = Array.from(new Set(dateProds.map(p => p.komoditas?.name))).filter(Boolean);
    const activeUnits = Array.from(new Set(dateProds.map(p => p.dryer_units?.name))).filter(Boolean);
    
    const commBreakdown = commodities.map(c => {
      const cProds = dateProds.filter(p => p.komoditas?.name === c);
      const cQty = cProds.reduce((acc, p) => acc + Number(p.qty_after || p.qty_before || 0), 0);
      return `- ${c}: ${cQty.toFixed(1)} Ton (${cProds.length} Batch)`;
    }).join('\n');

    const message = `REKAP PRODUKSI HARIAN (${formattedDate})\n` +
      `----------------------------------\n` +
      `Total Produksi: ${dateProds.length} Batch\n` +
      `Total Volume: ${totalQty.toFixed(1)} Ton\n\n` +
      `Rincian per Komoditas:\n${commBreakdown}\n\n` +
      `Unit Aktif: ${activeUnits.join(', ')}.\n` +
      `----------------------------------`;

    setManualMessage(message);
    setFeedback(null);
  };

  const handleSendAction = async (msg: string, isFromTab: boolean = false) => {
    if (!waSettings?.api_key || !waSettings?.target_number) {
      setFeedback({ type: 'error', text: 'Konfigurasi WA belum lengkap (API Key/Nomor Tujuan).' });
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('target', waSettings.target_number);
      formData.append('message', msg);
      formData.append('countryCode', '62');

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': waSettings.api_key.trim(),
        },
        body: formData,
      });

      const resData = await response.json();
      if (resData.status === true) {
        setFeedback({ type: 'success', text: 'Pesan berhasil dikirim ke WhatsApp!' });
        if (!isFromTab) setTimeout(() => setSelectedProd(null), 1500);
      } else {
        setFeedback({ type: 'error', text: 'Gagal mengirim: ' + (resData.reason || 'Cek koneksi API.') });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Error: ' + err.message });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!waSettings) return;
    setSavingTemplate(true);
    try {
      await whatsappService.updateSettings({ message_template: waSettings.message_template });
      setFeedback({ type: 'success', text: 'Template berhasil diperbarui!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Gagal menyimpan template: ' + err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Pesan disalin!");
  };

  const refreshData = async (dateOverride?: string) => {
    try {
      const freshProds = await loadData();
      generateDailyRecap(freshProds, dateOverride);
      setFeedback({ type: 'success', text: 'Data berhasil dimuat!' });
      setTimeout(() => setFeedback(null), 2000);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Gagal memuat data terbaru.' });
    }
  };

  const handleDateChange = (newDate: string) => {
    setRecapDate(newDate);
    generateDailyRecap(undefined, newDate);
  };

  const filtered = productions.filter(p => 
    p.gapoktan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.komoditas?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
             <MessageSquare className="h-8 w-8 text-emerald-500" /> Pelaporan WhatsApp
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Kelola format laporan dan pengiriman pesan manual ke Manager</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl w-fit">
          <button 
            onClick={() => { setActiveTab('log'); setFeedback(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'log' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutList className="h-4 w-4" /> Data Produksi
          </button>
          <button 
            onClick={() => { setActiveTab('daily'); setFeedback(null); generateDailyRecap(); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'daily' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays className="h-4 w-4" /> Recap Harian
          </button>
          <button 
            onClick={() => { setActiveTab('manual'); setFeedback(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'manual' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit3 className="h-4 w-4" /> Format & Manual
          </button>
        </div>
      </header>

      {activeTab === 'log' ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card rounded-2xl border p-6 shadow-sm border-t-4 border-t-emerald-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Cari Gapoktan atau Komoditas..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <ClipboardList className="h-4 w-4" /> 100 Log Terakhir
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-background/50">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50">
                        <th className="px-6 py-4">Tanggal / Unit</th>
                        <th className="px-6 py-4">Kelompok Tani</th>
                        <th className="px-6 py-4">Komoditas</th>
                        <th className="px-6 py-4 text-right">Volume (Ton)</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center animate-pulse text-muted-foreground">Memuat data...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">Tidak ada data ditemukan</td></tr>
                    ) : filtered.map(p => (
                      <tr key={p.id} className="text-sm hover:bg-muted/30 transition-all group">
                          <td className="px-6 py-4">
                            <div className="font-bold">{p.production_date || 'N/A'}</div>
                            <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                <Factory className="h-3 w-3" /> {p.dryer_units?.name || 'Unit N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground">{p.gapoktan?.name || 'N/A'}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{p.gapoktan?.address}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase border border-emerald-500/20">
                              {p.komoditas?.name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-foreground">{Number(p.qty_after || p.qty_before).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleOpenPreview(p)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                            >
                                <Send className="h-3.5 w-3.5" /> Kirim
                            </button>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'daily' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-500">
           <div className="lg:col-span-2 bg-card rounded-2xl border p-6 md:p-8 shadow-sm space-y-6">
              {/* Header with Date Picker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/20">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl tracking-tight">Ringkasan Harian</h2>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Pilih tanggal lalu kirim ke atasan</p>
                  </div>
                </div>
                <button 
                  onClick={() => refreshData(recapDate)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Muat Ulang
                </button>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <CalendarDays className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block mb-1">Tanggal Laporan</label>
                  <input 
                    type="date" 
                    value={recapDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border bg-background font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Ditemukan</div>
                  <div className="text-lg font-black text-emerald-600">
                    {productions.filter(p => (p.production_date || "").substring(0, 10) === recapDate).length} Batch
                  </div>
                </div>
              </div>

              {/* Generated Recap Text */}
              <textarea 
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                rows={12}
                placeholder="Pilih tanggal di atas untuk generate laporan..."
                className="w-full p-6 rounded-2xl border bg-background/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-mono leading-relaxed shadow-inner"
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                 <button 
                    onClick={() => handleSendAction(manualMessage, true)}
                    disabled={isSending || !manualMessage || manualMessage.startsWith('Tidak ada')}
                    className="flex-1 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                 >
                    {isSending ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
                    Kirim ke WhatsApp
                 </button>
                 <button 
                  onClick={() => copyToClipboard(manualMessage)}
                  className="px-6 py-4 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                  title="Salin teks"
                 >
                    <Copy className="h-4 w-4" />
                 </button>
              </div>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-6">
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                 <h4 className="font-black text-xs uppercase tracking-widest mb-4">Tujuan Pengiriman</h4>
                 <div className="p-4 bg-muted/50 rounded-xl border border-dashed flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border shadow-sm">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nomor Atasan</div>
                       <div className="text-sm font-bold">{waSettings?.target_number || 'Belum diatur'}</div>
                    </div>
                 </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                 <h4 className="font-black text-emerald-700 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                   <AlertCircle className="h-4 w-4" /> Cara Pakai
                 </h4>
                 <ol className="text-sm font-medium text-emerald-800 leading-relaxed space-y-2 list-decimal list-inside">
                    <li>Pilih <strong>tanggal</strong> yang ingin dilaporkan</li>
                    <li>Sistem otomatis membuat rekap dari data produksi</li>
                    <li>Edit teks jika perlu, lalu klik <strong>Kirim ke WhatsApp</strong></li>
                 </ol>
              </div>
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                 <h4 className="font-black text-xs uppercase tracking-widest mb-3">Pengiriman Otomatis</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Atur jadwal kirim otomatis di menu <strong>Profil & Pengaturan</strong> → Integrasi WhatsApp → Ringkasan Harian.
                 </p>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
           {/* Manual Send Form */}
           <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                 <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                    <Send className="h-5 w-5" />
                 </div>
                 <div>
                    <h2 className="font-black text-lg">Kirim Pesan Manual</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tulis dan kirim pesan bebas</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Isi Pesan</label>
                    <textarea 
                       value={manualMessage}
                       onChange={(e) => setManualMessage(e.target.value)}
                       placeholder="Ketik laporan atau pesan di sini..."
                       rows={10}
                       className="w-full p-4 rounded-2xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium leading-relaxed"
                    />
                 </div>

                 <div className="flex gap-3">
                    <button 
                       onClick={() => handleSendAction(manualMessage, true)}
                       disabled={isSending || !manualMessage}
                       className="flex-1 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isSending ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
                       Kirim Sekarang
                    </button>
                 </div>
              </div>
           </div>

           {/* Template Editor */}
           <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                 <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 flex items-center justify-center rounded-xl">
                    <Settings2 className="h-5 w-5" />
                 </div>
                 <div>
                    <h2 className="font-black text-lg">Format Template</h2>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Atur format laporan otomatis</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Template Laporan Produksi</label>
                    <textarea 
                       value={waSettings?.message_template || ""}
                       onChange={(e) => setWaSettings(prev => prev ? {...prev, message_template: e.target.value} : null)}
                       rows={4}
                       className="w-full p-4 rounded-2xl border bg-background focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium leading-relaxed"
                    />
                    <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                       <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 italic">
                          <Hash className="h-3 w-3" /> Variabel Tersedia:
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {['{{gapoktan}}', '{{qty}}', '{{komoditas}}', '{{notes}}'].map(v => (
                            <code key={v} className="px-2 py-0.5 bg-background border rounded text-[10px] font-bold text-emerald-600">{v}</code>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate}
                    className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {savingTemplate ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle2 className="h-4 w-4" />}
                    Simpan Format Baru
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FEEDBACK NOTIFICATION */}
      {feedback && (activeTab === 'manual' || activeTab === 'daily') && (
        <div className={cn(
          "fixed bottom-8 right-8 p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-50",
          feedback.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        )}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-bold">{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* PREVIEW MODAL (Used by Log Tab) */}
      {selectedProd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedProd(null)} />
           <div className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
              <div className="p-6 border-b flex items-center justify-between bg-emerald-500/5">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-500 text-white flex items-center justify-center rounded-xl">
                       <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                       <h3 className="font-black text-lg">Preview Laporan</h3>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Siap Dikirim via WhatsApp</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedProd(null)} className="p-2 hover:bg-muted rounded-full transition-all">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Konten Pesan</label>
                    <textarea 
                       value={previewMessage}
                       onChange={(e) => setPreviewMessage(e.target.value)}
                       rows={6}
                       className="w-full p-4 rounded-2xl border bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium leading-relaxed shadow-inner"
                    />
                 </div>

                 {feedback && activeTab === 'log' && (
                   <div className={cn(
                     "p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300",
                     feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                   )}>
                     {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                     <span className="text-xs font-bold">{feedback.text}</span>
                   </div>
                 )}

                 <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    <button 
                       onClick={() => handleSendAction(previewMessage)}
                       disabled={isSending}
                       className="w-full sm:flex-1 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isSending ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                       {isSending ? 'Mengirim...' : 'Kirim Sekarang'}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(previewMessage)}
                      className="w-full sm:w-auto px-6 py-4 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                       <Copy className="h-4 w-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
