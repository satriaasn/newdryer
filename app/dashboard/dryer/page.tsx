"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { DryerUnit, Gapoktan } from "@/lib/types";
import { Factory, Plus, Loader2 } from "lucide-react";

export default function DryerAdmin() {
  const [dryers, setDryers] = useState<DryerUnit[]>([]);
  const [gapoktanList, setGapoktanList] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const reload = () => {
    Promise.all([
      fetch('/api/dryer').then(r => r.json()),
      fetch('/api/gapoktan').then(r => r.json()),
    ]).then(([d, g]) => {
      setDryers(Array.isArray(d) ? d : []);
      setGapoktanList(Array.isArray(g) ? g : []);
    }).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const [form, setForm] = useState({ name: '', gapoktan_id: '', capacity_kg: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/dryer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, gapoktan_id: form.gapoktan_id, capacity_kg: form.capacity_kg ? Number(form.capacity_kg) : null }),
      });
      if (res.ok) { reload(); setShowForm(false); setForm({ name: '', gapoktan_id: '', capacity_kg: '' }); }
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  const statusColor: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-500', inactive: 'bg-gray-500/10 text-gray-500', maintenance: 'bg-amber-500/10 text-amber-500' };
  const statusLabel: Record<string, string> = { active: 'Aktif', inactive: 'Nonaktif', maintenance: 'Perawatan' };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kelola Unit Dryer</h1>
              <p className="text-muted-foreground">Tambah dan kelola unit pengering</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> Tambah Dryer
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4">
              <h3 className="text-lg font-bold">Tambah Unit Dryer</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nama Unit *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Gapoktan Pemilik *</label>
                  <select value={form.gapoktan_id} onChange={e => setForm({...form, gapoktan_id: e.target.value})} required className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
                    <option value="">Pilih...</option>
                    {gapoktanList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Kapasitas (kg)</label>
                  <input type="number" value={form.capacity_kg} onChange={e => setForm({...form, capacity_kg: e.target.value})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-xl border hover:bg-muted transition-all">Batal</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
                </button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Gapoktan</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4 text-right">Kapasitas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Memuat...</td></tr>
                ) : dryers.map(d => (
                  <tr key={d.id} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Factory className="h-4 w-4 text-primary" /></div><span className="font-semibold">{d.name}</span></div></td>
                    <td className="px-6 py-4 font-medium">{d.gapoktan?.name || '-'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{d.gapoktan?.desa?.name}, {d.gapoktan?.desa?.kecamatan?.name}</td>
                    <td className="px-6 py-4 text-right font-mono">{d.capacity_kg ? `${Number(d.capacity_kg).toLocaleString()} kg` : '-'}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[d.status]}`}>{statusLabel[d.status]}</span></td>
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
