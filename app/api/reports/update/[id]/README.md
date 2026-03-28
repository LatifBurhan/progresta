# PUT /api/reports/update/[id]

Updates an existing progress report.

## Requirements

- **2.1**: User must be authenticated and be the report creator
- **2.2**: Current date must equal report creation date (same-day edit only)
- **2.3**: All fields can be modified
- **2.4**: Same validation rules as create endpoint
- **2.5**: Updates the `updated_at` timestamp

## Request

### Method
`PUT`

### URL Parameters
- `id` (string, required): UUID of the report to update

### Headers
- `Cookie`: Must contain valid session cookie

### Body
All fields are optional. Only provided fields will be updated.

```json
{
  "project_id": "uuid",
  "lokasi_kerja": "WFA" | "Al-Wustho" | "Client Site",
  "pekerjaan_dikerjakan": "string",
  "kendala": "string",
  "rencana_kedepan": "string",
  "foto_urls": ["url1", "url2", ...]
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Errors

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### 403 Forbidden - Not Creator
```json
{
  "success": false,
  "error": "You are not authorized to edit this report"
}
```

#### 403 Forbidden - Not Same Day
```json
{
  "success": false,
  "error": "Reports can only be edited on the same day they were created"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Report not found"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field_name": "error message"
  }
}
```

## Validation Rules

### Same as Create Endpoint
- `project_id`: Must reference an active project where user is involved
- `lokasi_kerja`: Must be one of: 'WFA', 'Al-Wustho', 'Client Site'
- `pekerjaan_dikerjakan`: Required, non-empty string
- `kendala`: Optional string
- `rencana_kedepan`: Optional string
- `foto_urls`: Array of 1-5 valid storage URLs

### Additional Update Rules
- User must be the report creator
- Current date must equal report creation date (DATE(created_at) = CURRENT_DATE)
- If `project_id` is changed, user must be involved in the new project

## Example Usage

### Update Work Description
```typescript
const response = await fetch('/api/reports/update/123e4567-e89b-12d3-a456-426614174000', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pekerjaan_dikerjakan: 'Updated work description'
  })
});

const result = await response.json();
```

### Update Multiple Fields
```typescript
const response = await fetch('/api/reports/update/123e4567-e89b-12d3-a456-426614174000', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    lokasi_kerja: 'Client Site',
    pekerjaan_dikerjakan: 'Updated work description',
    kendala: 'New obstacles encountered',
    foto_urls: ['url1', 'url2', 'url3']
  })
});

const result = await response.json();
```

## Testing

Run the test endpoint to verify functionality:

```bash
curl http://localhost:3000/api/reports/test-update
```

Or visit in browser:
```
http://localhost:3000/api/reports/test-update
```

The test endpoint will:
1. Create a test report
2. Update it with new data
3. Verify all fields were updated correctly
4. Verify `updated_at` timestamp changed
5. Clean up the test data

## Implementation Notes

- Uses `canEditReport()` from `lib/validations/report-validation.ts` to check same-day edit permission
- Uses `validateReportForm()` to validate merged data (existing + updates)
- Uses `serializeFotoUrls()` to format photo URLs for database storage
- Validates project access if `project_id` is being changed
- Auto-updates `updated_at` timestamp via database trigger
- Merges update data with existing data for validation
