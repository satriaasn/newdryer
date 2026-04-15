"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState, useMemo } from "react";
import type { Production, Gapoktan, Komoditas, DryerUnit } from "@/lib/types";
import { Plus, Loader2, Trash2, Edit, Download, Printer, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { ImportModal } from "@/components/dashboard/import-modal";

type SortKey = 'production_date' | 'gapoktan' | 'komoditas' | 'dryer' | 'qty_before' | 'price_before' | 'qty_after' | 'price_after' | 'qty_diff_pct' | 'price_diff_pct';
type SortDir = 'asc' | 'desc';

export default function ProductionPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('production_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Print filter state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDateFrom, setPrintDateFrom] = useState('');
  const [printDateTo, setPrintDateTo] = useState('');
  const [printGapoktan, setPrintGapoktan] = useState('');
  const [printKomoditas, setPrintKomoditas] = useState('');

  const getSortValue = (p: Production, key: SortKey): string | number => {
    switch(key) {
      case 'production_date': return p.production_date || '';
      case 'gapoktan': return p.gapoktan?.name || '';
      case 'komoditas': return p.komoditas?.name || '';
      case 'dryer': return p.dryer_units?.name || '';
      case 'qty_before': return Number(p.qty_before) || 0;
      case 'price_before': return Number(p.price_before) || 0;
      case 'qty_after': return Number(p.qty_after) || 0;
      case 'price_after': return Number(p.price_after) || 0;
      case 'qty_diff_pct': return Number(p.qty_diff_pct) || 0;
      case 'price_diff_pct': return Number(p.price_diff_pct) || 0;
      default: return '';
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const sortedFiltered = useMemo(() => {
    const filtered = productions.filter(p => {
      const s = searchQuery.toLowerCase();
      return p.gapoktan?.name?.toLowerCase().includes(s) || 
             p.komoditas?.name?.toLowerCase().includes(s) ||
             p.dryer_units?.name?.toLowerCase().includes(s) ||
             p.production_date?.toLowerCase().includes(s);
    });
    return [...filtered].sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [productions, searchQuery, sortKey, sortDir]);

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



  const handlePrint = () => {
    let data = [...productions];
    if (printDateFrom) data = data.filter(p => (p.production_date || '') >= printDateFrom);
    if (printDateTo) data = data.filter(p => (p.production_date || '') <= printDateTo);
    if (printGapoktan) data = data.filter(p => p.gapoktan?.name?.toLowerCase().includes(printGapoktan.toLowerCase()));
    if (printKomoditas) data = data.filter(p => p.komoditas?.name?.toLowerCase().includes(printKomoditas.toLowerCase()));
    
    if (data.length === 0) return alert("Tidak ada data yang sesuai filter.");

    const totalQtyBefore = data.reduce((a, p) => a + Number(p.qty_before || 0), 0);
    const totalQtyAfter = data.reduce((a, p) => a + Number(p.qty_after || 0), 0);

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Laporan Produksi</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        .right { text-align: right; }
        .total { font-weight: 700; background: #f0f9ff; }
        @media print { @page { size: landscape; margin: 10mm; } }
      </style></head><body>
      <h1>LAPORAN DATA PRODUKSI PENGERINGAN</h1>
      <div class="sub">
        Periode: ${printDateFrom || 'Awal'} s/d ${printDateTo || 'Akhir'}
        ${printGapoktan ? ' | Gapoktan: ' + printGapoktan : ''}
        ${printKomoditas ? ' | Komoditas: ' + printKomoditas : ''}
        <br/>Dicetak: ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
      </div>
      <table>
        <thead><tr>
          <th>No</th><th>Tanggal</th><th>Gapoktan</th><th>Komoditas</th><th>Dryer</th>
          <th class="right">Qty Sebelum</th><th class="right">Harga Sblm</th>
          <th class="right">Qty Sesudah</th><th class="right">Harga Ssdh</th>
          <th class="right">Δ Qty</th><th class="right">Δ Harga</th><th>Catatan</th>
        </tr></thead>
        <tbody>
          ${data.map((p, i) => `<tr>
            <td>${i+1}</td><td>${p.production_date||'-'}</td><td>${p.gapoktan?.name||'-'}</td>
            <td>${p.komoditas?.name||'-'}</td><td>${p.dryer_units?.name||'-'}</td>
            <td class="right">${Number(p.qty_before).toLocaleString()} T</td>
            <td class="right">Rp ${Number(p.price_before).toLocaleString()}</td>
            <td class="right">${Number(p.qty_after).toLocaleString()} T</td>
            <td class="right">Rp ${Number(p.price_after).toLocaleString()}</td>
            <td class="right">${p.qty_diff_pct}%</td>
            <td class="right">+${p.price_diff_pct}%</td>
            <td>${p.notes||'-'}</td>
          </tr>`).join('')}
          <tr class="total">
            <td colspan="5">TOTAL (${data.length} Batch)</td>
            <td class="right">${totalQtyBefore.toLocaleString()} T</td><td></td>
            <td class="right">${totalQtyAfter.toLocaleString()} T</td><td colspan="4"></td>
          </tr>
        </tbody>
      </table>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    win.document.close();
    setShowPrintModal(false);
  };

  const thClass = "px-4 py-3 cursor-pointer hover:bg-muted/80 select-none transition-colors";

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Produksi</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Input dan riwayat data produksi pengeringan</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button 
            onClick={() => setShowImport(true)} 
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5 rotate-180" /> Import
          </button>
          <button 
            onClick={() => setShowPrintModal(true)} 
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak
          </button>
          <button
            onClick={() => { setEditingProduction(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Input Produksi
          </button>
        </div>
      </header>

      <div className="relative">
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari data produksi..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card/60 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <ImportModal title="Import Data Produksi" isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={reload} />

          {(showForm || editingProduction) && (
            <ProductionForm 
              gapoktan={gapoktan} 
              initialData={editingProduction}
              onSaved={handleSaved} 
              onCancel={() => { setShowForm(false); setEditingProduction(null); }} 
            />
          )}

          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Riwayat Produksi</h3>
              <span className="text-xs text-muted-foreground font-medium">{sortedFiltered.length} data · Klik kolom untuk urutkan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className={thClass} onClick={() => handleSort('production_date')}>
                      <span className="flex items-center gap-1">Tanggal <SortIcon col="production_date" /></span>
                    </th>
                    <th className={thClass} onClick={() => handleSort('gapoktan')}>
                      <span className="flex items-center gap-1">Gapoktan <SortIcon col="gapoktan" /></span>
                    </th>
                    <th className={thClass} onClick={() => handleSort('komoditas')}>
                      <span className="flex items-center gap-1">Komoditas <SortIcon col="komoditas" /></span>
                    </th>
                    <th className={thClass} onClick={() => handleSort('dryer')}>
                      <span className="flex items-center gap-1">Dryer <SortIcon col="dryer" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('qty_before')}>
                      <span className="flex items-center gap-1 justify-end">Qty Sblm <SortIcon col="qty_before" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('price_before')}>
                      <span className="flex items-center gap-1 justify-end">Harga Sblm <SortIcon col="price_before" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('qty_after')}>
                      <span className="flex items-center gap-1 justify-end">Qty Ssdh <SortIcon col="qty_after" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('price_after')}>
                      <span className="flex items-center gap-1 justify-end">Harga Ssdh <SortIcon col="price_after" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('qty_diff_pct')}>
                      <span className="flex items-center gap-1 justify-end">Δ Qty <SortIcon col="qty_diff_pct" /></span>
                    </th>
                    <th className={`${thClass} text-right`} onClick={() => handleSort('price_diff_pct')}>
                      <span className="flex items-center gap-1 justify-end">Δ Harga <SortIcon col="price_diff_pct" /></span>
                    </th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>
                  ) : sortedFiltered.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Data tidak ditemukan</td></tr>
                  ) : sortedFiltered.map(p => (
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

      {/* Print Filter Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPrintModal(false)} />
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl relative z-10 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2"><Printer className="h-5 w-5" /> Cetak Laporan Produksi</h3>
              <button onClick={() => setShowPrintModal(false)} className="p-1 hover:bg-muted rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Dari Tanggal</label>
                <input type="date" value={printDateFrom} onChange={e => setPrintDateFrom(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Sampai Tanggal</label>
                <input type="date" value={printDateTo} onChange={e => setPrintDateTo(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Gapoktan (Opsional)</label>
                <input type="text" value={printGapoktan} onChange={e => setPrintGapoktan(e.target.value)} placeholder="Semua" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Komoditas (Opsional)</label>
                <input type="text" value={printKomoditas} onChange={e => setPrintKomoditas(e.target.value)} placeholder="Semua" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
            </div>
            <button 
              onClick={handlePrint}
              className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" /> Cetak Sekarang
            </button>
          </div>
        </div>
      )}
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
