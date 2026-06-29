import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient({ useServiceRole: true });

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Calculate range
    const start = page * limit;
    const end = start + limit - 1;

    // Fetch audit logs with pagination
    const { data, count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: sortOrder === 'asc' })
      .range(start, end);

    if (error) {
      console.error('[Admin Audit API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: (page + 1) * limit < (count || 0),
        hasPrev: page > 0,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Admin Audit API] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
