import { NextResponse } from "next/server";
import { gapoktanService } from "@/services/gapoktan.service";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const komoditasId = searchParams.get('komoditas_id');
    if (!komoditasId) throw new Error("komoditas_id required");

    const { data, error } = await supabase
      .from('commodity_targets')
      .select('*')
      .eq('komoditas_id', komoditasId)
      .order('period', { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { komoditas_id, period, target_ton } = await request.json();
    if (!komoditas_id || !period) throw new Error("komoditas_id and period are required");
    const data = await gapoktanService.saveCommodityTarget(komoditas_id, period, Number(target_ton) || 0);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID required");

    await gapoktanService.deleteCommodityTarget(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
