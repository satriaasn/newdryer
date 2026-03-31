export const dynamic = 'force-dynamic';
"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Gapoktan, Komoditas, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Users, MapPin, Phone, Wheat, Plus, Loader2, Trash2, Edit } from "lucide-react";

export default function GapoktanAdmin() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [allKomoditas, setAllKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGapoktan, setEditingGapoktan] = useState<Gapoktan | null>(null);

  const reload = () => {
    Promise.all([
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([g, k]) => {
      setGapoktan(Array.isArray(g) ? g : []);
      setAllKomoditas(Array.isArray(k) ? k : []);
    }).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus Gapoktan "${name}"? Semua data dryer dan produksi terkait juga akan terpengaruh.`)) return;
    try {
      const res = await fetch(`/api/gapoktan/${id}`, { method: 'DELETE' });
      if (res.ok) reload();
      else { const err = await res.json(); alert(err.error); }
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kelola Gapoktan</h1>
              <p className="text-muted-foreground">Tambah, edit, dan kelola data gapoktan</p>
            </div>
            <button onClick={() => { setEditingGapoktan(null); setShowForm(!showForm); }} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> Tambah Gapoktan
            </button>
          </div>

          {(showForm || editingGapoktan) && (
            <GapoktanForm 
              initialData={editingGapoktan} 
              onSaved={() => { reload(); setShowForm(false); setEditingGapoktan(null); }} 
              onCancel={() => { setShowForm(false); setEditingGapoktan(null); }} 
            />
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl border bg-card/60 animate-pulse" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gapoktan.map(g => (
                <div key={g.id} className="relative group rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => setEditingGapoktan(g)}
                      className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(g.id, g.name)}
                      className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-start justify-between mb-3 mr-16">
                    <div>
                      <h3 className="text-lg font-bold">{g.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {g.desa?.name}, {g.desa?.kecamatan?.name}, {g.desa?.kecamatan?.kabupaten?.name}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="h-5 w-5 text-primary" /></div>
                  </div>
                  {g.ketua && <p className="text-sm mb-1"><span className="text-muted-foreground">Ketua:</span> <span className="font-medium">{g.ketua}</span></p>}
                  {g.phone && <div className="flex items-center gap-2 text-sm mb-2"><Phone className="h-3 w-3 text-muted-foreground" />{g.phone}</div>}
                  {g.latitude && <p className="text-xs text-muted-foreground">📍 {g.latitude?.toFixed(4)}, {g.longitude?.toFixed(4)}</p>}

                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Komoditas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.komoditas && g.komoditas.length > 0 ? g.komoditas.map(k => (
                        <span key={k.id} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Wheat className="h-3 w-3" />{k.name}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">Belum ada</span>}
                    </div>
                  </div>
                  {g.dryer_units && g.dryer_units.length > 0 && (
                    <div className="border-t pt-3 mt-3"><p className="text-xs text-muted-foreground">Dryer: {g.dryer_units.length} unit</p></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GapoktanForm({ initialData, onSaved, onCancel }: { initialData?: Gapoktan | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ 
    name: initialData?.name || '', 
    ketua: initialData?.ketua || '', 
    phone: initialData?.phone || '', 
    desa_id: initialData?.desa_id || '', 
    latitude: initialData?.latitude?.toString() || '', 
    longitude: initialData?.longitude?.toString() || '' 
  });
  const [kabList, setKabList] = useState<Kabupaten[]>([]);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selKab, setSelKab] = useState(initialData?.desa?.kecamatan?.kabupaten_id || '');
  const [selKec, setSelKec] = useState(initialData?.desa?.kecamatan_id || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch('/api/address?type=kabupaten').then(r => r.json()).then(d => setKabList(d)); }, []);
  useEffect(() => { if (selKab) fetch(`/api/address?type=kecamatan&kabupaten_id=${selKab}`).then(r => r.json()).then(d => setKecList(d)); }, [selKab]);
  useEffect(() => { if (selKec) fetch(`/api/address?type=desa&kecamatan_id=${selKec}`).then(r => r.json()).then(d => setDesaList(d)); }, [selKec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = { name: form.name, desa_id: form.desa_id, ketua: form.ketua || null, phone: form.phone || null };
      if (form.latitude) body.latitude = Number(form.latitude);
      if (form.longitude) body.longitude = Number(form.longitude);
      
      const url = initialData ? `/api/gapoktan/${initialData.id}` : '/api/gapoktan';
      const method = initialData ? 'PATCH' : 'POST';
      
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) onSaved();
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4">
      <h3 className="text-lg font-bold">{initialData ? 'Edit Gapoktan' : 'Tambah Gapoktan Baru'}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nama Gapoktan *</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Ketua</label>
          <input type="text" value={form.ketua} onChange={e => setForm({...form, ketua: e.target.value})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Telepon</label>
          <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Kabupaten *</label>
          <select value={selKab} onChange={e => { setSelKab(e.target.value); setSelKec(''); setForm({...form, desa_id: ''}); }} required className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
            <option value="">Pilih...</option>
            {kabList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Kecamatan *</label>
          <select value={selKec} onChange={e => { setSelKec(e.target.value); setForm({...form, desa_id: ''}); }} required disabled={!selKab} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">Pilih...</option>
            {kecList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Desa *</label>
          <select value={form.desa_id} onChange={e => setForm({...form, desa_id: e.target.value})} required disabled={!selKec} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">Pilih...</option>
            {desaList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Latitude</label>
          <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="-7.xxxx" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Longitude</label>
          <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="107.xxxx" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border hover:bg-muted transition-all">Batal</button>
        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {initialData ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
