"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";

const data = [
  { time: "08:00", temp: 65, moisture: 18 },
  { time: "09:00", temp: 68, moisture: 16 },
  { time: "10:00", temp: 72, moisture: 15 },
  { time: "11:00", temp: 75, moisture: 14 },
  { time: "12:00", temp: 74, moisture: 13.5 },
  { time: "13:00", temp: 70, moisture: 13 },
  { time: "14:00", temp: 68, moisture: 12.8 },
];

export function ProductionChart() {
  return (
    <div className="h-[400px] w-full rounded-2xl border bg-card/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Tren Produksi</h3>
          <p className="text-sm text-muted-foreground">Pemantauan suhu dan kelembaban real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs font-medium">Suhu (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs font-medium">Kelembaban (%)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTemp)"
          />
          <Area
            type="monotone"
            dataKey="moisture"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMoisture)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
