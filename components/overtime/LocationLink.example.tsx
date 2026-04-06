/**
 * Example usage of LocationLink component
 * This file demonstrates how to use the LocationLink component in different scenarios
 */

import { LocationLink } from './LocationLink'

// Example 1: Both clock in and clock out locations
export function ExampleBothLocations() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Both Locations Available</h3>
      <LocationLink
        clockInLat={-6.2088}
        clockInLng={106.8456}
        clockOutLat={-6.2146}
        clockOutLng={106.8451}
      />
    </div>
  )
}

// Example 2: Only clock in location
export function ExampleClockInOnly() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Clock In Location Only</h3>
      <LocationLink
        clockInLat={-6.2088}
        clockInLng={106.8456}
        clockOutLat={null}
        clockOutLng={null}
      />
    </div>
  )
}

// Example 3: Only clock out location
export function ExampleClockOutOnly() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Clock Out Location Only</h3>
      <LocationLink
        clockInLat={null}
        clockInLng={null}
        clockOutLat={-6.2146}
        clockOutLng={106.8451}
      />
    </div>
  )
}

// Example 4: No locations (component returns null)
export function ExampleNoLocations() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">No Locations (Nothing Rendered)</h3>
      <LocationLink
        clockInLat={null}
        clockInLng={null}
        clockOutLat={null}
        clockOutLng={null}
      />
      <p className="text-gray-500 text-sm mt-2">
        (Component returns null when no coordinates are available)
      </p>
    </div>
  )
}

// Example 5: Usage in a table row
export function ExampleInTable() {
  const overtimeSession = {
    id: '123',
    user_name: 'John Doe',
    start_time: '2024-01-15 08:00',
    end_time: '2024-01-15 17:00',
    clock_in_lat: -6.2088,
    clock_in_lng: 106.8456,
    clock_out_lat: -6.2146,
    clock_out_lng: 106.8451
  }

  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>User</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{overtimeSession.user_name}</td>
          <td>{overtimeSession.start_time}</td>
          <td>{overtimeSession.end_time}</td>
          <td>
            <LocationLink
              clockInLat={overtimeSession.clock_in_lat}
              clockInLng={overtimeSession.clock_in_lng}
              clockOutLat={overtimeSession.clock_out_lat}
              clockOutLng={overtimeSession.clock_out_lng}
            />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// Example 6: Custom styling
export function ExampleCustomStyling() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Custom Styling</h3>
      <LocationLink
        clockInLat={-6.2088}
        clockInLng={106.8456}
        clockOutLat={-6.2146}
        clockOutLng={106.8451}
        className="font-bold underline"
      />
    </div>
  )
}
