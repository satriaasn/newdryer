"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState, useMemo } from "react";
import type { Production, Gapoktan, Komoditas, DryerUnit } from "@/lib/types";
import { Plus, Loader2, Trash2, Edit, Download, Printer, ChevronUp, ChevronDown, Filter, X, Coins, Info, Calculator, TrendingUp, Sparkles } from "lucide-react";
import { ImportModal } from "@/components/dashboard/import-modal";
import { exportToCSV } from "@/lib/export-utils";
import { userService, type Profile } from "@/services/user.service";
import { calculateProductionCostAndValueAdded, getDefaultCostRates } from "@/lib/cost-calculator";

type SortKey = 'production_date' | 'gapoktan' | 'komoditas' | 'dryer' | 'qty_before' | 'price_before' | 'qty_after' | 'price_after' | 'qty_diff_pct' | 'price_diff_pct' | 'commodity_value_added_per_kg' | 'business_value_added' | 'net_value_added';
type SortDir = 'asc' | 'desc';

export default function ProductionPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [detailModalProduction, setDetailModalProduction] = useState<Production | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

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
      case 'commodity_value_added_per_kg': return Number(p.commodity_value_added_per_kg) || 0;
      case 'business_value_added': return Number(p.business_value_added) || 0;
      case 'net_value_added': return Number(p.net_value_added) || 0;
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
      userService.getCurrentProfile(),
    ]).then(([p, g, prof]) => {
      setProductions(Array.isArray(p) ? p : []);
      setGapoktan(Array.isArray(g) ? g : []);
      setProfile(prof);
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

  const getFilteredData = () => {
    let data = [...productions];
    if (printDateFrom) data = data.filter(p => (p.production_date || '') >= printDateFrom);
    if (printDateTo) data = data.filter(p => (p.production_date || '') <= printDateTo);
    if (printGapoktan) data = data.filter(p => p.gapoktan?.name?.toLowerCase().includes(printGapoktan.toLowerCase()));
    if (printKomoditas) data = data.filter(p => p.komoditas?.name?.toLowerCase().includes(printKomoditas.toLowerCase()));
    return data;
  };

  const handleDownloadExcel = () => {
    const data = getFilteredData();
    if (data.length === 0) return alert("Tidak ada data yang sesuai filter.");
    
    const exportData = data.map((p, i) => {
      const costRate = (Number(p.cost_operational_rate) || 0) + (Number(p.cost_labor_rate) || 0) + (Number(p.cost_management_rate) || 0);
      return {
        No: i + 1,
        Tanggal: p.production_date,
        Gapoktan: p.gapoktan?.name,
        Komoditas: p.komoditas?.name,
        Dryer: p.dryer_units?.name,
        'Qty Sebelum (Ton)': p.qty_before,
        'Harga Sebelum (Rp/kg)': p.price_before,
        'Qty Sesudah (Ton)': p.qty_after,
        'Harga Sesudah (Rp/kg)': p.price_after,
        'Selisih Qty (%)': p.qty_diff_pct,
        'Selisih Harga (%)': p.price_diff_pct,
        'Biaya Operasional (Rp/kg)': p.cost_operational_rate || 0,
        'Biaya Tenaga Kerja (Rp/kg)': p.cost_labor_rate || 0,
        'Kas Pengelola (Rp/kg)': p.cost_management_rate || 0,
        'Selisih Nilai Basah ke Kering (Rp)': p.gross_value_diff || 0,
        'Nilai Tambah Komoditas (Rp/kg)': p.commodity_value_added_per_kg || 0,
        'Nilai Tambah Sisa Unit Usaha (Rp)': p.business_value_added || 0,
        'Alokasi Tenaga Kerja (Rp)': p.total_cost_labor || 0,
        'Alokasi Kas Pengelola (Rp)': p.total_cost_management || 0,
        'Total Beban Biaya (Rp)': p.total_cost || 0,
        'Keuntungan Bersih Akhir (Rp)': p.net_value_added || 0,
        'Keuntungan Bersih / Kg (Rp/kg)': p.net_value_added_per_kg || 0,
        Catatan: p.notes
      };
    });

    exportToCSV({
      data: exportData,
      filename: `Laporan_Produksi_Nilai_Tambah_${new Date().toISOString().split('T')[0]}`
    });
    setShowPrintModal(false);
  };

  const handlePrint = () => {
    const data = getFilteredData();
    if (data.length === 0) return alert("Tidak ada data yang sesuai filter.");

    const totalQtyBefore = data.reduce((a, p) => a + Number(p.qty_before || 0), 0);
    const totalQtyAfter = data.reduce((a, p) => a + Number(p.qty_after || 0), 0);
    const totalBusinessValueAdded = data.reduce((a, p) => a + Number(p.business_value_added || 0), 0);
    const totalNetValueAdded = data.reduce((a, p) => a + Number(p.net_value_added || 0), 0);

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Laporan Produksi & Nilai Tambah</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { border: 1px solid #ddd; padding: 5px 6px; text-align: left; }
        th { background: #f5f5f5; font-weight: 700; text-transform: uppercase; font-size: 9px; }
        .right { text-align: right; }
        .total { font-weight: 700; background: #f0f9ff; }
        @media print { @page { size: landscape; margin: 8mm; } }
      </style></head><body>
      <h1>LAPORAN PRODUKSI & ANALISIS NILAI TAMBAH PENGERINGAN</h1>
      <div class="sub">
        Periode: ${printDateFrom || 'Awal'} s/d ${printDateTo || 'Akhir'}
        ${printGapoktan ? ' | Gapoktan: ' + printGapoktan : ''}
        ${printKomoditas ? ' | Komoditas: ' + printKomoditas : ''}
        <br/>Dicetak: ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
      </div>
      <table>
        <thead><tr>
          <th>No</th><th>Tanggal</th><th>Gapoktan</th><th>Komoditas</th><th>Dryer</th>
          <th class="right">Qty Sblm</th><th class="right">Harga Sblm</th>
          <th class="right">Qty Ssdh</th><th class="right">Harga Ssdh</th>
          <th class="right">Biaya Ops/kg</th>
          <th class="right">Nilai Tambah / Kg</th>
          <th class="right">Sisa Unit Usaha</th>
          <th class="right">Laba Bersih Akhir</th>
        </tr></thead>
        <tbody>
          ${data.map((p, i) => `<tr>
            <td>${i+1}</td><td>${p.production_date||'-'}</td><td>${p.gapoktan?.name||'-'}</td>
            <td>${p.komoditas?.name||'-'}</td><td>${p.dryer_units?.name||'-'}</td>
            <td class="right">${Number(p.qty_before).toLocaleString()} T</td>
            <td class="right">Rp ${Number(p.price_before).toLocaleString()}</td>
            <td class="right">${Number(p.qty_after).toLocaleString()} T</td>
            <td class="right">Rp ${Number(p.price_after).toLocaleString()}</td>
            <td class="right">Rp ${Number(p.cost_operational_rate || 0).toLocaleString()}</td>
            <td class="right font-bold">Rp ${Number(p.commodity_value_added_per_kg || 0).toLocaleString()} / kg</td>
            <td class="right font-bold">Rp ${Number(p.business_value_added || 0).toLocaleString()}</td>
            <td class="right">Rp ${Number(p.net_value_added || 0).toLocaleString()}</td>
          </tr>`).join('')}
          <tr class="total">
            <td colspan="5">TOTAL (${data.length} Transaksi)</td>
            <td class="right">${totalQtyBefore.toLocaleString()} T</td><td></td>
            <td class="right">${totalQtyAfter.toLocaleString()} T</td><td colspan="2"></td>
            <td></td>
            <td class="right">Rp ${totalBusinessValueAdded.toLocaleString()}</td>
            <td class="right">Rp ${totalNetValueAdded.toLocaleString()}</td>
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
  const isAdmin = !!profile;

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Produksi & Nilai Tambah</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Pencatatan produksi, nilai tambah komoditas per kg, dan nilai tambah sisa untuk unit usaha</p>
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
            <Printer className="h-3.5 w-3.5" /> Cetak / Export
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => { setShowForm(false); setEditingProduction(null); }} 
          />
          <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border bg-card shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <ProductionForm 
              key={editingProduction ? editingProduction.id : 'new'}
              gapoktan={gapoktan} 
              initialData={editingProduction}
              onSaved={handleSaved} 
              onCancel={() => { setShowForm(false); setEditingProduction(null); }} 
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card/60 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Riwayat Produksi & Nilai Tambah</h3>
            <p className="text-xs text-muted-foreground">Kalkulasi nilai tambah per kg dan keuntungan bersih unit usaha</p>
          </div>
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
                <th className="px-4 py-3 font-semibold">Wilayah/Kab</th>
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
                <th className={`${thClass} text-right bg-emerald-500/5`} onClick={() => handleSort('commodity_value_added_per_kg')}>
                  <span className="flex items-center gap-1 justify-end text-emerald-700 dark:text-emerald-400">
                    Nilai Tambah / Kg <SortIcon col="commodity_value_added_per_kg" />
                  </span>
                </th>
                <th className={`${thClass} text-right bg-primary/5`} onClick={() => handleSort('business_value_added')}>
                  <span className="flex items-center gap-1 justify-end text-primary font-bold">
                    Sisa Unit Usaha <SortIcon col="business_value_added" />
                  </span>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleSort('net_value_added')}>
                  <span className="flex items-center gap-1 justify-end">Laba Bersih Akhir <SortIcon col="net_value_added" /></span>
                </th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>
              ) : sortedFiltered.length === 0 ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-muted-foreground">Data tidak ditemukan</td></tr>
              ) : sortedFiltered.map(p => {
                const isCommPositive = (Number(p.commodity_value_added_per_kg) || 0) >= 0;
                const isBizPositive = (Number(p.business_value_added) || 0) >= 0;
                const isNetPositive = (Number(p.net_value_added) || 0) >= 0;
                return (
                  <tr key={p.id} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{p.production_date}</td>
                    <td className="px-4 py-3 font-medium">{p.gapoktan?.name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground italic">
                      {p.gapoktan?.desa?.kecamatan?.kabupaten?.name?.replace('KABUPATEN ', '') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                        {p.komoditas?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.dryer_units?.name || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono">{Number(p.qty_before).toLocaleString()} Ton</td>
                    <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_before).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">{Number(p.qty_after).toLocaleString()} Ton</td>
                    <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_after).toLocaleString()}</td>

                    {/* NILAI TAMBAH KOMODITAS PER KG */}
                    <td className="px-4 py-3 text-right bg-emerald-500/5">
                      <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-full ${isCommPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'}`}>
                        {isCommPositive ? '+' : ''}Rp {Number(p.commodity_value_added_per_kg || 0).toLocaleString()} / kg
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        (Ops: Rp {p.cost_operational_rate || 0}/kg)
                      </div>
                    </td>

                    {/* NILAI TAMBAH SISA UNTUK UNIT USAHA */}
                    <td className="px-4 py-3 text-right bg-primary/5">
                      <div className={`font-mono font-extrabold text-xs ${isBizPositive ? 'text-primary' : 'text-rose-600'}`}>
                        {isBizPositive ? '+' : ''}Rp {Number(p.business_value_added || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Keuntungan Bersih Usaha
                      </div>
                    </td>

                    {/* LABA BERSIH AKHIR SETELAH NAKER & KAS */}
                    <td className="px-4 py-3 text-right">
                      <div className={`font-mono font-bold text-xs ${isNetPositive ? 'text-foreground' : 'text-rose-600'}`}>
                        {isNetPositive ? '+' : ''}Rp {Number(p.net_value_added || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        (Rp {Number(p.net_value_added_per_kg || 0).toLocaleString()}/kg)
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button 
                          type="button"
                          onClick={() => setDetailModalProduction(p)}
                          className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                          title="Lihat Rincian Biaya & Nilai Tambah"
                        >
                          <Coins className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingProduction(p)}
                          className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                          title="Edit Data Produksi"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                          title="Hapus Data"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL RINCIAN BIAYA & NILAI TAMBAH */}
      {detailModalProduction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDetailModalProduction(null)} />
          <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl relative z-10 p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg">Analisis Nilai Tambah Produksi</h3>
              </div>
              <button onClick={() => setDetailModalProduction(null)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Gapoktan / Dryer</span>
                  <span className="font-semibold text-foreground">{detailModalProduction.gapoktan?.name} · {detailModalProduction.dryer_units?.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Komoditas / Tanggal</span>
                  <span className="font-semibold text-foreground">{detailModalProduction.komoditas?.name} ({detailModalProduction.production_date})</span>
                </div>
              </div>

              {/* Step 1: Nilai Selisih Basah ke Kering */}
              <div className="p-3.5 rounded-xl border space-y-2 bg-background">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>1. Nilai Selisih Basah ke Kering</span>
                  <span className="text-primary font-mono">(Tonase Awal: {(Number(detailModalProduction.qty_before) * 1000).toLocaleString()} Kg)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Bahan Baku Basah:</span>
                    <div className="font-mono font-bold text-sm">
                      {detailModalProduction.qty_before} Ton ({(Number(detailModalProduction.qty_before) * 1000).toLocaleString()} Kg)
                    </div>
                    <div className="text-muted-foreground">@ Rp {Number(detailModalProduction.price_before).toLocaleString()} / kg</div>
                    <div className="text-[11px] font-semibold text-muted-foreground mt-1">
                      Total: Rp {(Number(detailModalProduction.qty_before) * 1000 * Number(detailModalProduction.price_before)).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hasil Kering:</span>
                    <div className="font-mono font-bold text-sm">
                      {detailModalProduction.qty_after} Ton ({(Number(detailModalProduction.qty_after) * 1000).toLocaleString()} Kg)
                    </div>
                    <div className="text-muted-foreground">@ Rp {Number(detailModalProduction.price_after).toLocaleString()} / kg</div>
                    <div className="text-[11px] font-semibold text-muted-foreground mt-1">
                      Total: Rp {(Number(detailModalProduction.qty_after) * 1000 * Number(detailModalProduction.price_after)).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">Nilai Selisih dari Basah ke Kering:</span>
                  <span className="font-mono font-bold text-foreground">
                    Rp {Number(detailModalProduction.gross_value_diff || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Nilai Selisih dibagi Tonase Basah:</span>
                  <span className="font-mono font-semibold text-foreground">
                    Rp {Number(detailModalProduction.gross_value_diff_per_kg || 0).toLocaleString()} / kg basah
                  </span>
                </div>
              </div>

              {/* Step 2 & 3: Nilai Tambah Komoditas per Kg & Nilai Tambah Sisa Unit Usaha */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>2. Nilai Tambah Komoditas per Kg</span>
                  <span className="font-mono font-bold text-sm">
                    Rp {Number(detailModalProduction.commodity_value_added_per_kg || 0).toLocaleString()} / kg
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  (Nilai Selisih per kg: Rp {Number(detailModalProduction.gross_value_diff_per_kg || 0).toLocaleString()} - Biaya Operasional: Rp {detailModalProduction.cost_operational_rate || 0}/kg)
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold uppercase block">3. Nilai Tambah Sisa Unit Usaha</span>
                    <span className="text-[10px] text-muted-foreground block">(Keuntungan bersih selisih dikali tonase awal)</span>
                  </div>
                  <span className="font-mono font-extrabold text-lg text-emerald-700 dark:text-emerald-300">
                    Rp {Number(detailModalProduction.business_value_added || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step 4: Alokasi Biaya Tenaga Kerja & Kas Pengelola */}
              <div className="p-3.5 rounded-xl border space-y-2 bg-muted/20">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. Alokasi Biaya Lanjutan dari Sisa Unit Usaha
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Biaya Tenaga Kerja (@ Rp {detailModalProduction.cost_labor_rate || 0}/kg):
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      Rp {Number(detailModalProduction.total_cost_labor || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Kas Pengelola (@ Rp {detailModalProduction.cost_management_rate || 0}/kg):
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      Rp {Number(detailModalProduction.total_cost_management || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5: Laba Bersih Akhir */}
              <div className="p-3.5 rounded-xl bg-card border space-y-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase">
                  <span>5. Keuntungan Bersih Akhir Unit Usaha</span>
                  <span className="font-mono font-bold text-base text-primary">
                    Rp {Number(detailModalProduction.net_value_added || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Keuntungan Bersih per Kg Bahan Baku:</span>
                  <span className="font-mono font-bold text-foreground">
                    Rp {Number(detailModalProduction.net_value_added_per_kg || 0).toLocaleString()} / kg
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setDetailModalProduction(null)}
              className="w-full py-2.5 rounded-xl border bg-muted/60 font-semibold text-sm hover:bg-muted transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Print / Export Filter Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPrintModal(false)} />
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl relative z-10 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2"><Printer className="h-5 w-5" /> Cetak / Export Laporan</h3>
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
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Gapoktan (Opsional)</label>
                <input type="text" value={printGapoktan} onChange={e => setPrintGapoktan(e.target.value)} placeholder="Semua" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Komoditas (Opsional)</label>
                <input type="text" value={printKomoditas} onChange={e => setPrintKomoditas(e.target.value)} placeholder="Semua" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handlePrint}
                className="py-3 bg-card border text-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4 text-primary" /> Preview PDF
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Excel
              </button>
            </div>
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
  
  // Ambil default awal
  const initialRates = getDefaultCostRates(initialData?.komoditas);

  const [form, setForm] = useState({
    komoditas_id: initialData?.komoditas_id || '', 
    dryer_id: initialData?.dryer_id || '', 
    qty_before: initialData?.qty_before?.toString() || '', 
    price_before: initialData?.price_before?.toString() || '',
    qty_after: initialData?.qty_after?.toString() || '', 
    price_after: initialData?.price_after?.toString() || '', 
    cost_operational_rate: (initialData?.cost_operational_rate ?? initialRates.cost_operational).toString(),
    cost_labor_rate: (initialData?.cost_labor_rate ?? initialRates.cost_labor).toString(),
    cost_management_rate: (initialData?.cost_management_rate ?? initialRates.cost_management).toString(),
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

  // Saat komoditas berubah, otomatis sesuaikan tarif default jika bukan mode edit awal
  const handleCommodityChange = (komId: string) => {
    const selected = komoditasList.find(k => k.id === komId);
    const def = getDefaultCostRates(selected);
    setForm(prev => ({
      ...prev,
      komoditas_id: komId,
      cost_operational_rate: def.cost_operational.toString(),
      cost_labor_rate: def.cost_labor.toString(),
      cost_management_rate: def.cost_management.toString(),
    }));
  };

  const qtyDiffPct = Number(form.qty_before) > 0
    ? (((Number(form.qty_after) - Number(form.qty_before)) / Number(form.qty_before)) * 100).toFixed(2)
    : '0';
  const priceDiffPct = Number(form.price_before) > 0
    ? (((Number(form.price_after) - Number(form.price_before)) / Number(form.price_before)) * 100).toFixed(2)
    : '0';

  // Kalkulasi analisis nilai tambah secara realtime
  const costAnalysis = useMemo(() => {
    return calculateProductionCostAndValueAdded({
      qty_before_ton: Number(form.qty_before) || 0,
      price_before_kg: Number(form.price_before) || 0,
      qty_after_ton: Number(form.qty_after) || 0,
      price_after_kg: Number(form.price_after) || 0,
      operational_rate: Number(form.cost_operational_rate) || 0,
      labor_rate: Number(form.cost_labor_rate) || 0,
      management_rate: Number(form.cost_management_rate) || 0,
    });
  }, [form.qty_before, form.price_before, form.qty_after, form.price_after, form.cost_operational_rate, form.cost_labor_rate, form.cost_management_rate]);

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
          cost_operational_rate: costAnalysis.cost_operational_rate,
          cost_labor_rate: costAnalysis.cost_labor_rate,
          cost_management_rate: costAnalysis.cost_management_rate,
          total_cost_operational: costAnalysis.total_cost_operational,
          total_cost_labor: costAnalysis.total_cost_labor,
          total_cost_management: costAnalysis.total_cost_management,
          total_cost: costAnalysis.total_cost,
          gross_value_diff: costAnalysis.gross_value_diff,
          gross_value_diff_per_kg: costAnalysis.gross_value_diff_per_kg,
          commodity_value_added_per_kg: costAnalysis.commodity_value_added_per_kg,
          business_value_added: costAnalysis.business_value_added,
          net_value_added: costAnalysis.net_value_added,
          net_value_added_per_kg: costAnalysis.net_value_added_per_kg,
        }),
      });
      const data = await res.json();
      if (res.ok) onSaved();
      else alert(data.error);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            {initialData ? (
              <>
                <Edit className="h-5 w-5 text-primary" />
                <span>Edit Data Produksi</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                <span>Form Input Produksi</span>
              </>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            {initialData 
              ? 'Perbarui tonase atau tarif biaya, sistem akan otomatis menghitung ulang komponen nilai tambah' 
              : 'Input tonase bahan baku basah & kering, sistem akan otomatis menghitung komponen nilai tambah'}
          </p>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
          title="Tutup Form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Bagian 1: Data Umum Produksi */}
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
          <select value={form.komoditas_id} onChange={e => handleCommodityChange(e.target.value)} required disabled={!selectedGapoktan}
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
      </div>

      {/* Bagian 2: Bobot & Harga Bahan Baku */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 rounded-2xl bg-muted/20 border">
        <div>
          <label className="text-xs font-semibold text-foreground">1. Tonase Sebelum Dikeringkan (Ton)</label>
          <input type="number" step="any" value={form.qty_before} onChange={e => setForm({...form, qty_before: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="0" />
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            = {(Number(form.qty_before) * 1000).toLocaleString()} Kg (Tonase Basah Masuk)
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">Harga Sebelum (Rp/Kg)</label>
          <input type="number" step="any" value={form.price_before} onChange={e => setForm({...form, price_before: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="0" />
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Harga beli bahan baku basah per kg
          </span>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tanggal Produksi</label>
          <input type="date" value={form.production_date} onChange={e => setForm({...form, production_date: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">2. Tonase Setelah Dikeringkan (Ton)</label>
          <input type="number" step="any" value={form.qty_after} onChange={e => setForm({...form, qty_after: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="0" />
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            = {(Number(form.qty_after) * 1000).toLocaleString()} Kg (Hasil Kering)
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">Harga Setelah (Rp/Kg)</label>
          <input type="number" step="any" value={form.price_after} onChange={e => setForm({...form, price_after: e.target.value})} required
            className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="0" />
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Harga jual komoditas kering per kg
          </span>
        </div>
        <div className="flex gap-2 items-center pt-2">
          <div className="flex-1 p-2 rounded-xl border bg-background text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Susut Bobot</span>
            <span className={`text-xs font-bold ${Number(qtyDiffPct) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {qtyDiffPct}%
            </span>
          </div>
          <div className="flex-1 p-2 rounded-xl border bg-background text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Kenaikan Harga</span>
            <span className={`text-xs font-bold ${Number(priceDiffPct) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              +{priceDiffPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Bagian 3: Komponen Biaya Nilai Tambah (Dapat Diupdate oleh Operator) */}
      <div className="p-4 rounded-2xl bg-card border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Komponen Biaya Pengeringan (Fleksibel / Dapat Disesuaikan)</h4>
          </div>
          <span className="text-[11px] text-muted-foreground">Tarif otomatis terisi, operator dapat mengubah sesuai kebutuhan transaksi ini</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Biaya Operasional (Rp/kg)</label>
            <input type="number" step="any" value={form.cost_operational_rate} onChange={e => setForm({...form, cost_operational_rate: e.target.value})} required
              className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="75" />
            <span className="text-[10px] text-muted-foreground">Singkong: 100 | Jagung/Padi: 75</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-blue-600 dark:text-blue-400">Biaya Tenaga Kerja (Rp/kg)</label>
            <input type="number" step="any" value={form.cost_labor_rate} onChange={e => setForm({...form, cost_labor_rate: e.target.value})} required
              className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="100" />
            <span className="text-[10px] text-muted-foreground">Standar: 100/kg</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Kas Pengelola (Rp/kg)</label>
            <input type="number" step="any" value={form.cost_management_rate} onChange={e => setForm({...form, cost_management_rate: e.target.value})} required
              className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" placeholder="100" />
            <span className="text-[10px] text-muted-foreground">Standar: 100/kg</span>
          </div>
        </div>

        {/* LIVE PREVIEW KALKULASI NILAI TAMBAH SESUAI FORMULA USER */}
        <div className="mt-3 p-4 rounded-xl bg-muted/40 border space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-foreground border-b pb-2">
            <span className="flex items-center gap-1.5"><Calculator className="h-4 w-4 text-primary" /> Rincian Nilai Tambah Komoditas & Unit Usaha</span>
            <span className="font-mono text-muted-foreground">Tonase Basah Acuan: {costAnalysis.qty_before_kg.toLocaleString()} Kg</span>
          </div>

          {/* Kartu Highlight: Nilai Tambah per Kg & Sisa Unit Usaha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
              <span className="text-[10px] uppercase font-bold tracking-wider block">Nilai Tambah Komoditas per Kg</span>
              <div className="font-mono font-extrabold text-xl mt-1">
                Rp {costAnalysis.commodity_value_added_per_kg.toLocaleString()} / kg
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                = (Selisih Nilai Rp {costAnalysis.gross_value_diff.toLocaleString()} ÷ {costAnalysis.qty_before_kg.toLocaleString()} Kg) - Ops Rp {costAnalysis.cost_operational_rate}/kg
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">Nilai Tambah Sisa untuk Unit Usaha</span>
              <div className="font-mono font-extrabold text-xl text-primary mt-1">
                Rp {costAnalysis.business_value_added.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                = Nilai Tambah per Kg (Rp {costAnalysis.commodity_value_added_per_kg.toLocaleString()}) × Tonase Awal ({costAnalysis.qty_before_kg.toLocaleString()} Kg)
              </p>
            </div>
          </div>

          {/* Rincian Alokasi Biaya & Laba Bersih */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[10px] text-muted-foreground block">Selisih Nilai Basah-Kering</span>
              <span className="font-mono font-bold text-sm text-foreground">
                Rp {costAnalysis.gross_value_diff.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[10px] text-muted-foreground block">Biaya Operasional</span>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Rp {costAnalysis.total_cost_operational.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[10px] text-muted-foreground block">Alokasi Tenaga Kerja</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                Rp {costAnalysis.total_cost_labor.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[10px] text-muted-foreground block">Alokasi Kas Pengelola</span>
              <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                Rp {costAnalysis.total_cost_management.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-background border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <span className="font-bold text-foreground">Keuntungan Bersih Akhir Unit Usaha:</span>
              <span className="text-[10px] text-muted-foreground block">Setelah disisihkan untuk Upah Tenaga Kerja & Kas Pengelola</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-extrabold text-sm text-primary">
                Rp {costAnalysis.net_value_added.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                (Rp {costAnalysis.net_value_added_per_kg.toLocaleString()} / kg bahan awal)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Catatan Produksi</label>
        <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
          className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="Opsional (catatan pengeringan, kadar air, dll)..." />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border hover:bg-muted transition-all">Batal</button>
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Simpan Perubahan' : 'Simpan Data Produksi'}
        </button>
      </div>
    </form>
  );
}
