import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "operator", "viewer", "gapoktan", "administrator", "superadmin"]);
export const DryerStatusSchema = z.enum(["active", "inactive", "maintenance", "offline"]);

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  role: UserRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const DryerUnitSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  capacity_ton: z.number().nullable(),
  location: z.string().nullable(),
  status: DryerStatusSchema,
  metadata: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BatchSchema = z.object({
  id: z.string().uuid(),
  dryer_id: z.string().uuid(),
  batch_number: z.string(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  is_active: z.boolean(),
  total_output_kg: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ProductionLogSchema = z.object({
  id: z.string().uuid(),
  dryer_id: z.string().uuid(),
  batch_id: z.string().uuid(),
  temperature_c: z.number().nullable(),
  moisture_p: z.number().nullable(),
  humidity_p: z.number().nullable(),
  airflow_speed: z.number().nullable(),
  logged_at: z.string(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string(),
  table_name: z.string().nullable(),
  record_id: z.string().uuid().nullable(),
  old_data: z.record(z.any()).nullable(),
  new_data: z.record(z.any()).nullable(),
  created_at: z.string(),
});

// Input Validation Schemas
export const CreateDryerSchema = DryerUnitSchema.omit({ id: true, created_at: true, updated_at: true });
export const CreateBatchSchema = BatchSchema.omit({ id: true, created_at: true, updated_at: true });
export const CreateProductionLogSchema = ProductionLogSchema.omit({ id: true });
