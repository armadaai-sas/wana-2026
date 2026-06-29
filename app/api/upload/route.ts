import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

const schema = z.object({
  propertyId: z.string().uuid(),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const propertyIdRaw = formData.get('propertyId');
  const propertyId = propertyIdRaw ? String(propertyIdRaw).trim() : null;
  const fileType = file?.type ?? null;
  const fileSize = file?.size ?? null;
  const payload = { propertyId, fileType, fileSize };

  const validation = schema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid upload payload', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const supabase = createClient({ useServiceRole: true });

  try {
    const filename = `${Date.now()}_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('properties_media')
      .upload(filename, file as any, { contentType: file.type });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicData } = supabase.storage.from('properties_media').getPublicUrl(filename);
    const publicUrl = publicData?.publicUrl ?? null;

    const { data: propData, error: propError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propError) {
      throw new Error(propError.message);
    }

    const uploadedBy = propData?.owner_id ?? null;

    const { data: pmInsertData, error: pmInsertError } = await supabase
      .from('properties_media')
      .insert({
        property_id: propertyId,
        file_path: data.path,
        file_url: publicUrl,
        content_type: file.type,
        size_bytes: file.size,
        uploaded_by: uploadedBy,
        status: 'pending',
      })
      .select()
      .single();

    if (pmInsertError) {
      throw new Error(pmInsertError.message);
    }

    const { data: cqInsertData, error: cqInsertError } = await supabase
      .from('content_queue')
      .insert({
        property_id: propertyId,
        file_url: publicUrl ?? data.path,
        file_path: data.path,
        status: 'pending',
      })
      .select()
      .single();

    if (cqInsertError) {
      await supabase.from('properties_media').delete().eq('id', pmInsertData?.id);
      throw new Error(cqInsertError.message);
    }

    return NextResponse.json({ success: true, properties_media: pmInsertData, content_queue: cqInsertData });
  } catch (err: any) {
    console.error('Upload Error:', err);
    try {
      await supabase.from('error_logs').insert([{ 
        endpoint: '/api/upload',
        error_message: err?.message ?? String(err),
        payload: payload,
      }]);
    } catch (logError) {
      console.error('Error logging upload failure:', logError);
    }

    return NextResponse.json({ error: 'Internal Server Error', details: err?.message ?? String(err) }, { status: 500 });
  }
}
