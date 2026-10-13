"use client";

import { useEffect, useState } from "react";
import type { Komoditas } from "@/lib/types";
import { Plus, Loader2, Wheat, Edit, Trash2, X, Download, Target, Coins } from "lucide-react";
import { ImportModal } from "@/components/dashboard/import-modal";
import { getDefaultCostRates } from "@/lib/cost-calculator";

export default function KomoditasAdmin() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [costOperational, setCostOperational] = useState('75');
  const [costLabor, setCostLabor] = useState('100');
  const [costManagement, setCostManagement] = useState('100');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // States for Target Period Modal
  const [targetModalKomoditas, setTargetModalKomoditas] = useState<Komoditas | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periodTargetQty, setPeriodTargetQty] = useState('');
  const [periodTargets, setPeriodTargets] = useState<any[]>([]);
  const [loadingPeriodTargets, setLoadingPeriodTargets] = useState(false);
  const [savingPeriodTarget, setSavingPeriodTarget] = useState(false);

  const reload = () => {
    fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()).then(d => setKomoditas(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  // Update default costs when typing new name if not in edit mode
  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!editingId) {
      const def = getDefaultCostRates(null, val);
      setCostOperational(def.cost_operational.toString());
      setCostLabor(def.cost_labor.toString());
      setCostManagement(def.cost_management.toString());
    }
  };

  // Fetch period targets when modal opens
  const loadPeriodTargets = (komoditasId: string) => {
    setLoadingPeriodTargets(true);
    fetch(`/api/komoditas/targets?komoditas_id=${komoditasId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setPeriodTargets(Array.isArray(d) ? d : []))
      .finally(() => setLoadingPeriodTargets(false));
  };

  useEffect(() => {
    if (targetModalKomoditas) {
      loadPeriodTargets(targetModalKomoditas.id);
      setSelectedPeriod(new Date().toISOString().slice(0, 7)); // default current month "YYYY-MM"
      setPeriodTargetQty('');
    }
  }, [targetModalKomoditas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const url = '/api/komoditas';
      const method = editingId ? 'PATCH' : 'POST';
      const payload: any = {
        name: newName.trim(),
        target_monthly: parseFloat(newTarget) || 0,
        cost_operational: parseFloat(costOperational) || 0,
        cost_labor: parseFloat(costLabor) || 0,
        cost_management: parseFloat(costManagement) || 0,
      };
      if (editingId) payload.id = editingId;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        resetForm();
        reload(); 
      }
      else { const err = await res.json(); alert(err.error); }
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setNewName(''); 
    setNewTarget('');
    setCostOperational('75');
    setCostLabor('100');
    setCostManagement('100');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (k: Komoditas) => {
    const rates = getDefaultCostRates(k);
    setEditingId(k.id);
    setNewName(k.name);
    setNewTarget(k.target_monthly?.toString() || '0');
    setCostOperational(rates.cost_operational.toString());
    setCostLabor(rates.cost_labor.toString());
    setCostManagement(rates.cost_management.toString());
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus komoditas "${name}"?`)) return;
    try {
      const res = await fetch(`/api/komoditas?id=${id}`, { method: 'DELETE' });
      if (res.ok) reload();
      else { const err = await res.json(); alert(err.error); }
    } catch (e: any) { alert(e.message); }
  };

  const handleSavePeriodTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModalKomoditas || !selectedPeriod || !periodTargetQty) return;
    setSavingPeriodTarget(true);
    try {
      const res = await fetch('/api/komoditas/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          komoditas_id: targetModalKomoditas.id,
          period: selectedPeriod,
          target_ton: parseFloat(periodTargetQty) || 0
        })
      });
      if (res.ok) {
        setPeriodTargetQty('');
        loadPeriodTargets(targetModalKomoditas.id);
        reload();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } finally {
      setSavingPeriodTarget(false);
    }
  };

  const handleDeletePeriodTarget = async (id: string) => {
    if (!confirm('Hapus target untuk periode ini?')) return;
    try {
      const res = await fetch(`/api/komoditas/targets?id=${id}`, { method: 'DELETE' });
      if (res.ok && targetModalKomoditas) {
        loadPeriodTargets(targetModalKomoditas.id);
        reload();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Komoditas & Biaya Nilai Tambah</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Master data komoditas dan tarif komponen biaya pengeringan</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowImport(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4 rotate-180" /> Import Data
          </button>
          <button 
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Tambah Komoditas
          </button>
        </div>
      </header>

      <ImportModal title="Import Data Komoditas" isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={reload} />

      {(showForm || editingId) && (
        <form onSubmit={handleSubmit} className="bg-card/60 p-5 rounded-2xl border space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              {editingId ? 'Edit Komoditas & Komponen Biaya' : 'Tambah Komoditas & Tarif Biaya Baru'}
            </h3>
            <button type="button" onClick={resetForm} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Nama Komoditas</label>
              <input type="text" value={newName} onChange={e => handleNameChange(e.target.value)} required placeholder="Contoh: Singkong, Jagung, Padi..."
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Target Bulanan (Ton)</label>
              <input type="number" step="any" value={newTarget} onChange={e => setNewTarget(e.target.value)} required placeholder="0"
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Biaya Operasional (Rp/kg)</label>
              <input type="number" step="any" value={costOperational} onChange={e => setCostOperational(e.target.value)} required placeholder="75"
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all font-mono" />
              <span className="text-[10px] text-muted-foreground">Singkong: 100 | Jagung/Padi: 75</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tenaga Kerja (Rp/kg)</label>
              <input type="number" step="any" value={costLabor} onChange={e => setCostLabor(e.target.value)} required placeholder="100"
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all font-mono" />
              <span className="text-[10px] text-muted-foreground">Standar: 100/kg</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div>
              <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Kas Pengelola (Rp/kg)</label>
              <input type="number" step="any" value={costManagement} onChange={e => setCostManagement(e.target.value)} required placeholder="100"
                className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 ring-primary/20 transition-all font-mono" />
              <span className="text-[10px] text-muted-foreground">Standar: 100/kg</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border text-xs">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Biaya Komponen</span>
              <span className="font-mono font-bold text-sm text-foreground">
                Rp {((parseFloat(costOperational) || 0) + (parseFloat(costLabor) || 0) + (parseFloat(costManagement) || 0)).toLocaleString()} / kg
              </span>
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-all">
                Batal
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />} 
                {editingId ? 'Simpan Perubahan' : 'Tambah Komoditas'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {loading ? [1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-2xl border animate-pulse bg-card/60" />) :
        komoditas.map(k => {
          const rates = getDefaultCostRates(k);
          const totalCost = rates.cost_operational + rates.cost_labor + rates.cost_management;
          return (
            <div key={k.id} className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${editingId === k.id ? 'ring-2 ring-primary border-transparent bg-card' : 'bg-card/60 hover:shadow-lg hover:border-primary/20'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${editingId === k.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <Wheat className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{k.name}</h3>
                    <p className="text-xs text-muted-foreground">Target: {Number(k.target_monthly || 0).toLocaleString()} Ton/bln</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setTargetModalKomoditas(k)}
                    className="p-1.5 transition-all rounded-lg text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                    title="Target Bulanan Historis"
                  >
                    <Target className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleEdit(k)} className="p-1.5 transition-all rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Ubah Tarif Biaya">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(k.id, k.name)} className="p-1.5 transition-all rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500" title="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Rincian Komponen Biaya */}
              <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs border border-border/50">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border/40 font-semibold">
                  <span>Komponen Nilai Tambah</span>
                  <span className="text-foreground font-mono font-bold">Total: Rp {totalCost.toLocaleString()} / kg</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operasional
                  </span>
                  <span className="font-mono font-medium text-foreground">Rp {rates.cost_operational.toLocaleString()} / kg</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Tenaga Kerja
                  </span>
                  <span className="font-mono font-medium text-foreground">Rp {rates.cost_labor.toLocaleString()} / kg</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Kas Pengelola
                  </span>
                  <span className="font-mono font-medium text-foreground">Rp {rates.cost_management.toLocaleString()} / kg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TARGET PERIOD MODAL */}
      {targetModalKomoditas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <header className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Target Bulanan
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Komoditas: {targetModalKomoditas.name}</p>
              </div>
              <button 
                onClick={() => setTargetModalKomoditas(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Form Input Target Baru */}
              <form onSubmit={handleSavePeriodTarget} className="space-y-4 bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/20">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Set Target Baru</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Periode Bulan</label>
                    <input 
                      type="month" 
                      value={selectedPeriod} 
                      onChange={e => setSelectedPeriod(e.target.value)} 
                      required 
                      className="w-full mt-1 rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 ring-primary/20 transition-all text-foreground" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target (Ton)</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={periodTargetQty} 
                      onChange={e => setPeriodTargetQty(e.target.value)} 
                      required 
                      placeholder="e.g. 1000"
                      className="w-full mt-1 rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 ring-primary/20 transition-all" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={savingPeriodTarget}
                  className="w-full h-8 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPeriodTarget ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Simpan Target Periode
                </button>
              </form>

              {/* Daftar Target Historis */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daftar Target Historis</h4>
                {loadingPeriodTargets ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : periodTargets.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    Belum ada target periode khusus yang diset.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {periodTargets.map((t: any) => {
                      const [year, month] = t.period.split('-');
                      const formattedDate = new Date(Number(year), Number(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                      return (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-background border rounded-xl hover:shadow-sm transition-all">
                          <div>
                            <span className="text-xs font-bold text-foreground">{formattedDate}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Kode: {t.period}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{t.target_ton} Ton</span>
                            <button 
                              onClick={() => handleDeletePeriodTarget(t.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <footer className="px-6 py-3 border-t bg-muted/10 flex justify-end">
              <button 
                onClick={() => setTargetModalKomoditas(null)}
                className="px-4 py-1.5 border rounded-lg text-xs font-semibold hover:bg-muted active:scale-95 transition-all"
              >
                Tutup
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
