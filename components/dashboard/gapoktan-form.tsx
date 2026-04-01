"use client";

import { useEffect, useState } from "react";
import type { Gapoktan, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Loader2, MapPin, Globe, Navigation } from "lucide-react";

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
    longitude: initialData?.longitude?.toString() || '',
    address: initialData?.address || '' 
  });
  const [kabList, setKabList] = useState<Kabupaten[]>([]);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selKab, setSelKab] = useState(initialData?.desa?.kecamatan?.kabupaten_id || '');
  const [selKec, setSelKec] = useState(initialData?.desa?.kecamatan_id || '');
  const [submitting, setSubmitting] = useState(false);
  const [mapsUrl, setMapsUrl] = useState("");

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation tidak didukung browser ini");
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(prev => ({ 
        ...prev, 
        latitude: pos.coords.latitude.toString(), 
        longitude: pos.coords.longitude.toString() 
      }));
    }, (err) => alert("Gagal mengambil lokasi: " + err.message));
  };

  const handleParseMapsUrl = () => {
    if (!mapsUrl) return;
    // Regex for @lat,long
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapsUrl.match(regex);
    if (match) {
      setForm(prev => ({ ...prev, latitude: match[1], longitude: match[2] }));
      setMapsUrl("");
    } else {
      // Try search query format q=lat,long
      const qRegex = /q=(-?\d+\.\d+)%2C(-?\d+\.\d+)/;
      const qMatch = mapsUrl.match(qRegex);
      if (qMatch) {
        setForm(prev => ({ ...prev, latitude: qMatch[1], longitude: qMatch[2] }));
        setMapsUrl("");
      } else {
        alert("URL tidak valid. Pastikan URL berisi koordinat (ada tanda '@lat,long' atau 'q=lat,long')");
      }
    }
  };

  useEffect(() => { fetch('/api/address?type=kabupaten').then(r => r.json()).then(d => setKabList(d)); }, []);
  useEffect(() => { if (selKab) fetch(`/api/address?type=kecamatan&kabupaten_id=${selKab}`).then(r => r.json()).then(d => setKecList(d)); }, [selKab]);
  useEffect(() => { if (selKec) fetch(`/api/address?type=desa&kecamatan_id=${selKec}`).then(r => r.json()).then(d => setDesaList(d)); }, [selKec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = { name: form.name, desa_id: form.desa_id, ketua: form.ketua || null, phone: form.phone || null, address: form.address || null };
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
        <div className="lg:col-span-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alamat Lengkap</label>
          <textarea 
            value={form.address} 
            onChange={e => setForm({...form, address: e.target.value})} 
            className="w-full mt-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]" 
            placeholder="Jalan, No. Rumah, RT/RW, Dusun..."
          />
        </div>
        <div className="lg:col-span-3 border-t pt-4 mt-2">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px]">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Input Google Maps URL (Auto Convert)</label>
              <div className="flex gap-2 mt-1.5">
                <input 
                  type="text" 
                  value={mapsUrl} 
                  onChange={e => setMapsUrl(e.target.value)}
                  placeholder="Paste link Google Maps di sini..."
                  className="flex-1 rounded-xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={handleParseMapsUrl} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold transition-all">Konversi</button>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleGetLocation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-xs font-bold transition-all h-[38px]"
            >
              <Navigation className="h-3.5 w-3.5" /> Ambil Lokasi Live
            </button>
          </div>
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
