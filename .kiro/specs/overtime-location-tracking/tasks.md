# Implementation Plan: Overtime Location Tracking

## Overview

This implementation adds GPS location tracking to the overtime clock in/out system. The approach follows a bottom-up strategy: first create the database schema and utility functions, then build the geolocation capture mechanism, integrate it into clock components, update API routes to handle location data, and finally add location display in the admin UI. All location capture is optional and non-blocking to ensure core overtime functionality remains reliable.

## Tasks

- [x] 1. Create database migration for location columns
  - Create SQL migration file to add four nullable decimal columns to overtime_sessions table
  - Add check constraints to validate coordinate ranges (lat: -90 to 90, lng: -180 to 180)
  - Add partial indexes for location-based queries
  - Add column comments for documentation
  - Run migration against database
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Create geolocation hook and utilities
  - [x] 2.1 Create useGeolocation hook
    - Create lib/hooks/useGeolocation.ts with getCurrentPosition function
    - Implement 10-second timeout mechanism
    - Handle all error cases silently (return null coordinates)
    - Support browsers without geolocation API
    - _Requirements: 1.1, 1.3, 2.1, 2.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 2.2 Write property test for geolocation hook
    - **Property 2: Geolocation errors never block clock operations**
    - **Validates: Requirements 1.3, 2.3, 7.1, 7.2, 8.1, 8.2, 8.3**
  
  - [x] 2.3 Create Google Maps URL generator utility
    - Create lib/overtime/location.ts with generateGoogleMapsUrl function
    - Handle single location (one marker)
    - Handle two locations (two markers)
    - Return null when no locations provided
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 2.4 Write property tests for URL generator
    - **Property 5: Two-location URL contains two markers**
    - **Property 6: Single-location URL contains one marker**
    - **Property 7: URL format uses Google Maps API base**
    - **Validates: Requirements 3.2, 3.3, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 3. Create LocationLink component
  - [x] 3.1 Create LocationLink component
    - Create components/overtime/LocationLink.tsx
    - Accept clock in/out coordinates as props
    - Use generateGoogleMapsUrl utility
    - Render link with location icon
    - Return null when no coordinates available
    - Add target="_blank" and rel="noopener noreferrer"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 3.2 Write unit tests for LocationLink component
    - Test rendering with both locations
    - Test rendering with only clock-in location
    - Test rendering with only clock-out location
    - Test null return when no locations
    - Test link opens in new tab
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Update OvertimeClockIn component
  - [x] 4.1 Integrate geolocation into clock-in flow
    - Import useGeolocation hook
    - Call getCurrentPosition before form submission
    - Add clockInLat and clockInLng to FormData when available
    - Ensure location capture doesn't block submission
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 4.2 Write property test for clock-in location capture
    - **Property 1: Valid coordinates are stored with sessions**
    - **Property 3: Coordinates are stored as decimal numbers in valid ranges**
    - **Property 4: Null coordinates are accepted and stored**
    - **Validates: Requirements 1.2, 1.4, 2.4, 6.1, 6.2, 6.5**

- [x] 5. Update OvertimeClockOut component
  - [x] 5.1 Integrate geolocation into clock-out flow
    - Import useGeolocation hook
    - Call getCurrentPosition before form submission
    - Add clockOutLat and clockOutLng to FormData when available
    - Ensure location capture doesn't block submission
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 5.2 Write property test for clock-out location capture
    - **Property 1: Valid coordinates are stored with sessions**
    - **Property 3: Coordinates are stored as decimal numbers in valid ranges**
    - **Property 4: Null coordinates are accepted and stored**
    - **Validates: Requirements 2.2, 2.4, 6.3, 6.4, 6.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update clock-in API route
  - [x] 7.1 Extend clock-in API to accept location parameters
    - Update app/api/overtime/clock-in/route.ts
    - Extract optional clockInLat and clockInLng from FormData
    - Validate coordinates if present (both must be present or both null)
    - Validate coordinate ranges (-90 to 90 for lat, -180 to 180 for lng)
    - Add clock_in_lat and clock_in_lng to database insert
    - _Requirements: 1.2, 1.4, 6.1, 6.2, 6.5_
  
  - [ ]* 7.2 Write unit tests for clock-in API validation
    - Test API accepts valid coordinates
    - Test API accepts null coordinates
    - Test API rejects partial coordinates (one null, one present)
    - Test API rejects out-of-range coordinates
    - Test API rejects non-numeric coordinates
    - _Requirements: 1.2, 1.4, 6.1, 6.2, 6.5_

- [x] 8. Update clock-out API route
  - [x] 8.1 Extend clock-out API to accept location parameters
    - Update app/api/overtime/clock-out/route.ts
    - Extract optional clockOutLat and clockOutLng from FormData
    - Validate coordinates if present (both must be present or both null)
    - Validate coordinate ranges (-90 to 90 for lat, -180 to 180 for lng)
    - Add clock_out_lat and clock_out_lng to database update
    - _Requirements: 2.2, 2.4, 6.3, 6.4, 6.5_
  
  - [ ]* 8.2 Write unit tests for clock-out API validation
    - Test API accepts valid coordinates
    - Test API accepts null coordinates
    - Test API rejects partial coordinates (one null, one present)
    - Test API rejects out-of-range coordinates
    - Test API rejects non-numeric coordinates
    - _Requirements: 2.2, 2.4, 6.3, 6.4, 6.5_

- [x] 9. Update admin UI to display location links
  - [x] 9.1 Add location link column to admin table
    - Update app/dashboard/overtime/admin/OvertimeAdminClient.tsx
    - Import LocationLink component
    - Add "Lokasi" column header to table
    - Add LocationLink component in table body for each request
    - Pass clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng props
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 9.2 Update API to fetch location data
    - Update /api/overtime/requests route to select location columns
    - Ensure clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng are included in response
    - Update TypeScript interfaces to include location fields
    - _Requirements: 3.1, 4.1_
  
  - [ ]* 9.3 Write integration tests for admin UI location display
    - Test location link appears when coordinates exist
    - Test location link hidden when coordinates are null
    - Test clicking link opens Google Maps in new tab
    - Test two-marker URL for complete sessions
    - Test single-marker URL for incomplete sessions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update TypeScript types
  - [x] 11.1 Update OvertimeSession interface
    - Add clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng fields
    - Set all location fields as nullable numbers
    - Update type definitions in relevant files
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 12. Write property test for timeout mechanism
  - **Property 9: Clock operations complete promptly**
  - **Validates: Requirements 7.4, 8.4**

- [ ]* 13. Write property test for silent error handling
  - **Property 8: No error messages displayed on location failure**
  - **Validates: Requirements 7.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Location capture is non-blocking - failures never prevent clock in/out operations
- All location fields are nullable to support graceful degradation
- Database constraints ensure data integrity for coordinate ranges
