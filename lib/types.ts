export type UserRole = 'admin' | 'operator' | 'viewer' | 'gapoktan' | 'administrator' | 'superadmin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kabupaten {
  id: string;
  name: string;
}

export interface Kecamatan {
  id: string;
  kabupaten_id: string;
  name: string;
  kabupaten?: Kabupaten;
}

export interface Desa {
  id: string;
  kecamatan_id: string;
  name: string;
  kecamatan?: Kecamatan & { kabupaten?: Kabupaten };
}

export interface Gapoktan {
  id: string;
  name: string;
  desa_id: string;
  ketua: string | null;
  phone: string | null;
  user_id: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  desa?: Desa;
  komoditas?: Komoditas[];
  dryer_units?: DryerUnit[];
}

export interface DryerUnit {
  id: string;
  name: string;
  gapoktan_id: string;
  capacity_ton: number | null;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  gapoktan?: Gapoktan;
}

export interface Komoditas {
  id: string;
  name: string;
}

export interface GapoktanKomoditas {
  id: string;
  gapoktan_id: string;
  komoditas_id: string;
  komoditas?: Komoditas;
}

export interface Production {
  id: string;
  dryer_id: string;
  gapoktan_id: string;
  komoditas_id: string;
  qty_before: number;
  price_before: number;
  qty_after: number;
  price_after: number;
  qty_diff_pct: number;
  price_diff_pct: number;
  production_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  dryer_units?: DryerUnit;
  gapoktan?: Gapoktan;
  komoditas?: Komoditas;
}

export interface DashboardStats {
  totalGapoktan: number;
  totalDryers: number;
  totalProductions: number;
  todayProductions?: number;
  avgQtyDiffPct: number;
  avgPriceDiffPct: number;
  totalQtyBefore: number;
  totalQtyAfter: number;
  todayQtyAfter?: number;
  coverageKabupaten?: number;
}
