"use client";

import { Sprout, Factory, Users, Building2, Leaf, ArrowUpRight } from "lucide-react";

interface KPICardsProps {
  stats?: {
    totalProduksi?: string;
    totalDryerAktif?: number;
    totalGapoktan?: number;
    kabupatenAktif?: number;
    komoditasCount?: number;
    komoditasList?: string[];
  };
}

export function RedesignedKPICards({ stats }: KPICardsProps) {
  const commodityTags = stats?.komoditasList && stats.komoditasList.length > 0 
    ? stats.komoditasList.slice(0, 4) 
    : ["GABAH", "KAKAO", "JAGUNG", "SINGKONG"];

  const cards = [
    {
      title: "TOTAL PRODUKSI",
      value: stats?.totalProduksi || "9.827,46",
      unit: "Ton",
      change: "Keseluruhan Dryer",
      icon: Sprout,
      bgColor: "bg-[#10b981]",
    },
    {
      title: "TOTAL DRYER AKTIF",
      value: stats?.totalDryerAktif?.toString() || "126",
      unit: "Unit",
      change: "78% dari total",
      icon: Factory,
      bgColor: "bg-[#2563eb]",
    },
    {
      title: "TOTAL GAPOKTAN",
      value: stats?.totalGapoktan?.toString() || "243",
      unit: "",
      change: "+8 dari bulan lalu",
      icon: Users,
      bgColor: "bg-[#f97316]",
    },
    {
      title: "KABUPATEN AKTIF",
      value: stats?.kabupatenAktif?.toString() || "15",
      unit: "",
      change: "100% dari total",
      icon: Building2,
      bgColor: "bg-[#a855f7]",
    },
    {
      title: "KOMODITAS DIPRODUKSI",
      value: (stats?.komoditasCount || commodityTags.length).toString(),
      unit: "",
      commodities: commodityTags,
      icon: Leaf,
      bgColor: "bg-[#0d9488]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all"
        >
          {/* Icon Circle */}
          <div className={`h-11 w-11 rounded-full ${card.bgColor} text-white flex items-center justify-center shrink-0 shadow-sm`}>
            <card.icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate">
              {card.title}
            </span>
            
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-xs font-bold text-slate-600">
                  {card.unit}
                </span>
              )}
            </div>

            {/* Subtext Badge or Commodity tags */}
            {card.change ? (
              <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[11px] font-bold">
                <ArrowUpRight className="h-3 w-3 stroke-[3]" />
                <span className="truncate">{card.change}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {card.commodities?.map((c) => (
                  <span 
                    key={c} 
                    className="text-[8px] font-extrabold text-slate-600 bg-slate-100 px-1 py-0.5 rounded tracking-tighter uppercase"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
