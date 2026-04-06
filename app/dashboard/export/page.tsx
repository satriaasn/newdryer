"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, Wheat, Factory, Users, ClipboardList } from "lucide-react";
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground mt-2">Unduh data ke dalam format CSV untuk dilaporkan ke Microsoft Excel atau diolah lebih lanjut.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {exportOptions.map((opt) => (
          <Card key={opt.tableName} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <opt.icon className="h-5 w-5 text-primary" />
                </div>
                {opt.title}
              </CardTitle>
              <CardDescription>{opt.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <button
                onClick={() => handleExport(opt.tableName)}
                disabled={loadingTable === opt.tableName}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-colors border"
              >
                {loadingTable === opt.tableName ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin"></span>
                    Menyiapkan Data...
                  </span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Unduh CSV
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
