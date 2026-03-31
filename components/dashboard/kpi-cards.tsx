"use client";

import { cn } from "@/lib/utils";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight 
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: any;
  color?: string;
}

export function KPICard({ title, value, unit, trend, icon: Icon, color }: KPICardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className="relative group overflow-hidden rounded-2xl border bg-card/60 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className={cn("h-16 w-16", color)} />
      </div>
      
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
          <span className="text-xs text-muted-foreground">vs last hour</span>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center translate-y-8 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export function KPICardsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard 
        title="Suhu Rata-rata" 
        value={68.4} 
        unit="°C" 
        trend={2.4} 
        icon={Thermometer} 
        color="text-orange-500"
      />
      <KPICard 
        title="Tingkat Kelembaban" 
        value={12.8} 
        unit="%" 
        trend={-1.5} 
        icon={Droplets} 
        color="text-blue-500"
      />
      <KPICard 
        title="Kelembaban Sekitar" 
        value={45} 
        unit="%" 
        trend={0.8} 
        icon={Wind} 
        color="text-cyan-500"
      />
      <KPICard 
        title="Output Aktif" 
        value={24.5} 
        unit="ton" 
        trend={5.2} 
        icon={Activity} 
        color="text-primary"
      />
    </div>
  );
}
