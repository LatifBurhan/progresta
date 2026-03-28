# DELETE Report API Documentation

## Endpoint

```
DELETE /api/reports/delete/[id]
```

## Description

Deletes a progress report and its associated photos from Supabase Storage.

## Requirements

Implements requirements: 3.1, 3.2, 3.3, 3.4

## Authorization

- User must be authenticated
- User must be the report creator OR
- User must have role ADMIN, HRD, or CEO

## Request

### URL Parameters

- `id` (string, required): UUID of the report to delete

### Headers

```
Cookie: session={session-token}
```

### Example Request

```bash
curl -X DELETE \
  http://localhost:3000/api/reports/delete/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Cookie: session=your-session-token"
```

## Response

### Success Response (200 OK)

```json
{
  "success": true
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "You are not authorized to delete this report"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "Report not found"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to delete report: {error message}"
}
```

## Process Flow

1. **Validate Authentication**: Verify user session exists
2. **Retrieve Report**: Fetch report from database to verify ownership and get foto_urls
3. **Validate Authorization**: Check if user is creator OR admin (ADMIN, HRD, CEO)
4. **Delete Photos**: Remove all photos from Supabase Storage bucket
5. **Delete Record**: Remove report record from database
6. **Return Response**: Send success confirmation

## Storage Cleanup

The endpoint automatically deletes all photos associated with the report from the `project-report-photos` storage bucket. This ensures no orphaned files remain in storage.

If storage deletion fails, the database record is still deleted to prevent orphaned database entries. The error is logged for manual cleanup if needed.

## Testing

A test script is available at `template/test-delete-report.js`. Run it with:

```bash
TEST_USER_SESSION=xxx TEST_ADMIN_SESSION=yyy TEST_PROJECT_ID=zzz node test-delete-report.js
```

## Implementation Details

### File Location

```
template/app/api/reports/delete/[id]/route.ts
```

### Dependencies

- `@/lib/session`: Session verification
- `@/lib/supabase`: Database client
- `@/lib/storage/photo-upload`: Photo deletion utilities
- `@/lib/utils/foto-urls-parser`: URL parsing utilities

### Admin Roles

The following roles have admin privileges to delete any report:
- `ADMIN`
- `HRD`
- `CEO`

Regular users can only delete their own reports.

## Related Endpoints

- `POST /api/reports/create` - Create a new report
- `PUT /api/reports/update/[id]` - Update an existing report
- `GET /api/reports/list` - List reports with filtering

## Notes

- Reports can be deleted at any time by the creator (no time restriction)
- Admins can delete any report regardless of creation date
- Photo deletion from storage is attempted but won't block database deletion if it fails
- All foto_urls are parsed and deleted from the storage bucket
