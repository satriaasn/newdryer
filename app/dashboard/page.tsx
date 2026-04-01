"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { DashboardStats, Production } from "@/lib/types";
import { Factory, Users, Package, TrendingUp, Plus, Search, Calendar, Filter, X } from "lucide-react";

const AdminTrendChart = dynamic(() => import("@/components/dashboard/admin-charts").then(m => m.AdminTrendChart), { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> });
const AdminBarChart = dynamic(() => import("@/components/dashboard/admin-charts").then(m => m.AdminBarChart), { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> });

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([s, p, g, k]) => {
      setStats(s);
      setProductions(Array.isArray(p) ? p : []);
      setGapoktanList(Array.isArray(g) ? g : []);
      setKomoditasList(Array.isArray(k) ? k : []);
    }).finally(() => setLoading(false));
  }, []);

  const [gapoktanList, setGapoktanList] = useState<any[]>([]);
  const [komoditasList, setKomoditasList] = useState<any[]>([]);
  const [filterGapoktan, setFilterGapoktan] = useState('');
  const [filterKomoditas, setFilterKomoditas] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const filteredProductions = useMemo(() => {
    return productions.filter(p => {
      if (filterGapoktan && p.gapoktan_id !== filterGapoktan) return false;
      if (filterKomoditas && p.komoditas_id !== filterKomoditas) return false;
      if (filterDate && p.production_date !== filterDate) return false;
      if (filterSearch) {
        const s = `${p.gapoktan?.name} ${p.komoditas?.name}`.toLowerCase();
        if (!s.includes(filterSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [productions, filterGapoktan, filterKomoditas, filterDate, filterSearch]);

  const trendData = useMemo(() => {
    const last15Days = [...Array(15)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - i));
      return d.toISOString().split('T')[0];
    });

    return last15Days.map(date => {
      const dayProds = productions.filter(p => p.production_date === date);
      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        ton: dayProds.reduce((sum, p) => sum + Number(p.qty_after), 0)
      };
    });
  }, [productions]);

  const perKomoditas = useMemo(() => {
    const map: Record<string, number> = {};
    productions.forEach(p => {
      const name = p.komoditas?.name || 'Lainnya';
      map[name] = (map[name] || 0) + Number(p.qty_after);
    });
    return Object.entries(map).map(([name, ton]) => ({ name, ton }));
  }, [productions]);

  const clearFilters = () => { setFilterGapoktan(''); setFilterKomoditas(''); setFilterDate(''); setFilterSearch(''); };
  const hasFilters = !!(filterGapoktan || filterKomoditas || filterDate || filterSearch);

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Kelola data gapoktan, dryer, komoditas, dan produksi</p>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard/production" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="h-4 w-4" /> Input Produksi
            </a>
            <a href="/dashboard/gapoktan" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-all">
              <Plus className="h-4 w-4" /> Data Baru
            </a>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-card/40 p-4 rounded-2xl border border-dashed border-primary/20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Cari..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <select value={filterGapoktan} onChange={e => setFilterGapoktan(e.target.value)} className="w-full px-4 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 ring-primary/20">
            <option value="">Semua Gapoktan</option>
            {gapoktanList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={filterKomoditas} onChange={e => setFilterKomoditas(e.target.value)} className="w-full px-4 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 ring-primary/20">
            <option value="">Semua Komoditas</option>
            {komoditasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 ring-primary/20" />
            {hasFilters && <button onClick={clearFilters} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><X className="h-5 w-5" /></button>}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl border animate-pulse bg-card/60" />)}
        </div>
      ) : stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPI title="Total Produksi (Ton)" value={`${stats.totalQtyAfter?.toLocaleString() || 0} T`} icon={Package} color="text-primary" />
            <KPI title="Produksi Hari Ini" value={`${stats.todayQtyAfter?.toLocaleString() || 0} T`} icon={Calendar} color="text-blue-500" />
            <KPI title="Avg Margin Harga" value={`+${stats.avgPriceDiffPct}%`} icon={TrendingUp} color="text-emerald-500" />
            <KPI title="Total Unit Dryer" value={stats.totalDryers || 0} icon={Factory} color="text-indigo-500" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Tren Produksi (15 Hari)</h3>
              <div className="h-[300px] w-full bg-card/60 rounded-3xl border p-6">
                <AdminTrendChart data={trendData} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Package className="h-5 w-5 text-emerald-500" /> Perbandingan Komoditas</h3>
              <div className="h-[300px] w-full bg-card/60 rounded-3xl border p-6">
                <AdminBarChart data={perKomoditas} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Produksi Terbaru</h3>
              <a href="/dashboard/production" className="text-sm text-primary hover:underline">Lihat semua →</a>
            </div>
            <div className="space-y-2">
              {filteredProductions.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/10">
                  <div>
                    <p className="text-sm font-semibold">{p.gapoktan?.name}</p>
                    <p className="text-xs text-muted-foreground">{p.komoditas?.name} • {p.production_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.qty_before}→{p.qty_after} Ton</p>
                    <p className="text-xs text-emerald-500 font-medium">+{p.price_diff_pct}% harga</p>
                  </div>
                </div>
              ))}
              {filteredProductions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Tidak ada data sesuai filter</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Icon className={`h-16 w-16 ${color}`} /></div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight mt-1">{value}</h3>
    </div>
  );
}
