"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Package, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams: { redirectedFrom?: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Get the redirect URL from props
      const redirectPath = searchParams.redirectedFrom || '/dashboard';
      router.push(redirectPath);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative">
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4 transition-transform hover:scale-110">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Operator Login</h1>
            <p className="text-slate-400 text-sm text-center">Masuk ke Panel Kontrol AgroDryer</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="operator@agrodryer.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link 
              href="/" 
              className="text-slate-400 hover:text-white text-sm flex items-center justify-center transition-all"
            >
              ← Kembali ke Dashboard Publik
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs">
          © 2026 AgroDryer Industrial Monitoring. All rights reserved.
        </p>
      </div>
    </div>
  );
}
