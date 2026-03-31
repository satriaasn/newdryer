import { NextResponse } from "next/server";
import { productionService } from "@/services/production.service";

export async function GET() {
  try {
    const stats = await productionService.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
