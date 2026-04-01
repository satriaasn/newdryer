"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { userService, type Profile, type UserRole } from "@/services/user.service";
import { ShieldCheck, UserPlus, Search, Shield, Save, X } from "lucide-react";

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("viewer");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await userService.getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id: string) => {
    try {
      await userService.updateProfile(id, { role: editRole });
      setEditingId(null);
      loadProfiles();
    } catch (err) {
      alert("Gagal memperbarui role: " + (err as any).message);
    }
  };

  const filtered = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const roles: UserRole[] = ["admin", "operator", "viewer", "gapoktan", "administrator", "superadmin"];

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pengaturan User</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Kelola hak akses dan peran pengguna sistem</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">ID / Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Terdaftar</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Memuat data user...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Tidak ada user ditemukan</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="text-sm hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary/20 to-blue-400/20 flex items-center justify-center text-primary font-bold text-xs">
                            {p.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-foreground">{p.full_name || "Tanpa Nama"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.id}</td>
                      <td className="px-6 py-4">
                        {editingId === p.id ? (
                          <select 
                            value={editRole} 
                            onChange={e => setEditRole(e.target.value as UserRole)}
                            className="rounded-lg border bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary"
                          >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                            <Shield className="h-3 w-3" /> {p.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4 text-right">
                        {editingId === p.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdateRole(p.id)} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                              <Save className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingId(p.id); setEditRole(p.role); }}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Edit Role
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
