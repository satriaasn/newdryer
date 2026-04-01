"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { DashboardStats, Production } from "@/lib/types";
import { Factory, Users, Package, TrendingUp, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setProductions(Array.isArray(p) ? p.slice(0, 8) : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-8">
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Kelola data gapoktan, dryer, komoditas, dan produksi</p>
              </div>
              <div className="flex gap-3">
                <a href="/dashboard/production" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Plus className="h-4 w-4" /> Input Produksi
                </a>
                <a href="/dashboard/gapoktan" className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-all">
                  <Plus className="h-4 w-4" /> Data Baru
                </a>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl border animate-pulse bg-card/60" />)}</div>
          ) : stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPI title="Total Gapoktan" value={stats.totalGapoktan} icon={Users} color="text-blue-500" />
                <KPI title="Unit Dryer" value={stats.totalDryers} icon={Factory} color="text-emerald-500" />
                <KPI title="Total Produksi" value={stats.totalProductions} icon={Package} color="text-orange-500" />
                <KPI title="Avg Kenaikan Harga" value={`+${stats.avgPriceDiffPct}%`} icon={TrendingUp} color="text-primary" />
              </div>

              <div className="rounded-2xl border bg-card/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Produksi Terbaru</h3>
                  <a href="/dashboard/production" className="text-sm text-primary hover:underline">Lihat semua →</a>
                </div>
                <div className="space-y-2">
                  {productions.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all">
                      <div>
                        <p className="text-sm font-semibold">{p.gapoktan?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.komoditas?.name} • {p.production_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{p.qty_before}→{p.qty_after} kg</p>
                        <p className="text-xs text-emerald-500 font-medium">+{p.price_diff_pct}% harga</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
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
