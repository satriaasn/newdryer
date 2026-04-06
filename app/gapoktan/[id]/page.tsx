"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { gapoktanService } from "@/services/gapoktan.service";
import type { Production, Gapoktan } from "@/lib/types";
import { 
  ArrowLeft, MapPin, Users, Phone, Factory, Wheat, 
  Calendar, Package, TrendingUp, Info, ClipboardList,
  Mail, Globe, ShieldCheck, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicGapoktanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [gapoktan, setGapoktan] = useState<Gapoktan | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<{app_name: string, app_slogan: string, copyright: string}>({
    app_name: "Dashboard Monitoring Hibah Dryer",
    app_slogan: "Real-time oversight of national agricultural drying infrastructure",
    copyright: "© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved."
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'oligarch'>('oligarch');

  useEffect(() => {
    const savedTheme = localStorage.getItem('agro-theme') as any;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('oligarch');
    }

    if (!id) return;
    Promise.all([
      gapoktanService.getById(id as string),
      fetch(`/api/production?gapoktan_id=${id}`).then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([g, p, s]) => {
      setGapoktan(g);
      setProductions(Array.isArray(p) ? p : []);
      if (s && !s.error) setAppSettings(s);
    }).finally(() => setLoading(false));
  }, [id]);

  const applyTheme = (t: string) => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'oligarch') {
      document.documentElement.setAttribute('data-theme', 'oligarch');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-500 italic uppercase tracking-widest">Memuat Profil Gapoktan...</p>
      </div>
    </div>
  );

  if (!gapoktan) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100 shadow-sm">
         <ShieldCheck className="h-10 w-10 opacity-50" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gapoktan Tidak Terdaftar</h1>
      <p className="text-slate-500 mt-2 max-w-sm">Data kelompok tani yang Anda cari tidak tersedia dalam sistem pusat pemantauan hibah dryer nasional.</p>
      <button onClick={() => router.push('/')} className="mt-8 flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col pb-0">
      {/* HEADER SECTION - PREMIUM DARK BLUE */}
      <div className="bg-[#0f172a] text-white pt-10 pb-20 lg:pb-32 px-6 lg:px-12 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <button 
                onClick={() => router.push('/')} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Dashboard Utama</span>
              </button>
              
              <div className="text-right hidden md:block">
                <h2 className="text-sm font-black text-primary uppercase tracking-widest leading-none">{appSettings.app_name}</h2>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter opacity-70">{appSettings.app_slogan}</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-sm">Verified Gapoktan</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 shadow-sm">Hibah Dryer 2024</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">{gapoktan.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                       <MapPin className="h-4 w-4 text-primary" />
                       <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                          {gapoktan.desa?.kecamatan?.kabupaten?.name?.replace('KABUPATEN ', '')}, {gapoktan.desa?.kecamatan?.name}, {gapoktan.desa?.name}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                       <Users className="h-4 w-4 text-emerald-500" />
                       <span className="text-sm font-medium tracking-tight">Ketua: {gapoktan.ketua || 'N/A'}</span>
                    </div>
                  </div>
               </div>
               
               <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all shadow-sm">
                     <Download className="h-4 w-4" />
                     <span className="text-sm font-bold">Unduh Profil</span>
                  </button>
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-12 lg:-mt-20 relative z-20 space-y-8">
         {/* TOP STATS Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Produksi" value={productions.reduce((s, p) => s + Number(p.qty_before || 0), 0).toFixed(1)} unit="Ton" icon={Package} color="border-l-primary" />
            <StatCard title="Unit Dryer" value={gapoktan.dryer_units?.length || 0} unit="Unit" icon={Factory} color="border-l-emerald-500" />
            <StatCard title="Komoditas" value={gapoktan.komoditas?.length || 0} unit="Jenis" icon={Wheat} color="border-l-amber-500" />
            <StatCard title="Log Transaksi" value={productions.length} unit="Record" icon={TrendingUp} color="border-l-indigo-500" />
         </div>

         <div className="grid lg:grid-cols-3 gap-8">
            {/* SIDEBAR INFO */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-card rounded-3xl border border-border p-8 shadow-sm hover:border-primary/30 transition-colors">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <Info className="h-4 w-4" /> Detail Kelompok
                  </h3>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
                           <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Alamat Lengkap</p>
                           <p className="text-sm font-bold text-slate-800 leading-snug">{gapoktan.address || '-'}</p>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                           <Phone className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Kontak Person</p>
                           <p className="text-sm font-bold text-slate-800 leading-snug">{gapoktan.phone || '-'}</p>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                           <Wheat className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Komoditas Fokus</p>
                           <div className="flex flex-wrap gap-2 mt-1">
                              {gapoktan.komoditas?.map(k => (
                                 <span key={k.id} className="text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-border">{k.name}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-card rounded-3xl border border-border p-8 shadow-sm hover:border-primary/30 transition-colors">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <Factory className="h-4 w-4" /> Aset Infrastruktur
                  </h3>
                  <div className="space-y-4">
                     {gapoktan.dryer_units?.map(d => (
                        <div key={d.id} className="p-4 rounded-2xl bg-neutral-50/50 border border-slate-100 flex items-center justify-between group hover:bg-neutral-50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                d.status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                              )} />
                              <div>
                                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{d.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 tracking-widest">CAPACITY: {d.capacity_ton}T</p>
                              </div>
                           </div>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                             d.status === 'active' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"
                           )}>
                             {d.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* PRODUCTION HISTORY TABLE Section */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-card rounded-3xl border border-border p-1 shadow-sm overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                  <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                           <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Detail Produksi</h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase italic">Log riwayat masuk keluar monitoring dryer</p>
                        </div>
                     </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide px-4 pb-4 mt-4">
                     <table className="w-full text-left min-w-[1000px]">
                        <thead>
                           <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] bg-muted/50 rounded-xl">
                              <th className="px-6 py-4">TGL / UNIT</th>
                              <th className="px-6 py-4">KOMODITAS</th>
                              <th className="px-6 py-4 text-right">TON SEBELUM</th>
                              <th className="px-6 py-4 text-right">HARGA SEBELUM</th>
                              <th className="px-6 py-4 text-right">TON SESUDAH</th>
                              <th className="px-6 py-4 text-right">HARGA SESUDAH</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {productions.map(p => (
                              <tr key={p.id} className="group hover:bg-neutral-50 transition-colors">
                                 <td className="px-6 py-5">
                                    <div className="font-bold text-slate-800 text-xs">{p.production_date}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 group-hover:text-primary transition-colors">
                                       <Factory className="h-2.5 w-2.5" />
                                       {p.dryer_units?.name}
                                    </div>
                                 </td>
                                 <td className="px-6 py-5">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-widest">
                                       {p.komoditas?.name}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <div className="text-sm font-black text-slate-800">{Number(p.qty_before || 0).toFixed(2)}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">METRIC TONS</div>
                                 </td>
                                 <td className="px-6 py-5 text-right font-mono">
                                    <div className="text-xs font-bold text-slate-600">{formatCurrency(p.price_before || 0)}</div>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <div className="text-sm font-black text-slate-800">{Number(p.qty_after || 0).toFixed(2)}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">METRIC TONS</div>
                                 </td>
                                 <td className="px-6 py-5 text-right font-mono">
                                    <div className="text-xs font-bold text-emerald-600">{formatCurrency(p.price_after || 0)}</div>
                                    <div className="text-[9px] font-black text-emerald-400 uppercase">+{p.price_diff_pct}% INCREASE</div>
                                 </td>
                              </tr>
                           ))}
                           {productions.length === 0 && (
                              <tr>
                                 <td colSpan={6} className="py-20 text-center">
                                    <div className="max-w-xs mx-auto space-y-2 opacity-30 grayscale italic">
                                       <Package className="h-10 w-10 mx-auto" />
                                       <p className="text-sm font-bold uppercase tracking-widest">Belum Ada Data Produksi</p>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* FOOTER SECTION */}
      <footer className="mt-auto py-10 px-6 lg:px-10 border-t bg-card/30 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-foreground uppercase tracking-widest">{appSettings.app_name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-[0.2em] mt-0.5">Agriculture Monitoring System</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-xs text-muted-foreground font-medium italic opacity-70 transition-opacity hover:opacity-100">{appSettings.copyright}</p>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">
               <span>Efficiency</span>
               <span className="h-1 w-1 rounded-full bg-primary/20" />
               <span>Precision</span>
               <span className="h-1 w-1 rounded-full bg-primary/20" />
               <span>Integrity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className={cn("bg-card p-6 rounded-3xl border border-border shadow-sm border-l-4 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:border-primary/50 hover:shadow-primary/5 card-sky-glow", "border-l-primary")}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <div className="flex items-baseline gap-1.5">
           <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className="p-2 rounded-xl bg-muted text-muted-foreground">
         <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);
