# 🚀 PROGRESTA DEVELOPMENT GUIDE

## 📋 PROJECT OVERVIEW
**Progresta** adalah sistem Progress & Auto-Attendance berbasis Next.js dengan Supabase sebagai backend. Sistem ini mengelola karyawan, divisi, project, dan laporan progress.

## 🏗️ TECH STACK & ARCHITECTURE

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Shadcn/ui components
- **Language**: TypeScript

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Client**: Supabase JavaScript Client (NOT Prisma)

### Key Libraries
- `@supabase/supabase-js` - Database client
- `bcryptjs` - Password hashing
- `uuid` - UUID generation
- `zod` - Schema validation

## 🗄️ DATABASE SCHEMA

### Users Table
```sql
users {
  id: UUID (Primary Key)
  email: String (Unique)
  password: String (Hashed with bcrypt)
  role: String ('KARYAWAN', 'PM', 'HRD', 'CEO', 'ADMIN')
  divisionId: UUID (Foreign Key to divisions.id)
  status: String ('ACTIVE', 'INACTIVE')
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: UUID
}
```

### Divisions Table
```sql
divisions {
  id: UUID (Primary Key)
  name: String (Unique)
  description: String (Nullable)
  color: String (Default: '#3B82F6')
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Projects Table
```sql
projects {
  id: UUID (Primary Key)
  name: String
  description: String (Nullable)
  client: String (Nullable)
  start_date: Timestamp (Nullable)
  end_date: Timestamp (Nullable)
  is_active: Boolean (Default: true)
  status_active: Boolean (Default: true)
  created_at: Timestamp
  updated_at: Timestamp
}
```

### Project Divisions Table (Many-to-Many)
```sql
project_divisions {
  id: UUID (Primary Key)
  project_id: UUID (Foreign Key to projects.id)
  division_id: UUID (Foreign Key to divisions.id)
  created_at: Timestamp
  UNIQUE(project_id, division_id)
}
```

## 🔧 CRITICAL DEVELOPMENT RULES

### 1. Database Access
- **ALWAYS use Supabase client, NEVER Prisma**
- **Column names use snake_case** (created_at, division_id, start_date, end_date, is_active)
- **Generate UUIDs manually** using `uuidv4()` for new records
- **Let database handle timestamps** with default values (created_at, updated_at)
- **Convert to camelCase in UI layer** for React component compatibility

### 2. Authentication & Authorization
- **User creation**: Create in Supabase Auth + database table with hashed password
- **Login**: Use Supabase Auth signInWithPassword
- **Session**: Use custom session management in `/lib/session`
- **Role-based access**: Check user.role for permissions

### 3. API Patterns
```typescript
// Standard API structure
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/session'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  // 1. Verify session
  const session = await verifySession()
  if (!session) return NextResponse.json({success: false}, {status: 401})
  
  // 2. Check permissions
  if (!['ADMIN', 'HRD'].includes(session.role)) {
    return NextResponse.json({success: false}, {status: 403})
  }
  
  // 3. Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // 4. Database operations with proper error handling
  const { data, error } = await supabase
    .from('table_name')
    .insert([{
      id: uuidv4(),
      // Use snake_case for database fields
      field_name: value,
      is_active: true
      // Let database handle created_at, updated_at with defaults
    }])
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({
      success: false, 
      message: 'Error: ' + error.message
    }, {status: 500})
  }
  
  return NextResponse.json({success: true, data})
}
```

### 4. Multi-Division Projects

The system supports projects that can involve multiple divisions for collaboration:

#### Database Structure
- `projects` table: Core project information (name, description, dates, status)
- `project_divisions` table: Junction table for many-to-many relationships
- Each project can have multiple divisions, each division can be in multiple projects

#### Creating Multi-Division Projects
```typescript
// API request for creating project with multiple divisions
const response = await fetch('/api/admin/projects/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Cross-Division Project',
    description: 'Project involving multiple divisions',
    divisionIds: ['uuid1', 'uuid2', 'uuid3'], // Array of division IDs
    startDate: '2026-03-25',
    endDate: '2026-04-25'
  })
})

// Server-side project creation with relationships
const projectId = uuidv4()

// 1. Create project
const { data: project, error: projectError } = await supabase
  .from('projects')
  .insert({
    id: projectId,
    name: name.trim(),
    description: description?.trim() || null,
    is_active: true,
    status_active: true,
    start_date: startDate,
    end_date: endDate
  })
  .select('*')
  .single()

// 2. Create project-division relationships
for (const divisionId of divisionIds) {
  await supabase
    .from('project_divisions')
    .insert({
      id: uuidv4(),
      project_id: projectId,
      division_id: divisionId
    })
}
```

#### Fetching Projects with Divisions
```typescript
// Get projects with their associated divisions
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('is_active', true)

// Get project-division relationships
const { data: projectDivisions } = await supabase
  .from('project_divisions')
  .select('project_id, division_id')
  .in('project_id', projectIds)

// Get division details
const { data: divisions } = await supabase
  .from('divisions')
  .select('id, name, color')

// Combine data for UI
const projectsWithDivisions = projects.map(project => ({
  ...project,
  divisions: projectDivisions
    .filter(pd => pd.project_id === project.id)
    .map(pd => divisions.find(d => d.id === pd.division_id))
    .filter(Boolean)
}))
```

#### UI Components
- **CreateProjectModal**: Multi-select checkbox interface for divisions
- **Division badges**: Color-coded visual indicators
- **Real-time preview**: Shows selected divisions during creation
- **Validation**: Ensures at least one division is selected

#### Database Policies
```sql
-- Service role policies for API operations
CREATE POLICY "Service role can manage projects" ON projects
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage project_divisions" ON project_divisions
FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### 5. UI Component Patterns

## 🚨 COMMON PITFALLS TO AVOID

### ❌ DON'T DO
- Use Prisma for database operations
- Hardcode session data in components
- Use camelCase for database operations (createdAt, divisionId)
- Forget to generate UUIDs for new records
- Skip password hashing for user creation
- Use statusPending (old field) instead of status
- Mix snake_case and camelCase in same layer

### ✅ DO
- Use Supabase client for all database operations
- Use snake_case column names for database (created_at, division_id, start_date, end_date)
- Convert to camelCase in UI layer (createdAt, divisionId, startDate, endDate)
- Generate UUIDs with `uuidv4()`
- Hash passwords with `bcrypt.hash(password, 12)`
- Use status: 'ACTIVE'/'INACTIVE' for user status
- Include proper error handling and validation
- Verify sessions and check permissions

## 🔐 ENVIRONMENT VARIABLES
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# App
NODE_ENV="development"
SESSION_SECRET="your-secret-key"
REGISTRATION_TOKEN="123"
```

## 📁 PROJECT STRUCTURE
```
template/
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── dashboard/             # Main app pages
│   │   ├── admin/            # Admin management
│   │   │   ├── users/        # User management
│   │   │   ├── divisions/    # Division management
│   │   │   └── projects/     # Project management
│   │   └── layout.tsx        # Dashboard layout (NO hardcoded session!)
│   ├── api/                  # API endpoints
│   │   ├── admin/           # Admin APIs
│   │   └── auth/            # Auth APIs
│   └── actions/             # Server actions
├── lib/
│   ├── session.ts           # Session management
│   └── supabase.ts         # Supabase client
└── components/ui/          # Reusable UI components
```

## 🎯 ROLE-BASED PERMISSIONS
- **KARYAWAN**: Basic access, can submit reports
- **PM**: Project management, team monitoring
- **HRD**: User management, division management
- **CEO**: Full access except user deletion
- **ADMIN**: Full system access including user deletion

## 🔄 DEVELOPMENT WORKFLOW
1. **Always check existing database structure** before creating new features
2. **Use debug endpoints** to verify data structure: `/api/debug-users`, `/api/debug-projects`
3. **Test with real session data**, never hardcode
4. **Verify permissions** for each role
5. **Handle errors gracefully** with user-friendly messages

## 📝 DEBUGGING COMMANDS
```javascript
// Check session in browser console
fetch('/api/auth/check', {credentials: 'include'}).then(r => r.json()).then(console.log)

// Check database structure
fetch('/api/debug-users').then(r => r.json()).then(console.log)
fetch('/api/debug-projects').then(r => r.json()).then(console.log)
```

## 🚀 DEPLOYMENT NOTES
- **Environment variables** must be set in production
- **Database permissions** (RLS) should be properly configured
- **Supabase project** must be active and accessible
- **Build process** should complete without Prisma errors

---

**⚠️ IMPORTANT**: Always refer to this guide when adding new features to avoid common pitfalls and maintain consistency with the existing codebase.