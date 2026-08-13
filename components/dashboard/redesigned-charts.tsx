"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { ArrowRight } from "lucide-react";

// --- 1. TREND PRODUKSI 7 HARI TERAKHIR ---
const defaultTrendData = [
  { date: "7 Agu", ton: 456.23 },
  { date: "8 Agu", ton: 512.45 },
  { date: "9 Agu", ton: 478.91 },
  { date: "10 Agu", ton: 623.56 },
  { date: "11 Agu", ton: 769.23 },
  { date: "12 Agu", ton: 772.34 },
  { date: "13 Agu", ton: 892.45 },
];

export function Trend7HariChart({ data }: { data?: { date: string; ton: number }[] }) {
  const chartData = data && data.length > 0 ? data : defaultTrendData;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col space-y-3 w-full h-[280px]">
      <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
        TREND PRODUKSI 7 HARI TERAKHIR
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 18, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: "#94a3b8" }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px", border: "none" }}
              formatter={(val: any) => [`${val} Ton`, "Produksi"]}
            />
            <Line 
              type="monotone" 
              dataKey="ton" 
              stroke="#2563eb" 
              strokeWidth={2.5} 
              dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. STATUS DRYER ---
const defaultStatusData = [
  { name: "Aktif", value: 126, percent: "78,3%", color: "#22c55e" },
  { name: "Tidak Aktif", value: 25, percent: "15,5%", color: "#ef4444" },
  { name: "Maintenance", value: 10, percent: "6,2%", color: "#eab308" },
];

export function StatusDryerChart({ data, total }: { data?: { name: string; value: number; percent: string; color: string }[]; total?: number }) {
  const chartData = data && data.length > 0 ? data : defaultStatusData;
  const totalCount = total || chartData.reduce((s, i) => s + i.value, 0);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col space-y-3 w-full h-[280px]">
      <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
        STATUS DRYER
      </h3>

      <div className="flex-1 flex items-center justify-between gap-2 min-h-0">
        {/* Donut Chart with Center Text */}
        <div className="relative w-1/2 h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none leading-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
            <span className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-1/2 space-y-2 text-xs">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  {item.name} ({item.value})
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-900 ml-1">
                {item.percent}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. PRODUKSI BERDASARKAN KOMODITAS ---
const defaultKomoditasData = [
  { name: "GABAH", value: 456.78, percent: "51,2%", color: "#16a34a" },
  { name: "KAKAO", value: 187.32, percent: "21,0%", color: "#78350f" },
  { name: "JAGUNG", value: 156.23, percent: "17,5%", color: "#eab308" },
  { name: "SINGKONG", value: 92.12, percent: "10,3%", color: "#9333ea" },
];

export function ProduksiKomoditasChart({ data, totalTon }: { data?: { name: string; value: number; percent: string; color: string }[]; totalTon?: string }) {
  const chartData = data && data.length > 0 ? data : defaultKomoditasData;
  const total = totalTon || (chartData.reduce((s, i) => s + i.value, 0).toFixed(2).replace('.', ','));

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2 w-full h-[260px]">
      <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
        PRODUKSI BERDASARKAN KOMODITAS
      </h3>

      <div className="flex-1 flex items-center justify-between gap-2 min-h-0">
        {/* Donut Chart */}
        <div className="relative w-5/12 h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none leading-none text-center">
            <span className="text-xs font-black text-slate-900 tracking-tight">{total}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Total Ton</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-7/12 space-y-1.5 text-xs pl-2 border-l border-slate-100">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-slate-700 uppercase truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 ml-1 truncate">
                {item.value.toString().replace('.', ',')} T ({item.percent})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 4. TOP 5 KABUPATEN (PRODUKSI TERTINGGI) ---
const defaultTopKabupaten = [
  { rank: 1, name: "Lampung Tengah", ton: "156,45 Ton", pct: 100 },
  { rank: 2, name: "Lampung Timur", ton: "142,23 Ton", pct: 90 },
  { rank: 3, name: "Lampung Selatan", ton: "128,67 Ton", pct: 82 },
  { rank: 4, name: "Lampung Utara", ton: "98,34 Ton", pct: 63 },
  { rank: 5, name: "Tulang Bawang", ton: "87,91 Ton", pct: 56 },
];

export function Top5KabupatenList({ data }: { data?: { rank: number; name: string; ton: string; pct: number }[] }) {
  const listData = data && data.length > 0 ? data : defaultTopKabupaten;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2 w-full h-[260px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
          TOP 5 KABUPATEN (PRODUKSI TERTINGGI)
        </h3>
      </div>

      <div className="space-y-2 flex-1 pt-1">
        {listData.map((item) => (
          <div key={item.rank} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-[10px] font-bold text-slate-400">
              {item.rank}
            </span>
            <span className="w-28 text-[11px] font-semibold text-slate-700 truncate">
              {item.name}
            </span>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${item.pct}%` }} 
              />
            </div>
            <span className="w-16 text-[10px] font-bold text-slate-800 text-right truncate">
              {item.ton}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-1 border-t border-slate-100 text-right">
        <a 
          href="/dashboard/address?type=kabupaten" 
          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// --- 5. PRODUKSI PER KABUPATEN ---
const defaultKabupatenBarData = [
  { name: "Lampung Tengah", ton: 156.45 },
  { name: "Lampung Timur", ton: 142.23 },
  { name: "Lampung Selatan", ton: 128.67 },
  { name: "Lampung Utara", ton: 98.34 },
  { name: "Tulang Bawang", ton: 87.91 },
  { name: "Lainnya", ton: 279.85 },
];

export function ProduksiPerKabupatenChart({ data }: { data?: { name: string; ton: number }[] }) {
  const chartData = data && data.length > 0 ? data : defaultKabupatenBarData;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col space-y-3 w-full h-[280px]">
      <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
        PRODUKSI PER KABUPATEN
      </h3>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 8, fill: "#64748b", fontWeight: 600 }}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: "#94a3b8" }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px", border: "none" }}
              formatter={(val: any) => [`${val} Ton`, "Produksi"]}
            />
            <Bar dataKey="ton" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
