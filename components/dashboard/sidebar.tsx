"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Factory,
  Users,
  Package,
  ClipboardList,
  Map,
  Wheat,
  Home,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produksi", href: "/dashboard/production", icon: ClipboardList },
  { name: "Gapoktan", href: "/dashboard/gapoktan", icon: Users },
  { name: "Unit Dryer", href: "/dashboard/dryer", icon: Factory },
  { name: "Komoditas", href: "/dashboard/komoditas", icon: Wheat },
  { name: "Peta GIS", href: "/dashboard/maps", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-xl sticky top-0">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight gradient-text">AgroDryer</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all mb-4">
          <Home className="h-5 w-5" /> Halaman Publik
        </a>
        <p className="px-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2">Admin Panel</p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/30">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
