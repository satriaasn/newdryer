"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Globe, 
  Building2, 
  MapPin, 
  Building, 
  Users, 
  Factory, 
  Wheat, 
  BarChart3, 
  FileText, 
  Edit3, 
  TrendingUp, 
  FilePieChart, 
  PieChart, 
  Map, 
  UserCheck, 
  Settings, 
  Bell, 
  Layers, 
  Clock, 
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface RedesignedSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function RedesignedSidebar({ isOpen, onClose }: RedesignedSidebarProps) {
  const pathname = usePathname();

  const dataMasterItems = [
    { name: "Provinsi", href: "/dashboard/address?type=provinsi", icon: Globe },
    { name: "Kabupaten/Kota", href: "/dashboard/address?type=kabupaten", icon: Building2 },
    { name: "Kecamatan", href: "/dashboard/address?type=kecamatan", icon: MapPin },
    { name: "Desa", href: "/dashboard/address?type=desa", icon: Building },
    { name: "Gapoktan", href: "/dashboard/gapoktan", icon: Users },
    { name: "Dryer", href: "/dashboard/dryer", icon: Factory },
    { name: "Komoditas", href: "/dashboard/komoditas", icon: Wheat },
  ];

  const transaksiItems = [
    { name: "Produksi Harian", href: "/dashboard/production", icon: BarChart3 },
    { name: "Riwayat Produksi", href: "/dashboard/production", icon: FileText },
    { name: "Input Manual", href: "/dashboard/production", icon: Edit3 },
  ];

  const analyticsItems = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Laporan", href: "/dashboard/reports", icon: FilePieChart },
    { name: "Analisis", href: "/dashboard/export", icon: PieChart },
    { name: "Peta Sebaran", href: "/dashboard/maps", icon: Map },
  ];

  const sistemItems = [
    { name: "Pengguna", href: "/dashboard/users", icon: UserCheck },
    { name: "Pengaturan", href: "/dashboard/profile", icon: Settings },
    { name: "Notifikasi", href: "#", icon: Bell },
    { name: "Integrasi GIS", href: "/dashboard/maps", icon: Layers },
    { name: "Log Aktivitas", href: "#", icon: Clock },
  ];

  return (
    <aside className={cn(
      "w-64 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between shrink-0 space-y-4 font-sans text-slate-700",
      isOpen ? "block" : "hidden lg:block"
    )}>
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-hide">
        {/* Top Active Dashboard Button */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#2563eb] text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        {/* Section: DATA MASTER */}
        <div className="space-y-1 pt-2">
          <p className="px-3 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            DATA MASTER
          </p>
          {dataMasterItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Section: TRANSAKSI */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <p className="px-3 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            TRANSAKSI
          </p>
          {transaksiItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Section: ANALYTICS */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <p className="px-3 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            ANALYTICS
          </p>
          {analyticsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Section: SISTEM */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {sistemItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Button: Petunjuk Penggunaan */}
      <div className="pt-2 border-t border-slate-100">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#2563eb] text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all">
          <Lightbulb className="h-4 w-4" />
          <span>Petunjuk Penggunaan</span>
        </button>
      </div>
    </aside>
  );
}
