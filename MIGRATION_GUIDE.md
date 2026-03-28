# Migration Guide - Project Completion Feature

## Overview
This migration adds project completion tracking with urgency levels and creator tracking.

## New Fields Added to `projects` Table
- `createdBy` (UUID) - References the user who created the project
- `urgency` (ENUM) - Project urgency level: 'low', 'medium', or 'high'
- `isCompleted` (BOOLEAN) - Whether the project has been marked as completed

## How to Run the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
cd template
supabase db push
```

### Option 2: Manual SQL Execution
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_project_completion_fields.sql`
4. Click "Run"

## What This Enables
- Project creators can mark projects as complete/incomplete
- Projects display with color-coded urgency levels:
  - 🔴 High urgency (red)
  - 🟡 Medium urgency (orange)
  - 🟢 Low urgency (blue)
  - ✓ Completed projects (green)
- Only project creators can toggle completion status

## API Endpoints Added
- `PATCH /api/projects/[id]/complete` - Toggle project completion status

## Files Modified
1. `template/app/dashboard/reports/page.tsx` - Added currentUserId state and passing to ProjectGrid
2. `template/components/reports/ProjectGrid.tsx` - Enabled API call for completion toggle
3. `template/app/api/reports/projects/route.ts` - Returns createdBy, urgency, isCompleted fields
4. `template/types/report.ts` - Added new fields to Project interface

## Files Created
1. `template/supabase/migrations/add_project_completion_fields.sql` - Database migration
2. `template/app/api/projects/[id]/complete/route.ts` - API endpoint for toggling completion

## Testing
After running the migration:
1. Login as a user
2. Go to "Riwayat" page
3. You should see project cards with circle icons
4. Click the circle icon on a project you created
5. The icon should change to a checkmark and the card should turn green
6. Try clicking on a project you didn't create - you should see an error message

## Notes
- Existing projects will have `urgency` set to 'low' by default
- Existing projects will have `isCompleted` set to false by default
- The `createdBy` field will be NULL for existing projects until manually updated
