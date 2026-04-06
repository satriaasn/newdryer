import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Basic security check (Optional: verify CRON_SECRET from Vercel)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 2. Get WhatsApp Settings
    const { data: settings, error: sError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (sError || !settings || !settings.is_active || !settings.send_daily_summary) {
      return NextResponse.json({ message: "Feature disabled or settings missing" });
    }

    // 3. Time Check (Optional but good for dynamic timing)
    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // If we run this every 5 or 10 mins, we check if it's within that window
    // For simplicity in this demo, let's assume it runs and sends if it hasn't sent today
    // But better to just check if currentHourMin matches setting
    if (settings.daily_summary_time && settings.daily_summary_time.substring(0, 5) !== currentHourMin) {
        // Uncomment this line if you want strict time matching
        // return NextResponse.json({ message: `Waiting for scheduled time: ${settings.daily_summary_time}` });
    }

    // 4. Get Today's Production Data
    const today = new Date().toISOString().split('T')[0];
    const { data: productions, error: pError } = await supabase
      .from('productions')
      .select('qty_before, qty_after, gapoktan(name)')
      .eq('production_date', today);

    if (pError) throw pError;

    if (!productions || productions.length === 0) {
      return NextResponse.json({ message: "No production data today" });
    }

    // 5. Build Summary Message
    const totalQty = productions.reduce((sum, p) => sum + Number(p.qty_before), 0);
    const count = productions.length;
    
    const message = `*RINGKASAN PRODUKSI HARIAN (${today})*\n\n` +
                 `Total Produksi: *${totalQty.toFixed(1)} Ton*\n` +
                 `Jumlah Input: *${count} Data*\n\n` +
                 `Detail per Gapoktan:\n` +
                 productions.slice(0, 10).map(p => `- ${p.gapoktan?.name}: ${Number(p.qty_before).toFixed(1)} T`).join('\n') +
                 (productions.length > 10 ? '\n...dan lainnya' : '') +
                 `\n\n_Pesan otomatis dari Dashboard Monitoring Dryer_`;

    const formData = new FormData();
    formData.append('target', settings.target_number);
    formData.append('message', message);
    formData.append('countryCode', '62');

    // 6. Send to WhatsApp via Fonnté
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': settings.api_key.trim(),
      },
      body: formData,
    });

    const resData = await response.json();
    return NextResponse.json({ success: resData.status, fonnte_res: resData });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
