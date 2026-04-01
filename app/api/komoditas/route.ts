import { NextResponse } from "next/server";
import { gapoktanService } from "@/services/gapoktan.service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gapoktanId = searchParams.get('gapoktan_id');
    const data = gapoktanId
      ? await gapoktanService.getKomoditasByGapoktan(gapoktanId)
      : await gapoktanService.getAllKomoditas();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const data = await gapoktanService.createKomoditas(name);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name } = await request.json();
    if (!id) throw new Error("ID required");
    const data = await gapoktanService.updateKomoditas(id, name);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID required");
    await gapoktanService.deleteKomoditas(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
