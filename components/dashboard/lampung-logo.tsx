"use client";

export function LampungLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shield shape */}
      <path 
        d="M 50 5 L 90 20 L 90 75 C 90 95 65 112 50 118 C 35 112 10 95 10 75 L 10 20 Z" 
        fill="#FFD700" 
        stroke="#B8860B" 
        strokeWidth="3"
      />
      {/* Inner Shield */}
      <path 
        d="M 50 10 L 85 23 L 85 73 C 85 91 62 107 50 112 C 38 107 15 91 15 73 L 15 23 Z" 
        fill="#005A36" 
      />
      {/* Red Header section inside shield */}
      <path 
        d="M 15 23 L 85 23 L 85 42 L 15 42 Z" 
        fill="#DC2626" 
      />
      {/* Yellow Siger / Crown symbol at top */}
      <path 
        d="M 30 38 L 38 28 L 44 34 L 50 25 L 56 34 L 62 28 L 70 38 Z" 
        fill="#FACC15" 
        stroke="#991B1B" 
        strokeWidth="1"
      />
      {/* Rice & Coffee sprigs */}
      <path d="M 30 48 Q 22 68 35 85" stroke="#FACC15" strokeWidth="2.5" fill="none" />
      <path d="M 70 48 Q 78 68 65 85" stroke="#FACC15" strokeWidth="2.5" fill="none" />
      {/* Center Torch / Pillar */}
      <path d="M 47 45 L 53 45 L 52 82 L 48 82 Z" fill="#D97706" />
      {/* Flame */}
      <path d="M 50 36 C 45 42 47 46 50 48 C 53 46 55 42 50 36 Z" fill="#EF4444" />
      {/* White Ribbon with LAMPUNG text */}
      <path d="M 20 86 Q 50 94 80 86 L 78 94 Q 50 102 22 94 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
      <text x="50" y="93" textAnchor="middle" fill="#000000" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">LAMPUNG</text>
    </svg>
  );
}
