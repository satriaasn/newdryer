"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Gapoktan } from "@/lib/types";
import { Users, MapPin, Phone, Wheat } from "lucide-react";

export default function GapoktanPage() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gapoktan').then(r => r.json()).then(data => {
      setGapoktan(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Gapoktan</h1>
            <p className="text-muted-foreground">Daftar kelompok tani dan komoditas yang dikelola</p>
          </header>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl border bg-card/60 animate-pulse" />)}
            </div>
          ) : gapoktan.length === 0 ? (
            <p className="text-muted-foreground">Belum ada data gapoktan</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gapoktan.map(g => (
                <div key={g.id} className="rounded-2xl border bg-card/60 p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{g.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {g.desa?.name}, {g.desa?.kecamatan?.name}, {g.desa?.kecamatan?.kabupaten?.name}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  {g.ketua && (
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-muted-foreground">Ketua:</span>
                      <span className="font-medium">{g.ketua}</span>
                    </div>
                  )}
                  {g.phone && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{g.phone}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Komoditas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.komoditas && g.komoditas.length > 0 ? g.komoditas.map(k => (
                        <span key={k.id} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Wheat className="h-3 w-3" />
                          {k.name}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">Belum ada</span>}
                    </div>
                  </div>

                  {g.dryer_units && g.dryer_units.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Dryer: {g.dryer_units.length} unit</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
