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

export async function POST(request: Request) {
  try {
    const { type, name, parentId } = await request.json();
    let data;
    if (type === 'kabupaten') data = await addressService.createKabupaten(name);
    else if (type === 'kecamatan') data = await addressService.createKecamatan(name, parentId);
    else if (type === 'desa') data = await addressService.createDesa(name, parentId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { type, id, name } = await request.json();
    let data;
    if (type === 'kabupaten') data = await addressService.updateKabupaten(id, name);
    else if (type === 'kecamatan') data = await addressService.updateKecamatan(id, name);
    else if (type === 'desa') data = await addressService.updateDesa(id, name);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    if (!id || !type) throw new Error("ID and type are required");

    if (type === 'kabupaten') await addressService.deleteKabupaten(id);
    else if (type === 'kecamatan') await addressService.deleteKecamatan(id);
    else if (type === 'desa') await addressService.deleteDesa(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
