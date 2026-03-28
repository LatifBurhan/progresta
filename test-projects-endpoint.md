# Manual Test Guide for GET /api/reports/projects

## Endpoint
`GET /api/reports/projects`

## Requirements Validated
- **Requirement 1.1**: Display only Projects with status "Aktif" (isActive = true)
- **Requirement 1.2**: Display only Projects where User is involved through project_divisions
- **Requirement 7.1**: Query relationship: User → divisions → project_divisions → projects
- **Requirement 7.2**: Filter Projects to only include those with status "Aktif"

## Test Cases

### Test Case 1: Unauthenticated Request
**Expected**: 401 Unauthorized

```bash
curl http://localhost:3000/api/reports/projects
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Test Case 2: Authenticated User with Projects
**Expected**: 200 OK with list of active projects

**Steps**:
1. Login to the application
2. Make request with valid session cookie
3. Verify response contains only active projects
4. Verify each project has divisions array

**Expected Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project Description",
      "isActive": true,
      "divisions": [
        {
          "id": "uuid",
          "name": "Division Name",
          "color": "#3B82F6"
        }
      ]
    }
  ]
}
```

### Test Case 3: User with No Projects
**Expected**: 200 OK with empty array

**Expected Response**:
```json
{
  "success": true,
  "data": []
}
```

### Test Case 4: User with No Division
**Expected**: 400 Bad Request

**Expected Response**:
```json
{
  "success": false,
  "error": "User has no division assigned"
}
```

## Validation Checklist

- [ ] Endpoint returns 401 for unauthenticated requests
- [ ] Endpoint returns only active projects (isActive = true)
- [ ] Endpoint returns only projects where user's division is linked via project_divisions
- [ ] Response includes divisions array for each project
- [ ] Projects are sorted by name (ascending)
- [ ] Response format matches ListProjectsResponse type
- [ ] Endpoint handles users with no division gracefully
- [ ] Endpoint handles users with no projects gracefully

## Database Verification Queries

### Check User's Division
```sql
SELECT id, email, "divisionId" 
FROM users 
WHERE id = 'user-id';
```

### Check User's Projects
```sql
SELECT DISTINCT p.id, p.name, p."isActive"
FROM projects p
JOIN project_divisions pd ON pd.project_id = p.id
JOIN users u ON u."divisionId" = pd.division_id
WHERE u.id = 'user-id'
AND p."isActive" = true
ORDER BY p.name;
```

### Check Project Divisions
```sql
SELECT p.name as project_name, d.name as division_name
FROM projects p
JOIN project_divisions pd ON pd.project_id = p.id
JOIN divisions d ON d.id = pd.division_id
WHERE p.id = 'project-id';
```

## Notes

- The endpoint uses supabaseAdmin to bypass RLS policies for consistent querying
- The endpoint filters at the database level for performance
- The endpoint returns projects sorted alphabetically by name
- Each project includes all its associated divisions, not just the user's division
