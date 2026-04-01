"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  MapPin 
} from "lucide-react";

const mobileNavigation = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produksi", href: "/dashboard/production", icon: ClipboardList },
  { name: "Gapoktan", href: "/dashboard/gapoktan", icon: Users },
  { name: "Alamat", href: "/dashboard/address", icon: MapPin },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t px-2">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 transition-all group",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-primary/10" : "group-hover:bg-muted"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
