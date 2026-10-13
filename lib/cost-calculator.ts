import type { Komoditas } from "./types";

export interface CostRates {
  cost_operational: number;
  cost_labor: number;
  cost_management: number;
}

export interface ProductionCostAnalysis {
  qty_before_kg: number;
  qty_after_kg: number;
  cost_operational_rate: number;
  cost_labor_rate: number;
  cost_management_rate: number;
  total_cost_rate: number; // per kg
  total_cost_operational: number;
  total_cost_labor: number;
  total_cost_management: number;
  total_cost: number;
  raw_material_value_before: number;
  product_value_after: number;
  gross_value_diff: number; // Nilai selisih dari basah ke kering (Total Rp)
  gross_value_diff_per_kg: number; // Nilai selisih dibagi tonase basah (Rp/kg)
  commodity_value_added_per_kg: number; // Nilai tambah komoditas per kg = (gross_diff / qty_before) - cost_operational_rate
  business_value_added: number; // Nilai tambah sisa untuk unit usaha = commodity_value_added_per_kg * qty_before
  net_value_added: number; // Keuntungan bersih akhir setelah dikurangi upah naker & kas pengelola
  net_value_added_per_kg: number; // Keuntungan bersih per kg
  price_diff_per_kg: number;
  net_price_spread_per_kg: number;
}

/**
 * Mendapatkan tarif biaya default berdasarkan nama komoditas atau data master komoditas.
 * - Singkong: Operasional = 100, Tenaga Kerja = 100, Kas Pengelola = 100
 * - Jagung: Operasional = 75, Tenaga Kerja = 100, Kas Pengelola = 100
 * - Padi / Gabah: Operasional = 75, Tenaga Kerja = 100, Kas Pengelola = 100
 * - Default: Operasional = 75, Tenaga Kerja = 100, Kas Pengelola = 100
 */
export function getDefaultCostRates(commodity?: Partial<Komoditas> | null, commodityName?: string): CostRates {
  if (commodity) {
    const hasCustomOps = typeof commodity.cost_operational === 'number' && !isNaN(commodity.cost_operational);
    const hasCustomLabor = typeof commodity.cost_labor === 'number' && !isNaN(commodity.cost_labor);
    const hasCustomMgmt = typeof commodity.cost_management === 'number' && !isNaN(commodity.cost_management);

    if (hasCustomOps || hasCustomLabor || hasCustomMgmt) {
      return {
        cost_operational: hasCustomOps ? Number(commodity.cost_operational) : 75,
        cost_labor: hasCustomLabor ? Number(commodity.cost_labor) : 100,
        cost_management: hasCustomMgmt ? Number(commodity.cost_management) : 100,
      };
    }
  }

  const name = (commodityName || commodity?.name || '').toLowerCase();

  if (name.includes('singkong')) {
    return {
      cost_operational: 100,
      cost_labor: 100,
      cost_management: 100,
    };
  }

  if (name.includes('jagung') || name.includes('padi') || name.includes('gabah')) {
    return {
      cost_operational: 75,
      cost_labor: 100,
      cost_management: 100,
    };
  }

  return {
    cost_operational: 75,
    cost_labor: 100,
    cost_management: 100,
  };
}

/**
 * Menghitung rincian biaya produksi dan nilai tambah berdasarkan formula:
 * 1. Nilai Selisih = Nilai Kering - Nilai Basah
 * 2. Nilai Tambah Komoditas per kg = (Nilai Selisih / Tonase Basah) - Biaya Operasional/kg
 * 3. Nilai Tambah Sisa Unit Usaha = Nilai Tambah Komoditas per kg * Tonase Basah (awal)
 * 4. Alokasi Tenaga Kerja (Rp 100/kg) & Kas Pengelola (Rp 100/kg)
 * 5. Laba Bersih Akhir = Nilai Tambah Sisa Unit Usaha - (Tenaga Kerja + Kas Pengelola)
 */
export function calculateProductionCostAndValueAdded(params: {
  qty_before_ton: number;
  price_before_kg: number;
  qty_after_ton: number;
  price_after_kg: number;
  operational_rate?: number;
  labor_rate?: number;
  management_rate?: number;
}): ProductionCostAnalysis {
  const qty_before_kg = (params.qty_before_ton || 0) * 1000;
  const qty_after_kg = (params.qty_after_ton || 0) * 1000;
  const price_before_kg = params.price_before_kg || 0;
  const price_after_kg = params.price_after_kg || 0;

  const cost_operational_rate = typeof params.operational_rate === 'number' ? params.operational_rate : 75;
  const cost_labor_rate = typeof params.labor_rate === 'number' ? params.labor_rate : 100;
  const cost_management_rate = typeof params.management_rate === 'number' ? params.management_rate : 100;

  const total_cost_rate = cost_operational_rate + cost_labor_rate + cost_management_rate;

  // Nilai bahan baku basah & hasil kering
  const raw_material_value_before = Math.round(qty_before_kg * price_before_kg);
  const product_value_after = Math.round(qty_after_kg * price_after_kg);

  // 1. Nilai selisih dari basah ke kering (Total Rp)
  const gross_value_diff = product_value_after - raw_material_value_before;

  // 2. Nilai selisih per kg tonase basah
  const gross_value_diff_per_kg = qty_before_kg > 0 ? Math.round((gross_value_diff / qty_before_kg) * 100) / 100 : 0;

  // 3. Nilai tambah komoditas per kg (dikurangi biaya operasional/kg)
  const commodity_value_added_per_kg = Math.round((gross_value_diff_per_kg - cost_operational_rate) * 100) / 100;

  // 4. Nilai tambah sisa untuk unit usaha (keuntungan bersih selisih setelah dikurangi biaya operational * tonase basah awal)
  const business_value_added = Math.round(commodity_value_added_per_kg * qty_before_kg);

  // Komponen biaya tenaga kerja & kas pengelola
  const total_cost_operational = Math.round(qty_before_kg * cost_operational_rate);
  const total_cost_labor = Math.round(qty_before_kg * cost_labor_rate);
  const total_cost_management = Math.round(qty_before_kg * cost_management_rate);
  const total_cost = total_cost_operational + total_cost_labor + total_cost_management;

  // Keuntungan bersih akhir setelah dialokasikan untuk tenaga kerja dan kas pengelola
  const net_value_added = business_value_added - (total_cost_labor + total_cost_management);
  const net_value_added_per_kg = qty_before_kg > 0 ? Math.round((net_value_added / qty_before_kg) * 100) / 100 : 0;

  // Selisih harga satuan per kg
  const price_diff_per_kg = price_after_kg - price_before_kg;
  const net_price_spread_per_kg = price_diff_per_kg - total_cost_rate;

  return {
    qty_before_kg,
    qty_after_kg,
    cost_operational_rate,
    cost_labor_rate,
    cost_management_rate,
    total_cost_rate,
    total_cost_operational,
    total_cost_labor,
    total_cost_management,
    total_cost,
    raw_material_value_before,
    product_value_after,
    gross_value_diff,
    gross_value_diff_per_kg,
    commodity_value_added_per_kg,
    business_value_added,
    net_value_added,
    net_value_added_per_kg,
    price_diff_per_kg,
    net_price_spread_per_kg,
  };
}
