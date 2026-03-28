# Utility Functions Verification

## Task 3: Implementasi utility functions untuk validasi dan serialization

### Files Created

1. **lib/validations/report-validation.ts** - Report validation utilities
2. **lib/utils/foto-urls-parser.ts** - Photo URLs serialization utilities

### Verification Status

✅ **TypeScript Compilation**: Both files compile without errors
✅ **Type Safety**: All functions are properly typed with TypeScript
✅ **Requirements Coverage**: All specified requirements are implemented

---

## lib/validations/report-validation.ts

### Functions Implemented

#### 1. `validateReportForm(data: CreateReportRequest): ValidationErrors`
**Requirements**: 1.3, 1.4, 1.5, 1.8

Validates report form data for client-side validation.

**Validation Rules**:
- ✅ project_id must not be empty (Req 1.3)
- ✅ lokasi_kerja must be one of: 'WFA', 'Al-Wustho', 'Client Site' (Req 1.4)
- ✅ pekerjaan_dikerjakan must not be empty (Req 1.5)
- ✅ foto_urls must contain 1-5 items (Req 1.8)
- ✅ kendala and rencana_kedepan are optional (no validation)

**Usage Example**:
```typescript
import { validateReportForm } from '@/lib/validations/report-validation';

const formData = {
  project_id: '123',
  lokasi_kerja: 'WFA',
  pekerjaan_dikerjakan: 'Mengerjakan fitur',
  foto_urls: ['url1', 'url2']
};

const errors = validateReportForm(formData);
if (Object.keys(errors).length > 0) {
  // Handle validation errors
  console.log(errors);
}
```

#### 2. `validatePhotoFiles(files: FileList | File[]): string | null`
**Requirements**: 1.8, 1.9, 6.2, 6.3, 6.4

Validates photo files for format and count.

**Validation Rules**:
- ✅ Minimum 1 photo (Req 6.2)
- ✅ Maximum 5 photos (Req 6.3)
- ✅ Allowed formats: image/jpeg, image/jpg, image/png (Req 1.9, 6.4)

**Usage Example**:
```typescript
import { validatePhotoFiles } from '@/lib/validations/report-validation';

const fileInput = document.getElementById('photos') as HTMLInputElement;
const error = validatePhotoFiles(fileInput.files);

if (error) {
  alert(error);
} else {
  // Proceed with upload
}
```

#### 3. `canEditReport(report: ProjectReport, userId: string): boolean`
**Requirements**: 2.1, 2.2

Checks if a report can be edited by the user. Edit is allowed only on the same day as creation.

**Logic**:
- ✅ User must be the report creator (Req 2.1)
- ✅ Current date must equal creation date (Req 2.2)

**Usage Example**:
```typescript
import { canEditReport } from '@/lib/validations/report-validation';

const report = await fetchReport(reportId);
const canEdit = canEditReport(report, currentUserId);

if (canEdit) {
  // Show edit button
}
```

#### 4. `isValidLokasiKerja(lokasiKerja: string): boolean`

Type guard to validate lokasi_kerja values.

**Usage Example**:
```typescript
import { isValidLokasiKerja } from '@/lib/validations/report-validation';

if (isValidLokasiKerja(input)) {
  // input is now typed as LokasiKerja
}
```

#### 5. `hasRequiredFields(data: Partial<CreateReportRequest>): boolean`

Checks if all required fields are present in report data.

---

## lib/utils/foto-urls-parser.ts

### Functions Implemented

#### 1. `serializeFotoUrls(urls: string[]): string[]`
**Requirement**: 11.1

Serializes an array of photo URLs to PostgreSQL TEXT[] format.

**Features**:
- ✅ Filters out null, undefined, and empty strings
- ✅ Returns clean array ready for database storage

**Usage Example**:
```typescript
import { serializeFotoUrls } from '@/lib/utils/foto-urls-parser';

const urls = ['url1', 'url2', '', null, 'url3'];
const serialized = serializeFotoUrls(urls);
// Result: ['url1', 'url2', 'url3']

// Store in database
await db.query('INSERT INTO project_reports (foto_urls) VALUES ($1)', [serialized]);
```

#### 2. `deserializeFotoUrls(data: unknown): string[]`
**Requirements**: 11.2, 11.5

Deserializes PostgreSQL TEXT[] to JavaScript array of strings.

**Features**:
- ✅ Handles array input directly
- ✅ Parses PostgreSQL array literal format: `{url1,url2,url3}`
- ✅ Handles null and undefined gracefully (Req 11.5)
- ✅ Returns empty array on error (Req 11.5)
- ✅ Logs errors for debugging

**Usage Example**:
```typescript
import { deserializeFotoUrls } from '@/lib/utils/foto-urls-parser';

// From database query
const result = await db.query('SELECT foto_urls FROM project_reports WHERE id = $1', [id]);
const urls = deserializeFotoUrls(result.rows[0].foto_urls);

// Handle PostgreSQL literal format
const pgLiteral = '{url1,url2,url3}';
const parsed = deserializeFotoUrls(pgLiteral);
// Result: ['url1', 'url2', 'url3']
```

#### 3. `validateStorageUrl(url: string): boolean`
**Requirement**: 11.3

Validates that a URL is a valid Supabase Storage URL.

**Validation Rules**:
- ✅ Must be HTTPS protocol
- ✅ Must contain 'supabase' in hostname
- ✅ Must contain '/storage/' in path
- ✅ Must contain '/project-report-photos/' bucket

**Usage Example**:
```typescript
import { validateStorageUrl } from '@/lib/utils/foto-urls-parser';

const url = 'https://project.supabase.co/storage/v1/object/public/project-report-photos/photo.jpg';
if (validateStorageUrl(url)) {
  // URL is valid
}
```

#### 4. `validateFotoUrlsArray(urls: string[]): { valid: boolean; error?: string }`

Validates an array of photo URLs.

**Validation Rules**:
- ✅ Must be an array
- ✅ Must contain 1-5 URLs
- ✅ Each URL must be a valid Storage URL

**Usage Example**:
```typescript
import { validateFotoUrlsArray } from '@/lib/utils/foto-urls-parser';

const result = validateFotoUrlsArray(urls);
if (!result.valid) {
  console.error(result.error);
}
```

#### 5. `extractPathFromStorageUrl(url: string): string | null`

Extracts the file path from a Supabase Storage URL.

**Usage Example**:
```typescript
import { extractPathFromStorageUrl } from '@/lib/utils/foto-urls-parser';

const url = 'https://project.supabase.co/storage/v1/object/public/project-report-photos/user123/report456/photo.jpg';
const path = extractPathFromStorageUrl(url);
// Result: 'user123/report456/photo.jpg'
```

#### 6. `testRoundTrip(urls: string[]): boolean`
**Requirement**: 11.4

Tests the round-trip property: serialize → deserialize → serialize should produce equivalent arrays.

**Usage Example**:
```typescript
import { testRoundTrip } from '@/lib/utils/foto-urls-parser';

const urls = ['url1', 'url2', 'url3'];
const isValid = testRoundTrip(urls);
// Result: true (data preserved through round-trip)
```

---

## Manual Testing Guide

### Testing validateReportForm

```typescript
// In a Next.js page or API route
import { validateReportForm } from '@/lib/validations/report-validation';

// Test 1: Valid data
const validData = {
  project_id: '123',
  lokasi_kerja: 'WFA',
  pekerjaan_dikerjakan: 'Work description',
  foto_urls: ['url1']
};
console.log('Valid data errors:', validateReportForm(validData)); // Should be {}

// Test 2: Missing required field
const invalidData = {
  project_id: '',
  lokasi_kerja: 'WFA',
  pekerjaan_dikerjakan: '',
  foto_urls: []
};
console.log('Invalid data errors:', validateReportForm(invalidData)); 
// Should show errors for project_id, pekerjaan_dikerjakan, and foto_urls
```

### Testing validatePhotoFiles

```typescript
// In a client component
import { validatePhotoFiles } from '@/lib/validations/report-validation';

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const error = validatePhotoFiles(e.target.files);
    if (error) {
      alert(error);
    } else {
      console.log('Files are valid');
    }
  }
};
```

### Testing canEditReport

```typescript
import { canEditReport } from '@/lib/validations/report-validation';

// Test 1: Same day edit (should return true)
const todayReport = {
  id: '1',
  user_id: 'user-123',
  created_at: new Date().toISOString(),
  // ... other fields
};
console.log('Can edit today:', canEditReport(todayReport, 'user-123')); // true

// Test 2: Different day (should return false)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const oldReport = {
  id: '2',
  user_id: 'user-123',
  created_at: yesterday.toISOString(),
  // ... other fields
};
console.log('Can edit old:', canEditReport(oldReport, 'user-123')); // false
```

### Testing Foto URLs Parser

```typescript
import {
  serializeFotoUrls,
  deserializeFotoUrls,
  validateStorageUrl,
  testRoundTrip
} from '@/lib/utils/foto-urls-parser';

// Test serialization
const urls = ['url1', 'url2', 'url3'];
const serialized = serializeFotoUrls(urls);
console.log('Serialized:', serialized);

// Test deserialization
const deserialized = deserializeFotoUrls(serialized);
console.log('Deserialized:', deserialized);

// Test round-trip
console.log('Round-trip valid:', testRoundTrip(urls)); // Should be true

// Test URL validation
const validUrl = 'https://project.supabase.co/storage/v1/object/public/project-report-photos/photo.jpg';
console.log('Valid URL:', validateStorageUrl(validUrl)); // true

const invalidUrl = 'https://example.com/photo.jpg';
console.log('Invalid URL:', validateStorageUrl(invalidUrl)); // false
```

---

## Integration Points

### Where to Use These Utilities

1. **Report Form Component** (`components/ReportForm.tsx`)
   - Use `validateReportForm` for client-side validation
   - Use `validatePhotoFiles` when user selects photos

2. **Report API Routes** (`app/api/reports/create/route.ts`, `app/api/reports/update/route.ts`)
   - Use `validateReportForm` for server-side validation
   - Use `serializeFotoUrls` before storing to database
   - Use `deserializeFotoUrls` when reading from database
   - Use `validateStorageUrl` to verify uploaded photo URLs

3. **Report History Component** (`components/ReportHistory.tsx`)
   - Use `canEditReport` to show/hide edit button
   - Use `deserializeFotoUrls` to display photos

4. **Database Queries**
   - Always use `serializeFotoUrls` before INSERT/UPDATE
   - Always use `deserializeFotoUrls` after SELECT

---

## Requirements Coverage

### Task 3.1: lib/validations/report-validation.ts

| Requirement | Function | Status |
|-------------|----------|--------|
| 1.3 | validateReportForm | ✅ |
| 1.4 | validateReportForm | ✅ |
| 1.5 | validateReportForm | ✅ |
| 1.8 | validateReportForm, validatePhotoFiles | ✅ |
| 1.9 | validatePhotoFiles | ✅ |
| 2.1 | canEditReport | ✅ |
| 2.2 | canEditReport | ✅ |
| 6.2 | validatePhotoFiles | ✅ |
| 6.3 | validatePhotoFiles | ✅ |
| 6.4 | validatePhotoFiles | ✅ |

### Task 3.3: lib/utils/foto-urls-parser.ts

| Requirement | Function | Status |
|-------------|----------|--------|
| 11.1 | serializeFotoUrls | ✅ |
| 11.2 | deserializeFotoUrls | ✅ |
| 11.3 | validateStorageUrl | ✅ |
| 11.5 | deserializeFotoUrls (error handling) | ✅ |

---

## Next Steps

1. ✅ Utility functions created and verified
2. ⏭️ Integrate these utilities into Report Form component (Task 4)
3. ⏭️ Integrate into API routes (Task 5)
4. ⏭️ Add to Report History component (Task 6)

---

## Notes

- All functions are fully typed with TypeScript
- No external dependencies required (uses only built-in JavaScript/TypeScript)
- Functions are pure and side-effect free (except logging)
- Error handling is graceful with fallback values
- Ready for immediate use in the application
