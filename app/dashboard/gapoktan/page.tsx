"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Gapoktan, Komoditas, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Users, MapPin, Phone, Wheat, Plus, Loader2, Trash2 } from "lucide-react";

export default function GapoktanAdmin() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [allKomoditas, setAllKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const reload = () => {
    Promise.all([
      fetch('/api/gapoktan').then(r => r.json()),
      fetch('/api/komoditas').then(r => r.json()),
    ]).then(([g, k]) => {
      setGapoktan(Array.isArray(g) ? g : []);
      setAllKomoditas(Array.isArray(k) ? k : []);
    }).finally(() => setLoading(false));
  };
  useEffect(reload, []);

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
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> Tambah Gapoktan
            </button>
          </div>

          {showForm && <AddGapoktanForm onCreated={() => { reload(); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl border bg-card/60 animate-pulse" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gapoktan.map(g => (
                <div key={g.id} className="rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{g.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {g.desa?.name}, {g.desa?.kecamatan?.name}, {g.desa?.kecamatan?.kabupaten?.name}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
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

function AddGapoktanForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', ketua: '', phone: '', desa_id: '', latitude: '', longitude: '' });
  const [kabList, setKabList] = useState<Kabupaten[]>([]);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selKab, setSelKab] = useState('');
  const [selKec, setSelKec] = useState('');
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
      const res = await fetch('/api/gapoktan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) onCreated();
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4">
      <h3 className="text-lg font-bold">Tambah Gapoktan Baru</h3>
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
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
        </button>
      </div>
    </form>
  );
}
