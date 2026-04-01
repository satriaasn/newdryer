"use client";

export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import type { Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { MapPin, Plus, Trash2, Edit, Loader2, ChevronRight, Home, Building2, Map as MapIcon } from "lucide-react";

type AddressType = 'kabupaten' | 'kecamatan' | 'desa';

export default function AddressManagement() {
  const [activeTab, setActiveTab] = useState<AddressType>('kabupaten');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state for filtering
  const [kabList, setKabList] = useState<Kabupaten[]>([]);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [selKab, setSelKab] = useState("");
  const [selKec, setSelKec] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formName, setFormName] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/api/address?type=${activeTab}`;
      if (activeTab === 'kecamatan' && selKab) url += `&kabupaten_id=${selKab}`;
      if (activeTab === 'desa' && selKec) url += `&kecamatan_id=${selKec}`;
      
      const res = await fetch(url);
      const items = await res.json();
      setData(Array.isArray(items) ? items : []);
    } finally {
      setLoading(false);
    }
  };

  const loadMaster = async () => {
    const kabs = await fetch('/api/address?type=kabupaten').then(r => r.json());
    setKabList(kabs);
    if (selKab) {
      const kecs = await fetch(`/api/address?type=kecamatan&kabupaten_id=${selKab}`).then(r => r.json());
      setKecList(kecs);
    }
  };

  useEffect(() => { loadData(); }, [activeTab, selKab, selKec]);
  useEffect(() => { loadMaster(); }, [selKab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? 'PATCH' : 'POST';
    const parentId = activeTab === 'kecamatan' ? selKab : (activeTab === 'desa' ? selKec : undefined);
    
    if ((activeTab === 'kecamatan' && !selKab) || (activeTab === 'desa' && !selKec)) {
      alert(`Pilih ${activeTab === 'kecamatan' ? 'Kabupaten' : 'Kecamatan'} terlebih dahulu`);
      return;
    }

    const res = await fetch('/api/address', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: activeTab,
        id: editingItem?.id,
        name: formName,
        parentId
      })
    });

    if (res.ok) {
      loadData();
      setShowForm(false);
      setEditingItem(null);
      setFormName("");
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus wilayah ini? Data di bawahnya juga akan ikut terhapus.")) return;
    const res = await fetch(`/api/address?type=${activeTab}&id=${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
    else { const err = await res.json(); alert(err.error); }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detail Wilayah</h1>
              <p className="text-muted-foreground">Kelola data Kabupaten, Kecamatan, dan Desa</p>
            </div>
            <button 
              onClick={() => { setEditingItem(null); setFormName(""); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" /> Tambah {activeTab === 'kabupaten' ? 'Kabupaten' : (activeTab === 'kecamatan' ? 'Kecamatan' : 'Desa')}
            </button>
          </header>

          {/* Navigation Tabs */}
          <div className="flex p-1 gap-1 rounded-2xl bg-muted/50 w-fit">
            {[
              { id: 'kabupaten', label: 'Kabupaten', icon: Building2 },
              { id: 'kecamatan', label: 'Kecamatan', icon: MapIcon },
              { id: 'desa', label: 'Desa', icon: Home }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => { setActiveTab(t.id as AddressType); setShowForm(false); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters for nested data */}
          <div className="flex flex-wrap gap-4 items-end">
            {(activeTab === 'kecamatan' || activeTab === 'desa') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Kabupaten</label>
                <select value={selKab} onChange={e => { setSelKab(e.target.value); setSelKec(""); }} className="block w-64 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Pilih Kabupaten...</option>
                  {kabList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
            )}
            {activeTab === 'desa' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Kecamatan</label>
                <select value={selKec} onChange={e => setSelKec(e.target.value)} disabled={!selKab} className="block w-64 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                  <option value="">Pilih Kecamatan...</option>
                  {kecList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="rounded-2xl border bg-card/60 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Nama {activeTab}</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    required 
                    placeholder={`Masukkan nama ${activeTab}`}
                    className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-medium rounded-xl border hover:bg-muted transition-all">Batal</button>
                  <button type="submit" className="px-8 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all">
                    {editingItem ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          <div className="rounded-2xl border bg-card/60 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nama</th>
                  {activeTab !== 'kabupaten' && <th className="px-6 py-4">Induk</th>}
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">Tidak ada data ditemukan. {(!selKab && activeTab !== 'kabupaten') ? "Pilih filter di atas." : ""}</td></tr>
                ) : data.map(item => (
                  <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    {activeTab !== 'kabupaten' && (
                      <td className="px-6 py-4 text-sm text-muted-foreground italic">
                        {activeTab === 'kecamatan' ? item.kabupaten?.name : item.kecamatan?.name}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingItem(item); setFormName(item.name); setShowForm(true); }} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
