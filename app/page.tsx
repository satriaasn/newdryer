"use client";

import { useEffect, useState, useMemo } from "react";
import type { Production, Gapoktan, Komoditas, DashboardStats } from "@/lib/types";
import nextDynamic from "next/dynamic";
import { 
  Users, Package, Factory, TrendingUp, Wheat, MapPin, 
  Search, Calendar, Filter, ChevronDown, ChevronUp, X, LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const MapContainer = nextDynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = nextDynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = nextDynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = nextDynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

export default function PublicDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [gapoktanList, setGapoktanList] = useState<Gapoktan[]>([]);
  const [komoditasList, setKomoditasList] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [leafletReady, setLeafletReady] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  const reloadAll = () => {
    Promise.all([
      fetch('/api/dashboard', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/production', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/gapoktan', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/komoditas', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([s, p, g, k]) => {
      setStats(s);
      setProductions(Array.isArray(p) ? p : []);
      setGapoktanList(Array.isArray(g) ? g : []);
      setKomoditasList(Array.isArray(k) ? k : []);
      setLastUpdated(new Date().toLocaleTimeString());
    }).finally(() => setLoading(false));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  // Filters
  const [filterGapoktan, setFilterGapoktan] = useState('');
  const [filterKomoditas, setFilterKomoditas] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    reloadAll();
    const interval = setInterval(reloadAll, 60000);

    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        setCustomIcon(L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        }));
        setLeafletReady(true);
      });
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
    }
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return productions.filter(p => {
      if (filterGapoktan && p.gapoktan_id !== filterGapoktan) return false;
      if (filterKomoditas && p.komoditas_id !== filterKomoditas) return false;
      if (filterDate && p.production_date !== filterDate) return false;
      if (filterLokasi) {
        const loc = `${p.gapoktan?.desa?.name} ${p.gapoktan?.desa?.kecamatan?.name} ${p.gapoktan?.desa?.kecamatan?.kabupaten?.name}`.toLowerCase();
        if (!loc.includes(filterLokasi.toLowerCase())) return false;
      }
      return true;
    });
  }, [productions, filterGapoktan, filterKomoditas, filterDate, filterLokasi]);

  const perKomoditas = useMemo(() => {
    const map: Record<string, { name: string; total: number; totalToday: number }> = {};
    productions.forEach(p => {
      const name = p.komoditas?.name || 'Unknown';
      if (!map[name]) map[name] = { name, total: 0, totalToday: 0 };
      map[name].total += Number(p.qty_after);
      if (p.production_date === today) map[name].totalToday += Number(p.qty_after);
    });
    return Object.values(map);
  }, [productions, today]);

  const gapoktanWithCoords = useMemo(() => gapoktanList.filter(g => g.latitude && g.longitude), [gapoktanList]);

  const clearFilters = () => { setFilterGapoktan(''); setFilterKomoditas(''); setFilterDate(''); setFilterLokasi(''); };
  const hasFilters = !!(filterGapoktan || filterKomoditas || filterDate || filterLokasi);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-center space-y-4">
        <Factory className="h-12 w-12 mx-auto text-primary" />
        <p className="text-lg font-medium">Memuat data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AgroDryer</h1>
              <p className="text-xs text-muted-foreground">Sistem Monitoring Pengeringan Komoditas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live</span>
              <span className="text-[10px] opacity-70 ml-1">Update: {lastUpdated}</span>
            </div>
            <a href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              Admin Panel
            </a>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5 group"
              title="Keluar"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPI icon={Users} color="text-blue-500" title="Total Gapoktan" value={stats.totalGapoktan} />
            <KPI icon={Factory} color="text-emerald-500" title="Unit Dryer" value={stats.totalDryers} />
            <KPI icon={Package} color="text-orange-500" title="Total Produksi" value={stats.totalProductions} />
            <KPI icon={TrendingUp} color="text-primary" title="Avg Kenaikan Harga" value={`+${stats.avgPriceDiffPct}%`} />
          </div>
        )}

        <section>
          <h2 className="text-lg font-bold mb-4">Produksi Per Komoditas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {perKomoditas.map(k => (
              <div key={k.name} className="rounded-2xl border bg-card/60 p-4 hover:shadow-lg hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2"><Wheat className="h-4 w-4 text-primary" /><span className="text-sm font-bold">{k.name}</span></div>
                <p className="text-2xl font-bold">{k.total.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">kg</span></p>
                <p className="text-xs text-muted-foreground mt-1">Hari ini: <span className="text-foreground font-semibold">{k.totalToday.toLocaleString()} kg</span></p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-primary transition-colors">
            <Filter className="h-4 w-4" /> Filter Data
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </button>
          {showFilters && (
            <div className="rounded-2xl border bg-card/60 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Lokasi</label>
                <input type="text" placeholder="Cari kab/kec/desa..." value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gapoktan</label>
                <select value={filterGapoktan} onChange={e => setFilterGapoktan(e.target.value)} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
                  <option value="">Semua</option>
                  {gapoktanList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Komoditas</label>
                <select value={filterKomoditas} onChange={e => setFilterKomoditas(e.target.value)} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm">
                  <option value="">Semua</option>
                  {komoditasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tanggal Produksi</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full mt-1 rounded-xl border bg-background px-3 py-2 text-sm" />
              </div>
              {hasFilters && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 col-span-full"><X className="h-3 w-3" /> Reset Filter</button>}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Peta Lokasi Gapoktan</h2>
          <div className="rounded-2xl border bg-card/60 overflow-hidden" style={{ height: '450px' }}>
            {!leafletReady ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><MapPin className="h-6 w-6 animate-pulse" /></div>
            ) : (
              <MapContainer center={[-7.0, 107.4]} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {gapoktanWithCoords.map(g => (
                  <Marker key={g.id} position={[g.latitude!, g.longitude!]} icon={customIcon}>
                    <Popup>
                      <div className="min-w-[220px] space-y-1">
                        <h3 className="font-bold text-sm">{g.name}</h3>
                        <p className="text-xs text-gray-500">{g.desa?.name}, {g.desa?.kecamatan?.name}, {g.desa?.kecamatan?.kabupaten?.name}</p>
                        {g.ketua && <p className="text-xs"><b>Ketua:</b> {g.ketua}</p>}
                        {g.phone && <p className="text-xs"><b>Telp:</b> {g.phone}</p>}
                        {g.dryer_units && <p className="text-xs"><b>Dryer:</b> {g.dryer_units.length} unit</p>}
                        {g.komoditas && g.komoditas.length > 0 && <p className="text-xs"><b>Komoditas:</b> {g.komoditas.map(k => k.name).join(', ')}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Detail Produksi</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} data{hasFilters ? ' (terfilter)' : ''}</span>
          </div>
          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Gapoktan</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Komoditas</th>
                    <th className="px-4 py-3">Dryer</th>
                    <th className="px-4 py-3 text-right">Qty Sebelum</th>
                    <th className="px-4 py-3 text-right">Harga Sebelum</th>
                    <th className="px-4 py-3 text-right">Qty Sesudah</th>
                    <th className="px-4 py-3 text-right">Harga Sesudah</th>
                    <th className="px-4 py-3 text-right">Δ Qty</th>
                    <th className="px-4 py-3 text-right">Δ Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">{hasFilters ? 'Tidak ada data sesuai filter' : 'Belum ada data'}</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="text-sm hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{p.production_date}</td>
                      <td className="px-4 py-3 font-medium">{p.gapoktan?.name || '-'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.gapoktan?.desa?.name}, {p.gapoktan?.desa?.kecamatan?.name}</td>
                      <td className="px-4 py-3">{p.komoditas?.name || '-'}</td>
                      <td className="px-4 py-3">{p.dryer_units?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(p.qty_before).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_before).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(p.qty_after).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">Rp {Number(p.price_after).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(p.qty_diff_pct) < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{p.qty_diff_pct}%</span></td>
                      <td className="px-4 py-3 text-right"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(p.price_diff_pct) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>+{p.price_diff_pct}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-8 border-t flex flex-col items-center gap-2">
          <p>© 2026 AgroDryer — Sistem Monitoring Pengeringan Komoditas Pertanian</p>
          <a href="/signin" className="hover:text-primary transition-colors">Panel Admin</a>
        </footer>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, color, title, value }: { icon: any; color: string; title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card/60 p-5 hover:shadow-xl hover:border-primary/20 transition-all">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Icon className={`h-5 w-5 ${color}`} /></div>
        <div><p className="text-xs text-muted-foreground">{title}</p><p className="text-2xl font-bold tracking-tight">{value}</p></div>
      </div>
    </div>
  );
}
