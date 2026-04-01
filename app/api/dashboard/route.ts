import { NextResponse } from "next/server";
import { productionService } from "@/services/production.service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const stats = await productionService.getDashboardStats();
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
