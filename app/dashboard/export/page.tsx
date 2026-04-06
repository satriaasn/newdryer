"use client";

import { useState } from "react";
import { Download, Factory, Users, ClipboardList, Wheat } from "lucide-react";
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

  const exportOptions: ExportCardProps[] = [
    { title: "Data Gapoktan", description: "Ekspor seluruh data Gabungan Kelompok Tani.", icon: Users, tableName: "gapoktan" },
    { title: "Data Mesin Dryer", description: "Ekspor seluruh mesin (unit dryer) yang terdaftar.", icon: Factory, tableName: "dryer_units" },
    { title: "Data Produksi", description: "Ekspor seluruh riwayat data produksi panen harian.", icon: ClipboardList, tableName: "productions" },
    { title: "Data Komoditas", description: "Ekspor referensi data komoditas padi/jagung.", icon: Wheat, tableName: "komoditas" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto pb-24 lg:pb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-2">Unduh data ke dalam format CSV untuk dilaporkan ke Microsoft Excel atau diolah lebih lanjut.</p>
      </div>

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
  );
}
