/**
 * Foto URLs Parser and Serializer
 * Feature: Laporan Progres Project
 * 
 * This module provides functions for serializing and deserializing photo URL arrays
 * to/from PostgreSQL TEXT[] format, with validation and error handling.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */

/**
 * Serializes an array of photo URLs to PostgreSQL TEXT[] format
 * 
 * Requirement 11.1: Serialize array to TEXT[] for database storage
 * 
 * @param urls - Array of photo URLs to serialize
 * @returns Array ready for PostgreSQL TEXT[] column
 */
export function serializeFotoUrls(urls: string[]): string[] {
  // PostgreSQL TEXT[] can directly accept string arrays in most drivers
  // This function ensures the format is correct and validates the input
  
  if (!Array.isArray(urls)) {
    console.error('serializeFotoUrls: Input is not an array', urls);
    return [];
  }
  
  // Filter out any null, undefined, or empty strings
  const validUrls = urls.filter(url => 
    url !== null && 
    url !== undefined && 
    typeof url === 'string' && 
    url.trim() !== ''
  );
  
  return validUrls;
}

/**
 * Deserializes PostgreSQL TEXT[] to JavaScript array of strings
 * 
 * Requirement 11.2: Parse TEXT[] from database to JavaScript array
 * Requirement 11.5: Graceful error handling for malformed data
 * 
 * @param data - Data from database (TEXT[] or string)
 * @returns Array of photo URLs, or empty array if parsing fails
 */
export function deserializeFotoUrls(data: unknown): string[] {
  try {
    // If already an array, validate and return
    if (Array.isArray(data)) {
      return data.filter(item => typeof item === 'string' && item.trim() !== '');
    }
    
    // If it's a string (PostgreSQL array literal format like "{url1,url2}")
    if (typeof data === 'string') {
      // Remove curly braces and split by comma
      const cleaned = data.trim();
      
      // Handle empty array representation
      if (cleaned === '{}' || cleaned === '') {
        return [];
      }
      
      // Remove outer braces if present
      const withoutBraces = cleaned.startsWith('{') && cleaned.endsWith('}')
        ? cleaned.slice(1, -1)
        : cleaned;
      
      // Split by comma and clean each URL
      const urls = withoutBraces
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
      
      return urls;
    }
    
    // If null or undefined, return empty array
    if (data === null || data === undefined) {
      return [];
    }
    
    // Requirement 11.5: Log error for unexpected data types
    console.error('deserializeFotoUrls: Unexpected data type', typeof data, data);
    return [];
    
  } catch (error) {
    // Requirement 11.5: Graceful error handling
    console.error('deserializeFotoUrls: Error parsing foto_urls', error, data);
    return [];
  }
}

/**
 * Validates that a URL is a valid Supabase Storage URL
 * 
 * Requirement 11.3: Validate Storage URL format
 * 
 * @param url - URL to validate
 * @returns true if valid Storage URL, false otherwise
 */
export function validateStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    // Check if it's a valid URL
    const urlObj = new URL(url);
    
    // Check if it's a Supabase Storage URL
    // Format: https://{project}.supabase.co/storage/v1/object/public/project-report-photos/{path}
    const isSupabaseStorage = 
      urlObj.protocol === 'https:' &&
      urlObj.hostname.includes('supabase') &&
      urlObj.pathname.includes('/storage/') &&
      urlObj.pathname.includes('/project-report-photos/');
    
    return isSupabaseStorage;
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

/**
 * Validates an array of photo URLs
 * 
 * @param urls - Array of URLs to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateFotoUrlsArray(urls: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(urls)) {
    return { valid: false, error: 'foto_urls must be an array' };
  }
  
  if (urls.length < 1) {
    return { valid: false, error: 'At least 1 photo URL is required' };
  }
  
  if (urls.length > 5) {
    return { valid: false, error: 'Maximum 5 photo URLs allowed' };
  }
  
  // Validate each URL
  for (let i = 0; i < urls.length; i++) {
    if (!validateStorageUrl(urls[i])) {
      return { 
        valid: false, 
        error: `Invalid storage URL at index ${i}: ${urls[i]}` 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Extracts the file path from a Supabase Storage URL
 * 
 * @param url - Full Supabase Storage URL
 * @returns File path within the bucket, or null if extraction fails
 */
export function extractPathFromStorageUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Extract path after /project-report-photos/
    const match = urlObj.pathname.match(/\/project-report-photos\/(.+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('extractPathFromStorageUrl: Error extracting path', error);
    return null;
  }
}

/**
 * Tests the round-trip property: serialize -> deserialize -> serialize
 * Should produce equivalent arrays
 * 
 * Requirement 11.4: Round-trip property validation
 * 
 * @param urls - Original array of URLs
 * @returns true if round-trip preserves data, false otherwise
 */
export function testRoundTrip(urls: string[]): boolean {
  try {
    const serialized = serializeFotoUrls(urls);
    const deserialized = deserializeFotoUrls(serialized);
    const reSerialized = serializeFotoUrls(deserialized);
    
    // Compare arrays
    if (serialized.length !== reSerialized.length) {
      return false;
    }
    
    for (let i = 0; i < serialized.length; i++) {
      if (serialized[i] !== reSerialized[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('testRoundTrip: Error during round-trip test', error);
    return false;
  }
}
