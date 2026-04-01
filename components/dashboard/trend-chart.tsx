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
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dx={-10} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Line type="monotone" dataKey="ton" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#0F172A' }}>
          <LabelList dataKey="ton" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#0F172A' }} offset={10} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
