import { NextResponse } from "next/server";
import { gapoktanService } from "@/services/gapoktan.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gapoktanId = searchParams.get('gapoktan_id');
    const data = gapoktanId
      ? await gapoktanService.getKomoditasByGapoktan(gapoktanId)
      : await gapoktanService.getAllKomoditas();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
