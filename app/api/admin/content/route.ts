import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient({ useServiceRole: true });

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Calculate range for pagination
    const start = page * limit;
    const end = start + limit - 1;

    // Build query
    let query = supabase.from('content_queue').select('*', { count: 'exact' });

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply range for pagination
    const { data, count, error } = await query.range(start, end);

    if (error) {
      console.error('[Admin API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content', details: error.message },
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
        sortBy,
        sortOrder,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Admin API] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
