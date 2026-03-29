import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET_NAME = 'project-attachments'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({
        success: false,
        message: 'File path tidak ditemukan'
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Storage configuration error'
      }, { status: 500 });
    }

    // Delete file using admin client (bypasses RLS)
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({
        success: false,
        message: `Gagal menghapus file: ${error.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File berhasil dihapus'
    });

  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error: " + error.message,
    }, { status: 500 });
  }
}
