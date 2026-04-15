"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { type Profile, type UserRole } from "@/services/user.service";
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Shield, 
  Save, 
  X, 
  Download, 
  MoreVertical,
  Key,
  Trash2,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["admin", "operator", "viewer", "gapoktan", "administrator", "superadmin"];

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'operator' as UserRole,
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ email: '', full_name: '', role: 'operator', password: '' });
    setModalMode('add');
    setFeedback(null);
  };

  const handleOpenEdit = (p: Profile) => {
    setSelectedProfile(p);
    setFormData({ email: '', full_name: p.full_name || '', role: p.role, password: '' });
    setModalMode('edit');
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const url = '/api/admin/users';
      const method = modalMode === 'add' ? 'POST' : 'PATCH';
      const body = modalMode === 'add' 
        ? formData 
        : { id: selectedProfile?.id, full_name: formData.full_name, role: formData.role, password: formData.password || undefined };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

      setFeedback({ type: 'success', text: `User berhasil ${modalMode === 'add' ? 'dibuat' : 'diperbarui'}!` });
      setTimeout(() => {
        setModalMode(null);
        loadProfiles();
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${selectedProfile.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus user');
      
      setModalMode(null);
      loadProfiles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <ShieldCheck className="h-8 w-8 text-primary" /> Pengaturan User
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Kelola manajemen hak akses dan kredensial pengguna sistem</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleOpenAdd}
             className="flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-6 py-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
           >
             <UserPlus className="h-4 w-4" /> Tambah User
           </button>
        </div>
      </header>

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden border-t-4 border-t-primary">
        <div className="p-6 border-b bg-muted/20">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Cari user berdasarkan nama atau ID..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-8 py-5">Identitas Pengguna</th>
                <th className="px-8 py-5">Role / Akses</th>
                <th className="px-8 py-5">Dibuat Pada</th>
                <th className="px-8 py-5 text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground">
                   <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <span className="font-bold text-xs uppercase tracking-widest">Sinkronisasi Database...</span>
                   </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic">Tidak ada user ditemukan</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="text-sm hover:bg-muted/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 p-[2px] shadow-lg group-hover:rotate-6 transition-transform">
                         <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-primary font-black text-lg">
                           {p.full_name?.charAt(0) || 'U'}
                         </div>
                      </div>
                      <div>
                        <div className="font-black text-foreground text-base">{p.full_name || "Tanpa Nama"}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase opacity-70 leading-none mt-1">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">
                      <Shield className="h-3 w-3" /> {p.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-muted-foreground font-medium text-xs">
                     {new Date(p.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleOpenEdit(p)}
                         className="p-2.5 rounded-xl bg-muted text-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                         title="Edit User & Password"
                       >
                         <Key className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => { setSelectedProfile(p); setModalMode('delete'); }}
                         className="p-2.5 rounded-xl bg-muted text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                         title="Hapus User"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setModalMode(null)} />
           <div className="bg-card w-full max-w-lg rounded-[32px] border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border-t-8 border-t-primary">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black tracking-tight">{modalMode === 'add' ? 'Tambah User Baru' : 'Edit User & Reset Password'}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Konfigurasi Hak Akses & Kredensial</p>
                 </div>
                 <button onClick={() => setModalMode(null)} className="p-3 bg-muted rounded-full hover:rotate-90 transition-all duration-300">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                 {modalMode === 'add' && (
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Alamat Email</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                           required
                           type="email"
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           placeholder="user@example.com"
                           className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                        />
                     </div>
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Lengkap</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <input 
                          required
                          type="text"
                          value={formData.full_name}
                          onChange={e => setFormData({...formData, full_name: e.target.value})}
                          placeholder="Budi Santoso"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role / Akses</label>
                       <select 
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          className="w-full px-4 py-4 rounded-2xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm uppercase"
                       >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                          {modalMode === 'add' ? 'Password' : 'Password Baru (Opsional)'}
                       </label>
                       <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input 
                             required={modalMode === 'add'}
                             type="password"
                             value={formData.password}
                             onChange={e => setFormData({...formData, password: e.target.value})}
                             placeholder={modalMode === 'add' ? "••••••••" : "Isi jika ingin reset"}
                             className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                          />
                       </div>
                    </div>
                 </div>

                 {feedback && (
                   <div className={cn(
                     "p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2",
                     feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                   )}>
                     {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                     <span className="text-xs font-bold">{feedback.text}</span>
                   </div>
                 )}

                 <div className="pt-4 flex items-center gap-3">
                    <button 
                       type="button"
                       onClick={() => setModalMode(null)}
                       className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-2xl transition-all"
                    >
                       Batal
                    </button>
                    <button 
                       type="submit"
                       disabled={submitting}
                       className="flex-[2] py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                       {modalMode === 'add' ? 'Simpan User' : 'Update & Reset'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalMode === 'delete' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setModalMode(null)} />
           <div className="bg-card w-full max-w-sm rounded-[32px] border shadow-2xl relative z-10 p-8 text-center animate-in zoom-in-95 duration-300 border-t-8 border-t-rose-500">
              <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black mb-2">Hapus User?</h3>
              <p className="text-sm text-muted-foreground font-medium mb-8">
                 Tindakan ini permanen. Akun <span className="font-bold text-foreground">"{selectedProfile?.full_name}"</span> akan dihapus dari sistem.
              </p>
              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setModalMode(null)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-2xl transition-all"
                 >
                    Batal
                 </button>
                 <button 
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                 >
                    {submitting ? 'Menghapus...' : 'Ya, Hapus'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
