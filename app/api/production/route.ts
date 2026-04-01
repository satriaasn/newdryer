import { NextResponse } from "next/server";
import { productionService } from "@/services/production.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gapoktan_id = searchParams.get('gapoktan_id');
    
    let productions;
    if (gapoktan_id) {
      productions = await productionService.getByGapoktan(gapoktan_id);
    } else {
      productions = await productionService.getAll();
    }
    return NextResponse.json(productions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProd = await productionService.create(body);
    return NextResponse.json(newProd, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
