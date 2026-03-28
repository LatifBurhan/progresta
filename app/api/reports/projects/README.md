# GET /api/reports/projects

## Overview

This endpoint retrieves active projects that the authenticated user is involved in through their division.

## Implementation Details

### File Location
`template/app/api/reports/projects/route.ts`

### Requirements Implemented
- **Requirement 1.1**: Display only Projects with status "Aktif" (isActive = true)
- **Requirement 1.2**: Display only Projects where User is involved through project_divisions
- **Requirement 7.1**: Query relationship: User → divisions → project_divisions → projects
- **Requirement 7.2**: Filter Projects to only include those with status "Aktif"

### Query Logic

1. **Authenticate User**: Verify session and get user ID
2. **Get User's Division**: Query `users` table to get user's `divisionId`
3. **Find User's Projects**: Query `project_divisions` table to find projects linked to user's division
4. **Filter Active Projects**: Only include projects where `isActive = true`
5. **Fetch Complete Data**: Get full project details with all associated divisions
6. **Transform Response**: Format data according to `ListProjectsResponse` type

### Database Queries

#### Step 1: Get User's Division
```sql
SELECT divisionId 
FROM users 
WHERE id = $userId
```

#### Step 2: Get Projects via project_divisions
```sql
SELECT DISTINCT project_id, projects.*
FROM project_divisions
JOIN projects ON projects.id = project_divisions.project_id
WHERE division_id = $userDivisionId
AND projects.isActive = true
```

#### Step 3: Get Complete Project Data with Divisions
```sql
SELECT 
  p.id,
  p.name,
  p.description,
  p.isActive,
  pd.division_id,
  d.id as division_id,
  d.name as division_name,
  d.color as division_color
FROM projects p
JOIN project_divisions pd ON pd.project_id = p.id
JOIN divisions d ON d.id = pd.division_id
WHERE p.id IN ($projectIds)
AND p.isActive = true
ORDER BY p.name ASC
```

### Response Format

#### Success Response (200)
```typescript
{
  success: true,
  data: Array<{
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    divisions: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "User not found"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": "User has no division assigned"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to fetch projects: [error message]"
}
```

## Testing

### Test Script
Run the verification script:
```bash
node scripts/test-projects-endpoint.js
```

### Manual Testing
See `template/test-projects-endpoint.md` for manual test cases and validation steps.

### Test Results
✅ All validation checks passed:
- All projects have `isActive = true`
- All projects have `divisions` array
- Projects are sorted by name (ascending)
- Only projects where user's division is linked are returned

## Usage Example

### Client-Side (React)
```typescript
async function fetchUserProjects() {
  const response = await fetch('/api/reports/projects');
  const result = await response.json();
  
  if (result.success) {
    return result.data; // Array of projects
  } else {
    throw new Error(result.error);
  }
}
```

### Server-Side (API Route)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/reports/projects`,
    {
      headers: {
        Cookie: request.headers.get('cookie') || ''
      }
    }
  );
  
  return NextResponse.json(await response.json());
}
```

## Security

- **Authentication**: Requires valid session cookie
- **Authorization**: Users can only see projects they're involved in
- **RLS Bypass**: Uses `supabaseAdmin` to bypass RLS for consistent querying
- **Input Validation**: User ID from session is validated before querying

## Performance Considerations

- **Indexes**: Queries use indexed columns (`divisionId`, `project_id`, `division_id`)
- **Efficient Joins**: Uses Supabase's nested select for optimal query performance
- **Caching**: Consider implementing client-side caching for project list
- **Pagination**: Not implemented (assumes reasonable number of projects per user)

## Related Files

- Type definitions: `template/types/report.ts`
- Session verification: `template/lib/session.ts`
- Supabase client: `template/lib/supabase.ts`
- Design document: `.kiro/specs/laporan-progres-project/design.md`
- Requirements: `.kiro/specs/laporan-progres-project/requirements.md`

## Future Enhancements

- Add pagination support for users with many projects
- Add search/filter by project name
- Add caching with revalidation
- Add project status filter (beyond just active)
- Add sorting options (by date, name, etc.)
