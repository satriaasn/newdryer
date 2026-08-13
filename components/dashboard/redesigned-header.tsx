"use client";

import { useState } from "react";
import { LampungLogo } from "./lampung-logo";
import { Calendar, Bell, ChevronDown, User, ShieldCheck } from "lucide-react";

interface HeaderProps {
  userProfile?: {
    full_name?: string | null;
    role?: string | null;
  } | null;
}

export function RedesignedHeader({ userProfile }: HeaderProps) {
  const [dateRange, setDateRange] = useState("10 Mei 2026 - 10 Mei 2026");
  const [unreadNotifications, setUnreadNotifications] = useState(8);

  return (
    <header className="w-full bg-[#eef2f8] pt-3 px-3 sm:px-6 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Left Navy Blue Banner */}
      <div className="flex-1 bg-gradient-to-r from-[#0d2238] via-[#0f2b48] to-[#12365c] text-white rounded-2xl md:rounded-r-full md:rounded-l-2xl py-3 px-4 sm:px-6 shadow-md flex items-center gap-3 sm:gap-4 border border-[#1d426d]/40">
        <div className="flex-shrink-0 bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/15">
          <LampungLogo className="h-10 w-10 sm:h-11 sm:w-11" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-tight uppercase text-white">
            SISTEM MONITORING PRODUKSI DRYER
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/90 font-medium tracking-normal leading-tight mt-0.5">
            Dinas Ketahanan Pangan, Tanaman Pangan dan Hortikultura Provinsi Lampung
          </p>
        </div>
      </div>

      {/* Right Header Widgets */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0 px-1">
        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-xs font-semibold text-slate-700 cursor-pointer">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>{dateRange}</span>
          <Calendar className="h-4 w-4 text-slate-400 ml-1" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="h-10 w-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all">
            <Bell className="h-4 w-4 text-slate-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 bg-white pl-2 pr-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-slate-800">
              {userProfile?.full_name || "Admin Provinsi"}
            </span>
            <span className="text-[10px] font-medium text-slate-500 mt-0.5">
              {userProfile?.role || "Administrator"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
        </div>
      </div>
    </header>
  );
}
