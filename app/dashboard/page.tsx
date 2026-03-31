import { Sidebar } from "@/components/dashboard/sidebar";
import { KPICardsSection } from "@/components/dashboard/kpi-cards";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { 
  Bell, 
  Search, 
  Calendar,
  Filter,
  Download,
  Plus
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-muted/20">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/50 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari unit pengering, batch, atau log..."
                className="w-full rounded-xl border bg-muted/40 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-background hover:bg-muted transition-all duration-300">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
            </button>
            <div className="h-4 w-px bg-border" />
            <button className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" />
              Batch Baru
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Ikhtisar Pemantauan</h1>
                <p className="text-muted-foreground">Selamat datang kembali. Semua sistem beroperasi dalam parameter normal.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-all">
                  <Calendar className="h-4 w-4" />
                  Hari Ini
                </button>
                <button className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-all">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-all">
                  <Download className="h-4 w-4" />
                  Ekspor Data
                </button>
              </div>
            </div>
          </header>

          <KPICardsSection />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProductionChart />
            </div>
            
            {/* Live Status Table Mini-version or Sidebar Widget */}
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Unit Aktif</h3>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">4 Online</span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-sm font-semibold">Dryer Unit 0{i}</p>
                        <p className="text-xs text-muted-foreground">Batch #B-2024-00{i}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">68.2°C</p>
                      <p className="text-xs text-muted-foreground">12.4% MC</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full rounded-xl border border-dashed py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
                Lihat Semua Unit
              </button>
            </div>
          </div>

          {/* Alert Table / History Section */}
          <div className="rounded-2xl border bg-card/60 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">Log Produksi Terbaru</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">Suhu</th>
                    <th className="px-6 py-4">Kelembaban</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="text-sm hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">2024-03-30 14:{40-i}:00</td>
                      <td className="px-6 py-4 font-medium">Pengering 01</td>
                      <td className="px-6 py-4 text-primary">#B-2024-001</td>
                      <td className="px-6 py-4 font-mono font-medium">72.{i}°C</td>
                      <td className="px-6 py-4 font-mono font-medium">14.2%</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                          Normal
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
