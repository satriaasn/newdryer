"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import type { Gapoktan, Komoditas, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Users, MapPin, Phone, Wheat, Plus, Loader2, Trash2, Edit, Download, Printer } from "lucide-react";
import { GapoktanForm } from "@/components/dashboard/gapoktan-form";
import { ImportModal } from "@/components/dashboard/import-modal";

const printGapoktanProfile = (g: Gapoktan) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>Profil ${g.name}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 30px; color: #1a1a1a; max-width: 700px; }
      h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
      .row { display: flex; margin: 6px 0; }
      .label { font-weight: 700; width: 160px; color: #555; font-size: 13px; }
      .value { font-size: 13px; }
      .section { margin-top: 16px; font-weight: 700; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 12px; font-size: 11px; margin: 2px 4px 2px 0; font-weight: 600; }
      .footer { margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
      @media print { @page { margin: 15mm; } }
    </style></head><body>
    <h1>PROFIL GAPOKTAN: ${g.name}</h1>
    <div class="row"><div class="label">Nama Gapoktan</div><div class="value">${g.name}</div></div>
    <div class="row"><div class="label">Ketua</div><div class="value">${g.ketua || '-'}</div></div>
    <div class="row"><div class="label">No. Telepon</div><div class="value">${g.phone || '-'}</div></div>
    <div class="row"><div class="label">Alamat</div><div class="value">${g.address || '-'}</div></div>
    <div class="row"><div class="label">Desa</div><div class="value">${g.desa?.name || '-'}</div></div>
    <div class="row"><div class="label">Kecamatan</div><div class="value">${g.desa?.kecamatan?.name || '-'}</div></div>
    <div class="row"><div class="label">Kabupaten</div><div class="value">${g.desa?.kecamatan?.kabupaten?.name || '-'}</div></div>
    ${g.latitude ? `<div class="row"><div class="label">Koordinat</div><div class="value">${g.latitude?.toFixed(6)}, ${g.longitude?.toFixed(6)}</div></div>` : ''}
    <div class="section">Komoditas</div>
    <div style="margin-top:6px">${g.komoditas && g.komoditas.length > 0 ? g.komoditas.map(k => `<span class="badge">${k.name}</span>`).join('') : '<span style="color:#999">Belum ada</span>'}</div>
    ${g.dryer_units && g.dryer_units.length > 0 ? `
      <div class="section">Unit Dryer (${g.dryer_units.length} unit)</div>
      <div style="margin-top:6px">${g.dryer_units.map(d => `<span class="badge">${d.name} (${d.capacity_ton}T)</span>`).join('')}</div>
    ` : ''}
    <div class="footer">Dicetak pada ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>
  `);
  win.document.close();
};

export default function GapoktanAdmin() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [allKomoditas, setAllKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingGapoktan, setEditingGapoktan] = useState<Gapoktan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredGapoktan = gapoktan.filter(g => {
    const s = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(s) || 
           g.ketua?.toLowerCase().includes(s) || 
           g.address?.toLowerCase().includes(s) ||
           g.desa?.name?.toLowerCase().includes(s) ||
           g.desa?.kecamatan?.name?.toLowerCase().includes(s);
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Data Gapoktan</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Manajemen data Gabungan Kelompok Tani</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowImport(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4 rotate-180" /> Import Data
          </button>
          <button 
            onClick={() => { setEditingGapoktan(null); setShowForm(!showForm); }} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Tambah Gapoktan
          </button>
        </div>
      </header>

      <div className="relative">
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari gapoktan, ketua, atau alamat..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card/60 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <ImportModal title="Import Data Gapoktan" isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={reload} />

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
              {filteredGapoktan.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">Data tidak ditemukan</div>
              ) : filteredGapoktan.map(g => (
                <div key={g.id} className="relative group rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => printGapoktanProfile(g)}
                      className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                      title="Cetak Profil"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
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
                  {g.address && <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic">🏠 {g.address}</p>}
                  {g.latitude && <p className="text-xs text-muted-foreground font-mono">📍 {g.latitude?.toFixed(4)}, {g.longitude?.toFixed(4)}</p>}

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
  );
}

