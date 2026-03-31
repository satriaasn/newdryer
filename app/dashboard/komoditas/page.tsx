"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Komoditas } from "@/lib/types";
import { Plus, Loader2, Wheat } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function KomoditasAdmin() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = () => {
    fetch('/api/komoditas').then(r => r.json()).then(d => setKomoditas(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('komoditas').insert({ name: newName.trim() });
    setSubmitting(false);
    if (error) alert(error.message);
    else { setNewName(''); reload(); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus komoditas "${name}"?`)) return;
    const { error } = await supabase.from('komoditas').delete().eq('id', id);
    if (error) alert(error.message);
    else reload();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Komoditas</h1>
            <p className="text-muted-foreground">Tambah dan kelola jenis komoditas pertanian</p>
          </header>

          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="text-xs font-medium text-muted-foreground">Nama Komoditas Baru</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Nama komoditas..."
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tambah
            </button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? [1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl border animate-pulse bg-card/60" />) :
            komoditas.map(k => (
              <div key={k.id} className="rounded-2xl border bg-card/60 p-4 flex items-center justify-between hover:shadow-lg hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Wheat className="h-5 w-5 text-primary" /></div>
                  <span className="font-semibold">{k.name}</span>
                </div>
                <button onClick={() => handleDelete(k.id, k.name)} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors">Hapus</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
