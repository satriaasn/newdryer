"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface VolumeBarChartProps {
  data: { name: string; allTime: number }[];
}

const COLORS = ['#0F172A', '#0284C7', '#059669', '#7C3AED', '#EA580C'];

export default function VolumeBarChart({ data }: VolumeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748B' }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748B' }} 
          dx={-10} 
        />
        <Tooltip 
          cursor={{ fill: '#F1F5F9' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontSize: '12px',
            fontWeight: 'bold'
          }} 
        />
        <Bar dataKey="allTime" name="Volume (Ton)" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
