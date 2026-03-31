# Dryer Monitoring System - Database Schema

This document outlines the relational structure of the Dryer Monitoring System.

## Tables

### `profiles`
Extends `auth.users` with application-specific metadata.
- `id` (UUID, PK, FK: `auth.users.id`)
- `full_name` (TEXT)
- `role` (ENUM: `admin`, `operator`, `viewer`)
- `created_at`, `updated_at` (TIMESTAMP)

### `dryer_units`
Master list of drying machines.
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE)
- `capacity_ton` (NUMERIC)
- `location` (TEXT)
- `status` (ENUM: `active`, `inactive`, `maintenance`, `offline`)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMP)

### `batches`
Grouping of production runs.
- `id` (UUID, PK)
- `dryer_id` (UUID, FK: `dryer_units.id`)
- `batch_number` (TEXT)
- `start_time`, `end_time` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `total_output_kg` (NUMERIC)
- `created_at`, `updated_at` (TIMESTAMP)

### `production_logs`
Chronological sensor data (Time-series).
- `id` (UUID, PK)
- `dryer_id` (UUID, FK: `dryer_units.id`)
- `batch_id` (UUID, FK: `batches.id`)
- `temperature_c` (NUMERIC)
- `moisture_p` (NUMERIC)
- `humidity_p` (NUMERIC)
- `airflow_speed` (NUMERIC)
- `logged_at` (TIMESTAMP, DEFAULT: `now()`)

### `audit_logs`
System activity tracking.
- `id` (UUID, PK)
- `user_id` (UUID, FK: `profiles.id`)
- `action` (TEXT)
- `table_name` (TEXT)
- `record_id` (UUID)
- `old_data`, `new_data` (JSONB)
- `created_at` (TIMESTAMP, DEFAULT: `now()`)

## Relationships (ERD Summary)
1. `dryer_units` (1:N) `batches`
2. `batches` (1:N) `production_logs` (Cascade delete on batch removal)
3. `dryer_units` (1:N) `production_logs`
4. `profiles` (1:N) `audit_logs`

## Performance & Optimization
- **Indexing**: B-Tree indexes on `production_logs(logged_at)` and `batches(is_active)`.
- **Realtime**: PostgreSQL CDC (Change Data Capture) enabled for `production_logs` and `dryer_units`.
- **Normalization**: Normalized structure to prevent data duplication and ensure ACID compliance.
