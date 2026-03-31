"use client";

import { useEffect, useState } from "react";
import type { Gapoktan, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface GapoktanFormProps {
  initialData?: Gapoktan | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function GapoktanForm({ initialData, onSaved, onCancel }: GapoktanFormProps) {
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
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
      <h3 className="text-lg font-bold">{initialData ? 'Edit Gapoktan' : 'Tambah Gapoktan Baru'}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Gapoktan *</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Masukkan nama gapoktan" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ketua</label>
          <input type="text" value={form.ketua} onChange={e => setForm({...form, ketua: e.target.value})} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nama ketua" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telepon</label>
          <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="08xxxx" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kabupaten *</label>
          <select value={selKab} onChange={e => { setSelKab(e.target.value); setSelKec(''); setForm({...form, desa_id: ''}); }} required className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none">
            <option value="">Pilih Kabupaten...</option>
            {kabList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kecamatan *</label>
          <select value={selKec} onChange={e => { setSelKec(e.target.value); setForm({...form, desa_id: ''}); }} required disabled={!selKab} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50">
            <option value="">Pilih Kecamatan...</option>
            {kecList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Desa *</label>
          <select value={form.desa_id} onChange={e => setForm({...form, desa_id: e.target.value})} required disabled={!selKec} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50">
            <option value="">Pilih Desa...</option>
            {desaList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Latitude</label>
          <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="-7.xxxx" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Longitude</label>
          <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="107.xxxx" />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-medium rounded-xl border hover:bg-muted transition-all active:scale-95">Batal</button>
        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Simpan Perubahan' : 'Simpan Gapoktan'}
        </button>
      </div>
    </form>
  );
}
