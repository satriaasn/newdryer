import { NextResponse } from "next/server";
import { gapoktanService } from "@/services/gapoktan.service";

export async function GET() {
  try {
    const data = await gapoktanService.getAll();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await gapoktanService.create(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
