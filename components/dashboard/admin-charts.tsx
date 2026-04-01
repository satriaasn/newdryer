"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface AdminTrendChartProps {
  data: { date: string; ton: number }[];
}

export function AdminTrendChart({ data }: AdminTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
        <Area type="monotone" dataKey="ton" stroke="#2563eb" fillOpacity={1} fill="url(#colorTon)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface AdminBarChartProps {
  data: { name: string; ton: number }[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export function AdminBarChart({ data }: AdminBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
        <Bar dataKey="ton" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
