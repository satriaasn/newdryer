"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Gapoktan, Komoditas, Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { Users, MapPin, Phone, Wheat, Plus, Loader2, Trash2, Edit } from "lucide-react";
import { GapoktanForm } from "@/components/dashboard/gapoktan-form";

export default function GapoktanAdmin() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [allKomoditas, setAllKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGapoktan, setEditingGapoktan] = useState<Gapoktan | null>(null);

  const reload = () => {
    Promise.all([
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([g, k]) => {
      setGapoktan(Array.isArray(g) ? g : []);
      setAllKomoditas(Array.isArray(k) ? k : []);
    }).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus Gapoktan "${name}"? Semua data dryer dan produksi terkait juga akan terpengaruh.`)) return;
    try {
      const res = await fetch(`/api/gapoktan/${id}`, { method: 'DELETE' });
      if (res.ok) reload();
      else { const err = await res.json(); alert(err.error); }
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kelola Gapoktan</h1>
              <p className="text-muted-foreground">Tambah, edit, dan kelola data gapoktan</p>
            </div>
            <button onClick={() => { setEditingGapoktan(null); setShowForm(!showForm); }} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> Tambah Gapoktan
            </button>
          </div>

          {(showForm || editingGapoktan) && (
            <GapoktanForm 
              initialData={editingGapoktan} 
              onSaved={() => { reload(); setShowForm(false); setEditingGapoktan(null); }} 
              onCancel={() => { setShowForm(false); setEditingGapoktan(null); }} 
            />
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl border bg-card/60 animate-pulse" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gapoktan.map(g => (
                <div key={g.id} className="relative group rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => setEditingGapoktan(g)}
                      className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(g.id, g.name)}
                      className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-start justify-between mb-3 mr-16">
                    <div>
                      <h3 className="text-lg font-bold">{g.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {g.desa?.name}, {g.desa?.kecamatan?.name}, {g.desa?.kecamatan?.kabupaten?.name}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="h-5 w-5 text-primary" /></div>
                  </div>
                  {g.ketua && <p className="text-sm mb-1"><span className="text-muted-foreground">Ketua:</span> <span className="font-medium">{g.ketua}</span></p>}
                  {g.phone && <div className="flex items-center gap-2 text-sm mb-2"><Phone className="h-3 w-3 text-muted-foreground" />{g.phone}</div>}
                  {g.address && <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic">🏠 {g.address}</p>}
                  {g.latitude && <p className="text-xs text-muted-foreground font-mono">📍 {g.latitude?.toFixed(4)}, {g.longitude?.toFixed(4)}</p>}

                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Komoditas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.komoditas && g.komoditas.length > 0 ? g.komoditas.map(k => (
                        <span key={k.id} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Wheat className="h-3 w-3" />{k.name}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">Belum ada</span>}
                    </div>
                  </div>
                  {g.dryer_units && g.dryer_units.length > 0 && (
                    <div className="border-t pt-3 mt-3"><p className="text-xs text-muted-foreground">Dryer: {g.dryer_units.length} unit</p></div>
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

