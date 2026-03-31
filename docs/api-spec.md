# Dryer Monitoring System - API Specification

This document details the RESTful API endpoints available in the Next.js application layer.

## Authentication
Authentication is handled via Supabase Auth (JWT). Headers should include `Authorization: Bearer <JWT_TOKEN>`.

## Endpoints

### 1. Production Logs

#### `GET /api/production/logs`
Fetch time-series production data.
- **Query Params**:
  - `dryerId` (UUID, optional)
  - `batchId` (UUID, optional)
  - `startDate`, `endDate` (ISO8601, optional)
  - `limit` (Int, default: 50)
- **Response**: `Array<ProductionLog>`

#### `POST /api/production/logs`
Insert a new sensor log (typically for IOT gateways).
- **Body**: `CreateProductionLogSchema` (Zod)
- **Response**: `ProductionLog`

### 2. Dryer Units

#### `GET /api/dryers`
Fetch list of all drying machines.
- **Response**: `Array<DryerUnit>`

#### `PATCH /api/dryers/:id`
Update machine status or metadata.
- **Body**: `Partial<DryerUnit>`
- **Response**: `DryerUnit`

### 3. Batches

#### `GET /api/batches/active`
Fetch currently active production batches.
- **Response**: `Array<Batch>`

#### `POST /api/batches`
Initialize a new production batch for a specific dryer.
- **Body**: `CreateBatchSchema`
- **Response**: `Batch`

## Real-time (WebSocket)
For real-time updates, use the Supabase client to subscribe to PostgreSQL changes:
```typescript
supabase
  .channel('production_logs_changes')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'production_logs' }, callback)
  .subscribe();
```
