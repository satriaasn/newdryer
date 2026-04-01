"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Production, Gapoktan, Komoditas, DryerUnit } from "@/lib/types";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";

export default function ProductionPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);

  const reload = () => {
    Promise.all([
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([p, g]) => {
      setProductions(Array.isArray(p) ? p : []);
      setGapoktan(Array.isArray(g) ? g : []);
    }).finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleSaved = () => {
    setEditingProduction(null);
    setShowForm(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus catatan produksi ini?`)) return;
    try {
      const res = await fetch(`/api/production/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProductions(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Produksi</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Input dan riwayat data produksi pengeringan</p>
        </div>
        <button
          onClick={() => { setEditingProduction(null); setShowForm(!showForm); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Input Produksi
        </button>
      </header>

          {(showForm || editingProduction) && (
            <ProductionForm 
              gapoktan={gapoktan} 
              initialData={editingProduction}
              onSaved={handleSaved} 
              onCancel={() => { setShowForm(false); setEditingProduction(null); }} 
            />
          )}

          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">Riwayat Produksi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Gapoktan</th>
                    <th className="px-4 py-3">Komoditas</th>
                    <th className="px-4 py-3">Dryer</th>
                    <th className="px-4 py-3 text-right">Qty Sebelum</th>
                    <th className="px-4 py-3 text-right">Harga Sebelum</th>
                    <th className="px-4 py-3 text-right">Qty Sesudah</th>
                    <th className="px-4 py-3 text-right">Harga Sesudah</th>
                    <th className="px-4 py-3 text-right">Δ Qty</th>
                    <th className="px-4 py-3 text-right">Δ Harga</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>
                  ) : productions.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                  ) : productions.map(p => (
                    <tr key={p.id} className="text-sm hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{p.production_date}</td>
                      <td className="px-4 py-3 font-medium">{p.gapoktan?.name || '-'}</td>
                      <td className="px-4 py-3">{p.komoditas?.name || '-'}</td>
                      <td className="px-4 py-3">{p.dryer_units?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(p.qty_before).toLocaleString()} Ton</td>
                      <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_before).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(p.qty_after).toLocaleString()} Ton</td>
                      <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_after).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(p.qty_diff_pct) < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {p.qty_diff_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(p.price_diff_pct) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          +{p.price_diff_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2 text-right">
                        <button 
                          onClick={() => setEditingProduction(p)}
                          className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
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
    </div>
  );
}

function ProductionForm({ gapoktan, initialData, onSaved, onCancel }: { gapoktan: Gapoktan[]; initialData?: Production | null; onSaved: () => void; onCancel: () => void }) {
  const [selectedGapoktan, setSelectedGapoktan] = useState(initialData?.gapoktan_id || '');
  const [komoditasList, setKomoditasList] = useState<Komoditas[]>([]);
  const [dryerList, setDryerList] = useState<DryerUnit[]>([]);
  const [form, setForm] = useState({
    komoditas_id: initialData?.komoditas_id || '', 
    dryer_id: initialData?.dryer_id || '', 
    qty_before: initialData?.qty_before?.toString() || '', 
    price_before: initialData?.price_before?.toString() || '',
    qty_after: initialData?.qty_after?.toString() || '', 
    price_after: initialData?.price_after?.toString() || '', 
    production_date: initialData?.production_date || new Date().toISOString().split('T')[0], 
    notes: initialData?.notes || '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedGapoktan) return;
    Promise.all([
      fetch(`/api/komoditas?gapoktan_id=${selectedGapoktan}`).then(r => r.json()),
      fetch(`/api/dryer?gapoktan_id=${selectedGapoktan}`).then(r => r.json()),
      fetch('/api/komoditas').then(r => r.json()),
      fetch('/api/dryer').then(r => r.json()),
    ]).then(([k, d, allK, allD]) => {
      setKomoditasList(Array.isArray(k) && k.length > 0 ? k : (Array.isArray(allK) ? allK : []));
      setDryerList(Array.isArray(d) && d.length > 0 ? d : (Array.isArray(allD) ? allD : []));
    });
  }, [selectedGapoktan]);

  const qtyDiffPct = Number(form.qty_before) > 0
    ? (((Number(form.qty_after) - Number(form.qty_before)) / Number(form.qty_before)) * 100).toFixed(2)
    : '0';
  const priceDiffPct = Number(form.price_before) > 0
    ? (((Number(form.price_after) - Number(form.price_before)) / Number(form.price_before)) * 100).toFixed(2)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = initialData ? `/api/production/${initialData.id}` : '/api/production';
      const method = initialData ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gapoktan_id: selectedGapoktan,
          komoditas_id: form.komoditas_id,
          dryer_id: form.dryer_id,
          qty_before: Number(form.qty_before),
          price_before: Number(form.price_before),
          qty_after: Number(form.qty_after),
          price_after: Number(form.price_after),
          production_date: form.production_date,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok) onSaved();
      else alert(data.error);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4">
      <h3 className="text-lg font-bold">{initialData ? 'Edit Data Produksi' : 'Form Input Produksi'}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Gapoktan</label>
          <select value={selectedGapoktan} onChange={e => setSelectedGapoktan(e.target.value)} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
            <option value="">Pilih Gapoktan...</option>
            {gapoktan.map(g => (
              <option key={g.id} value={g.id}>{g.name} — {g.desa?.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Komoditas</label>
          <select value={form.komoditas_id} onChange={e => setForm({...form, komoditas_id: e.target.value})} required disabled={!selectedGapoktan}
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">Pilih Komoditas...</option>
            {komoditasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Dryer Unit</label>
          <select value={form.dryer_id} onChange={e => setForm({...form, dryer_id: e.target.value})} required disabled={!selectedGapoktan}
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">Pilih Dryer...</option>
            {dryerList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.capacity_ton} Ton)</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Jumlah Sebelum (Ton)</label>
          <input type="number" value={form.qty_before} onChange={e => setForm({...form, qty_before: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Harga Sebelum (Rp/Ton)</label>
          <input type="number" value={form.price_before} onChange={e => setForm({...form, price_before: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tanggal Produksi</label>
          <input type="date" value={form.production_date} onChange={e => setForm({...form, production_date: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Jumlah Sesudah (Ton)</label>
          <input type="number" value={form.qty_after} onChange={e => setForm({...form, qty_after: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Harga Sesudah (Rp/Ton)</label>
          <input type="number" value={form.price_after} onChange={e => setForm({...form, price_after: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Selisih Qty</label>
            <div className={`mt-1 rounded-xl border px-3 py-2 text-sm font-bold ${Number(qtyDiffPct) < 0 ? 'text-rose-500 bg-rose-50' : 'text-emerald-500 bg-emerald-50'}`}>
              {qtyDiffPct}%
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Selisih Harga</label>
            <div className={`mt-1 rounded-xl border px-3 py-2 text-sm font-bold ${Number(priceDiffPct) >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
              +{priceDiffPct}%
            </div>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Catatan</label>
        <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
          className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="Opsional..." />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border hover:bg-muted transition-all">Batal</button>
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
