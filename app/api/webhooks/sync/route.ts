// app/api/webhooks/sync/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  try {
    // Desestructuración de la data entrante
    const { source, property_id, start_date, end_date, external_id } = body;

    // Insertar en tu tabla recién creada
    const { data, error } = await supabase
      .from('external_blocks')
      .insert([{ 
        source, 
        property_id, 
        start_date, 
        end_date, 
        external_id 
      }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await supabase.from('error_logs').insert({
      endpoint: '/api/webhooks/sync',
      error_message: errorMessage,
      payload: body,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
