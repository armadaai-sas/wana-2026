import { NextResponse } from 'next/server';
// NOTE: This endpoint is a conceptual stub. To enable real analysis,
// install @google-cloud/vision and configure credentials in your environment.
import type { NextRequest } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { imageUrl } = body;

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
  }

  try {
    // Dynamically require to avoid build-time errors if package isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ImageAnnotatorClient } = require('@google-cloud/vision');
    const client = new ImageAnnotatorClient();

    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result?.safeSearchAnnotation || {};

    if (detections.adult === 'VERY_LIKELY' || detections.violence === 'VERY_LIKELY') {
      return NextResponse.json({ status: 'rejected', reason: 'Inappropriate content' }, { status: 400 });
    }

    return NextResponse.json({ status: 'ready_for_moderation' });
  } catch (err) {
    console.error('Vision analysis failed:', err);
    return NextResponse.json({ error: 'Vision API error or not configured' }, { status: 500 });
  }
}
