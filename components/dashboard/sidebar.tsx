"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ShieldCheck,
  MapPin,
  X,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { userService, type Profile } from "@/services/user.service";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produksi", href: "/dashboard/production", icon: ClipboardList },
  { name: "Gapoktan", href: "/dashboard/gapoktan", icon: Users },
  { name: "Unit Dryer", href: "/dashboard/dryer", icon: Factory },
  { name: "Komoditas", href: "/dashboard/komoditas", icon: Wheat },
  { name: "Peta GIS", href: "/dashboard/maps", icon: Map },
  { name: "Detail Wilayah", href: "/dashboard/address", icon: MapPin },
  { name: "Pengaturan User", href: "/dashboard/users", icon: ShieldCheck },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    userService.getCurrentProfile().then(setProfile).catch(console.error);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-card/50 backdrop-blur-xl transition-transform lg:translate-x-0 lg:static lg:flex h-screen sticky top-0",
        isOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">AgroDryer</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden ml-auto p-2 text-muted-foreground hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all mb-4"
          >
            <Home className="h-5 w-5" /> Halaman Publik
          </button>
          <p className="px-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2">Admin Panel</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
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

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/30">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.full_name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate uppercase tracking-tighter">{profile?.role || "Administrator"}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}
