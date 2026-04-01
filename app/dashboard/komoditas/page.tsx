"use client";

import { useEffect, useState } from "react";
import type { Komoditas } from "@/lib/types";
import { Plus, Loader2, Wheat, Edit, Trash2, X, Download } from "lucide-react";
import { ImportModal } from "@/components/dashboard/import-modal";

export default function KomoditasAdmin() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reload = () => {
    fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()).then(d => setKomoditas(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const url = editingId ? '/api/komoditas' : '/api/komoditas';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, name: newName.trim() } : { name: newName.trim() }),
      });
      if (res.ok) { 
        setNewName(''); 
        setEditingId(null);
        setShowForm(false);
        reload(); 
      }
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  const handleEdit = (k: Komoditas) => {
    setEditingId(k.id);
    setNewName(k.name);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus komoditas "${name}"?`)) return;
    try {
      const res = await fetch(`/api/komoditas?id=${id}`, { method: 'DELETE' });
      if (res.ok) reload();
      else { const err = await res.json(); alert(err.error); }
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Komoditas</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Master data komoditas pertanian</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowImport(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4 rotate-180" /> Import Data
          </button>
          <button 
            onClick={() => { setEditingId(null); setNewName(''); setShowForm(!showForm); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Tambah Komoditas
          </button>
        </div>
      </header>

      <ImportModal title="Import Data Komoditas" isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={reload} />

          {(showForm || editingId) && (
            <form onSubmit={handleSubmit} className="flex items-end gap-3 bg-card/40 p-4 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex-1 max-w-xs">
              <label className="text-xs font-medium text-muted-foreground">{editingId ? 'Ubah Nama' : 'Nama Komoditas Baru'}</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Nama komoditas..."
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />} 
                {editingId ? 'Simpan' : 'Tambah'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setNewName(''); }} className="p-2 rounded-xl border hover:bg-muted transition-all">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? [1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl border animate-pulse bg-card/60" />) :
            komoditas.map(k => (
              <div key={k.id} className={`rounded-2xl border p-4 flex items-center justify-between transition-all ${editingId === k.id ? 'ring-2 ring-primary border-transparent bg-card' : 'bg-card/60 hover:shadow-lg hover:border-primary/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${editingId === k.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}><Wheat className="h-5 w-5" /></div>
                  <span className="font-semibold">{k.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(k)} className="p-2 transition-all rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(k.id, k.name)} className="p-2 transition-all rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
    </div>
  );
}
