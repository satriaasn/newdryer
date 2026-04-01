"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import type { Kabupaten, Kecamatan, Desa } from "@/lib/types";
import { 
  Search, X, Save, AlertCircle, RefreshCw, Download
} from "lucide-react";
import { ImportModal } from "@/components/dashboard/import-modal";

type AddressType = 'kabupaten' | 'kecamatan' | 'desa';

export default function AddressManagement() {
  const [activeTab, setActiveTab] = useState<AddressType>('kabupaten');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [kabList, setKabList] = useState<Kabupaten[]>([]);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [selKab, setSelKab] = useState("");
  const [selKec, setSelKec] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    
    if ((activeTab === 'kecamatan' && !selKab) || (activeTab === 'desa' && !selKec)) {
      alert(`Pilih ${activeTab === 'kecamatan' ? 'Kabupaten' : 'Kecamatan'} terlebih dahulu sebagai induk data.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const parentId = activeTab === 'kecamatan' ? selKab : (activeTab === 'desa' ? selKec : undefined);
      
      const res = await fetch('/api/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, id: editingItem?.id, name: formName, parentId })
      });

      if (res.ok) {
        await loadData();
        setShowForm(false);
        setEditingItem(null);
        setFormName("");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan data");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus wilayah "${name}"? Perhatian: Data di bawahnya juga akan ikut terhapus permanen.`)) return;
    const res = await fetch(`/api/address?type=${activeTab}&id=${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
    else { const err = await res.json(); alert(err.error || "Gagal menghapus"); }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            <MapPin className="h-3 w-3" /> Data Geografis
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Manajemen Wilayah</h1>
          <p className="text-muted-foreground max-w-xl">Kelola struktur administratif dari level Kabupaten, Kecamatan, hingga Desa untuk mendukung akurasi pemetaan dan produksi.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={() => setShowImport(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-6 py-3.5 text-sm font-bold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4 rotate-180" /> Import Data
          </button>
          <button 
            onClick={() => { setEditingItem(null); setFormName(""); setShowForm(true); }}
            className="group flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
              <Plus className="h-4 w-4" />
            </div>
            <span>Tambah {activeTab}</span>
          </button>
        </div>
      </header>

      <ImportModal title={`Import Data ${activeTab}`} isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={loadData} />

      {/* TABS & FILTERS */}
      <section className="bg-card/40 backdrop-blur-md rounded-3xl p-2 lg:p-4 border shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        
        <div className="flex p-1.5 bg-muted/60 rounded-2xl w-full xl:w-auto overflow-x-auto relative">
          {[
            { id: 'kabupaten', label: 'Kabupaten', icon: Building2 },
            { id: 'kecamatan', label: 'Kecamatan', icon: MapIcon },
            { id: 'desa', label: 'Desa', icon: Home }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => { setActiveTab(t.id as AddressType); setShowForm(false); setSelKab(""); setSelKec(""); setSearchQuery(""); }}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all relative z-10 
              ${activeTab === t.id ? 'bg-background shadow-md text-primary ring-1 ring-border' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              <t.icon className={`h-4 w-4 ${activeTab === t.id ? 'text-primary' : 'opacity-70'}`} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row flex-1 w-full gap-3 xl:ml-auto xl:max-w-3xl">
          {(activeTab === 'kecamatan' || activeTab === 'desa') && (
            <div className="flex-1 min-w-[200px] relative group">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select 
                value={selKab} 
                onChange={e => { setSelKab(e.target.value); setSelKec(""); }} 
                className="w-full pl-10 pr-10 py-3 rounded-2xl border bg-background/50 text-sm font-medium outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
              >
                <option value="">Semua Kabupaten</option>
                {kabList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'desa' && (
            <div className="flex-1 min-w-[200px] relative group">
              <MapIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${!selKab ? 'opacity-30' : 'text-muted-foreground group-focus-within:text-primary'}`} />
              <select 
                value={selKec} 
                onChange={e => setSelKec(e.target.value)} 
                disabled={!selKab} 
                className="w-full pl-10 pr-10 py-3 rounded-2xl border bg-background/50 text-sm font-medium outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">Semua Kecamatan</option>
                {kecList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex-1 min-w-[200px] relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Cari wilayah..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border bg-background/50 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {editingItem ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  {editingItem ? 'Edit' : 'Tambah'} {activeTab}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Masukkan nama detail {activeTab} yang valid.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {((activeTab === 'kecamatan' && !selKab) || (activeTab === 'desa' && (!selKab || !selKec))) && !editingItem && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex gap-3 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>Anda belum memilih {activeTab === 'kecamatan' ? 'Kabupaten' : 'Kecamatan'} induk pada filter di luar. Data mungkin gagal disimpan jika induk kosong.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Nama {activeTab}</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  required 
                  autoFocus
                  placeholder={`Contoh: ${activeTab === 'kabupaten' ? 'Bandung' : activeTab === 'kecamatan' ? 'Pangalengan' : 'Margamulya'}`}
                  className="w-full rounded-2xl border bg-background/50 px-4 py-3 text-base font-medium outline-none focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 text-sm font-bold rounded-2xl border hover:bg-muted transition-all">Batal</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formName.trim()}
                  className="flex-[2] flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DATA GRID UI */}
      {!loading && filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-card/30">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tidak Ada Data</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery 
              ? `Pencarian "${searchQuery}" tidak menemukan hasil di kategori ini.` 
              : activeTab !== 'kabupaten' && (!selKab || (activeTab === 'desa' && !selKec)) 
                ? `Pilih ${activeTab === 'kecamatan' ? 'Kabupaten' : 'Kecamatan'} induk terlebih dahulu pada filter di atas.`
                : `Belum ada data ${activeTab} yang terdaftar di database.`}
          </p>
          {(!selKab || (activeTab === 'desa' && !selKec)) && !searchQuery && activeTab !== 'kabupaten' ? null : (
            <button 
              onClick={() => { setEditingItem(null); setFormName(""); setShowForm(true); }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Mulai Tambah Data
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border shadow-sm p-5 animate-pulse flex flex-col justify-between">
                <div className="h-5 w-3/4 bg-muted rounded-lg" />
                <div className="h-3 w-1/2 bg-muted rounded-lg" />
              </div>
            ))
          ) : (
            filteredData.map((item, index) => (
              <div 
                key={item.id} 
                className="group relative bg-card rounded-2xl border p-5 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  {activeTab === 'kabupaten' ? <Building2 className="h-16 w-16" /> : activeTab === 'kecamatan' ? <MapIcon className="h-16 w-16" /> : <Home className="h-16 w-16" />}
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 pr-4 text-foreground/90">{item.name}</h3>
                    <div className="flex flex-col gap-1 -mr-2 -mt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); setFormName(item.name); setShowForm(true); }}
                        className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                        className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-muted/80 shrink-0">
                      {activeTab === 'kabupaten' ? <Building2 className="h-3 w-3" /> : activeTab === 'kecamatan' ? <MapIcon className="h-3 w-3 text-amber-500" /> : <Home className="h-3 w-3 text-emerald-500" />}
                    </div>
                    {activeTab === 'kabupaten' ? (
                      <span>Data Provinsi</span>
                    ) : activeTab === 'kecamatan' ? (
                      <span className="truncate">Kab: <span className="text-foreground">{item.kabupaten?.name || '-'}</span></span>
                    ) : (
                      <span className="truncate">Kec: <span className="text-foreground">{item.kecamatan?.name || '-'}</span></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
