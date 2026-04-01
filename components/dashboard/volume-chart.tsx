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
  LabelList,
} from "recharts";

interface VolumeBarChartProps {
  data: { name: string; ton: number }[];
}

const COLORS = ['#0F172A', '#0284C7', '#059669', '#7C3AED', '#EA580C'];

export default function VolumeBarChart({ data }: VolumeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
        <XAxis 
          type="number"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748B' }} 
        />
        <YAxis 
          type="category"
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#64748B' }} 
          width={80}
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
        <Bar dataKey="ton" name="Volume (Ton)" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList dataKey="ton" position="right" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748B' }} offset={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
