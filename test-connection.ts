// Test simple de conectividad Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase.from('properties').select('count', { count: 'exact' });
  if (error) console.error("❌ Error de conexión:", error.message);
  else console.log("✅ Conexión exitosa. Base de datos operativa.", data);
}

test();
