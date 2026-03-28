# Photo Upload Utilities

Storage utilities for managing photo uploads in the Project Progress Report feature.

## Overview

This module provides functions for uploading, deleting, and managing photos in Supabase Storage for the project progress report system.

- **Storage Bucket**: `project-report-photos`
- **Path Pattern**: `{user_id}/{report_id}/{timestamp}_{randomstr}_{filename}`
- **Supported Formats**: JPG, PNG, JPEG
- **Photo Limits**: 1-5 photos per report

## Functions

### `uploadPhotoToStorage(file, userId, reportId)`

Upload a single photo to Supabase Storage.

**Parameters:**
- `file: File` - File object to upload
- `userId: string` - UUID of the user uploading the photo
- `reportId: string` - UUID of the report the photo belongs to

**Returns:** `Promise<PhotoUploadResult>`
```typescript
{
  path: string;      // Storage path: user_id/report_id/filename
  publicUrl: string; // Public URL for accessing the photo
}
```

**Example:**
```typescript
import { uploadPhotoToStorage } from '@/lib/storage/photo-upload';

const result = await uploadPhotoToStorage(
  file,
  'user-uuid-123',
  'report-uuid-456'
);

console.log(result.publicUrl); // https://...supabase.co/.../photo.jpg
```

### `uploadMultiplePhotos(files, userId, reportId)`

Upload multiple photos in batch (1-5 photos).

**Parameters:**
- `files: File[]` - Array of File objects (1-5 photos)
- `userId: string` - UUID of the user
- `reportId: string` - UUID of the report

**Returns:** `Promise<PhotoUploadResult[]>`

**Example:**
```typescript
import { uploadMultiplePhotos } from '@/lib/storage/photo-upload';

const results = await uploadMultiplePhotos(
  [file1, file2, file3],
  'user-uuid-123',
  'report-uuid-456'
);

const photoUrls = results.map(r => r.publicUrl);
```

### `deletePhotoFromStorage(photoPath)`

Delete a single photo from Supabase Storage.

**Parameters:**
- `photoPath: string` - Storage path of the photo (e.g., `user_id/report_id/filename.jpg`)

**Returns:** `Promise<{ success: boolean }>`

**Example:**
```typescript
import { deletePhotoFromStorage } from '@/lib/storage/photo-upload';

await deletePhotoFromStorage('user-uuid/report-uuid/photo.jpg');
```

### `deleteMultiplePhotos(photoPaths)`

Delete multiple photos in batch.

**Parameters:**
- `photoPaths: string[]` - Array of storage paths

**Returns:** `Promise<{ success: boolean }>`

**Example:**
```typescript
import { deleteMultiplePhotos } from '@/lib/storage/photo-upload';

await deleteMultiplePhotos([
  'user-uuid/report-uuid/photo1.jpg',
  'user-uuid/report-uuid/photo2.jpg'
]);
```

### `deletePhotosByUrls(publicUrls)`

Delete photos by their public URLs (convenience function).

**Parameters:**
- `publicUrls: string[]` - Array of public URLs

**Returns:** `Promise<{ success: boolean }>`

**Example:**
```typescript
import { deletePhotosByUrls } from '@/lib/storage/photo-upload';

const report = { foto_urls: ['https://...photo1.jpg', 'https://...photo2.jpg'] };
await deletePhotosByUrls(report.foto_urls);
```

### `extractStoragePathFromUrl(publicUrl)`

Extract storage path from public URL (helper function).

**Parameters:**
- `publicUrl: string` - Public URL of the photo

**Returns:** `string | null` - Storage path or null if extraction fails

**Example:**
```typescript
import { extractStoragePathFromUrl } from '@/lib/storage/photo-upload';

const url = 'https://...supabase.co/.../project-report-photos/user/report/photo.jpg';
const path = extractStoragePathFromUrl(url);
// Returns: 'user/report/photo.jpg'
```

## Usage in API Routes

### Creating a Report with Photos

```typescript
import { uploadMultiplePhotos } from '@/lib/storage/photo-upload';

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('photos') as File[];
  const userId = 'user-uuid';
  const reportId = 'report-uuid';

  // Upload photos
  const uploadResults = await uploadMultiplePhotos(files, userId, reportId);
  const fotoUrls = uploadResults.map(r => r.publicUrl);

  // Save report with foto_urls
  await db.project_reports.create({
    data: {
      user_id: userId,
      project_id: formData.get('project_id'),
      foto_urls: fotoUrls,
      // ... other fields
    }
  });

  return Response.json({ success: true });
}
```

### Deleting a Report with Photos

```typescript
import { deletePhotosByUrls } from '@/lib/storage/photo-upload';

export async function DELETE(request: Request) {
  const { reportId } = await request.json();

  // Get report with photo URLs
  const report = await db.project_reports.findUnique({
    where: { id: reportId }
  });

  // Delete photos from storage
  await deletePhotosByUrls(report.foto_urls);

  // Delete report record
  await db.project_reports.delete({
    where: { id: reportId }
  });

  return Response.json({ success: true });
}
```

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 1.10**: Store photos with path pattern `{user_id}/{report_id}/{filename}`
- **Requirement 6.1**: Accept photo uploads from camera or gallery
- **Requirement 6.5**: Display progress indicator during upload
- **Requirement 6.8**: Generate unique filenames to prevent collisions
- **Requirement 6.9**: Configure Storage bucket with public read access
- **Requirement 3.3**: Delete associated photos when report is deleted

## Testing

Run the verification script to test the helper functions:

```bash
npx tsx lib/storage/verify-photo-upload.ts
```

All tests should pass with ✓ PASS status.

## Environment Variables

Required environment variables in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Error Handling

All functions throw errors with descriptive messages:

- `Error: Supabase credentials not configured` - Missing env vars
- `Error: Failed to upload photo: {reason}` - Upload failure
- `Error: Failed to delete photo: {reason}` - Delete failure
- `Error: Must upload between 1 and 5 photos` - Invalid photo count

Catch and handle these errors in your API routes:

```typescript
try {
  await uploadMultiplePhotos(files, userId, reportId);
} catch (error) {
  return Response.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```
