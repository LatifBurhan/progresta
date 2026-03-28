/**
 * Verification script for photo upload utilities
 * Run with: npx tsx lib/storage/verify-photo-upload.ts
 */

import { extractStoragePathFromUrl } from './photo-upload';

console.log('Testing extractStoragePathFromUrl function...\n');

// Test case 1: Valid Supabase URL
const url1 = 'https://ltdsbtelfetmgrxgoudf.supabase.co/storage/v1/object/public/project-report-photos/user123/report456/1234567890_photo.jpg';
const path1 = extractStoragePathFromUrl(url1);
console.log('Test 1 - Valid URL:');
console.log('  Input:', url1);
console.log('  Output:', path1);
console.log('  Expected: user123/report456/1234567890_photo.jpg');
console.log('  Status:', path1 === 'user123/report456/1234567890_photo.jpg' ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 2: URL with query parameters
const url2 = 'https://ltdsbtelfetmgrxgoudf.supabase.co/storage/v1/object/public/project-report-photos/user123/report456/photo.jpg?token=abc123';
const path2 = extractStoragePathFromUrl(url2);
console.log('Test 2 - URL with query params:');
console.log('  Input:', url2);
console.log('  Output:', path2);
console.log('  Expected: user123/report456/photo.jpg');
console.log('  Status:', path2 === 'user123/report456/photo.jpg' ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 3: Invalid URL
const url3 = 'https://example.com/invalid/url';
const path3 = extractStoragePathFromUrl(url3);
console.log('Test 3 - Invalid URL:');
console.log('  Input:', url3);
console.log('  Output:', path3);
console.log('  Expected: null');
console.log('  Status:', path3 === null ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 4: Empty string
const url4 = '';
const path4 = extractStoragePathFromUrl(url4);
console.log('Test 4 - Empty string:');
console.log('  Input: (empty string)');
console.log('  Output:', path4);
console.log('  Expected: null');
console.log('  Status:', path4 === null ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Verification complete!');
