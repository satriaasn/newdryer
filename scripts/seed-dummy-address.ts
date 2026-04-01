import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual simple dotenv parser
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value;
        }
      });
      console.log(`Loaded env from ${file}`);
      return;
    }
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Missing Supabase URL or KEY in .env or .env.local");
  process.exit(1);
}

const supabase = createClient(URL, KEY);

async function main() {
  try {
    console.log("Seeding 10 dummy address data (Kabupaten, Kecamatan, Desa)...");

    // 1. Create a dummy Kabupaten
    const { data: kab, error: e1 } = await supabase
      .from('kabupaten')
      .insert({ name: 'Kabupaten Dummy ' + Date.now().toString().slice(-4) })
      .select().single();
    if (e1) throw e1;
    console.log(`Created Kabupaten: ${kab.name}`);

    // 2. Create 2 dummy Kecamatan under this Kabupaten
    const kecs = await Promise.all([
      supabase.from('kecamatan').insert({ name: 'Kecamatan Alpha', kabupaten_id: kab.id }).select().single(),
      supabase.from('kecamatan').insert({ name: 'Kecamatan Beta', kabupaten_id: kab.id }).select().single()
    ]);
    if (kecs[0].error || kecs[1].error) throw new Error("Error creating kecamatan");
    
    const kec1 = kecs[0].data;
    const kec2 = kecs[1].data;
    console.log(`Created Kecamatan: ${kec1.name}, ${kec2.name}`);

    // 3. Create 7 dummy Desa distributed in those 2 Kecamatan
    // making total 1 + 2 + 7 = 10 data items inserted.
    const desasParams = [
      { name: 'Desa Alpha 1', kecamatan_id: kec1.id },
      { name: 'Desa Alpha 2', kecamatan_id: kec1.id },
      { name: 'Desa Alpha 3', kecamatan_id: kec1.id },
      { name: 'Desa Alpha 4', kecamatan_id: kec1.id },
      { name: 'Desa Beta 1', kecamatan_id: kec2.id },
      { name: 'Desa Beta 2', kecamatan_id: kec2.id },
      { name: 'Desa Beta 3', kecamatan_id: kec2.id },
    ];

    for (const dp of desasParams) {
      const { error } = await supabase.from('desa').insert(dp);
      if (error) throw error;
      console.log(`Created Desa: ${dp.name}`);
    }

    console.log("\nSuccess! Inserted 1 Kabupaten, 2 Kecamatan, and 7 Desa (Total 10 records).");
  } catch (err: any) {
    console.error("Failed to seed dummy data:", err.message);
  }
}

main();
