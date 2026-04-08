"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

interface TrendChartProps {
  data: { date: string; ton: number }[];
  theme?: 'light' | 'dark' | 'oligarch';
}

export default function TrendChart({ data, theme = 'oligarch' }: TrendChartProps) {
  const isDark = theme === 'dark' || theme === 'oligarch';
  const primaryColor = "#87ceeb"; // Sky Blue
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0";
  const textColor = isDark ? "#94a3b8" : "#64748B";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fill: textColor }} 
          dy={10}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: textColor }} 
          dx={-5} 
        />
        <Tooltip 
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
        <Line 
          type="monotone" 
          dataKey="ton" 
          stroke={primaryColor} 
          strokeWidth={3} 
          dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1e293b' : '#fff', stroke: primaryColor }} 
          activeDot={{ r: 6, fill: primaryColor, stroke: "#fff", strokeWidth: 2 }}
          animationDuration={1500}
        >
          <LabelList 
            dataKey="ton" 
            position="top" 
            style={{ 
              fontSize: '11px', 
              fontWeight: '900', 
              fill: isDark ? '#fff' : '#0f172a',
              textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
            }} 
            offset={12} 
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
