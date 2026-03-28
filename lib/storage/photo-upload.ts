/**
 * Photo Upload Utilities for Project Progress Reports
 * 
 * This module provides functions for uploading, deleting, and managing photos
 * in Supabase Storage for the project progress report feature.
 * 
 * Storage bucket: project-report-photos
 * Path pattern: {user_id}/{report_id}/{timestamp}_{originalname}
 * 
 * Requirements: 1.10, 6.1, 6.5, 6.8, 6.9, 3.3
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PhotoUploadResult } from '@/types/report';

const STORAGE_BUCKET = 'project-report-photos';

// Lazy initialization of Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client with service role
 * Uses lazy initialization to avoid errors when env vars are not available
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
}

/**
 * Generate unique filename with timestamp to prevent collisions
 * Format: {timestamp}_{originalname}
 * 
 * @param originalName - Original filename from uploaded file
 * @returns Unique filename with timestamp prefix
 * 
 * Requirement 6.8: Generate unique filenames to prevent collisions
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${randomStr}_${sanitizedName}`;
}

/**
 * Upload a single photo to Supabase Storage
 * 
 * @param file - File object to upload
 * @param userId - UUID of the user uploading the photo
 * @param reportId - UUID of the report the photo belongs to
 * @returns PhotoUploadResult with path and publicUrl
 * @throws Error if upload fails
 * 
 * Requirements: 1.10, 6.1, 6.5, 6.8, 6.9
 */
export async function uploadPhotoToStorage(
  file: File,
  userId: string,
  reportId: string
): Promise<PhotoUploadResult> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Construct storage path: {user_id}/{report_id}/{filename}
    const storagePath = `${userId}/${reportId}/${uniqueFilename}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL for the uploaded photo
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload photo to storage');
  }
}

/**
 * Upload multiple photos to Supabase Storage (batch upload)
 * 
 * @param files - Array of File objects to upload (1-5 photos)
 * @param userId - UUID of the user uploading the photos
 * @param reportId - UUID of the report the photos belong to
 * @returns Array of PhotoUploadResult with paths and publicUrls
 * @throws Error if any upload fails (all or nothing)
 * 
 * Requirements: 1.10, 6.1, 6.5, 6.8, 6.9
 */
export async function uploadMultiplePhotos(
  files: File[],
  userId: string,
  reportId: string
): Promise<PhotoUploadResult[]> {
  try {
    // Validate photo count (1-5 photos)
    if (files.length < 1 || files.length > 5) {
      throw new Error('Must upload between 1 and 5 photos');
    }

    // Upload all photos in parallel
    const uploadPromises = files.map(file => 
      uploadPhotoToStorage(file, userId, reportId)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Batch photo upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload photos to storage');
  }
}

/**
 * Delete a single photo from Supabase Storage
 * 
 * @param photoPath - Storage path of the photo to delete
 * @returns Success status
 * @throws Error if deletion fails
 * 
 * Requirement 3.3: Delete associated photos from Storage when report is deleted
 */
export async function deletePhotoFromStorage(photoPath: string): Promise<{ success: boolean }> {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([photoPath]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Photo delete error:', error);
    throw error instanceof Error ? error : new Error('Failed to delete photo from storage');
  }
}

/**
 * Delete multiple photos from Supabase Storage (batch delete)
 * 
 * @param photoPaths - Array of storage paths to delete
 * @returns Success status
 * @throws Error if deletion fails
 * 
 * Requirement 3.3: Delete associated photos from Storage when report is deleted
 */
export async function deleteMultiplePhotos(photoPaths: string[]): Promise<{ success: boolean }> {
  try {
    if (photoPaths.length === 0) {
      return { success: true };
    }

    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(photoPaths);

    if (error) {
      console.error('Supabase storage batch delete error:', error);
      throw new Error(`Failed to delete photos: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Batch photo delete error:', error);
    throw error instanceof Error ? error : new Error('Failed to delete photos from storage');
  }
}

/**
 * Extract storage path from public URL
 * Helper function to convert public URL back to storage path for deletion
 * 
 * @param publicUrl - Public URL of the photo
 * @returns Storage path or null if extraction fails
 * 
 * Example URL: https://ltdsbtelfetmgrxgoudf.supabase.co/storage/v1/object/public/project-report-photos/user_id/report_id/filename.jpg
 * Returns: user_id/report_id/filename.jpg
 */
export function extractStoragePathFromUrl(publicUrl: string): string | null {
  try {
    // Match the pattern after /project-report-photos/
    const match = publicUrl.match(/\/project-report-photos\/(.+?)(?:\?|$)/);
    if (match && match[1]) {
      return match[1];
    }

    // Fallback: try to get everything after the bucket name
    const parts = publicUrl.split(`/${STORAGE_BUCKET}/`);
    if (parts.length > 1) {
      return parts[1].split('?')[0]; // Remove query params if any
    }

    return null;
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
}

/**
 * Delete photos by their public URLs
 * Convenience function that extracts paths and deletes photos
 * 
 * @param publicUrls - Array of public URLs to delete
 * @returns Success status
 * @throws Error if deletion fails
 */
export async function deletePhotosByUrls(publicUrls: string[]): Promise<{ success: boolean }> {
  try {
    const paths = publicUrls
      .map(url => extractStoragePathFromUrl(url))
      .filter((path): path is string => path !== null);

    if (paths.length === 0) {
      console.warn('No valid storage paths extracted from URLs');
      return { success: true };
    }

    return await deleteMultiplePhotos(paths);
  } catch (error) {
    console.error('Delete photos by URLs error:', error);
    throw error instanceof Error ? error : new Error('Failed to delete photos by URLs');
  }
}
