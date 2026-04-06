# Design Document: Overtime Location Tracking

## Overview

This feature enhances the existing overtime management system by integrating GPS location tracking into the clock in/clock out workflow. The system will capture device coordinates using the browser's Geolocation API and store them alongside overtime session data. Admin users will be able to view these locations via Google Maps links in both the overtime list table and detail pages.

The design prioritizes non-blocking behavior - location capture failures will not prevent staff from clocking in or out. This ensures the core overtime functionality remains reliable even when GPS is unavailable or denied.

### Key Design Principles

1. **Non-blocking**: Location capture must never block or delay clock in/out operations
2. **Optional by design**: All location fields are nullable to support graceful degradation
3. **Simple integration**: Use Google Maps URLs instead of embedded maps to avoid API key requirements
4. **Minimal UI changes**: Integrate location capture seamlessly into existing components
5. **Privacy-aware**: Silent failures when location is denied (no error messages to users)

## Architecture

### System Components

The feature integrates into three main layers of the existing Next.js application:

1. **Frontend Layer** (React/TypeScript)
   - `OvertimeClockIn.tsx`: Captures clock-in location
   - `OvertimeClockOut.tsx`: Captures clock-out location
   - `OvertimeAdminClient.tsx`: Displays location links in list view
   - Location link utility component (new)

2. **API Layer** (Next.js Route Handlers)
   - `/api/overtime/clock-in/route.ts`: Accepts and stores clock-in coordinates
   - `/api/overtime/clock-out/route.ts`: Accepts and stores clock-out coordinates
   - No new endpoints required

3. **Database Layer** (Supabase/PostgreSQL)
   - `overtime_sessions` table: Stores location coordinates
   - Migration script: Adds four new nullable columns

### Data Flow

#### Clock In Flow with Location
```
User clicks "Clock In"
  ↓
Component requests geolocation (async, non-blocking)
  ↓
Component submits form with location data (or null)
  ↓
API validates and stores session with coordinates
  ↓
Success response returned
```

#### Clock Out Flow with Location
```
User clicks "Clock Out"
  ↓
Component requests geolocation (async, non-blocking)
  ↓
Component submits form with location data (or null)
  ↓
API updates session and creates request with coordinates
  ↓
Success response returned
```

#### Admin View Flow
```
Admin loads overtime list/detail
  ↓
Component checks for location data
  ↓
If locations exist: Generate Google Maps URL
  ↓
Display "Lihat Lokasi" link
```

### Integration Points

The feature integrates with existing overtime system at these points:

1. **Clock In Component**: Add geolocation capture before form submission
2. **Clock Out Component**: Add geolocation capture before form submission
3. **API Routes**: Extend request body to accept optional location fields
4. **Database Schema**: Add location columns to `overtime_sessions` table
5. **Admin UI**: Add location link column/section to display views

## Components and Interfaces

### Frontend Components

#### 1. Geolocation Service Hook

A reusable hook for capturing device location:

```typescript
// lib/hooks/useGeolocation.ts

interface GeolocationResult {
  latitude: number | null
  longitude: number | null
  error: GeolocationPositionError | null
}

export function useGeolocation() {
  const getCurrentPosition = async (): Promise<GeolocationResult> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null, error: null })
        return
      }

      const timeoutId = setTimeout(() => {
        resolve({ latitude: null, longitude: null, error: null })
      }, 10000) // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          })
        },
        (error) => {
          clearTimeout(timeoutId)
          // Silent failure - return null coordinates
          resolve({ latitude: null, longitude: null, error })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  return { getCurrentPosition }
}
```

#### 2. Google Maps URL Generator

Utility function for creating Google Maps links:

```typescript
// lib/overtime/location.ts

interface LocationCoordinates {
  latitude: number
  longitude: number
}

export function generateGoogleMapsUrl(
  clockInLocation: LocationCoordinates | null,
  clockOutLocation: LocationCoordinates | null
): string | null {
  if (!clockInLocation && !clockOutLocation) {
    return null
  }

  const baseUrl = 'https://www.google.com/maps/search/?api=1'
  
  if (clockInLocation && clockOutLocation) {
    // Two markers
    const markers = [
      `markers=${clockInLocation.latitude},${clockInLocation.longitude}`,
      `markers=${clockOutLocation.latitude},${clockOutLocation.longitude}`
    ]
    return `${baseUrl}&${markers.join('&')}`
  }
  
  // Single marker
  const location = clockInLocation || clockOutLocation!
  return `${baseUrl}&query=${location.latitude},${location.longitude}`
}
```

#### 3. Location Link Component

Reusable component for displaying location links:

```typescript
// components/overtime/LocationLink.tsx

interface LocationLinkProps {
  clockInLat: number | null
  clockInLng: number | null
  clockOutLat: number | null
  clockOutLng: number | null
  className?: string
}

export function LocationLink({
  clockInLat,
  clockInLng,
  clockOutLat,
  clockOutLng,
  className = ''
}: LocationLinkProps) {
  const clockInLocation = clockInLat && clockInLng 
    ? { latitude: clockInLat, longitude: clockInLng } 
    : null
  
  const clockOutLocation = clockOutLat && clockOutLng 
    ? { latitude: clockOutLat, longitude: clockOutLng } 
    : null

  const mapsUrl = generateGoogleMapsUrl(clockInLocation, clockOutLocation)

  if (!mapsUrl) {
    return null
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Lihat Lokasi
    </a>
  )
}
```

#### 4. Updated OvertimeClockIn Component

Modifications to capture clock-in location:

```typescript
// Key changes to app/dashboard/overtime/components/OvertimeClockIn.tsx

import { useGeolocation } from '@/lib/hooks/useGeolocation'

export default function OvertimeClockIn({ onSuccess }: OvertimeClockInProps) {
  const { getCurrentPosition } = useGeolocation()
  // ... existing state ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ... existing validation ...

    setLoading(true)
    
    // Capture location (non-blocking)
    const locationData = await getCurrentPosition()
    
    try {
      const formData = new FormData()
      formData.append('location', location.trim())
      formData.append('projectLeader', projectLeader.trim())
      formData.append('purpose', purpose.trim())
      if (startFile) {
        formData.append('startPhoto', startFile)
      }
      
      // Add location coordinates if available
      if (locationData.latitude !== null) {
        formData.append('clockInLat', locationData.latitude.toString())
      }
      if (locationData.longitude !== null) {
        formData.append('clockInLng', locationData.longitude.toString())
      }

      // ... rest of submission logic ...
    }
  }
}
```

#### 5. Updated OvertimeClockOut Component

Similar modifications for clock-out location capture.

### API Interfaces

#### Clock In Request Body

```typescript
interface ClockInRequest {
  location: string           // Existing: text location description
  projectLeader: string       // Existing
  purpose: string            // Existing
  startPhoto: File           // Existing
  clockInLat?: string        // New: optional latitude
  clockInLng?: string        // New: optional longitude
}
```

#### Clock Out Request Body

```typescript
interface ClockOutRequest {
  proofPhoto: File           // Existing
  clockOutLat?: string       // New: optional latitude
  clockOutLng?: string       // New: optional longitude
}
```

#### API Response (unchanged)

Existing response structures remain the same. Location data is stored but not returned in responses.

## Data Models

### Database Schema Changes

Add four new columns to the `overtime_sessions` table:

```sql
-- Migration: add_location_tracking_columns.sql

ALTER TABLE overtime_sessions
  ADD COLUMN clock_in_lat DECIMAL(10, 8) NULL,
  ADD COLUMN clock_in_lng DECIMAL(11, 8) NULL,
  ADD COLUMN clock_out_lat DECIMAL(10, 8) NULL,
  ADD COLUMN clock_out_lng DECIMAL(11, 8) NULL;

-- Add comments for documentation
COMMENT ON COLUMN overtime_sessions.clock_in_lat IS 'GPS latitude captured at clock in (-90 to 90)';
COMMENT ON COLUMN overtime_sessions.clock_in_lng IS 'GPS longitude captured at clock in (-180 to 180)';
COMMENT ON COLUMN overtime_sessions.clock_out_lat IS 'GPS latitude captured at clock out (-90 to 90)';
COMMENT ON COLUMN overtime_sessions.clock_out_lng IS 'GPS longitude captured at clock out (-180 to 180)';

-- Add check constraints for valid coordinate ranges
ALTER TABLE overtime_sessions
  ADD CONSTRAINT check_clock_in_lat_range 
    CHECK (clock_in_lat IS NULL OR (clock_in_lat >= -90 AND clock_in_lat <= 90)),
  ADD CONSTRAINT check_clock_in_lng_range 
    CHECK (clock_in_lng IS NULL OR (clock_in_lng >= -180 AND clock_in_lng <= 180)),
  ADD CONSTRAINT check_clock_out_lat_range 
    CHECK (clock_out_lat IS NULL OR (clock_out_lat >= -90 AND clock_out_lat <= 90)),
  ADD CONSTRAINT check_clock_out_lng_range 
    CHECK (clock_out_lng IS NULL OR (clock_out_lng >= -180 AND clock_out_lng <= 180));

-- Add index for potential location-based queries
CREATE INDEX idx_overtime_sessions_clock_in_location 
  ON overtime_sessions(clock_in_lat, clock_in_lng) 
  WHERE clock_in_lat IS NOT NULL AND clock_in_lng IS NOT NULL;

CREATE INDEX idx_overtime_sessions_clock_out_location 
  ON overtime_sessions(clock_out_lat, clock_out_lng) 
  WHERE clock_out_lat IS NOT NULL AND clock_out_lng IS NOT NULL;
```

### Data Type Rationale

- **DECIMAL(10, 8)** for latitude: Provides ~1.1mm precision, sufficient for GPS accuracy
- **DECIMAL(11, 8)** for longitude: Accounts for -180 to 180 range with same precision
- **NULL allowed**: Supports optional location capture and graceful degradation
- **Check constraints**: Ensures data integrity for coordinate ranges

### TypeScript Type Updates

```typescript
// Update existing OvertimeSession type
interface OvertimeSession {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  location: string
  project_leader: string
  purpose: string
  status: 'active' | 'completed' | 'cancelled'
  start_photo_url: string | null
  // New fields
  clock_in_lat: number | null
  clock_in_lng: number | null
  clock_out_lat: number | null
  clock_out_lng: number | null
  created_at: string
  updated_at: string
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid coordinates are stored with sessions

*For any* valid GPS coordinates (latitude between -90 and 90, longitude between -180 and 180) returned by the Geolocation API during clock in or clock out, the system should store those exact coordinate values with the overtime session.

**Validates: Requirements 1.2, 2.2**

### Property 2: Geolocation errors never block clock operations

*For any* geolocation error type (permission denied, position unavailable, timeout), the clock in or clock out operation should complete successfully with null location values, and the operation should not be delayed or prevented.

**Validates: Requirements 1.3, 2.3, 7.1, 7.2, 8.1, 8.2, 8.3**

### Property 3: Coordinates are stored as decimal numbers in valid ranges

*For any* stored location coordinate, if the value is not null, it must be a decimal number where latitude is between -90 and 90 (inclusive) and longitude is between -180 and 180 (inclusive).

**Validates: Requirements 1.4, 2.4, 6.1, 6.2, 6.3, 6.4**

### Property 4: Null coordinates are accepted and stored

*For any* clock in or clock out operation where geolocation returns null coordinates, the system should accept the null values and successfully store the session with null location fields.

**Validates: Requirements 6.5**

### Property 5: Two-location URL contains two markers

*For any* pair of valid coordinates (clock-in and clock-out locations both non-null), the generated Google Maps URL should contain two marker parameters in the format "markers=lat1,lng1&markers=lat2,lng2".

**Validates: Requirements 3.2, 4.2, 5.2, 5.4**

### Property 6: Single-location URL contains one marker

*For any* single valid coordinate (either clock-in or clock-out location non-null, the other null), the generated Google Maps URL should contain one marker parameter in the format "query=lat,lng" or "markers=lat,lng".

**Validates: Requirements 3.3, 4.3, 5.1, 5.3**

### Property 7: URL format uses Google Maps API base

*For any* generated location URL (one or two markers), the URL should start with "https://www.google.com/maps/search/?api=1" or "https://www.google.com/maps" base path.

**Validates: Requirements 5.5**

### Property 8: No error messages displayed on location failure

*For any* geolocation error or failure, the user interface should not display error messages or alerts related to location capture - the operation should proceed silently.

**Validates: Requirements 7.3**

### Property 9: Clock operations complete promptly

*For any* clock in or clock out operation, the operation should complete within a reasonable time (under 15 seconds) regardless of geolocation API response time, ensuring the timeout mechanism prevents indefinite delays.

**Validates: Requirements 7.4**

## Error Handling

### Geolocation Error Scenarios

The system must handle all geolocation failure modes gracefully:

1. **Permission Denied (PERMISSION_DENIED)**
   - User explicitly denies location access
   - Browser blocks location access due to security policy
   - Action: Proceed with null coordinates, no user-facing error

2. **Position Unavailable (POSITION_UNAVAILABLE)**
   - GPS hardware unavailable
   - Network location services down
   - Indoor location with no signal
   - Action: Proceed with null coordinates, no user-facing error

3. **Timeout (TIMEOUT)**
   - Geolocation request exceeds 10-second timeout
   - Action: Proceed with null coordinates, no user-facing error

4. **Browser Not Supported**
   - `navigator.geolocation` is undefined
   - Action: Proceed with null coordinates, no user-facing error

### Error Handling Implementation

```typescript
// Geolocation error handling pattern
const getCurrentPosition = async (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    // Handle unsupported browsers
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null, error: null })
      return
    }

    // Set timeout to prevent indefinite waiting
    const timeoutId = setTimeout(() => {
      resolve({ latitude: null, longitude: null, error: null })
    }, 10000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        })
      },
      (error) => {
        clearTimeout(timeoutId)
        // All errors result in null coordinates - silent failure
        resolve({ latitude: null, longitude: null, error })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}
```

### API Error Handling

The API layer should validate coordinate values when present:

```typescript
// API validation for coordinates
function validateCoordinates(lat: string | null, lng: string | null): boolean {
  if (lat === null && lng === null) {
    return true // Null coordinates are valid
  }
  
  if (lat === null || lng === null) {
    return false // Both must be present or both null
  }
  
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return false
  }
  
  if (latitude < -90 || latitude > 90) {
    return false
  }
  
  if (longitude < -180 || longitude > 180) {
    return false
  }
  
  return true
}
```

### Database Constraint Errors

The database check constraints will prevent invalid coordinate values:

- If latitude is outside -90 to 90 range: Constraint violation
- If longitude is outside -180 to 180 range: Constraint violation
- Action: Return 500 error to client (this should never happen with proper API validation)

### UI Error States

The UI should never display location-specific errors to users. However, existing error handling for clock in/out operations remains:

- Photo upload failures: Display error message
- Network failures: Display error message
- Validation failures: Display error message
- Location capture failures: Silent (no error message)

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and integration points
- **Property tests**: Verify universal properties across randomized inputs

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) to implement the correctness properties defined above.

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: overtime-location-tracking, Property {N}: {description}`

**Property Test Examples:**

```typescript
// Example property test for Property 1
import fc from 'fast-check'

describe('Feature: overtime-location-tracking, Property 1: Valid coordinates are stored', () => {
  it('should store any valid GPS coordinates with the session', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90 }), // latitude
        fc.double({ min: -180, max: 180 }), // longitude
        async (lat, lng) => {
          // Create session with coordinates
          const session = await createOvertimeSession({
            clockInLat: lat,
            clockInLng: lng
          })
          
          // Verify coordinates are stored exactly
          expect(session.clock_in_lat).toBeCloseTo(lat, 8)
          expect(session.clock_in_lng).toBeCloseTo(lng, 8)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Example property test for Property 5
describe('Feature: overtime-location-tracking, Property 5: Two-location URL', () => {
  it('should generate URL with two markers for any pair of valid coordinates', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        fc.double({ min: -90, max: 90 }),
        fc.double({ min: -180, max: 180 }),
        (lat1, lng1, lat2, lng2) => {
          const url = generateGoogleMapsUrl(
            { latitude: lat1, longitude: lng1 },
            { latitude: lat2, longitude: lng2 }
          )
          
          // URL should contain two marker parameters
          expect(url).toContain('markers=')
          const markerCount = (url.match(/markers=/g) || []).length
          expect(markerCount).toBe(2)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Testing

Unit tests should focus on:

1. **Specific Examples**
   - Clock in triggers geolocation request
   - Clock out triggers geolocation request
   - Location link appears in admin list view
   - Location link appears in detail view
   - No location link when coordinates are null
   - Location link has target="_blank" attribute
   - Timeout is set to 10 seconds

2. **Edge Cases**
   - Permission denied error handling
   - Position unavailable error handling
   - Timeout error handling
   - Browser without geolocation support
   - Partial coordinates (one null, one present) rejected by API
   - Boundary values (exactly -90, 90, -180, 180)

3. **Integration Points**
   - Geolocation hook integrates with clock in component
   - Geolocation hook integrates with clock out component
   - API accepts optional location parameters
   - Database stores and retrieves coordinates correctly
   - Admin UI fetches and displays location data

4. **Component Testing**
   - LocationLink component renders correctly with various inputs
   - LocationLink component returns null when no coordinates
   - OvertimeClockIn captures location before submission
   - OvertimeClockOut captures location before submission
   - Admin table displays location links

### Test Coverage Goals

- **Frontend components**: 90%+ coverage
- **Geolocation hook**: 100% coverage (critical path)
- **URL generation utility**: 100% coverage
- **API route handlers**: 85%+ coverage
- **Database migrations**: Manual verification + integration tests

### Testing Tools

- **Jest**: Unit test runner
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing
- **MSW (Mock Service Worker)**: API mocking
- **Supabase Test Helpers**: Database testing

### Manual Testing Checklist

Before deployment, manually verify:

- [ ] Clock in captures location on mobile device
- [ ] Clock in works when location is denied
- [ ] Clock in works in airplane mode (no GPS)
- [ ] Clock out captures location on mobile device
- [ ] Clock out works when location is denied
- [ ] Location links open Google Maps correctly
- [ ] Two-marker maps display both locations
- [ ] Single-marker maps display one location
- [ ] No location link appears when coordinates are null
- [ ] Links open in new tab
- [ ] No error messages shown when location fails
- [ ] Clock operations complete within 15 seconds
- [ ] Database stores coordinates with correct precision
- [ ] Existing overtime functionality unchanged

