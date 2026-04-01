"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import type { DashboardStats, Production } from "@/lib/types";
import { Factory, Users, Package, TrendingUp, Plus, Search, Calendar, Filter, X } from "lucide-react";
import { useMemo } from "react";

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
            <KPI title="Total Gapoktan" value={stats.totalGapoktan} icon={Users} color="text-blue-500" />
            <KPI title="Unit Dryer" value={stats.totalDryers} icon={Factory} color="text-emerald-500" />
            <KPI title="Total Produksi" value={stats.totalProductions} icon={Package} color="text-orange-500" />
            <KPI title="Avg Kenaikan Harga" value={`+${stats.avgPriceDiffPct}%`} icon={TrendingUp} color="text-primary" />
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
