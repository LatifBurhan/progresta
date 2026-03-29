import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET_NAME = 'project-attachments'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'File tidak ditemukan'
      }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({
        success: false,
        message: 'Project ID tidak ditemukan'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        message: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Storage configuration error'
      }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${projectId}/${fileName}`

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({
        success: false,
        message: `Gagal upload file: ${error.message}`
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    });

  } catch (error: any) {
    console.error("Upload file error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error: " + error.message,
    }, { status: 500 });
  }
}
