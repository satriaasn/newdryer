"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { DryerUnit } from "@/lib/types";
import { Factory } from "lucide-react";

export default function DryerPage() {
  const [dryers, setDryers] = useState<DryerUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dryer').then(r => r.json()).then(data => {
      setDryers(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-500',
    inactive: 'bg-gray-500/10 text-gray-500',
    maintenance: 'bg-amber-500/10 text-amber-500',
  };
  const statusLabel: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Nonaktif',
    maintenance: 'Perawatan',
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Unit Dryer</h1>
            <p className="text-muted-foreground">Daftar seluruh unit pengering yang terdaftar</p>
          </header>

          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Unit</th>
                  <th className="px-6 py-4">Gapoktan</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4 text-right">Kapasitas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Memuat...</td></tr>
                ) : dryers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                ) : dryers.map(d => (
                  <tr key={d.id} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Factory className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{d.gapoktan?.name || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {d.gapoktan?.desa?.name}, {d.gapoktan?.desa?.kecamatan?.name}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">{d.capacity_kg ? `${Number(d.capacity_kg).toLocaleString()} kg` : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[d.status] || ''}`}>
                        {statusLabel[d.status] || d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
