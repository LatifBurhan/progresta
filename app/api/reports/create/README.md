# POST /api/reports/create

API endpoint untuk membuat laporan progres project baru.

## Requirements

Implements requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.11, 7.3, 7.4, 7.5

## Request

### Method
`POST`

### Headers
- `Content-Type: application/json`
- Requires authenticated session (cookie-based)

### Body
```typescript
{
  project_id: string;        // UUID of the project
  lokasi_kerja: 'WFA' | 'Al-Wustho' | 'Client Site';
  pekerjaan_dikerjakan: string;  // Required, work description
  kendala?: string;          // Optional, obstacles
  rencana_kedepan?: string;  // Optional, future plans
  foto_urls: string[];       // Array of 1-5 photo URLs
}
```

## Response

### Success (200)
```typescript
{
  success: true,
  data: {
    id: string;           // UUID of created report
    created_at: string;   // ISO timestamp
  }
}
```

### Error Responses

#### 401 Unauthorized
```typescript
{
  success: false,
  error: "Authentication required"
}
```

#### 400 Bad Request - Validation Failed
```typescript
{
  success: false,
  error: "Validation failed",
  details: {
    field_name: "error message"
  }
}
```

#### 403 Forbidden - Not Authorized for Project
```typescript
{
  success: false,
  error: "You are not authorized to report on this project"
}
```

#### 404 Not Found - Project Not Found
```typescript
{
  success: false,
  error: "Project not found"
}
```

#### 500 Internal Server Error
```typescript
{
  success: false,
  error: "Internal server error: <details>"
}
```

## Validation Rules

### Authentication (Requirement 7.3)
- User must have a valid session
- Session must contain userId

### Request Body (Requirement 7.3)
- All required fields must be present
- Uses `validateReportForm` from `@/lib/validations/report-validation`

### Lokasi Kerja (Requirement 7.5)
- Must be one of: 'WFA', 'Al-Wustho', 'Client Site'
- Case-sensitive

### Foto URLs (Requirement 7.5)
- Must contain at least 1 photo URL
- Must contain at most 5 photo URLs
- URLs are serialized using `serializeFotoUrls` from `@/lib/utils/foto-urls-parser`

### Project Active Status (Requirement 7.5)
- Project must exist in database
- Project status must be 'Aktif'

### User-Project Relationship (Requirement 7.4)
- User must have a division assigned
- User's division must be linked to the project via `project_divisions` table
- Validates the relationship: `users.division_id` → `project_divisions.division_id` → `project_divisions.project_id`

## Database Operations

### Tables Used
- `users` - Get user's division
- `projects` - Validate project exists and is active
- `project_divisions` - Validate user-project relationship
- `project_reports` - Insert new report record

### Insert Query
```sql
INSERT INTO project_reports (
  user_id,
  project_id,
  lokasi_kerja,
  pekerjaan_dikerjakan,
  kendala,
  rencana_kedepan,
  foto_urls
) VALUES (...)
RETURNING id, created_at;
```

## Error Handling

All errors are logged to console and returned with appropriate HTTP status codes:
- Authentication errors: 401
- Validation errors: 400
- Authorization errors: 403
- Not found errors: 404
- Database/server errors: 500

## Testing

The endpoint has been verified with:
1. Direct SQL insertion test - ✅ Passed
2. Validation logic verification - ✅ Passed
3. User-project relationship check - ✅ Passed
4. Active project filter - ✅ Passed

### Test Record
A test record was successfully created and verified:
- User: latifburhanuddin02@gmail.com
- Project: Website Company Profile
- Lokasi: WFA
- Foto URLs: 2 photos
- Status: Successfully inserted and deleted

## Dependencies

- `@/lib/session` - Session verification
- `@/lib/supabase` - Database client (supabaseAdmin)
- `@/lib/validations/report-validation` - Form validation
- `@/lib/utils/foto-urls-parser` - URL serialization
- `@/types/report` - TypeScript types

## Notes

- Uses service role client (`supabaseAdmin`) to bypass RLS policies
- Database uses snake_case (`division_id`) but code handles both snake_case and camelCase
- Projects table uses `status` field with value 'Aktif' (not boolean `isActive`)
- Foto URLs are stored as PostgreSQL TEXT[] array
