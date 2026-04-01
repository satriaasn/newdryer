"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { gapoktanService } from "@/services/gapoktan.service";
import { productionService } from "@/services/production.service";
import type { Gapoktan, Production } from "@/lib/types";
import { 
  ArrowLeft, MapPin, Users, Phone, Factory, Wheat, 
  Calendar, Package, TrendingUp, Info
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function GapoktanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [gapoktan, setGapoktan] = useState<Gapoktan | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      gapoktanService.getOne(id as string),
      fetch(`/api/production?gapoktan_id=${id}`).then(r => r.json())
    ]).then(([g, p]) => {
      setGapoktan(g);
      setProductions(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!gapoktan) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Gapoktan tidak ditemukan</h1>
      <button onClick={() => router.back()} className="mt-4 flex items-center gap-2 mx-auto text-primary">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-card border hover:bg-muted transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{gapoktan.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {gapoktan.desa?.name}, {gapoktan.desa?.kecamatan?.name}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-3xl border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Informasi Utama</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users className="h-4 w-4" /></div>
                  <div><p className="text-xs text-muted-foreground uppercase font-bold">Ketua</p><p className="font-medium">{gapoktan.ketua || '-'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Phone className="h-4 w-4" /></div>
                  <div><p className="text-xs text-muted-foreground uppercase font-bold">Kontak</p><p className="font-medium">{gapoktan.phone || '-'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-rose-500/10 text-rose-500"><MapPin className="h-4 w-4" /></div>
                  <div><p className="text-xs text-muted-foreground uppercase font-bold">Alamat</p><p className="font-medium text-sm">{gapoktan.address || '-'}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Wheat className="h-5 w-5 text-amber-500" /> Komoditas</h2>
              <div className="flex flex-wrap gap-2">
                {gapoktan.komoditas && gapoktan.komoditas.length > 0 ? (
                  gapoktan.komoditas.map(k => (
                    <span key={k.id} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">{k.name}</span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Belum ada komoditas terdaftar</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-3xl border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Factory className="h-5 w-5 text-primary" /> Aset Dryer</h2>
              <div className="space-y-2">
                {gapoktan.dryer_units && gapoktan.dryer_units.length > 0 ? (
                  gapoktan.dryer_units.map(d => (
                    <div key={d.id} className="p-3 rounded-2xl bg-muted/50 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">Kapasitas: {d.capacity_ton} Ton</p>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${d.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Tidak ada unit dryer</p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl border p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Riwayat Produksi</h2>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{productions.length} Data</span>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                      <th className="pb-3 pr-4">Tanggal</th>
                      <th className="pb-3 pr-4">Komoditas</th>
                      <th className="pb-3 pr-4 text-right">Qty (Ton)</th>
                      <th className="pb-3 text-right">Margin Harga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productions.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Belum ada riwayat transaksi</td></tr>
                    ) : productions.map(p => (
                      <tr key={p.id} className="text-sm group hover:bg-muted/30 transition-all">
                        <td className="py-3 pr-4 py-3">
                           <p className="font-medium">{new Date(p.production_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                           <p className="text-[10px] text-muted-foreground">Unit: {p.dryer_units?.name}</p>
                        </td>
                        <td className="py-3 pr-4">
                           <span className="text-xs font-semibold">{p.komoditas?.name}</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono">
                           <p className="font-bold">{Number(p.qty_after).toLocaleString()}</p>
                           <p className={`text-[10px] ${Number(p.qty_diff_pct) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{p.qty_diff_pct}%</p>
                        </td>
                        <td className="py-3 text-right font-mono">
                           <p className="font-bold text-emerald-500">+{p.price_diff_pct}%</p>
                           <p className="text-[10px] text-muted-foreground">Rp {Number(p.price_after).toLocaleString()}/Ton</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
