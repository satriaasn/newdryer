"use client";

import React from "react";

interface DryerMachineIconProps {
  isProducing: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

export function DryerMachineIcon({
  isProducing,
  size = "md",
  className = "",
  showGlow = true,
}: DryerMachineIconProps) {
  // Dimensions per size
  const dims = {
    sm: { w: 38, h: 46 },
    md: { w: 58, h: 70 },
    lg: { w: 76, h: 92 },
    xl: { w: 100, h: 120 },
  }[size];

  const strokeColor = isProducing ? "#10b981" : "#f43f5e";
  const glowColor = isProducing ? "#10b981" : "#f43f5e";
  const bodyFill = isProducing ? "#064e3b" : "#1e293b";
  const bodyStroke = isProducing ? "#059669" : "#475569";
  const panelFill = isProducing ? "#047857" : "#334155";
  const accentLight = isProducing ? "#34d399" : "#fb7185";

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dims.w, height: dims.h }}
    >
      <svg
        viewBox="0 0 100 120"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 overflow-visible"
      >
        <defs>
          {/* Ambient Glow */}
          <radialGradient id={`dryer-glow-${isProducing ? "green" : "red"}`} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity={isProducing ? "0.35" : "0.15"} />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>

          {/* Silo Metallic Gradient */}
          <linearGradient id={`silo-body-${isProducing ? "green" : "red"}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isProducing ? "#065f46" : "#1e293b"} />
            <stop offset="40%" stopColor={isProducing ? "#047857" : "#334155"} />
            <stop offset="70%" stopColor={isProducing ? "#059669" : "#475569"} />
            <stop offset="100%" stopColor={isProducing ? "#064e3b" : "#0f172a"} />
          </linearGradient>

          {/* Heat air wave gradient */}
          <linearGradient id="heat-glow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Radial Aura */}
        {showGlow && (
          <ellipse
            cx="50"
            cy="65"
            rx="46"
            ry="46"
            fill={`url(#dryer-glow-${isProducing ? "green" : "red"})`}
          />
        )}

        {/* 1. TOP EXHAUST & BEACON TOWER */}
        {/* Steam / Heat Waves when producing */}
        {isProducing && (
          <g opacity="0.85">
            <path
              d="M 44,14 Q 41,8 45,2"
              stroke="#34d399"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <path
              d="M 50,12 Q 54,6 50,1"
              stroke="#6ee7b7"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
            <path
              d="M 56,14 Q 59,8 55,2"
              stroke="#34d399"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDelay: "600ms" }}
            />
          </g>
        )}

        {/* Beacon Mast & Lamp */}
        <line x1="50" y1="9" x2="50" y2="17" stroke={isProducing ? "#10b981" : "#ef4444"} strokeWidth="2.5" />
        <circle cx="50" cy="8" r="4" fill={isProducing ? "#10b981" : "#ef4444"} />
        {isProducing ? (
          <circle cx="50" cy="8" r="7" fill="#10b981" opacity="0.4" className="animate-ping origin-center" />
        ) : (
          <circle cx="50" cy="8" r="1.5" fill="#fecdd3" />
        )}

        {/* Exhaust Cap / Hood */}
        <path
          d="M 38,20 L 50,15 L 62,20 L 58,23 L 42,23 Z"
          fill={panelFill}
          stroke={bodyStroke}
          strokeWidth="1.2"
        />

        {/* Top Funnel / Hopper Roof */}
        <path
          d="M 30,28 L 50,22 L 70,28 L 68,32 L 32,32 Z"
          fill={panelFill}
          stroke={bodyStroke}
          strokeWidth="1.5"
        />

        {/* 2. MAIN DRYER SILO TOWER */}
        <rect
          x="32"
          y="32"
          width="36"
          height="48"
          rx="2"
          fill={`url(#silo-body-${isProducing ? "green" : "red"})`}
          stroke={bodyStroke}
          strokeWidth="1.5"
        />

        {/* Panel Segments / Ribs */}
        <line x1="32" y1="44" x2="68" y2="44" stroke={isProducing ? "#047857" : "#334155"} strokeWidth="1" />
        <line x1="32" y1="56" x2="68" y2="56" stroke={isProducing ? "#047857" : "#334155"} strokeWidth="1" />
        <line x1="32" y1="68" x2="68" y2="68" stroke={isProducing ? "#047857" : "#334155"} strokeWidth="1" />

        {/* Rivets / Bolts Detail */}
        <circle cx="34.5" cy="36" r="0.9" fill={accentLight} />
        <circle cx="34.5" cy="48" r="0.9" fill={accentLight} />
        <circle cx="34.5" cy="60" r="0.9" fill={accentLight} />
        <circle cx="34.5" cy="72" r="0.9" fill={accentLight} />
        <circle cx="65.5" cy="36" r="0.9" fill={accentLight} />
        <circle cx="65.5" cy="48" r="0.9" fill={accentLight} />
        <circle cx="65.5" cy="60" r="0.9" fill={accentLight} />
        <circle cx="65.5" cy="72" r="0.9" fill={accentLight} />

        {/* Observation Sight Window / Grain Chamber */}
        <rect
          x="44"
          y="37"
          width="12"
          height="37"
          rx="2"
          fill={isProducing ? "#022c22" : "#0f172a"}
          stroke={isProducing ? "#10b981" : "#475569"}
          strokeWidth="1.2"
        />

        {/* Content in Sight Glass: Golden Grains & Heat or Cold Standby */}
        {isProducing ? (
          <g>
            {/* Grain Bed (Golden Warm Amber) */}
            <rect x="45.5" y="47" width="9" height="25.5" rx="1" fill="#f59e0b" opacity="0.9" />
            {/* Grain texture points */}
            <circle cx="48" cy="52" r="0.9" fill="#fef08a" />
            <circle cx="52" cy="56" r="0.9" fill="#fef08a" />
            <circle cx="47" cy="61" r="0.9" fill="#fef08a" />
            <circle cx="51" cy="66" r="0.9" fill="#fef08a" />
            {/* Hot air circulation waves */}
            <path
              d="M 47,43 Q 50,40 53,43"
              stroke="#fbbf24"
              strokeWidth="1.2"
              fill="none"
              className="animate-pulse"
            />
          </g>
        ) : (
          <g opacity="0.5">
            {/* Empty Cold Sight Glass */}
            <line x1="46" y1="42" x2="54" y2="68" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="54" y1="42" x2="46" y2="68" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" />
          </g>
        )}

        {/* 3. BLOWER / BURNER UNIT (Kiri) */}
        {/* Air Duct */}
        <path d="M 26,58 L 32,58 L 32,66 L 26,66 Z" fill={panelFill} stroke={bodyStroke} strokeWidth="1" />
        {/* Blower Box */}
        <rect
          x="14"
          y="52"
          width="14"
          height="18"
          rx="2.5"
          fill={panelFill}
          stroke={bodyStroke}
          strokeWidth="1.2"
        />
        {/* Fan Grille */}
        <circle cx="21" cy="61" r="6" fill={isProducing ? "#064e3b" : "#0f172a"} stroke={bodyStroke} strokeWidth="1" />
        {/* Fan Blades (Spinning if Producing) */}
        {isProducing ? (
          <g
            className="origin-[21px_61px] animate-spin"
            style={{ animationDuration: "2.5s", transformOrigin: "21px 61px" }}
          >
            <line x1="21" y1="56.5" x2="21" y2="65.5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="16.5" y1="61" x2="25.5" y2="61" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="17.8" y1="57.8" x2="24.2" y2="64.2" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24.2" y1="57.8" x2="17.8" y2="64.2" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="21" cy="61" r="1.5" fill="#a7f3d0" />
          </g>
        ) : (
          <g>
            <circle cx="21" cy="61" r="2" fill="#ef4444" />
            <line x1="18" y1="61" x2="24" y2="61" stroke="#ef4444" strokeWidth="1" />
          </g>
        )}

        {/* 4. DIGITAL CONTROL PANEL (Kanan) */}
        <rect
          x="68"
          y="46"
          width="9"
          height="16"
          rx="1.5"
          fill={isProducing ? "#022c22" : "#0f172a"}
          stroke={bodyStroke}
          strokeWidth="1"
        />
        {/* Power Status LED */}
        <circle cx="72.5" cy="50" r="1.8" fill={isProducing ? "#10b981" : "#ef4444"} />
        {isProducing && (
          <circle cx="72.5" cy="50" r="2.8" fill="#10b981" opacity="0.4" className="animate-ping origin-center" />
        )}
        {/* Mini meter bars */}
        <line x1="70" y1="54" x2="75" y2="54" stroke={isProducing ? "#34d399" : "#64748b"} strokeWidth="1" />
        <line x1="70" y1="57" x2="74" y2="57" stroke={isProducing ? "#34d399" : "#64748b"} strokeWidth="1" />

        {/* 5. DISCHARGE HOPPER (Bawah Silo) */}
        <polygon
          points="32,80 68,80 58,92 42,92"
          fill={panelFill}
          stroke={bodyStroke}
          strokeWidth="1.5"
        />

        {/* Discharge Spout & Valve Gate */}
        <rect
          x="46"
          y="92"
          width="8"
          height="6"
          rx="1"
          fill={isProducing ? "#047857" : "#1e293b"}
          stroke={bodyStroke}
          strokeWidth="1"
        />
        {/* Grain pouring effect when producing */}
        {isProducing && (
          <g opacity="0.8">
            <line x1="50" y1="98" x2="50" y2="103" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="1.5 1.5" />
            <circle cx="50" cy="105" r="1.2" fill="#fbbf24" />
          </g>
        )}

        {/* 6. STRUCTURAL LEGS & A-FRAME BASE */}
        {/* Left Leg */}
        <line x1="34" y1="80" x2="28" y2="110" stroke={bodyStroke} strokeWidth="2.5" strokeLinecap="round" />
        {/* Right Leg */}
        <line x1="66" y1="80" x2="72" y2="110" stroke={bodyStroke} strokeWidth="2.5" strokeLinecap="round" />
        {/* Cross Bracing */}
        <line x1="31" y1="96" x2="69" y2="96" stroke={bodyStroke} strokeWidth="1.5" />
        <line x1="31" y1="96" x2="42" y2="92" stroke={bodyStroke} strokeWidth="1" />
        <line x1="69" y1="96" x2="58" y2="92" stroke={bodyStroke} strokeWidth="1" />

        {/* Base Footpads */}
        <rect x="24" y="109" width="8" height="3" rx="1" fill={panelFill} stroke={bodyStroke} strokeWidth="1" />
        <rect x="68" y="109" width="8" height="3" rx="1" fill={panelFill} stroke={bodyStroke} strokeWidth="1" />
      </svg>
    </div>
  );
}
