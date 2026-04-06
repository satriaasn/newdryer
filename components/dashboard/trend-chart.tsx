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
          tick={{ fontSize: 10, fill: textColor }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: textColor }} 
          dx={-5} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#0f172a' : '#fff',
            borderRadius: '12px', 
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            color: isDark ? '#fff' : '#000'
          }} 
          itemStyle={{ color: primaryColor }}
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
