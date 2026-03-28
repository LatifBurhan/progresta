import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { createClient } from '@supabase/supabase-js';

const STORAGE_BUCKET = 'project-report-photos';

/**
 * POST /api/reports/upload-photos
 * 
 * Upload photos to Supabase Storage for progress reports
 * 
 * Request: FormData with:
 * - files: File[] (1-5 photos)
 * - userId: string
 * - reportId: string
 * 
 * Response:
 * {
 *   success: boolean;
 *   data?: string[]; // Array of public URLs
 *   error?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials missing:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse form data
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const reportId = formData.get('reportId') as string;
    const files = formData.getAll('files') as File[];

    // Validate inputs
    if (!userId || !reportId) {
      return NextResponse.json(
        { success: false, error: "Missing userId or reportId" },
        { status: 400 }
      );
    }

    if (files.length < 1 || files.length > 5) {
      return NextResponse.json(
        { success: false, error: "Must upload between 1 and 5 photos" },
        { status: 400 }
      );
    }

    // Verify user is authenticated as the userId
    if (session.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Upload all photos
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${timestamp}_${randomStr}_${sanitizedName}`;

      // Construct storage path
      const storagePath = `${userId}/${reportId}/${uniqueFilename}`;

      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      return publicUrlData.publicUrl;
    });

    const publicUrls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      data: publicUrls
    });

  } catch (error: any) {
    console.error("Upload photos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload photos" },
      { status: 500 }
    );
  }
}
