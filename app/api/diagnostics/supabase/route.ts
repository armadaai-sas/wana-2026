import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error: true,
        message: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.'
      },
      { status: 500 }
    );
  }

  try {
    const { count: cqCount } = await supabase.from('content_queue').select('*', { count: 'exact', head: true });
    const { count: pmCount } = await supabase.from('properties_media').select('*', { count: 'exact', head: true });

    return NextResponse.json({ content_queue: cqCount ?? 0, properties_media: pmCount ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err?.message ?? String(err) }, { status: 500 });
  }
}
