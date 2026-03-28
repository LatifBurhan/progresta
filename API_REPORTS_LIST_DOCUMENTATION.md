# GET /api/reports/list - API Documentation

## Overview

Retrieves a paginated list of progress reports with filtering capabilities. Implements role-based access control where regular users see only their own reports, while admins (ADMIN, HRD, CEO) can view all reports.

## Endpoint

```
GET /api/reports/list
```

## Authentication

**Required**: Yes

The endpoint requires a valid session cookie. Unauthenticated requests will receive a 401 response.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project_id` | string (UUID) | No | - | Filter reports by specific project |
| `start_date` | string (ISO date) | No | - | Filter reports from this date (inclusive) |
| `end_date` | string (ISO date) | No | - | Filter reports until this date (inclusive) |
| `limit` | number | No | 20 | Number of reports per page (1-100) |
| `offset` | number | No | 0 | Pagination offset (must be >= 0) |

## Response Format

### Success Response (200)

```typescript
{
  success: true,
  data: {
    reports: [
      {
        id: string;                    // Report UUID
        user_id: string;               // Creator's user UUID
        user_name: string;             // Creator's name
        project_id: string;            // Project UUID
        project_name: string;          // Project name
        lokasi_kerja: string;          // Work location: 'WFA' | 'Al-Wustho' | 'Client Site'
        pekerjaan_dikerjakan: string;  // Work description
        kendala: string | null;        // Obstacles (optional)
        rencana_kedepan: string | null; // Future plans (optional)
        foto_urls: string[];           // Array of photo URLs (1-5)
        created_at: string;            // ISO timestamp
        updated_at: string;            // ISO timestamp
        can_edit: boolean;             // True if user can edit (same day only)
        can_delete: boolean;           // True if user can delete
      }
    ],
    total: number;      // Total number of reports matching filters
    has_more: boolean;  // True if more pages available
  }
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

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Limit must be between 1 and 100"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch reports: [error message]"
}
```

## Access Control

### Regular Users
- Can only view their own reports
- `can_edit` is true only for reports created on the same day
- `can_delete` is true for all their own reports

### Admin Users (ADMIN, HRD, CEO)
- Can view all reports from all users
- `can_edit` is false for other users' reports
- `can_delete` is true for all reports

## Examples

### Example 1: List all reports (default pagination)

**Request:**
```bash
GET /api/reports/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "a1b2c3d4-...",
        "user_id": "e5f6g7h8-...",
        "user_name": "John Doe",
        "project_id": "i9j0k1l2-...",
        "project_name": "Website Redesign",
        "lokasi_kerja": "WFA",
        "pekerjaan_dikerjakan": "Completed homepage mockup",
        "kendala": null,
        "rencana_kedepan": "Start coding tomorrow",
        "foto_urls": [
          "https://...supabase.co/storage/.../photo1.jpg",
          "https://...supabase.co/storage/.../photo2.jpg"
        ],
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "can_edit": true,
        "can_delete": true
      }
    ],
    "total": 45,
    "has_more": true
  }
}
```

### Example 2: Filter by project

**Request:**
```bash
GET /api/reports/list?project_id=i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "total": 12,
    "has_more": false
  }
}
```

### Example 3: Filter by date range

**Request:**
```bash
GET /api/reports/list?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "total": 28,
    "has_more": true
  }
}
```

### Example 4: Pagination

**Request (Page 1):**
```bash
GET /api/reports/list?limit=10&offset=0
```

**Request (Page 2):**
```bash
GET /api/reports/list?limit=10&offset=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "total": 45,
    "has_more": true
  }
}
```

### Example 5: Combined filters

**Request:**
```bash
GET /api/reports/list?project_id=i9j0k1l2-...&start_date=2024-01-01&limit=5
```

## Implementation Details

### Database Query

The endpoint performs a single optimized query with:
- JOIN with `users` table to get creator name
- JOIN with `projects` table to get project name
- Filtering based on user role (RLS)
- Date range filtering
- Project filtering
- Sorting by `created_at DESC`
- Pagination using `range()`

### Performance Considerations

- Uses database indexes on:
  - `user_id`
  - `project_id`
  - `created_at`
  - `(user_id, project_id)` composite
- Returns exact count for pagination metadata
- Efficient range-based pagination

### Data Transformation

1. **Photo URLs**: Deserialized from PostgreSQL TEXT[] to JavaScript array
2. **can_edit**: Computed based on creation date and user ownership
3. **can_delete**: Computed based on user ownership or admin role
4. **User/Project names**: Extracted from JOIN results

## Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| 4.1 | Users see only own reports (line 109) |
| 4.2 | Filter by project_id (line 113-115) |
| 4.3 | View all reports (no filter) |
| 4.4 | Sort by created_at DESC (line 130) |
| 4.5 | Display all fields + flags (line 149-175) |
| 5.1 | Admins see all reports (line 107-110) |
| 5.2 | Filter by project_id (line 113-115) |
| 5.3 | View all reports (no filter) |
| 5.4 | Sort by created_at DESC (line 130) |
| 5.5 | Display all fields + flags (line 149-175) |

## Testing

See test files:
- `test-list-reports.js` - Full integration tests
- `test-list-endpoint-direct.js` - HTTP endpoint tests

## Related Endpoints

- `POST /api/reports/create` - Create new report
- `PUT /api/reports/update/[id]` - Update report
- `DELETE /api/reports/delete/[id]` - Delete report
- `GET /api/reports/projects` - Get available projects

## Notes

- Reports are always sorted by creation date (newest first)
- The `can_edit` flag is only true for same-day reports
- Photo URLs are automatically deserialized from database format
- Admin users cannot edit other users' reports, only delete them
- Date filters are inclusive (both start and end dates)
