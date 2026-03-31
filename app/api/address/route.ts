import { NextResponse } from "next/server";
import { addressService } from "@/services/address.service";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kabupatenId = searchParams.get('kabupaten_id') || undefined;
    const kecamatanId = searchParams.get('kecamatan_id') || undefined;
    const type = searchParams.get('type') || 'kabupaten';

    let data;
    if (type === 'kecamatan') {
      data = await addressService.getKecamatan(kabupatenId);
    } else if (type === 'desa') {
      data = await addressService.getDesa(kecamatanId);
    } else {
      data = await addressService.getKabupaten();
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
