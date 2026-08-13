"use client";

import { 
  Clock, 
  Map, 
  LineChart, 
  Bell, 
  Smartphone, 
  Database 
} from "lucide-react";

export function FiturSistemFooter() {
  const features = [
    {
      icon: Clock,
      color: "text-blue-500",
      title: "Monitoring Real-time",
      desc: "Pantau produksi dryer secara real-time dari seluruh wilayah Lampung",
    },
    {
      icon: Map,
      color: "text-blue-500",
      title: "Peta Interaktif",
      desc: "Visualisasi data produksi dengan peta interaktif dan cluster.",
    },
    {
      icon: LineChart,
      color: "text-blue-500",
      title: "Analisis Komprehensif",
      desc: "Analisis trend, perbandingan, dan laporan yang komprehensif.",
    },
    {
      icon: Bell,
      color: "text-blue-500",
      title: "Notifikasi Otomatis",
      desc: "Sistem notifikasi untuk alert produksi dan status dryer.",
    },
    {
      icon: Smartphone,
      color: "text-blue-500",
      title: "Multi Platform",
      desc: "Akses sistem melalui web dan mobile aplikasi.",
    },
    {
      icon: Database,
      color: "text-blue-500",
      title: "Integrasi Data",
      desc: "Integrasi dengan sistem lain dan export data.",
    },
  ];

  return (
    <div className="w-full space-y-4 pt-2">
      {/* Container Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight">
          FITUR SISTEM
        </h4>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-bold text-slate-800">
                  {f.title}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 leading-normal">
                  {f.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Blue Banner Pill */}
      <div className="w-full flex justify-center">
        <div className="bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/10 border border-blue-200/60 text-blue-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-sm text-center max-w-4xl">
          Sistem ini membantu monitoring dan pengambilan keputusan berbasis data untuk meningkatkan produksi dan efisiensi dryer di Provinsi Lampung
        </div>
      </div>
    </div>
  );
}
