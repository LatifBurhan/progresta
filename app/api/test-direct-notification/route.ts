import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySession } from "@/lib/session";

/**
 * Direct test: Insert notification langsung ke database
 * Bypass semua logic untuk test database access
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    const targetUserId = userId || session.userId;

    console.log('🧪 TEST: Direct notification insert');
    console.log('Target user ID:', targetUserId);

    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return NextResponse.json({
        success: false,
        message: 'Table notifications tidak ditemukan atau tidak bisa diakses',
        error: tableError,
      }, { status: 500 });
    }

    console.log('✅ Table notifications exists');

    // Test 2: Direct insert
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const testNotification = {
      id: crypto.randomUUID(),
      user_id: targetUserId,
      type: 'system_alert',
      title: 'Test Notification Direct',
      message: 'Ini adalah test notification yang di-insert langsung ke database',
      priority: 'high',
      action_url: '/dashboard',
      data: { test: true },
      read: false,
      created_at: now,
      expires_at: expiresAt,
    };

    console.log('🧪 Inserting test notification:', testNotification);

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert([testNotification])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return NextResponse.json({
        success: false,
        message: 'Gagal insert notification',
        error: insertError,
      }, { status: 500 });
    }

    console.log('✅ Insert successful:', insertedData);

    // Test 3: Verify insert
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', testNotification.id)
      .single();

    if (verifyError) {
      console.error('❌ Verify failed:', verifyError);
      return NextResponse.json({
        success: false,
        message: 'Insert berhasil tapi gagal verify',
        insertedData,
        error: verifyError,
      }, { status: 500 });
    }

    console.log('✅ Verify successful:', verifyData);

    return NextResponse.json({
      success: true,
      message: 'Test notification berhasil di-insert dan di-verify!',
      notification: verifyData,
      steps: {
        tableExists: true,
        insertSuccess: true,
        verifySuccess: true,
      }
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Test error: ' + error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
