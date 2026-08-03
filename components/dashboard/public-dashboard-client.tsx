"use client";

import { useEffect, useState, useMemo } from "react";
import type { Production, Gapoktan, Komoditas, DashboardStats } from "@/lib/types";
import nextDynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cn } from "@/lib/utils";

const DynamicMap = nextDynamic(() => import("@/components/dashboard/dashboard-map"), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><MapPin className="h-8 w-8 text-primary animate-bounce" /></div> });
const TrendChart = nextDynamic(() => import("@/components/dashboard/trend-chart"), { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> });
const VolumeBarChart = nextDynamic(() => import("@/components/dashboard/volume-chart"), { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> });
const GapoktanChart = nextDynamic(() => import("@/components/dashboard/admin-charts").then(m => m.AdminGapoktanChart), { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> });

import { 
  Users, Package, Factory, TrendingUp, MapPin, 
  Search, Calendar, Filter, Download, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw,
  Wheat, ClipboardList, Sun, Moon, Palette, Check, ChevronDown, ChevronUp
} from "lucide-react";

export default function PublicDashboardClient() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [productions, setProductions] = useState<Production[]>([]);
  const [gapoktanList, setGapoktanList] = useState<Gapoktan[]>([]);
  const [komoditasList, setKomoditasList] = useState<Komoditas[]>([]);
  const [allKabupaten, setAllKabupaten] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'oligarch'>('oligarch');

  // App Settings State
  const [appSettings, setAppSettings] = useState<{app_name: string, app_slogan: string, copyright: string}>({
    app_name: "Dashboard Monitoring Hibah Dryer",
    app_slogan: "Real-time oversight of national agricultural drying infrastructure",
    copyright: "© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved."
  });

  // Filters
  const [filterKomoditas, setFilterKomoditas] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterProductivity, setFilterProductivity] = useState('');
  const [filterGapoktan, setFilterGapoktan] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Wilayah Cascade
  const [filterKabupaten, setFilterKabupaten] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [selectedGapoktan, setSelectedGapoktan] = useState<Gapoktan | null>(null);

  // Filter Toggle State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Date Popover State
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const resetFilters = () => {
    setFilterKabupaten('');
    setFilterKecamatan('');
    setFilterGapoktan('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterKomoditas('');
    setFilterStatus('Semua');
    setFilterProductivity('');
    setSelectedGapoktan(null);
  };

  const reloadAll = () => {
    Promise.all([
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/address?type=kabupaten', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/settings', { cache: 'no-store' }).then(r => r.json())
    ]).then(([prodData, gapoktanData, komoditasData, kabRes, settingsData]) => {
      setProductions(Array.isArray(prodData) ? prodData : []);
      setGapoktanList(Array.isArray(gapoktanData) ? gapoktanData : []);
      setKomoditasList(Array.isArray(komoditasData) ? komoditasData : []);
      setAllKabupaten(Array.isArray(kabRes) ? kabRes : []);
      if (settingsData && !settingsData.error) setAppSettings(settingsData);
      setLoading(false);
    }).catch(err => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    // Determine initial filter state based on screen width
    setIsFilterOpen(window.innerWidth >= 1024);

    // Load theme from local storage
    const savedTheme = localStorage.getItem('agro-theme') as any;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('oligarch');
    }

    reloadAll();
    const interval = setInterval(reloadAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const applyTheme = (t: string) => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'oligarch') {
      document.documentElement.setAttribute('data-theme', 'oligarch');
    }
    localStorage.setItem('agro-theme', t);
  };

  const handleThemeChange = (t: 'light' | 'dark' | 'oligarch') => {
    setTheme(t);
    applyTheme(t);
  };

  // Extract unique regions for cascade
  const availableKabupaten = useMemo(() => {
    const kabs = new Map();
    gapoktanList.forEach(g => {
      if (g.desa?.kecamatan?.kabupaten) {
        kabs.set(g.desa.kecamatan.kabupaten.id, g.desa.kecamatan.kabupaten);
      }
    });
    return Array.from(kabs.values());
  }, [gapoktanList]);

  const availableKecamatan = useMemo(() => {
    const kecs = new Map();
    gapoktanList.forEach(g => {
      if (g.desa?.kecamatan && (!filterKabupaten || g.desa.kecamatan.kabupaten_id === filterKabupaten)) {
        kecs.set(g.desa.kecamatan.id, g.desa.kecamatan);
      }
    });
    return Array.from(kecs.values());
  }, [gapoktanList, filterKabupaten]);

  const filteredGapoktan = useMemo(() => {
    return gapoktanList.filter(g => {
      if (filterKomoditas && !g.komoditas?.some(k => k.id === filterKomoditas)) return false;
      if (filterKabupaten && g.desa?.kecamatan?.kabupaten_id !== filterKabupaten) return false;
      if (filterKecamatan && g.desa?.kecamatan_id !== filterKecamatan) return false;
      if (filterGapoktan && g.id !== filterGapoktan) return false;
      if (filterProductivity && !g.dryer_units?.some(d => (d.productivity || 'Belum Beroperasi') === filterProductivity)) return false;
      return true;
    });
  }, [gapoktanList, filterKomoditas, filterKabupaten, filterKecamatan, filterGapoktan, filterProductivity]);

  const filteredProductions = useMemo(() => {
    let result = productions.filter(p => {
      if (filterKomoditas && p.komoditas_id !== filterKomoditas) return false;
      if (filterKabupaten && p.gapoktan?.desa?.kecamatan?.kabupaten_id !== filterKabupaten) return false;
      if (filterKecamatan && p.gapoktan?.desa?.kecamatan_id !== filterKecamatan) return false;
      if (filterGapoktan && p.gapoktan_id !== filterGapoktan) return false;
      if (filterStartDate && p.production_date < filterStartDate) return false;
      if (filterEndDate && p.production_date > filterEndDate) return false;
      if (filterProductivity && !p.gapoktan?.dryer_units?.some(d => (d.productivity || 'Belum Beroperasi') === filterProductivity)) return false;
      return true;
    });

    if (sortKey) {
      result.sort((a, b) => {
        let valA: any = a[sortKey as keyof Production];
        let valB: any = b[sortKey as keyof Production];

        // Special handling for nested objects
        if (sortKey === 'gapoktan') valA = a.gapoktan?.name, valB = b.gapoktan?.name;
        if (sortKey === 'komoditas') valA = a.komoditas?.name, valB = b.komoditas?.name;
        if (sortKey === 'alamat') valA = a.gapoktan?.desa?.name, valB = b.gapoktan?.desa?.name;

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [productions, filterKomoditas, filterKabupaten, filterKecamatan, filterGapoktan, filterStartDate, filterEndDate, filterProductivity, sortKey, sortDir]);

  const stats = useMemo<DashboardStats>(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalQtyBefore = filteredProductions.reduce((sum: any, p: any) => sum + Number(p.qty_before || 0), 0);
    const todayQtyBefore = filteredProductions.filter((p: any) => p.production_date.startsWith(today)).reduce((sum: any, p: any) => sum + Number(p.qty_before || 0), 0);
    const totalGapoktan = filteredGapoktan.length;
    const totalDryers = filteredGapoktan.reduce((sum: any, g: any) => {
      if (filterProductivity) {
        return sum + (g.dryer_units?.filter((d: any) => (d.productivity || 'Belum Beroperasi') === filterProductivity).length || 0);
      }
      return sum + (g.dryer_units?.length || 0);
    }, 0);
    const coverageKabSet = new Set();
    filteredGapoktan.forEach((g: any) => {
      const kabId = g.desa?.kecamatan?.kabupaten_id;
      if (kabId) coverageKabSet.add(kabId);
    });

    return {
      totalGapoktan,
      totalDryers: totalDryers || 0,
      totalProductions: filteredProductions.length,
      todayProductions: filteredProductions.filter((p: any) => p.production_date.startsWith(today)).length,
      avgQtyDiffPct: 0,
      avgPriceDiffPct: 0,
      totalQtyBefore,
      totalQtyAfter: totalQtyBefore, // Sync for backwards compatibility if needed
      todayQtyAfter: todayQtyBefore,
      coverageKabupaten: coverageKabSet.size
    };
  }, [filteredProductions, filteredGapoktan, filterProductivity]);

  const productivityStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Beroperasi Optimal': 0,
      'Hanya Saat Panen Raya': 0,
      'Belum Beroperasi': 0,
      'Proses Installasi': 0
    };

    filteredGapoktan.forEach(g => {
      g.dryer_units?.forEach(d => {
        const status = d.productivity || 'Belum Beroperasi';
        if (counts[status] !== undefined) {
          counts[status] += 1;
        } else {
          counts[status] = 1;
        }
      });
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return [
      {
        key: 'Beroperasi Optimal',
        title: 'Beroperasi Optimal',
        count: counts['Beroperasi Optimal'],
        pct: total > 0 ? ((counts['Beroperasi Optimal'] / total) * 100).toFixed(1) : '0',
        borderColor: 'border-l-blue-500',
        textColor: 'text-blue-500'
      },
      {
        key: 'Hanya Saat Panen Raya',
        title: 'Hanya Saat Panen Raya',
        count: counts['Hanya Saat Panen Raya'],
        pct: total > 0 ? ((counts['Hanya Saat Panen Raya'] / total) * 100).toFixed(1) : '0',
        borderColor: 'border-l-amber-500',
        textColor: 'text-amber-500'
      },
      {
        key: 'Belum Beroperasi',
        title: 'Belum Beroperasi',
        count: counts['Belum Beroperasi'],
        pct: total > 0 ? ((counts['Belum Beroperasi'] / total) * 100).toFixed(1) : '0',
        borderColor: 'border-l-gray-500',
        textColor: 'text-gray-500'
      },
      {
        key: 'Proses Installasi',
        title: 'Proses Installasi',
        count: counts['Proses Installasi'],
        pct: total > 0 ? ((counts['Proses Installasi'] / total) * 100).toFixed(1) : '0',
        borderColor: 'border-l-purple-500',
        textColor: 'text-purple-500'
      }
    ];
  }, [filteredGapoktan]);

  const mapMarkers = useMemo(() => {
    return gapoktanList.filter(g => g.latitude && g.longitude).map(g => ({ 
      id: g.id, 
      latitude: g.latitude!, 
      longitude: g.longitude!,
      name: g.name,
      address: `${g.desa?.name || ''}, ${g.desa?.kecamatan?.name || ''}`,
      komoditas: g.komoditas?.map(k => k.name).join(', ')
    }));
  }, [gapoktanList]);

  const komoditasStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    
    // Determine the active target period based on date filters
    const activePeriod = filterStartDate 
      ? filterStartDate.slice(0, 7) 
      : (filterEndDate ? filterEndDate.slice(0, 7) : currentMonthStr);

    const stats = (komoditasList || []).map(k => {
      const prods = (filteredProductions || []).filter(p => {
        if (p.komoditas_id !== k.id) return false;
        return true;
      });
      const allTime = prods.reduce((sum, p) => sum + Number(p.qty_before || 0), 0);
      const todayTotal = prods.filter(p => p.production_date.startsWith(today)).reduce((sum, p) => sum + Number(p.qty_before || 0), 0);
      const thisMonthTotal = prods.filter(p => p.production_date.startsWith(currentMonthStr)).reduce((sum, p) => sum + Number(p.qty_before || 0), 0);
      
      const periodTargetObj = (k.commodity_targets || []).find((ct: any) => ct.period === activePeriod);
      const activeTarget = periodTargetObj ? Number(periodTargetObj.target_ton) : Number(k.target_monthly || 0);

      // If user has filtered by date, compare against allTime (which is filtered)
      const currentQty = (filterStartDate || filterEndDate) ? allTime : thisMonthTotal;

      return { 
        ...k, 
        allTime, 
        todayTotal, 
        thisMonthTotal, 
        activeTarget, 
        currentQty,
        activePeriod
      };
    }).sort((a, b) => (b.allTime || 0) - (a.allTime || 0));
    return stats;
  }, [filteredProductions, komoditasList, filterStartDate, filterEndDate]);

  const kabupatenSummary = useMemo(() => {
    return allKabupaten.map(kab => {
      const units = gapoktanList.filter(g => g.desa?.kecamatan?.kabupaten_id === kab.id);
      const prods = productions.filter(p => {
        if (p.gapoktan?.desa?.kecamatan?.kabupaten_id !== kab.id) return false;
        if (filterStartDate && p.production_date < filterStartDate) return false;
        if (filterEndDate && p.production_date > filterEndDate) return false;
        return true;
      });
      const totalTonnage = prods.reduce((sum: any, p: any) => sum + Number(p.qty_before || 0), 0);
      const activeUnits = units.filter((u: any) => u.dryer_units?.some((d: any) => d.status === 'active')).length;
      return {
        ...kab,
        unitCount: units.length,
        totalTonnage,
        activeUnits
      };
    }).sort((a: any, b: any) => b.totalTonnage - a.totalTonnage);
  }, [allKabupaten, gapoktanList, productions, filterStartDate, filterEndDate]);

  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    productions.forEach(p => {
      const d = new Date(p.production_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      map[d] = (map[d] || 0) + Number(p.qty_before);
    });
    
    // Sort keys chronologically
    const sortedKeys = Object.keys(map).sort((a, b) => {
      const dateA = new Date(a.replace(' ', ' 1, '));
      const dateB = new Date(b.replace(' ', ' 1, '));
      return dateA.getTime() - dateB.getTime();
    });

    if (sortedKeys.length === 0) {
       // Default dummy view if no data
       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
       const year = new Date().getFullYear();
       return months.map(m => ({ date: `${m} ${year}`, ton: Number((Math.floor(Math.random() * 50) + 10).toFixed(1)) }));
    }

    return sortedKeys.map(k => ({ date: k, ton: Number(map[k].toFixed(1)) }));
  }, [productions]);

  const perGapoktan = useMemo(() => {
    const map: Record<string, number> = {};
    filteredProductions.forEach(p => {
      const name = p.gapoktan?.name || 'Lainnya';
      map[name] = (map[name] || 0) + Number(p.qty_before);
    });
    return Object.entries(map)
      .map(([name, ton]) => ({ name, ton }))
      .sort((a, b) => b.ton - a.ton)
      .slice(0, 5);
  }, [filteredProductions]);

  const exportToCSV = () => {
    const headers = ['No Unit', 'Tanggal', 'Gapoktan', 'Alamat', 'Komoditas', 'Tonase Sebelum', 'Harga Sebelum', 'Tonase Sesudah', 'Harga Sesudah', 'Status'];
    const rows = filteredProductions.map(p => {
      const isMaintenance = p.gapoktan?.dryer_units?.some((d: any) => d.status === 'maintenance');
      const isIdle = p.gapoktan?.dryer_units?.every((d: any) => d.status === 'inactive');
      const status = isMaintenance ? 'Maintenance' : (isIdle ? 'Idle' : 'Aktif');
      return [
        `DRY-${p.gapoktan_id.substring(0,4).toUpperCase()}`,
        p.production_date,
        p.gapoktan?.name,
        `"${p.gapoktan?.desa?.name}, ${p.gapoktan?.desa?.kecamatan?.name}, ${p.gapoktan?.desa?.kecamatan?.kabupaten?.name.replace('KABUPATEN ', '')}"`,
        p.komoditas?.name,
        Number(p.qty_before || 0).toFixed(2),
        Number(p.price_before || 0).toFixed(0),
        Number(p.qty_after || 0).toFixed(2),
        Number(p.price_after || 0).toFixed(0),
        status
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Produksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedProductions = filteredProductions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-center space-y-4">
        <Factory className="h-12 w-12 mx-auto text-primary" />
        <p className="text-sm font-medium">Memuat Monitoring Hibah Dryer...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden">
      {/* Lampung Identity Accent */}
      <div className="bg-lampung-accent" />

      {/* HEADER SECTION */}
      <header className="bg-card border-b px-6 lg:px-10 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-50 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary transition-all duration-500 line-clamp-1">{appSettings.app_name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-1">{appSettings.app_slogan}</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* THEME PICKER */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border">
             <button onClick={() => handleThemeChange('light')} className={cn("p-2 rounded-lg transition-all", theme === 'light' ? "bg-white shadow text-slate-900" : "text-muted-foreground hover:bg-white/50")}>
                <Sun className="h-4 w-4" />
             </button>
             <button onClick={() => handleThemeChange('dark')} className={cn("p-2 rounded-lg transition-all", theme === 'dark' ? "bg-slate-800 shadow text-white" : "text-muted-foreground hover:bg-slate-800/10")}>
                <Moon className="h-4 w-4" />
             </button>
             <button onClick={() => handleThemeChange('oligarch')} className={cn("p-2 rounded-lg transition-all flex items-center gap-1.5 px-3", theme === 'oligarch' ? "bg-[#10b981] shadow text-slate-900 border border-white/20" : "text-muted-foreground hover:bg-[#10b981]/20")}>
                <Palette className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Oligarch</span>
             </button>
          </div>

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:scale-105 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6 w-full">
        
        {/* TOP FILTERS SECTION */}
        <div className="bg-card rounded-2xl border p-4 shadow-xl shadow-black/5 flex flex-col items-start gap-4 sticky top-[80px] z-40 backdrop-blur-md bg-opacity-95">
          <div 
            className="flex items-center justify-between text-foreground font-bold border-b w-full pb-2 md:pb-3 cursor-pointer select-none"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <span>Filter Data & Wilayah</span>
              {!isFilterOpen && (filterKabupaten || filterKecamatan || filterGapoktan || filterStartDate || filterEndDate) && (
                <span className="ml-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </div>
            <button className="text-muted-foreground p-1 rounded-md hover:bg-muted transition-colors flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
              {isFilterOpen ? <><ChevronUp className="h-4 w-4" /> Tutup</> : <><ChevronDown className="h-4 w-4" /> Buka</>}
            </button>
          </div>
                    <div className={cn("w-full transition-all duration-300", isFilterOpen ? "max-h-[1000px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full pt-2">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Kabupaten</label>
                <select value={filterKabupaten} onChange={(e: any) => { setFilterKabupaten(e.target.value); setFilterKecamatan(''); }} className="w-full pl-4 pr-8 py-2.5 rounded-xl border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Semua Kabupaten</option>
                  {availableKabupaten.map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Kecamatan</label>
                <select value={filterKecamatan} onChange={(e: any) => setFilterKecamatan(e.target.value)} disabled={!filterKabupaten} className="w-full pl-4 pr-8 py-2.5 rounded-xl border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                  <option value="">Semua Kecamatan</option>
                  {availableKecamatan.map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Komoditas</label>
                <select value={filterKomoditas} onChange={(e: any) => setFilterKomoditas(e.target.value)} className="w-full pl-4 pr-8 py-2.5 rounded-xl border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Semua Komoditas</option>
                  {komoditasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Produktivitas</label>
                <select value={filterProductivity} onChange={(e: any) => setFilterProductivity(e.target.value)} className="w-full pl-4 pr-8 py-2.5 rounded-xl border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Semua Produktivitas</option>
                  <option value="Belum Beroperasi">Belum Beroperasi</option>
                  <option value="Beroperasi Optimal">Beroperasi Optimal</option>
                  <option value="Hanya Saat Panen Raya">Hanya Saat Panen Raya</option>
                  <option value="Proses Installasi">Proses Installasi</option>
                </select>
              </div>

              <div className="relative md:col-span-2 lg:col-span-1">
                <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Rentang Tanggal</label>
                <button
                  type="button"
                  onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border bg-background text-xs font-medium text-left outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/40 transition-colors"
                >
                  <span className="truncate">
                    {filterStartDate || filterEndDate ? (
                      `${filterStartDate || '...'} s/d ${filterEndDate || '...'}`
                    ) : (
                      <span className="text-muted-foreground">Pilih Rentang...</span>
                    )}
                  </span>
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </button>

                {isDatePopoverOpen && (
                  <div className="absolute left-0 right-0 mt-2 p-4 bg-card border rounded-2xl shadow-xl z-50 space-y-3 min-w-[240px]">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-foreground">Rentang Tanggal</span>
                      <button 
                        type="button" 
                        onClick={() => setIsDatePopoverOpen(false)}
                        className="text-[10px] text-muted-foreground font-bold hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Dari Tanggal</label>
                        <input 
                          type="date" 
                          value={filterStartDate} 
                          onChange={(e: any) => setFilterStartDate(e.target.value)} 
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Sampai Tanggal</label>
                        <input 
                          type="date" 
                          value={filterEndDate} 
                          onChange={(e: any) => setFilterEndDate(e.target.value)} 
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterStartDate('');
                          setFilterEndDate('');
                        }}
                        className="text-[10px] text-rose-500 font-bold hover:underline"
                      >
                        Reset Tanggal
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDatePopoverOpen(false)}
                        className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:opacity-90 transition-opacity"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 md:col-span-3 lg:col-span-1">
                <div className="relative flex-grow">
                  <label className="absolute -top-2 left-3 bg-card px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground z-10">Gapoktan</label>
                  <select 
                    value={filterGapoktan} 
                    onChange={(e: any) => {
                      const id = e.target.value;
                      setFilterGapoktan(id);
                      const found = gapoktanList.find(g => g.id === id);
                      setSelectedGapoktan(found || null);
                    }}
                    className="w-full pl-3 pr-6 py-2.5 rounded-xl border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Semua Gapoktan</option>
                    {gapoktanList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <button 
                  onClick={resetFilters}
                  className="p-2.5 bg-background border border-border text-muted-foreground rounded-xl hover:bg-muted hover:text-primary transition-all shadow-sm shrink-0 group"
                  title="Reset Filters"
                >
                  <RefreshCw className="h-4 w-4 group-active:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Total Produksi" value={Number(stats?.totalQtyBefore || 0).toFixed(1)} unit="Ton" trend="+12.5% vs bln lalu" trendUp={true} borderLeft="border-l-emerald-500" />
          <KPICard title="Produksi Hari Ini" value={Number(stats?.todayQtyAfter || 0).toFixed(1)} unit="Ton" trend="+4.2% vs kemarin" trendUp={true} borderLeft="border-l-green-500" />
          <KPICard title="Total Gapoktan" value={stats?.totalGapoktan || 0} unit="Poktan" trend="Update terbaru" trendUp={true} borderLeft="border-l-teal-500" />
          <KPICard title="Total Dryer" value={stats?.totalDryers || 0} unit="Unit" trend="100% Aktif monitoring" trendUp={true} borderLeft="border-l-emerald-600" />
          <KPICard title="Wilayah Terjangkau" value={stats?.coverageKabupaten || 0} unit="Kab/Kota" trend="Update terbaru hari ini" trendUp={undefined} borderLeft="border-l-lime-500" />
        </div>

        {/* SCORECARD PRODUKTIVITAS DRYER Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status Produktivitas Dryer</h2>
            <div className="h-px flex-grow mx-4 bg-muted/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productivityStats.map((item) => (
              <div 
                key={item.key}
                onClick={() => setFilterProductivity(filterProductivity === item.key ? '' : item.key)}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  filterProductivity === item.key ? "ring-2 ring-primary rounded-2xl" : ""
                )}
              >
                <KPICard 
                  title={item.title.toUpperCase()} 
                  value={item.count} 
                  unit="Unit"
                  trend={`${item.pct}% dari total unit`} 
                  borderLeft={item.borderColor} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* SCORECARD KOMODITAS Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Produksi Per Komoditas (All Time)</h2>
            <div className="h-px flex-grow mx-4 bg-muted/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {komoditasStats.map((k: any) => {
              const target = Number(k.activeTarget || 0);
              const progress = target > 0 ? {
                current: k.currentQty || 0,
                target: target,
                pct: target > 0 ? ((k.currentQty || 0) / target) * 100 : 0,
                period: k.activePeriod
              } : undefined;
              return (
                <KPICard 
                  key={`all-${k.id}`}
                  title={`TOTAL ${k.name.toUpperCase()}`} 
                  value={Number(k.allTime || 0).toFixed(1)} 
                  unit="Ton"
                  trend="All time accumulation" 
                  borderLeft="border-l-emerald-500" 
                  progress={progress}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Produksi Per Komoditas (Hari Ini)</h2>
            <div className="h-px flex-grow mx-4 bg-muted/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {komoditasStats.map((k: any) => (
              <KPICard 
                key={`today-${k.id}`}
                title={`${k.name.toUpperCase()} (TODAY)`} 
                value={Number(k.todayTotal || 0).toFixed(1)} 
                unit="Ton"
                trend="Updated just now" 
                borderLeft="border-l-emerald-500" 
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Pemetaan GIS Dryer</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Lokasi unit monitoring secara real-time</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-3 h-[500px] rounded-2xl border overflow-hidden shadow-inner relative">
                  <DynamicMap 
                    theme={theme}
                    markers={mapMarkers} 
                    selectedMarkerId={selectedGapoktan?.id || filterGapoktan}
                    onMarkerClick={(id: string) => {
                      const found = gapoktanList.find(g => g.id === id);
                      if (found) {
                        setSelectedGapoktan(found);
                        setFilterGapoktan(found.id);
                        setTimeout(() => {
                          const confirmRedirect = window.confirm(`Apakah Anda ingin melihat halaman detail untuk Gapoktan "${found.name}"?`);
                          if (confirmRedirect) {
                            router.push(`/gapoktan/${found.id}`);
                          }
                        }, 500);
                      }
                    }} 
                  />
               </div>
               
               <div className="lg:col-span-1 space-y-3 overflow-hidden flex flex-col h-[500px]">
                  <div className="flex items-center justify-between px-1 shrink-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredGapoktan.length} Lokasi Terdaftar</p>
                    {filterGapoktan && (
                      <button 
                        onClick={() => {
                          setFilterGapoktan('');
                          setSelectedGapoktan(null);
                        }}
                        className="text-[10px] text-rose-500 font-bold hover:underline transition-all"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-grow pb-4">
                    {filteredGapoktan.map((g: any) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGapoktan(g)}
                        className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                          selectedGapoktan?.id === g.id ? 'border-primary bg-primary/5 shadow-sm' : 'bg-background hover:border-primary/20'
                        }`}
                      >
                        <h4 className="font-bold text-sm text-foreground">{g.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 font-medium italic">
                           <MapPin className="h-3 w-3" />
                           {g.desa?.name}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {g.komoditas?.map((k: any) => (
                            <span key={k.id} className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                              {k.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                           <div className="flex items-center gap-1 font-bold text-[10px] text-muted-foreground">
                              <Factory className="h-3 w-3" />
                              {g.dryer_units?.length || 0} Unit
                           </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/gapoktan/${g.id}`);
                              }}
                              className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Lihat Detail →
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Tren Produksi</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Volume pengeringan bulanan</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <TrendChart data={trendData} theme={theme} />
                </div>
             </div>

             <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Wheat className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Volume per Komoditas</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Distribusi tonase hasil panen</p>
                  </div>
                </div>
                <div className="h-[300px]">
                   <VolumeBarChart data={komoditasStats.map((k: any) => ({ name: k.name, ton: k.allTime }))} theme={theme} />
                </div>
             </div>

             <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Factory className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Produksi per Gapoktan</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Top 5 Kelompok Tani</p>
                  </div>
                </div>
                <div className="h-[300px]">
                   <GapoktanChart data={perGapoktan} />
                </div>
             </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Data Riwayat Produksi</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Total log pengeringan unit monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium text-[10px] uppercase font-bold tracking-widest leading-none">Rows:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="text-xs font-bold border rounded-lg px-2 py-1 outline-none bg-background focus:ring-2 focus:ring-primary/20"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
           </div>

           <div className="overflow-x-auto rounded-xl border scrollbar-hide">
              <table className="w-full text-left min-w-[1200px]">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30">
                    <th className="px-5 py-4 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('production_date')}>
                      <div className="flex items-center gap-1">Unit-Tgl {sortKey === 'production_date' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('gapoktan')}>
                      <div className="flex items-center gap-1">Kelompok Tani {sortKey === 'gapoktan' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('alamat')}>
                      <div className="flex items-center gap-1">Alamat Lengkap {sortKey === 'alamat' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('komoditas')}>
                      <div className="flex items-center gap-1">Komoditas {sortKey === 'komoditas' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('qty_before')}>
                      <div className="flex items-center justify-end gap-1">Ton Sebelum {sortKey === 'qty_before' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('price_before')}>
                      <div className="flex items-center justify-end gap-1">Harga Sebelum {sortKey === 'price_before' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('qty_after')}>
                      <div className="flex items-center justify-end gap-1">Ton Sesudah {sortKey === 'qty_after' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('price_after')}>
                      <div className="flex items-center justify-end gap-1">Harga Sesudah {sortKey === 'price_after' && (sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}</div>
                    </th>
                    <th className="px-5 py-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProductions.slice(0, itemsPerPage).map((p: any) => {
                     const isMaintenance = p.gapoktan?.dryer_units?.some((d: any) => d.status === 'maintenance');
                     const isIdle = p.gapoktan?.dryer_units?.every((d: any) => d.status === 'inactive');
                     const statusName = isMaintenance ? 'Maintenance' : (isIdle ? 'Idle' : 'Aktif');
                     const statusColor = isMaintenance ? 'text-rose-400' : (isIdle ? 'text-slate-400' : 'text-emerald-400');
                     const statusDot = isMaintenance ? 'bg-rose-500' : (isIdle ? 'bg-slate-500' : 'bg-emerald-500');

                     return (
                        <tr key={p.id} className="text-[11px] hover:bg-muted/30 transition-all cursor-pointer" onClick={() => router.push(`/gapoktan/${p.gapoktan_id}`)}>
                          <td className="px-5 py-5">
                             <div className="font-mono text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {p.gapoktan_id.substring(0,6).toUpperCase()}</div>
                             <div className="font-bold text-foreground text-[12px]">{p.production_date}</div>
                          </td>
                          <td className="px-5 py-5">
                            <div className="font-bold text-foreground text-[13px] tracking-tight">{p.gapoktan?.name}</div>
                            <div className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5 tracking-wider font-mono">Unit Aktif</div>
                          </td>
                          <td className="px-5 py-5">
                             <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground text-[13px]">
                                  {p.gapoktan?.desa?.kecamatan?.kabupaten?.name?.replace('KABUPATEN ', '') || '-'}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                   {p.gapoktan?.desa?.kecamatan?.name || '-'} / {p.gapoktan?.desa?.name || '-'}
                                </span>
                             </div>
                          </td>
                          <td className="px-5 py-5">
                             <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 text-[10px]">{p.komoditas?.name}</span>
                          </td>
                          <td className="px-5 py-5 text-right">
                             <span className="text-sm font-bold text-foreground">{Number(p.qty_before || 0).toFixed(2)}</span>
                             <span className="text-[9px] ml-1 text-muted-foreground uppercase">Ton</span>
                          </td>
                          <td className="px-5 py-5 text-right">
                             <span className="text-[11px] font-bold text-emerald-500">{formatCurrency(p.price_before || 0)}</span>
                          </td>
                          <td className="px-5 py-5 text-right">
                             <span className="text-sm font-bold text-foreground">{Number(p.qty_after || 0).toFixed(2)}</span>
                             <span className="text-[9px] ml-1 text-muted-foreground uppercase">Ton</span>
                          </td>
                          <td className="px-5 py-5 text-right">
                             <span className="text-[11px] font-bold text-emerald-500">{formatCurrency(p.price_after || 0)}</span>
                          </td>
                          <td className="px-5 py-5">
                             <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${statusDot} animate-pulse`} />
                                <span className={`font-bold text-[10px] uppercase tracking-widest ${statusColor}`}>{statusName}</span>
                             </div>
                          </td>
                        </tr>
                     );
                  })}
                  {filteredProductions.length === 0 && (
                    <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground italic">Tidak ada data sesuai filter</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className="mt-auto py-10 px-6 lg:px-10 border-t bg-card/30 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-foreground uppercase tracking-widest">{appSettings.app_name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-[0.2em] mt-0.5">Agriculture Monitoring System</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-xs text-muted-foreground font-medium italic opacity-70 transition-opacity hover:opacity-100">{appSettings.copyright}</p>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">
               <span>Efficiency</span>
               <span className="h-1 w-1 rounded-full bg-primary/20" />
               <span>Precision</span>
               <span className="h-1 w-1 rounded-full bg-primary/20" />
               <span>Integrity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const formatPeriod = (period: string) => {
  if (!period) return "";
  const [year, month] = period.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const KPICard = ({ title, value, unit, trend, trendUp, borderLeft, progress }: any) => (
  <div className={cn("bg-card p-4 rounded-2xl border border-border shadow-sm border-l-4 transition-all hover:shadow-md hover:translate-y-[-2px]", borderLeft)}>
    <div className="flex flex-col">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-foreground tracking-tight">{value}</span>
        <span className="text-xs font-bold text-muted-foreground">{unit}</span>
      </div>
      
      {progress && progress.target > 0 ? (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-semibold">
            <span className="text-muted-foreground text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider">
              {progress.period ? `Target ${formatPeriod(progress.period)}` : "Target Bulan Ini"}
            </span>
            <span className="text-emerald-500 font-bold">{progress.pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(progress.pct, 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground font-medium">
            Target: {Number(progress.current || 0).toFixed(1)} / {progress.target} Ton
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1.5">
          <div className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1",
            trendUp === true ? "bg-emerald-500/10 text-emerald-500" : 
            trendUp === false ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground"
          )}>
            {trendUp === true && <ArrowUpRight className="h-2.5 w-2.5" />}
            {trendUp === false && <ArrowDownRight className="h-2.5 w-2.5" />}
            {trend}
          </div>
        </div>
      )}
    </div>
  </div>
);
