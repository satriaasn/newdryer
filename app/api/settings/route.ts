import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return NextResponse.json({
      app_name: "Dashboard Monitoring Hibah Dryer",
      app_slogan: "Real-time oversight of national agricultural drying infrastructure",
      copyright: "© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved."
    });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  // Try to update ID 1
  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .eq('id', 1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({
        app_name: body.app_name,
        app_slogan: body.app_slogan,
        copyright: body.copyright,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from('app_settings')
      .insert([{
        id: 1,
        app_name: body.app_name,
        app_slogan: body.app_slogan,
        copyright: body.copyright
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
