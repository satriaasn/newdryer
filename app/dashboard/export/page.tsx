"use client";

import { useState } from "react";
import { Download, Factory, Users, ClipboardList, Wheat, Database, Loader2, CheckCircle2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { exportToCSV } from "@/lib/export-utils";

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  tableName: string;
}

export default function ExportDataPage() {
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [exportingSQL, setExportingSQL] = useState(false);
  const [sqlDone, setSqlDone] = useState(false);
  const supabase = createClientComponentClient();

  const handleExport = async (tableName: string) => {
    setLoadingTable(tableName);
    try {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;
      
      const dateStr = new Date().toISOString().split('T')[0];
      exportToCSV({
        data: data || [],
        filename: `${tableName}_export_${dateStr}`
      });
    } catch (error: any) {
      alert("Gagal mengunduh data: " + error.message);
    } finally {
      setLoadingTable(null);
    }
  };

  const handleExportAllSQL = async () => {
    setExportingSQL(true);
    setSqlDone(false);
    try {
      const tables = ['gapoktan', 'dryer_units', 'production', 'komoditas', 'profiles', 'whatsapp_settings', 'app_settings'];
      const allResults: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (!error && data) {
          allResults[table] = data;
        }
      }

      const esc = (v: any): string => {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'number') return String(v);
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        return `'${String(v).replace(/'/g, "''")}'`;
      };

      let sql = `-- =============================================\n`;
      sql += `-- FULL DATABASE BACKUP\n`;
      sql += `-- Generated: ${new Date().toISOString()}\n`;
      sql += `-- Dashboard Monitoring Hibah Dryer\n`;
      sql += `-- =============================================\n\n`;

      for (const [table, rows] of Object.entries(allResults)) {
        if (rows.length === 0) {
          sql += `-- Table: ${table} (0 rows)\n\n`;
          continue;
        }

        const columns = Object.keys(rows[0]);
        sql += `-- =============================================\n`;
        sql += `-- Table: ${table} (${rows.length} rows)\n`;
        sql += `-- =============================================\n`;

        for (const row of rows) {
          const vals = columns.map(c => esc(row[c])).join(', ');
          sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${vals}) ON CONFLICT (id) DO UPDATE SET ${columns.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ')};\n`;
        }
        sql += `\n`;
      }

      const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full_backup_${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      setSqlDone(true);
      setTimeout(() => setSqlDone(false), 3000);
    } catch (error: any) {
      alert("Gagal membuat backup SQL: " + error.message);
    } finally {
      setExportingSQL(false);
    }
  };

  const exportOptions: ExportCardProps[] = [
    { title: "Data Gapoktan", description: "Ekspor seluruh data Gabungan Kelompok Tani.", icon: Users, tableName: "gapoktan" },
    { title: "Data Mesin Dryer", description: "Ekspor seluruh mesin (unit dryer) yang terdaftar.", icon: Factory, tableName: "dryer_units" },
    { title: "Data Produksi", description: "Ekspor seluruh riwayat data produksi panen harian.", icon: ClipboardList, tableName: "production" },
    { title: "Data Komoditas", description: "Ekspor referensi data komoditas padi/jagung.", icon: Wheat, tableName: "komoditas" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto pb-24 lg:pb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-2">Unduh data ke dalam format CSV atau backup keseluruhan database dalam format SQL.</p>
      </div>

      {/* SQL Full Backup Card */}
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-16 w-16 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-black tracking-tight">Backup Keseluruhan Database (SQL)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unduh seluruh data dari semua tabel (Gapoktan, Dryer, Produksi, Komoditas, Profil, Pengaturan) sebagai file <code className="px-1 py-0.5 bg-muted rounded text-xs font-bold">.sql</code> untuk keperluan backup dan restore.
          </p>
        </div>
        <button
          onClick={handleExportAllSQL}
          disabled={exportingSQL}
          className="shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all text-sm"
        >
          {exportingSQL ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Membuat Backup...</>
          ) : sqlDone ? (
            <><CheckCircle2 className="h-4 w-4" /> Berhasil!</>
          ) : (
            <><Database className="h-4 w-4" /> Backup SQL</>
          )}
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Atau Export Per Tabel (CSV)</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {exportOptions.map((opt) => (
            <div key={opt.tableName} className="flex flex-col rounded-2xl border bg-card/60 p-6 hover:shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <opt.icon className="h-16 w-16 text-primary" />
              </div>
              
              <div className="relative space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <opt.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{opt.title}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground flex-1">{opt.description}</p>
                
                <button
                  onClick={() => handleExport(opt.tableName)}
                  disabled={loadingTable === opt.tableName}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  {loadingTable === opt.tableName ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin"></span>
                      Menyiapkan...
                    </span>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Unduh CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
