"use client";

import { useState } from "react";
import { 
  RotateCw, 
  Menu, 
  Plus, 
  Check, 
  ChevronRight, 
  ArrowRight,
} from "lucide-react";

interface MonitoringPanelProps {
  summaryStats?: {
    totalProduksi?: string;
    dryerAktif?: number;
    gapoktan?: number;
    kabupaten?: number;
  };
  notifications?: {
    id: string;
    color: string;
    title: string;
    desc?: string;
    time: string;
  }[];
}

const defaultNotifications = [
  {
    id: "1",
    color: "bg-blue-500",
    title: "Produksi tinggi di Lampung Tengah",
    desc: "892,45 Ton hari ini",
    time: "10 Mei 2026 16:30",
  },
  {
    id: "2",
    color: "bg-orange-500",
    title: "Dryer tidak aktif: Dryer 15 - Metro",
    desc: "",
    time: "10 Mei 2026 15:45",
  },
  {
    id: "3",
    color: "bg-amber-400",
    title: "Input data tertunda: 5 Gapoktan",
    desc: "",
    time: "10 Mei 2026 14:20",
  },
];

export function MonitoringPanel({ summaryStats, notifications }: MonitoringPanelProps) {
  const [activeTab, setActiveTab] = useState<"peta" | "grafik">("peta");

  const gisFeatures = [
    "Peta Interaktif dengan cluster data",
    "Layer administrasi (Provinsi, Kab, Kec, Desa)",
    "Heatmap produksi",
    "Filter berdasarkan wilayah",
    "Popup detail data per lokasi",
    "Export peta dan data spasial",
  ];

  const notificationList = notifications && notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <div className="w-full lg:w-[320px] shrink-0 space-y-3.5">
      {/* Top Header Card: Monitoring Dryer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Blue Header Bar */}
        <div className="bg-[#2563eb] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-tight">
              Monitoring Dryer
            </h3>
          </div>
          <button className="p-1 hover:bg-white/10 rounded-lg transition-all" title="Refresh">
            <RotateCw className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Ringkasan Hari Ini */}
        <div className="p-3.5 space-y-3">
          <p className="text-[11px] font-bold text-slate-800">
            Ringkasan Hari Ini
          </p>

          {/* 4 Colored Metric Boxes */}
          <div className="grid grid-cols-2 gap-2">
            {/* Green */}
            <div className="bg-[#10b981] text-white p-2.5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-1">
                <SproutIcon className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[10px] font-medium opacity-90">Total Produksi (Ton)</span>
              </div>
              <span className="text-base font-black mt-1">{summaryStats?.totalProduksi || "892,45"}</span>
            </div>

            {/* Blue */}
            <div className="bg-[#3b82f6] text-white p-2.5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-1">
                <FactoryIcon className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[10px] font-medium opacity-90">Dryer Aktif</span>
              </div>
              <span className="text-base font-black mt-1">{summaryStats?.dryerAktif ?? 126}</span>
            </div>

            {/* Orange */}
            <div className="bg-[#f97316] text-white p-2.5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[10px] font-medium opacity-90">Gapoktan</span>
              </div>
              <span className="text-base font-black mt-1">{summaryStats?.gapoktan ?? 243}</span>
            </div>

            {/* Purple */}
            <div className="bg-[#a855f7] text-white p-2.5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-1">
                <BuildingIcon className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[10px] font-medium opacity-90">Kabupaten</span>
              </div>
              <span className="text-base font-black mt-1">{summaryStats?.kabupaten ?? 15}</span>
            </div>
          </div>

          {/* Map Preview Widget */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-center gap-4 border-b border-slate-100 pb-1">
              <button 
                onClick={() => setActiveTab("peta")}
                className={`text-xs font-bold pb-1 border-b-2 transition-all ${
                  activeTab === "peta" 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-slate-400"
                }`}
              >
                Peta
              </button>
              <button 
                onClick={() => setActiveTab("grafik")}
                className={`text-xs font-bold pb-1 border-b-2 transition-all ${
                  activeTab === "grafik" 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-slate-400"
                }`}
              >
                Grafik
              </button>
            </div>

            {/* Mini map container with floating action button */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-emerald-50">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=60" 
                alt="Mini Map Preview" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none" />

              {/* Floating Action (+) button */}
              <button className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card: INTEGRASI GIS */}
      <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm space-y-3">
        <h4 className="text-xs font-black uppercase text-blue-700 tracking-tight">
          INTEGRASI GIS
        </h4>
        <div className="space-y-1.5 text-[11px] text-slate-700">
          {gisFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-tight">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card: NOTIFIKASI SISTEM */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#0f2942] text-white px-4 py-2.5">
          <h4 className="text-xs font-black uppercase tracking-tight">
            NOTIFIKASI SISTEM
          </h4>
        </div>
        <div className="p-3 space-y-3 divide-y divide-slate-100">
          {notificationList.map((n) => (
            <div key={n.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs group cursor-pointer">
              <div className="flex items-start gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full ${n.color} shrink-0 mt-1`} />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {n.title}
                  </span>
                  {n.desc && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {n.desc}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {n.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-1" />
            </div>
          ))}

          <div className="pt-3 text-center">
            <a 
              href="#" 
              className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Lihat Semua Notifikasi</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SproutIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-1.5-.4-3-.9-3.9-2.1-.7-.9-.7-2.1.2-2.5.4-.2 1-.1 1.4.9z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.6 1-1 1-2.4.1-3-.4-.2-1.2-.2-2.3.6z" />
    </svg>
  );
}

function FactoryIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2v16z" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
