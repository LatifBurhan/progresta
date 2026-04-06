# Requirements Document

## Introduction

This feature adds GPS location tracking to the existing overtime (lembur) clock in/clock out system. The system will capture and store GPS coordinates when staff clock in and clock out for overtime work, and display these locations to General Affair/Admin users via Google Maps links. Location capture is optional to handle cases where GPS is unavailable or denied by the user.

## Glossary

- **Overtime_System**: The existing system that manages overtime work sessions including clock in/clock out functionality
- **Staff**: Employees who perform overtime work and use the clock in/clock out features
- **Admin**: General Affair or Admin users who view and manage overtime records
- **GPS_Coordinates**: Latitude and longitude values captured from the device's location services
- **Clock_In_Location**: GPS coordinates captured when staff starts an overtime session
- **Clock_Out_Location**: GPS coordinates captured when staff ends an overtime session
- **Location_Link**: A Google Maps URL that displays one or more location pins
- **Geolocation_API**: Browser's native navigator.geolocation interface for accessing device location

## Requirements

### Requirement 1: Capture Clock In Location

**User Story:** As a staff member, I want my location to be captured when I clock in for overtime, so that my actual work location is recorded.

#### Acceptance Criteria

1. WHEN Staff clicks "Clock In" for overtime, THE Overtime_System SHALL request GPS_Coordinates from the Geolocation_API
2. WHEN the Geolocation_API returns coordinates, THE Overtime_System SHALL store the Clock_In_Location with the overtime session
3. IF the Geolocation_API fails or is denied, THEN THE Overtime_System SHALL allow the clock in to proceed without location data
4. THE Overtime_System SHALL store Clock_In_Location as latitude and longitude decimal values

### Requirement 2: Capture Clock Out Location

**User Story:** As a staff member, I want my location to be captured when I clock out from overtime, so that my ending work location is recorded.

#### Acceptance Criteria

1. WHEN Staff clicks "Clock Out" for overtime, THE Overtime_System SHALL request GPS_Coordinates from the Geolocation_API
2. WHEN the Geolocation_API returns coordinates, THE Overtime_System SHALL store the Clock_Out_Location with the overtime session
3. IF the Geolocation_API fails or is denied, THEN THE Overtime_System SHALL allow the clock out to proceed without location data
4. THE Overtime_System SHALL store Clock_Out_Location as latitude and longitude decimal values

### Requirement 3: Display Location Links in Overtime List

**User Story:** As an Admin, I want to see a location link in the overtime list table, so that I can quickly verify staff locations without opening details.

#### Acceptance Criteria

1. WHEN Admin views the overtime list, THE Overtime_System SHALL display a "Lihat Lokasi" link for each overtime record
2. WHEN both Clock_In_Location and Clock_Out_Location exist, THE Location_Link SHALL open Google Maps with two pins
3. WHEN only Clock_In_Location exists, THE Location_Link SHALL open Google Maps with one pin
4. WHEN both locations are empty, THE Overtime_System SHALL hide or disable the Location_Link
5. THE Location_Link SHALL open in a new browser tab

### Requirement 4: Display Location Links in Overtime Detail Page

**User Story:** As an Admin, I want to see a location link in the overtime detail page, so that I can view staff locations while reviewing complete overtime information.

#### Acceptance Criteria

1. WHEN Admin views an overtime detail page, THE Overtime_System SHALL display a "Lihat Lokasi" link
2. WHEN both Clock_In_Location and Clock_Out_Location exist, THE Location_Link SHALL open Google Maps with two pins labeled for clock in and clock out
3. WHEN only Clock_In_Location exists, THE Location_Link SHALL open Google Maps with one pin labeled for clock in
4. WHEN both locations are empty, THE Overtime_System SHALL hide or disable the Location_Link
5. THE Location_Link SHALL open in a new browser tab

### Requirement 5: Generate Google Maps URLs

**User Story:** As an Admin, I want location data to be displayed via simple Google Maps links, so that I can view locations without requiring API keys or embedded maps.

#### Acceptance Criteria

1. WHEN generating a Location_Link with one location, THE Overtime_System SHALL create a Google Maps URL with a single marker parameter
2. WHEN generating a Location_Link with two locations, THE Overtime_System SHALL create a Google Maps URL with two marker parameters
3. THE Overtime_System SHALL format marker parameters as "markers=lat,lng" for single locations
4. THE Overtime_System SHALL format marker parameters as "markers=lat1,lng1&markers=lat2,lng2" for multiple locations
5. THE Location_Link SHALL use the format "https://www.google.com/maps/search/?api=1&query=lat,lng" or equivalent multi-marker format

### Requirement 6: Store Location Data in Database

**User Story:** As a system administrator, I want GPS coordinates stored in the database, so that location data persists with overtime records.

#### Acceptance Criteria

1. THE Overtime_System SHALL store Clock_In_Location latitude as a decimal number
2. THE Overtime_System SHALL store Clock_In_Location longitude as a decimal number
3. THE Overtime_System SHALL store Clock_Out_Location latitude as a decimal number
4. THE Overtime_System SHALL store Clock_Out_Location longitude as a decimal number
5. THE Overtime_System SHALL allow null values for all location fields to support optional location capture

### Requirement 7: Handle Location Permission Denials

**User Story:** As a staff member, I want to be able to clock in/out even if I deny location permissions, so that I can still record my overtime work.

#### Acceptance Criteria

1. IF the Geolocation_API returns a permission denied error, THEN THE Overtime_System SHALL proceed with clock in without location data
2. IF the Geolocation_API returns a permission denied error, THEN THE Overtime_System SHALL proceed with clock out without location data
3. THE Overtime_System SHALL not display error messages to Staff when location capture fails
4. THE Overtime_System SHALL not block or delay the clock in/out process while waiting for location data

### Requirement 8: Handle Location Unavailability

**User Story:** As a staff member, I want to be able to clock in/out when GPS is unavailable, so that technical issues don't prevent me from recording overtime.

#### Acceptance Criteria

1. IF the Geolocation_API returns a position unavailable error, THEN THE Overtime_System SHALL proceed with clock in without location data
2. IF the Geolocation_API returns a position unavailable error, THEN THE Overtime_System SHALL proceed with clock out without location data
3. IF the Geolocation_API times out, THEN THE Overtime_System SHALL proceed with clock in/out without location data
4. THE Overtime_System SHALL set a timeout of 10 seconds maximum for location requests
