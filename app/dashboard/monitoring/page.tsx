"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import type { DryerUnit, Production, Gapoktan } from "@/lib/types";
import { 
  Factory, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Download, 
  Printer, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Clock, 
  Wheat, 
  BarChart3, 
  Radio, 
  Layers, 
  Flame, 
  ArrowUpRight,
  Info,
  LayoutGrid,
  Grid3X3,
  Zap
} from "lucide-react";
import { exportToCSV } from "@/lib/export-utils";
import { DryerMachineIcon } from "@/components/dashboard/dryer-machine-icon";

export default function DryerMonitoringPage() {
  const [dryers, setDryers] = useState<DryerUnit[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7days' | '30days' | 'all'>('today');

  const [filterColorStatus, setFilterColorStatus] = useState<'all' | 'producing' | 'idle'>('all');
  const [filterKabupaten, setFilterKabupaten] = useState<string>('all');
  const [filterProductionLevel, setFilterProductionLevel] = useState<'all' | 'high' | 'normal' | 'zero'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active View Tab: 'grid' (Monitoring Visual) | 'report' (Laporan Analisis)
  const [activeTab, setActiveTab] = useState<'grid' | 'report'>('grid');
  // Display Mode: 'visual' (Ikon Mesin Dryer) | 'compact' (Matriks Kompak)
  const [displayMode, setDisplayMode] = useState<'visual' | 'compact'>('visual');

  // Modal Detail Dryer
  const [selectedDryerModal, setSelectedDryerModal] = useState<{
    dryer: DryerUnit;
    dayProduction: Production[];
    totalDayTon: number;
    isProducing: boolean;
    lastProductionDate?: string;
  } | null>(null);

  // Load Data
  const reload = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/dryer', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/address?type=kabupaten', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([d, p, kab]) => {
      setDryers(Array.isArray(d) ? d : []);
      setProductions(Array.isArray(p) ? p : []);
      setKabupatenList(Array.isArray(kab) ? kab : []);
    }).finally(() => setLoading(false));
  };

  useEffect(reload, []);

  // Quick Date Range Handler
  const handleDatePreset = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'all') => {
    setDateRange(preset);
    const d = new Date();
    if (preset === 'today') {
      setSelectedDate(todayStr);
      setDateMode('single');
    } else if (preset === 'yesterday') {
      d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
      setDateMode('single');
    } else {
      setDateMode('range');
    }
  };

  // Helper filter productions by date or range
  const isDateMatched = (prodDate: string): boolean => {
    if (dateMode === 'single') {
      return prodDate === selectedDate;
    }
    const target = new Date(prodDate).getTime();
    const now = new Date(todayStr).getTime();
    if (dateRange === '7days') {
      const past7 = now - 7 * 24 * 60 * 60 * 1000;
      return target >= past7 && target <= now;
    }
    if (dateRange === '30days') {
      const past30 = now - 30 * 24 * 60 * 60 * 1000;
      return target >= past30 && target <= now;
    }
    return true; // 'all'
  };

  // Compile Status for every Dryer
  const dryerStatuses = useMemo(() => {
    return dryers.map(dryer => {
      // Produksi pada tanggal/rentang terpilih
      const matchedProds = productions.filter(p => p.dryer_id === dryer.id && isDateMatched(p.production_date));
      const totalTon = matchedProds.reduce((sum, p) => sum + (Number(p.qty_before) || 0), 0);
      const isProducing = matchedProds.length > 0 && totalTon > 0;

      // Cari produksi terakhir secara keseluruhan di database
      const allDryerProds = productions
        .filter(p => p.dryer_id === dryer.id)
        .sort((a, b) => (b.production_date || '').localeCompare(a.production_date || ''));
      
      const lastProduction = allDryerProds[0];
      const lastProductionDate = lastProduction?.production_date;

      // Hitung selisih hari dari terakhir produksi
      let daysSinceLast = -1;
      if (lastProductionDate) {
        const diffMs = new Date(selectedDate).getTime() - new Date(lastProductionDate).getTime();
        daysSinceLast = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      // Kategori produksi
      let level: 'high' | 'normal' | 'zero' = 'zero';
      if (totalTon >= 15) level = 'high';
      else if (totalTon > 0) level = 'normal';

      return {
        dryer,
        isProducing,
        totalTon: Math.round(totalTon * 100) / 100,
        batchCount: matchedProds.length,
        commodities: Array.from(new Set(matchedProds.map(p => p.komoditas?.name).filter(Boolean))) as string[],
        matchedProds,
        lastProductionDate,
        daysSinceLast,
        level,
        kabupatenName: dryer.gapoktan?.desa?.kecamatan?.kabupaten?.name || 'Lainnya',
      };
    });
  }, [dryers, productions, selectedDate, dateMode, dateRange]);

  // Filtered List
  const filteredList = useMemo(() => {
    return dryerStatuses.filter(item => {
      // 1. Status Warna Hijau/Merah
      if (filterColorStatus === 'producing' && !item.isProducing) return false;
      if (filterColorStatus === 'idle' && item.isProducing) return false;

      // 2. Kabupaten
      if (filterKabupaten !== 'all' && item.kabupatenName.toLowerCase() !== filterKabupaten.toLowerCase()) {
        return false;
      }

      // 3. Level Produksi
      if (filterProductionLevel !== 'all' && item.level !== filterProductionLevel) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const dName = item.dryer.name.toLowerCase();
        const gName = (item.dryer.gapoktan?.name || '').toLowerCase();
        const loc = (item.dryer.gapoktan?.desa?.name || '').toLowerCase();
        if (!dName.includes(q) && !gName.includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [dryerStatuses, filterColorStatus, filterKabupaten, filterProductionLevel, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = dryerStatuses.length;
    const producing = dryerStatuses.filter(d => d.isProducing).length;
    const idle = total - producing;
    const totalTon = dryerStatuses.reduce((acc, d) => acc + d.totalTon, 0);
    const producingPct = total > 0 ? Math.round((producing / total) * 100) : 0;
    const idlePct = total > 0 ? Math.round((idle / total) * 100) : 0;

    return { total, producing, idle, totalTon: Math.round(totalTon * 10) / 10, producingPct, idlePct };
  }, [dryerStatuses]);

  // Ranking: Dryer Produksi Tinggi (Teratas)
  const highProductionRank = useMemo(() => {
    return [...dryerStatuses]
      .filter(d => d.totalTon > 0)
      .sort((a, b) => b.totalTon - a.totalTon);
  }, [dryerStatuses]);

  // Ranking: Dryer Tidak Produksi (Idle)
  const idleDryersList = useMemo(() => {
    return [...dryerStatuses]
      .filter(d => !d.isProducing)
      .sort((a, b) => (b.daysSinceLast ?? 999) - (a.daysSinceLast ?? 999));
  }, [dryerStatuses]);

  // Export Laporan Monitoring to Excel
  const handleExportExcel = () => {
    if (dryerStatuses.length === 0) return alert("Tidak ada data untuk diexport");

    const exportData = dryerStatuses.map((item, idx) => ({
      No: idx + 1,
      'Tanggal Pemantauan': dateMode === 'single' ? selectedDate : `Rentang: ${dateRange}`,
      'Nama Unit Dryer': item.dryer.name,
      'Gapoktan': item.dryer.gapoktan?.name || '-',
      'Kabupaten': item.kabupatenName,
      'Kecamatan': item.dryer.gapoktan?.desa?.kecamatan?.name || '-',
      'Desa': item.dryer.gapoktan?.desa?.name || '-',
      'Kapasitas (Ton)': item.dryer.capacity_ton || 0,
      'Status Operasi': item.isProducing ? '🟢 BERPRODUKSI (HIJAU)' : '🔴 TIDAK PRODUKSI (MERAH)',
      'Total Tonase Hari Ini (Ton)': item.totalTon,
      'Jumlah Batch/Input': item.batchCount,
      'Komoditas Diolah': item.commodities.join(', ') || '-',
      'Kategori Produksi': item.level === 'high' ? 'Produksi Tinggi' : item.level === 'normal' ? 'Normal' : 'Tidak Produksi',
      'Terakhir Berproduksi': item.lastProductionDate || 'Belum ada catatan',
      'Kontak Ketua': item.dryer.gapoktan?.phone || '-',
      'Ketua Gapoktan': item.dryer.gapoktan?.ketua || '-',
    }));

    exportToCSV({
      data: exportData,
      filename: `Laporan_Monitoring_Dryer_${selectedDate}`
    });
  };

  // Print PDF Preview
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Laporan Monitoring Operasi Dryer</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
        h1 { font-size: 18px; margin-bottom: 2px; }
        .sub { font-size: 11px; color: #64748b; margin-bottom: 14px; }
        .kpi { display: flex; gap: 10px; margin-bottom: 16px; }
        .kpi-box { border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 6px; font-size: 12px; }
        .kpi-val { font-weight: bold; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; }
        th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 9px; }
        .green { color: #16a34a; font-weight: bold; }
        .red { color: #dc2626; font-weight: bold; }
        .right { text-align: right; }
        @media print { @page { size: landscape; margin: 8mm; } }
      </style></head><body>
      <h1>LAPORAN MONITORING STATUS OPERASI MESIN DRYER</h1>
      <div class="sub">Tanggal Pantau: ${selectedDate} | Dicetak: ${new Date().toLocaleString('id-ID')}</div>

      <div class="kpi">
        <div class="kpi-box">Total Unit: <span class="kpi-val">${summary.total} Unit</span></div>
        <div class="kpi-box">🟢 Berproduksi: <span class="kpi-val green">${summary.producing} Unit (${summary.producingPct}%)</span></div>
        <div class="kpi-box">🔴 Tidak Produksi: <span class="kpi-val red">${summary.idle} Unit (${summary.idlePct}%)</span></div>
        <div class="kpi-box">Total Tonase: <span class="kpi-val">${summary.totalTon} Ton</span></div>
      </div>

      <h3>Daftar Status Mesin Dryer</h3>
      <table>
        <thead><tr>
          <th>No</th><th>Nama Unit Dryer</th><th>Gapoktan</th><th>Kabupaten</th>
          <th class="right">Kapasitas</th><th>Status Warna</th><th class="right">Tonase</th>
          <th>Jumlah Batch</th><th>Komoditas</th><th>Terakhir Aktif</th>
        </tr></thead>
        <tbody>
          ${dryerStatuses.map((item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><b>${item.dryer.name}</b></td>
              <td>${item.dryer.gapoktan?.name || '-'}</td>
              <td>${item.kabupatenName}</td>
              <td class="right">${item.dryer.capacity_ton || '-'} T</td>
              <td class="${item.isProducing ? 'green' : 'red'}">${item.isProducing ? '🟢 BERPRODUKSI' : '🔴 TIDAK PRODUKSI'}</td>
              <td class="right">${item.totalTon > 0 ? item.totalTon + ' T' : '-'}</td>
              <td>${item.batchCount > 0 ? item.batchCount + ' Kali' : '-'}</td>
              <td>${item.commodities.join(', ') || '-'}</td>
              <td>${item.lastProductionDate || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      {/* Header Halaman */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Monitoring Unit Dryer</h1>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-0.5">
            Pantau status aktivitas operasi mesin dryer secara real-time: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Hijau (Berproduksi)</span> & <span className="font-semibold text-rose-600 dark:text-rose-400">Merah (Tidak Produksi)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export Excel
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Printer className="h-4 w-4 text-primary" /> Cetak PDF
          </button>
        </div>
      </header>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Dryer */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Dryer</span>
            <Factory className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
            {summary.total} <span className="text-sm font-normal text-muted-foreground">Unit</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            Tersebar di {kabupatenList.length} Kabupaten
          </div>
        </div>

        {/* 🟢 BERPRODUKSI (HIJAU) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Berproduksi (Hijau)
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-400">
            {summary.producing} <span className="text-sm font-semibold text-emerald-600/80">Unit ({summary.producingPct}%)</span>
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300">
            Ada transaksi & input produksi pada tanggal ini
          </div>
        </div>

        {/* 🔴 TIDAK PRODUKSI (MERAH) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur shadow-sm space-y-2">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Tidak Produksi (Merah)
            </span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-700 dark:text-rose-400">
            {summary.idle} <span className="text-sm font-semibold text-rose-600/80">Unit ({summary.idlePct}%)</span>
          </div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-300">
            Tidak ada catatan produksi pada tanggal ini
          </div>
        </div>

        {/* TOTAL TONASE */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Volume Pengeringan</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
            {summary.totalTon.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Ton</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Total gabah/jagung/singkong yang diproses
          </div>
        </div>
      </div>

      {/* PROGRESS RATIO BAR */}
      <div className="bg-card/60 p-4 rounded-2xl border space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Aktif Berproduksi: {summary.producing} Unit ({summary.producingPct}%)
          </span>
          <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Tidak Produksi: {summary.idle} Unit ({summary.idlePct}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-rose-500/20 overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${summary.producingPct}%` }}
          />
        </div>
      </div>

      {/* FILTER CONTROLS & DATE SELECTOR */}
      <div className="bg-card/70 p-4 sm:p-5 rounded-2xl border space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tanggal Pantauan */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Pantau:</label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setDateMode('single'); }}
                className="px-3 py-1.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 ring-primary/20 transition-all"
              />
              <div className="flex gap-1">
                <button 
                  onClick={() => handleDatePreset('today')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${dateRange === 'today' && dateMode === 'single' ? 'bg-primary text-white shadow-sm' : 'border hover:bg-muted text-muted-foreground'}`}
                >
                  Hari Ini
                </button>
                <button 
                  onClick={() => handleDatePreset('yesterday')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${dateRange === 'yesterday' && dateMode === 'single' ? 'bg-primary text-white shadow-sm' : 'border hover:bg-muted text-muted-foreground'}`}
                >
                  Kemarin
                </button>
                <button 
                  onClick={() => handleDatePreset('7days')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${dateMode === 'range' && dateRange === '7days' ? 'bg-primary text-white shadow-sm' : 'border hover:bg-muted text-muted-foreground'}`}
                >
                  7 Hari
                </button>
                <button 
                  onClick={() => handleDatePreset('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${dateMode === 'range' && dateRange === 'all' ? 'bg-primary text-white shadow-sm' : 'border hover:bg-muted text-muted-foreground'}`}
                >
                  Semua Waktu
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Tab View */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border self-start lg:self-auto">
            <button 
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Layers className="h-3.5 w-3.5" /> Kotak Warna ({filteredList.length})
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'report' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Laporan Analisis
            </button>
          </div>
        </div>

        {/* Baris Filter Lanjutan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t">
          {/* Filter Status Warna */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Filter Status Warna</label>
            <select 
              value={filterColorStatus} 
              onChange={e => setFilterColorStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-medium"
            >
              <option value="all">Semua Dryer ({dryerStatuses.length})</option>
              <option value="producing">🟢 Hanya Berproduksi ({summary.producing})</option>
              <option value="idle">🔴 Hanya Tidak Produksi ({summary.idle})</option>
            </select>
          </div>

          {/* Filter Wilayah / Kabupaten */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Wilayah / Kabupaten</label>
            <select 
              value={filterKabupaten} 
              onChange={e => setFilterKabupaten(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-medium"
            >
              <option value="all">Semua Kabupaten</option>
              {kabupatenList.map(k => (
                <option key={k.id} value={k.name}>{k.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Tingkat Produksi */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Tingkat Produksi</label>
            <select 
              value={filterProductionLevel} 
              onChange={e => setFilterProductionLevel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-medium"
            >
              <option value="all">Semua Tingkat</option>
              <option value="high">Produksi Tinggi (≥ 15 Ton)</option>
              <option value="normal">Produksi Normal (&gt; 0 Ton)</option>
              <option value="zero">Nol / Tidak Produksi (0 Ton)</option>
            </select>
          </div>

          {/* Pencarian Nama Dryer / Gapoktan */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Cari Dryer / Gapoktan</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ketik nama dryer..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border bg-background text-xs"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: VISUAL IKON DRYER & GRID MATRIX */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          {/* Header Grid: Count, Mode Switcher, & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pb-1">
            <div className="flex items-center gap-2">
              <span>Menampilkan <b>{filteredList.length}</b> unit dryer dari total {dryers.length} mesin</span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Tampilan Switcher */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border">
                <button
                  type="button"
                  onClick={() => setDisplayMode('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    displayMode === 'visual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Tampilan Visual Ikon Mesin Dryer"
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ikon Mesin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('compact')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    displayMode === 'compact'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Tampilan Matriks Kompak"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  <span>Matriks Kompak</span>
                </button>
              </div>

              {/* Legend Status Warna */}
              <div className="flex items-center gap-3 border-l pl-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Hijau = Berproduksi
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Merah = Tidak Produksi
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl border animate-pulse bg-card/60" />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center border rounded-2xl bg-card/40 space-y-3">
              <div className="flex justify-center opacity-40">
                <DryerMachineIcon isProducing={false} size="lg" showGlow={false} />
              </div>
              <h4 className="font-bold text-sm">Tidak ada dryer yang cocok dengan filter</h4>
              <p className="text-xs text-muted-foreground">Coba ubah tanggal pantau, status warna, atau kata kunci pencarian</p>
            </div>
          ) : displayMode === 'visual' ? (
            /* MODE 1: VISUAL IKON MESIN DRYER (DETAIL & ESTETIK) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredList.map(item => {
                const isGreen = item.isProducing;
                return (
                  <div 
                    key={item.dryer.id}
                    onClick={() => setSelectedDryerModal({
                      dryer: item.dryer,
                      dayProduction: item.matchedProds,
                      totalDayTon: item.totalTon,
                      isProducing: item.isProducing,
                      lastProductionDate: item.lastProductionDate
                    })}
                    className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
                      isGreen 
                        ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-card hover:border-emerald-500 hover:shadow-emerald-500/20 dark:from-emerald-950/40 dark:via-emerald-950/10 dark:to-card' 
                        : 'border-rose-500/40 bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-card hover:border-rose-500 hover:shadow-rose-500/15 dark:from-rose-950/30 dark:via-rose-950/10 dark:to-card'
                    }`}
                  >
                    {/* Header Box: Status Pill & Kapasitas */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                        isGreen 
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' 
                          : 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full bg-white ${isGreen ? 'animate-ping' : ''}`} />
                        {isGreen ? 'BERPRODUKSI' : 'TIDAK PRODUKSI'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted/80 text-foreground border border-border/40">
                        {item.dryer.capacity_ton ? `${item.dryer.capacity_ton}T` : '-'}
                      </span>
                    </div>

                    {/* Showcase Center: IKON MESIN DRYER & METRIK UTAMA */}
                    <div className={`my-2.5 flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                      isGreen 
                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/30' 
                        : 'bg-rose-500/5 border-rose-500/20 dark:bg-rose-950/20'
                    }`}>
                      {/* IKON MESIN DRYER SVG */}
                      <div className="shrink-0 flex items-center justify-center p-1">
                        <DryerMachineIcon isProducing={isGreen} size="md" />
                      </div>

                      {/* INFORMASI PRODUKSI */}
                      <div className="min-w-0 flex-1">
                        {isGreen ? (
                          <div>
                            <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-tight block">
                              SEDANG OPERASI
                            </span>
                            <div className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-400 leading-tight my-0.5">
                              {item.totalTon.toLocaleString()} <span className="text-[11px] font-bold">Ton</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate font-medium">
                              {item.batchCount} Batch • {item.commodities.join(', ') || 'Gabah'}
                            </div>
                            {/* Live activity bar */}
                            <div className="w-full bg-emerald-500/20 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-1 rounded-full animate-pulse w-full" />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight block">
                              STANDBY / IDLE
                            </span>
                            <div className="font-mono font-bold text-base text-rose-600 dark:text-rose-400 leading-tight my-0.5">
                              0 Ton
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                              {item.lastProductionDate ? (
                                <span>Aktif {item.daysSinceLast === 0 ? 'hari ini' : `${item.daysSinceLast} hari lalu`}</span>
                              ) : (
                                <span className="italic">Belum pernah input</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Detail Mesin, Gapoktan, & Wilayah */}
                    <div className="pt-2.5 border-t border-border/40 space-y-0.5">
                      <h4 className="font-extrabold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.dryer.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
                        {item.dryer.gapoktan?.name || '-'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1">
                        <span className="line-clamp-1 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {item.kabupatenName}
                        </span>
                        <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          Detail <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* MODE 2: MATRIKS KOMPAK (IKON DRYER MINI UNTUK PANTAU BANYAK MESIN) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredList.map(item => {
                const isGreen = item.isProducing;
                return (
                  <div 
                    key={item.dryer.id}
                    onClick={() => setSelectedDryerModal({
                      dryer: item.dryer,
                      dayProduction: item.matchedProds,
                      totalDayTon: item.totalTon,
                      isProducing: item.isProducing,
                      lastProductionDate: item.lastProductionDate
                    })}
                    className={`group relative rounded-xl border p-3 flex flex-col items-center text-center transition-all duration-200 cursor-pointer hover:scale-[1.04] hover:shadow-lg ${
                      isGreen 
                        ? 'border-emerald-500/60 bg-emerald-500/10 hover:border-emerald-500 hover:shadow-emerald-500/20 dark:bg-emerald-950/30' 
                        : 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500 hover:shadow-rose-500/15 dark:bg-rose-950/20'
                    }`}
                  >
                    {/* IKON DRYER MINI */}
                    <div className="mb-1.5 transition-transform group-hover:scale-110">
                      <DryerMachineIcon isProducing={isGreen} size="sm" />
                    </div>

                    {/* STATUS PILL */}
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mb-1 ${
                      isGreen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {isGreen ? `${item.totalTon}T` : 'IDLE'}
                    </span>

                    {/* NAMA DRYER */}
                    <h4 className="font-extrabold text-[11px] text-foreground line-clamp-1 w-full group-hover:text-primary transition-colors">
                      {item.dryer.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate w-full">
                      {item.kabupatenName}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: LAPORAN ANALISIS DRYER (PRODUKSI TINGGI VS TIDAK PRODUKSI) */}
      {activeTab === 'report' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card 1: Peringkat Dryer Produksi Tertinggi */}
          <div className="rounded-2xl border bg-card/70 overflow-hidden shadow-sm">
            <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 text-foreground">
                  <Flame className="h-5 w-5 text-amber-500" />
                  Peringkat Dryer Produksi Tinggi ({highProductionRank.length} Unit Aktif)
                </h3>
                <p className="text-xs text-muted-foreground">Urutan dryer dengan volume pengeringan terbesar pada tanggal/periode terpilih</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Total: {highProductionRank.reduce((s, x) => s + x.totalTon, 0).toLocaleString()} Ton
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Peringkat</th>
                    <th className="px-5 py-3">Unit Dryer</th>
                    <th className="px-5 py-3">Gapoktan</th>
                    <th className="px-5 py-3">Kabupaten</th>
                    <th className="px-5 py-3 text-right">Kapasitas</th>
                    <th className="px-5 py-3 text-right">Total Produksi</th>
                    <th className="px-5 py-3 text-center">Batch Input</th>
                    <th className="px-5 py-3">Komoditas</th>
                    <th className="px-5 py-3 text-center">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {highProductionRank.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-muted-foreground text-xs">
                        Tidak ada dryer yang berproduksi pada tanggal ini. Coba pilih tanggal atau rentang waktu lain.
                      </td>
                    </tr>
                  ) : highProductionRank.map((item, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <tr key={item.dryer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-bold">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-black ${
                            idx === 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' :
                            idx === 1 ? 'bg-slate-400 text-white' :
                            idx === 2 ? 'bg-amber-700 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-foreground">
                          <div className="flex items-center gap-2.5">
                            <DryerMachineIcon isProducing={true} size="sm" showGlow={false} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{item.dryer.name}</span>
                                {idx === 0 && <span className="text-xs text-amber-500">🏆</span>}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-normal">Kapasitas: {item.dryer.capacity_ton || '-'} Ton</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{item.dryer.gapoktan?.name || '-'}</td>
                        <td className="px-5 py-3 text-xs">{item.kabupatenName}</td>
                        <td className="px-5 py-3 text-right font-mono">{item.dryer.capacity_ton || '-'} Ton</td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.totalTon.toLocaleString()} Ton
                        </td>
                        <td className="px-5 py-3 text-center font-mono">{item.batchCount} Kali</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                            {item.commodities.join(', ') || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.totalTon >= 20 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          }`}>
                            {item.totalTon >= 20 ? 'Sangat Tinggi' : 'Optimal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Laporan Dryer Tidak Berproduksi (Idle) */}
          <div className="rounded-2xl border bg-card/70 overflow-hidden shadow-sm">
            <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-500/5">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                  Laporan Dryer Tidak Berproduksi ({idleDryersList.length} Unit Idle)
                </h3>
                <p className="text-xs text-muted-foreground">Daftar mesin dryer yang tidak memiliki catatan produksi pada tanggal/periode terpilih (perlu evaluasi & pembinaan)</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {idleDryersList.length} Mesin Belum Beroperasi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">No</th>
                    <th className="px-5 py-3">Unit Dryer</th>
                    <th className="px-5 py-3">Gapoktan</th>
                    <th className="px-5 py-3">Kabupaten</th>
                    <th className="px-5 py-3">Status / Keterangan</th>
                    <th className="px-5 py-3">Terakhir Berproduksi</th>
                    <th className="px-5 py-3">Ketua & Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {idleDryersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-emerald-600 text-xs font-bold">
                        🎉 Luar biasa! Semua mesin dryer berproduksi pada tanggal ini.
                      </td>
                    </tr>
                  ) : idleDryersList.map((item, idx) => (
                    <tr key={item.dryer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-5 py-3 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <DryerMachineIcon isProducing={false} size="sm" showGlow={false} />
                          <div>
                            <div>{item.dryer.name}</div>
                            <div className="text-[10px] text-muted-foreground font-normal">Kapasitas: {item.dryer.capacity_ton || '-'} Ton</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{item.dryer.gapoktan?.name || '-'}</div>
                        <div className="text-[10px] text-muted-foreground">{item.dryer.gapoktan?.desa?.name}</div>
                      </td>
                      <td className="px-5 py-3 text-xs">{item.kabupatenName}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border">
                          {item.dryer.productivity || 'Belum Beroperasi'}
                        </span>
                        {item.dryer.keterangan && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 italic">
                            {item.dryer.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {item.lastProductionDate ? (
                          <div>
                            <span className="font-semibold text-foreground">{item.lastProductionDate}</span>
                            <span className="text-[10px] text-rose-500 block">
                              ({item.daysSinceLast} hari lalu)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Belum pernah ada input</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <div className="font-medium">{item.dryer.gapoktan?.ketua || '-'}</div>
                        {item.dryer.gapoktan?.phone ? (
                          <a 
                            href={`tel:${item.dryer.gapoktan.phone}`}
                            className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="h-3 w-3" /> {item.dryer.gapoktan.phone}
                          </a>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL DRYER (KETIKA KOTAK DIKLIK) */}
      {selectedDryerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedDryerModal(null)} />
          <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl relative z-10 p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <DryerMachineIcon isProducing={selectedDryerModal.isProducing} size="md" />
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">{selectedDryerModal.dryer.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {selectedDryerModal.dryer.gapoktan?.name || '-'} • Kapasitas {selectedDryerModal.dryer.capacity_ton || '-'} Ton
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDryerModal(null)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Badge Status */}
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${selectedDryerModal.isProducing ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {selectedDryerModal.isProducing ? '🟢 Berproduksi Pada Tanggal Ini' : '🔴 Tidak Berproduksi Pada Tanggal Ini'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {selectedDryerModal.totalDayTon} Ton
                </span>
              </div>

              {/* Info Gapoktan & Wilayah */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Gapoktan</span>
                  <span className="font-bold text-foreground">{selectedDryerModal.dryer.gapoktan?.name || '-'}</span>
                  <span className="text-muted-foreground block mt-0.5">Ketua: {selectedDryerModal.dryer.gapoktan?.ketua || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Lokasi & Kapasitas</span>
                  <span className="font-semibold text-foreground">
                    {selectedDryerModal.dryer.gapoktan?.desa?.name}, {selectedDryerModal.dryer.gapoktan?.desa?.kecamatan?.kabupaten?.name}
                  </span>
                  <span className="text-muted-foreground block mt-0.5 font-mono">
                    Kapasitas: {selectedDryerModal.dryer.capacity_ton || '-'} Ton
                  </span>
                </div>
              </div>

              {/* Rincian Transaksi Produksi Hari Ini */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Catatan Produksi Tanggal {selectedDate} ({selectedDryerModal.dayProduction.length} Input)
                </h4>
                {selectedDryerModal.dayProduction.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                    Tidak ada transaksi produksi pada tanggal ini.
                    {selectedDryerModal.lastProductionDate && (
                      <p className="mt-1 font-semibold text-foreground">
                        Terakhir tercatat pada: {selectedDryerModal.lastProductionDate}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDryerModal.dayProduction.map(p => (
                      <div key={p.id} className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-foreground">{p.komoditas?.name}</span>
                          <div className="text-muted-foreground">
                            {p.qty_before} Ton basah → {p.qty_after} Ton kering
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {Number(p.commodity_value_added_per_kg || 0).toLocaleString()} / kg
                          </div>
                          <span className="text-[10px] text-muted-foreground">Nilai Tambah</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => setSelectedDryerModal(null)}
                className="w-full py-2.5 rounded-xl border bg-muted/60 font-semibold text-xs hover:bg-muted transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  window.location.href = `/dashboard/production`;
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                Input Produksi Baru <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
