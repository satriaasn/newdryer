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
  theme?: 'light' | 'dark' | 'oligarch';
}

export default function VolumeBarChart({ data, theme = 'oligarch' }: VolumeBarChartProps) {
  const isDark = theme === 'dark' || theme === 'oligarch';
  const primaryColor = "#87ceeb"; // Sky Blue
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0";
  const textColor = isDark ? "#94a3b8" : "#64748B";

  // Gradient colors for better separation
  const BAR_COLORS = [
    "#87ceeb", // Sky Blue
    "#0ea5e9", // Sky 500
    "#38bdf8", // Sky 400
    "#7dd3fc", // Sky 300
    "#bae6fd", // Sky 200
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
        <XAxis 
          type="number"
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: textColor }} 
        />
        <YAxis 
          type="category"
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: isDark ? '#fff' : textColor, fontWeight: 'bold' }} 
          width={100}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ 
            backgroundColor: '#1e293b', // Slate 800 for high contrast
            borderRadius: '8px', 
            border: '1px solid #334155', // Slate 700 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
            color: '#f8fafc', // Slate 50
            padding: '8px 12px',
            fontSize: '12px'
          }} 
          itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }} // Sky 400
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }} // Slate 400
        />
        <Bar dataKey="ton" name="Volume (Ton)" radius={[0, 8, 8, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
          <LabelList 
            dataKey="ton" 
            position="right" 
            style={{ 
              fontSize: '11px', 
              fontWeight: '900', 
              fill: isDark ? '#87ceeb' : '#0f172a' 
            }} 
            offset={12} 
            formatter={(val: number) => `${val} T`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
