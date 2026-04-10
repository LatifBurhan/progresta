import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const searchParams = request.nextUrl.searchParams;
    
    const filter = searchParams.get('filter') || 'all'; // all, today
    const periods = searchParams.get('periods')?.split(',').filter(Boolean) || []; // ["08-10", "10-12"]

    let query = supabase
      .from('project_reports')
      .select(`
        id,
        user_id,
        project_id,
        lokasi_kerja,
        pekerjaan_dikerjakan,
        kendala,
        rencana_kedepan,
        foto_urls,
        created_at,
        period,
        users!project_reports_user_id_fkey (
          id,
          name,
          email
        ),
        projects!project_reports_project_id_fkey (
          id,
          name,
          project_divisions (
            divisions (
              id,
              name
            )
          ),
          project_department_divisions (
            departments (
              id,
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by date
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('created_at', today.toISOString());
    }

    // Filter by periods
    if (periods.length > 0) {
      query = query.in('period', periods);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
