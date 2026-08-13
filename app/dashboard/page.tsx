"use client";

import { useEffect, useState, useMemo } from "react";
import NextDynamic from "next/dynamic";
import { RedesignedKPICards } from "@/components/dashboard/redesigned-kpi";
import { 
  Trend7HariChart, 
  StatusDryerChart, 
  ProduksiKomoditasChart, 
  Top5KabupatenList, 
  ProduksiPerKabupatenChart 
} from "@/components/dashboard/redesigned-charts";
import { FiturSistemFooter } from "@/components/dashboard/fitur-sistem-footer";

const RedesignedMap = NextDynamic(
  () => import("@/components/dashboard/redesigned-map").then((m) => m.RedesignedMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm h-[536px] flex items-center justify-center text-slate-400">
        Memuat Peta...
      </div>
    ),
  }
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [productions, setProductions] = useState<any[]>([]);
  const [gapoktanList, setGapoktanList] = useState<any[]>([]);
  const [komoditasList, setKomoditasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    ]).then(([s, p, g, k]) => {
      setStats(s);
      setProductions(Array.isArray(p) ? p : []);
      setGapoktanList(Array.isArray(g) ? g : []);
      setKomoditasList(Array.isArray(k) ? k : []);
    }).finally(() => setLoading(false));
  }, []);

  // 1. Trend 7 Hari Terakhir
  const trend7DaysData = useMemo(() => {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return dates.map(dateStr => {
      const dayProds = productions.filter(p => p.production_date === dateStr);
      const totalTon = dayProds.reduce((sum, p) => sum + Number(p.qty_before || 0), 0);
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return {
        date: formattedDate,
        ton: Math.round(totalTon * 100) / 100
      };
    });
  }, [productions]);

  // 2. Produksi Berdasarkan Komoditas
  const perKomoditasData = useMemo(() => {
    if (productions.length === 0) return undefined;
    const map: Record<string, number> = {};
    productions.forEach(p => {
      const name = p.komoditas?.name || 'Lainnya';
      map[name] = (map[name] || 0) + Number(p.qty_before || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    const colors = ['#16a34a', '#78350f', '#eab308', '#9333ea', '#2563eb', '#f97316'];
    
    return Object.entries(map).map(([name, value], i) => ({
      name: name.toUpperCase(),
      value: Math.round(value * 100) / 100,
      percent: `${((value / total) * 100).toFixed(1).replace('.', ',')}%`,
      color: colors[i % colors.length]
    }));
  }, [productions]);

  // 3. Top 5 Kabupaten
  const top5KabupatenData = useMemo(() => {
    if (productions.length === 0) return undefined;
    const map: Record<string, number> = {};
    productions.forEach(p => {
      const kabName = p.gapoktan?.desa?.kecamatan?.kabupaten?.name || 'Lampung Tengah';
      map[kabName] = (map[kabName] || 0) + Number(p.qty_before || 0);
    });
    
    const sorted = Object.entries(map)
      .map(([name, ton]) => ({ name, ton: Math.round(ton * 100) / 100 }))
      .sort((a, b) => b.ton - a.ton);

    const maxTon = sorted[0]?.ton || 1;

    return sorted.slice(0, 5).map((item, idx) => ({
      rank: idx + 1,
      name: item.name,
      ton: `${item.ton.toString().replace('.', ',')} Ton`,
      pct: Math.round((item.ton / maxTon) * 100)
    }));
  }, [productions]);

  // 4. Produksi Per Kabupaten
  const perKabupatenData = useMemo(() => {
    if (productions.length === 0) return undefined;
    const map: Record<string, number> = {};
    productions.forEach(p => {
      const kabName = p.gapoktan?.desa?.kecamatan?.kabupaten?.name || 'Lampung Tengah';
      map[kabName] = (map[kabName] || 0) + Number(p.qty_before || 0);
    });

    return Object.entries(map).map(([name, ton]) => ({
      name,
      ton: Math.round(ton * 100) / 100
    }));
  }, [productions]);

  // 5. Dynamic Map Markers
  const mapMarkers = useMemo(() => {
    if (gapoktanList.length === 0) return undefined;
    const gapoktanProdMap: Record<string, number> = {};
    productions.forEach(p => {
      if (p.gapoktan_id) {
        gapoktanProdMap[p.gapoktan_id] = (gapoktanProdMap[p.gapoktan_id] || 0) + Number(p.qty_before || 0);
      }
    });

    return gapoktanList.map((g, idx) => {
      const tonnage = gapoktanProdMap[g.id] || 0;
      const lat = Number(g.latitude) || (-4.85 + (idx * 0.15) % 1.2);
      const lng = Number(g.longitude) || (105.1 + (idx * 0.2) % 1.0);
      return {
        id: g.id,
        name: g.name,
        lat,
        lng,
        count: g.dryer_units?.length || 1,
        tonnage: Math.round(tonnage * 100) / 100,
        alamat: g.desa ? `${g.desa.name}, ${g.desa.kecamatan?.name || ''}, ${g.desa.kecamatan?.kabupaten?.name || ''}` : 'Lampung',
        ketua: g.ketua || undefined,
        komoditasList: g.komoditas?.map((k: any) => k.name) || undefined
      };
    });
  }, [gapoktanList, productions]);

  const totalProductionTon = useMemo(() => {
    const sum = productions.reduce((s, p) => s + Number(p.qty_before || 0), 0);
    const val = (stats?.totalQtyBefore !== undefined && stats?.totalQtyBefore !== null) 
      ? stats.totalQtyBefore 
      : sum;
    return Number(val).toFixed(2).replace('.', ',');
  }, [stats, productions]);

  return (
    <div className="p-4 sm:p-6 space-y-4 w-full">
      
      {/* 1. TOP KPI SUMMARY CARDS */}
      <RedesignedKPICards 
        stats={{
          totalProduksi: totalProductionTon,
          totalDryerAktif: stats?.totalDryers || 126,
          totalGapoktan: stats?.totalGapoktan || gapoktanList.length || 243,
          kabupatenAktif: stats?.coverageKabupaten || 15,
          komoditasCount: komoditasList.length || 4,
          komoditasList: komoditasList.map(k => k.name.toUpperCase())
        }} 
      />

      {/* 2. MAIN ROW 1: EXPANDED MAP & RIGHT STACK (KOMODITAS + TOP 5 KABUPATEN) */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
        
        {/* Expanded Map Area */}
        <div className="flex-1 min-w-0">
          <RedesignedMap markers={mapMarkers} />
        </div>

        {/* Right Stack: Produksi Komoditas & Top 5 Kabupaten (Aligned height with Map) */}
        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
          <ProduksiKomoditasChart data={perKomoditasData} totalTon={totalProductionTon} />
          <Top5KabupatenList data={top5KabupatenData} />
        </div>

      </div>

      {/* 3. MAIN ROW 2: 3 EQUAL COLUMNS (TREND + STATUS DRYER + PRODUKSI PER KABUPATEN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Trend7HariChart data={trend7DaysData} />
        <StatusDryerChart total={stats?.totalDryers} />
        <ProduksiPerKabupatenChart data={perKabupatenData} />
      </div>

      {/* 4. FITUR SISTEM FOOTER */}
      <FiturSistemFooter />
    </div>
  );
}
