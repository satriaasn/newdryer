# Dryer Monitoring System - Architecture

This document describes the high-level architecture of the Dryer Monitoring System.

## Stack Overview

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI.
- **Charts**: Recharts for real-time temporal analysis.
- **Backend**: Supabase (PostgreSQL, Auth, Realtime).
- **Service Layer**: Decoupled TypeScript services for dryer and production logic.

## Data Flow

1. **Sensors/IOT Gateways**: Insert data into the `production_logs` table via Supabase API/Edge Functions.
2. **Supabase Realtime**: Broadcasts changes to `production_logs`, `batches`, and `dryer_units`.
3. **Frontend Dashboard**:
    - Uses `production.service.ts` to fetch historical logs and active batches.
    - Subscribes to real-time events to update KPI cards and charts without page refresh.
    - Uses React Query (TanStack Query) for efficient caching and background synchronization.

## Security (RLS & RBAC)

- **Authentication**: Managed via Supabase Auth (JWT).
- **Authorization**:
    - `Viewer`: Can only view the dashboard and logs.
    - `Operator`: Can start/stop batches and update dryer statuses.
    - `Admin`: Full access including user management and system audits.
- **Row Level Security**: Policies are enforced at the database level to prevent unauthorized access even if the API keys are leaked.

## Scalability

- **Database Partitioning**: `production_logs` is designed for future partitioning by `logged_at`.
- **Indexing**: Frequent queries (e.g., current batch data) are covered by BTREE indexes.
- **Modular Services**: Business logic is separated from the UI for testability and reuse.
