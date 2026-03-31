export const dynamic = 'force-dynamic';
"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { DryerUnit, Gapoktan } from "@/lib/types";
import { Factory, Plus, Loader2, Trash2, Edit } from "lucide-react";

export default function DryerAdmin() {
  const [dryers, setDryers] = useState<DryerUnit[]>([]);
  const [gapoktanList, setGapoktanList] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingDryer, setEditingDryer] = useState<DryerUnit | null>(null);

  const reload = () => {
    Promise.all([
      fetch('/api/dryer', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([d, g]) => {
      setDryers(Array.isArray(d) ? d : []);
      setGapoktanList(Array.isArray(g) ? g : []);
    }).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus unit dryer "${name}"? Semua data produksi terkait juga akan dihapus.`)) return;
    try {
      const res = await fetch(`/api/dryer/${id}`, { method: 'DELETE' });
      if (res.ok) reload();
      else { const err = await res.json(); alert(err.error); }
    } catch (e: any) { alert(e.message); }
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
            <button onClick={() => { setEditingDryer(null); setShowForm(!showForm); }} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> Tambah Dryer
            </button>
          </div>

          {(showForm || editingDryer) && (
            <DryerForm 
              initialData={editingDryer} 
              gapoktanList={gapoktanList} 
              onSaved={() => { reload(); setShowForm(false); setEditingDryer(null); }} 
              onCancel={() => { setShowForm(false); setEditingDryer(null); }} 
            />
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
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Memuat...</td></tr>
                ) : dryers.map(d => (
                  <tr key={d.id} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Factory className="h-4 w-4 text-primary" /></div><span className="font-semibold">{d.name}</span></div></td>
                    <td className="px-6 py-4 font-medium">{d.gapoktan?.name || '-'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{d.gapoktan?.desa?.name}, {d.gapoktan?.desa?.kecamatan?.name}</td>
                    <td className="px-6 py-4 text-right font-mono">{d.capacity_kg ? `${Number(d.capacity_kg).toLocaleString()} kg` : '-'}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[d.status]}`}>{statusLabel[d.status]}</span></td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 text-right">
                      <button 
                        onClick={() => setEditingDryer(d)}
                        className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id, d.name)}
                        className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

function DryerForm({ initialData, gapoktanList, onSaved, onCancel }: { initialData?: DryerUnit | null; gapoktanList: Gapoktan[]; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ 
    name: initialData?.name || '', 
    gapoktan_id: initialData?.gapoktan_id || '', 
    capacity_kg: initialData?.capacity_kg?.toString() || '',
    status: initialData?.status || 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = initialData ? `/api/dryer/${initialData.id}` : '/api/dryer';
      const method = initialData ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity_kg: form.capacity_kg ? Number(form.capacity_kg) : null
        })
      });
      if (res.ok) onSaved();
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4">
      <h3 className="text-lg font-bold">{initialData ? 'Edit Unit Dryer' : 'Tambah Unit Dryer'}</h3>
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
        <div>
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="maintenance">Perawatan</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border hover:bg-muted transition-all">Batal</button>
        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {initialData ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
