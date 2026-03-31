import { NextResponse } from "next/server";
import { dryerService } from "@/services/dryer.service";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gapoktanId = searchParams.get('gapoktan_id');
    const data = gapoktanId
      ? await dryerService.getByGapoktan(gapoktanId)
      : await dryerService.getAll();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await dryerService.create(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
