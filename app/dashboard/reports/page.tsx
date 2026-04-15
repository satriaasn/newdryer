"use client";

import { useEffect, useState } from "react";
import { whatsappService } from "@/services/whatsapp.service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  Factory, 
  CheckCircle2, 
  AlertCircle,
  X,
  ClipboardList,
  Edit3,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Production } from "@/lib/types";

export default function WhatsAppReportingPage() {
  const supabase = createClientComponentClient();
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProd, setSelectedProd] = useState<any | null>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('production')
      .select(`
        *,
        gapoktan (id, name, address),
        komoditas (id, name),
        dryer_units (id, name)
      `)
      .order('production_date', { ascending: false })
      .limit(50);
    
    if (data) setProductions(data);
    setLoading(false);
  };

  const handleOpenPreview = async (p: any) => {
    setSelectedProd(p);
    const settings = await whatsappService.getSettings();
    
    // Manual formatting from template
    let msg = settings.message_template
      .replace('{{gapoktan}}', p.gapoktan?.name || '-')
      .replace('{{qty}}', Number(p.qty_after || p.qty_before).toFixed(1))
      .replace('{{komoditas}}', p.komoditas?.name || '-')
      .replace('{{notes}}', p.notes || '-');
    
    setPreviewMessage(msg);
    setFeedback(null);
  };

  const handleSendReport = async () => {
    if (!selectedProd) return;
    setIsSending(true);
    try {
      const settings = await whatsappService.getSettings();
      
      const formData = new FormData();
      formData.append('target', settings.target_number || "");
      formData.append('message', previewMessage);
      formData.append('countryCode', '62');

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': (settings.api_key || "").trim(),
        },
        body: formData,
      });

      const resData = await response.json();
      if (resData.status === true) {
        setFeedback({ type: 'success', text: 'Laporan berhasil dikirim ke WhatsApp!' });
        setTimeout(() => setSelectedProd(null), 1500);
      } else {
        setFeedback({ type: 'error', text: 'Gagal mengirim: ' + (resData.reason || 'Cek API Key WA.') });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Error: ' + err.message });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewMessage);
    alert("Pesan disalin ke clipboard!");
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
          <p className="text-muted-foreground font-medium mt-1">Kirim laporan produksi individu secara manual ke WhatsApp Manager</p>
        </div>
      </header>

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
                 <ClipboardList className="h-4 w-4" /> 50 Log Terakhir
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
                      <th className="px-6 py-4 text-right">Aksi Manual</th>
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
                           <div className="font-bold">{p.production_date}</div>
                           <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                              <Factory className="h-3 w-3" /> {p.dryer_units?.name || 'Unit N/A'}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-foreground">{p.gapoktan?.name}</div>
                           <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{p.gapoktan?.address}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase border border-emerald-500/20">
                             {p.komoditas?.name}
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
                              <Send className="h-3.5 w-3.5" /> Kirim WA
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Konten Pesan (Bisa Diedit)</label>
                    <textarea 
                       value={previewMessage}
                       onChange={(e) => setPreviewMessage(e.target.value)}
                       rows={6}
                       className="w-full p-4 rounded-2xl border bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium leading-relaxed shadow-inner"
                    />
                 </div>

                 {feedback && (
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
                       onClick={handleSendReport}
                       disabled={isSending}
                       className="w-full sm:flex-1 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isSending ? (
                         <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       ) : (
                         <Send className="h-4 w-4" />
                       )}
                       {isSending ? 'Mengirim...' : 'Kirim Sekarang'}
                    </button>
                    <button 
                      onClick={copyToClipboard}
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
