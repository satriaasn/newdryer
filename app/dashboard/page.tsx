"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { DashboardStats, Production } from "@/lib/types";
import { 
  Factory, Users, Package, TrendingUp, TrendingDown,
  ArrowUpRight, BarChart3
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/production').then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setProductions(Array.isArray(p) ? p.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Ikhtisar sistem pengeringan komoditas pertanian</p>
          </header>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 rounded-2xl border bg-card/60 animate-pulse" />
              ))}
            </div>
          ) : stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Gapoktan" value={stats.totalGapoktan} icon={Users} color="text-blue-500" />
                <KPICard title="Unit Dryer" value={stats.totalDryers} icon={Factory} color="text-emerald-500" />
                <KPICard title="Total Produksi" value={stats.totalProductions} icon={Package} color="text-orange-500" />
                <KPICard 
                  title="Avg Kenaikan Harga" 
                  value={`${stats.avgPriceDiffPct > 0 ? '+' : ''}${stats.avgPriceDiffPct}%`} 
                  icon={stats.avgPriceDiffPct >= 0 ? TrendingUp : TrendingDown} 
                  color={stats.avgPriceDiffPct >= 0 ? "text-emerald-500" : "text-rose-500"} 
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card/60 p-6">
                  <h3 className="text-lg font-bold mb-4">Ringkasan Produksi</h3>
                  <div className="space-y-4">
                    <StatBar label="Total Qty Sebelum" value={`${stats.totalQtyBefore.toLocaleString()} kg`} />
                    <StatBar label="Total Qty Sesudah" value={`${stats.totalQtyAfter.toLocaleString()} kg`} />
                    <StatBar 
                      label="Avg Selisih Qty" 
                      value={`${stats.avgQtyDiffPct}%`} 
                      negative={stats.avgQtyDiffPct < 0}
                    />
                    <StatBar 
                      label="Avg Kenaikan Harga" 
                      value={`+${stats.avgPriceDiffPct}%`} 
                      positive 
                    />
                  </div>
                </div>

                <div className="rounded-2xl border bg-card/60 p-6">
                  <h3 className="text-lg font-bold mb-4">Produksi Terbaru</h3>
                  <div className="space-y-3">
                    {productions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada data produksi</p>
                    ) : productions.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all">
                        <div>
                          <p className="text-sm font-semibold">{p.gapoktan?.name || '-'}</p>
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
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border bg-card/60 p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/20">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className={`h-16 w-16 ${color}`} />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight mt-1">{value}</h3>
      <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center translate-y-8 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function StatBar({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${positive ? 'text-emerald-500' : negative ? 'text-rose-500' : ''}`}>{value}</span>
    </div>
  );
}
