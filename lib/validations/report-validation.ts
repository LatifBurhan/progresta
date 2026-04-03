/**
 * Report Validation Utilities
 * Feature: Laporan Progres Project
 * 
 * This module provides validation functions for project progress reports,
 * including form validation, photo file validation, and edit permission checks.
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.8, 1.9, 2.1, 2.2, 6.2, 6.3, 6.4
 */

import type { CreateReportRequest, LokasiKerja, ProjectReport } from '@/types/report';

/**
 * Validation error structure
 * Maps field names to error messages
 */
export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Validates report form data for client-side validation
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.8
 * 
 * @param data - Report form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validateReportForm(data: CreateReportRequest): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Requirement 1.3: Project must be selected
  if (!data.project_id || data.project_id.trim() === '') {
    errors.project_id = 'Project harus dipilih';
  }
  
  // Requirement 1.4: Work location must be selected
  if (!data.lokasi_kerja) {
    errors.lokasi_kerja = 'Lokasi kerja harus dipilih';
  } else {
    // Validate lokasi_kerja is one of the allowed values
    const validLocations: LokasiKerja[] = ['Remote', 'Kantor', 'Lokasi Proyek'];
    if (!validLocations.includes(data.lokasi_kerja)) {
      errors.lokasi_kerja = 'Lokasi kerja tidak valid';
    }
  }
  
  // Requirement 1.5: Work description is required
  if (!data.pekerjaan_dikerjakan || data.pekerjaan_dikerjakan.trim() === '') {
    errors.pekerjaan_dikerjakan = 'Pekerjaan yang dikerjakan harus diisi';
  }
  
  // Photos are optional (Requirement 8.1, 8.2)
  // Only validate count if photos are provided
  if (data.foto_urls && data.foto_urls.length > 5) {
    errors.foto_urls = 'Maksimal 5 foto dapat diupload';
  }
  
  return errors;
}

/**
 * Validates photo files for format and count
 * 
 * Requirements: 1.8, 1.9, 6.2, 6.3, 6.4, 8.1
 * 
 * @param files - FileList object from file input
 * @returns Error message if validation fails, null if valid
 */
export function validatePhotoFiles(files: FileList | File[]): string | null {
  // Requirement 1.9, 6.4: Allowed photo formats
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  
  const fileArray = Array.from(files);
  
  // Requirement 8.1: Photos are optional, so 0 files is valid
  if (fileArray.length === 0) {
    return null;
  }
  
  // Requirement 6.3: Maximum 5 photos
  if (fileArray.length > 5) {
    return 'Maksimal 5 foto dapat dipilih';
  }
  
  // Requirement 1.9, 6.4: Validate each file format
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    if (!allowedFormats.includes(file.type)) {
      return `File ${file.name} bukan format JPG/PNG yang valid`;
    }
  }
  
  return null;
}

/**
 * Checks if a report can be edited by the user
 * Edit is allowed only on the same day as creation
 * 
 * Requirements: 2.1, 2.2
 * 
 * @param report - The report to check
 * @param userId - The ID of the user attempting to edit
 * @returns true if edit is allowed, false otherwise
 */
export function canEditReport(report: ProjectReport, userId: string): boolean {
  // Requirement 2.1: User must be the report creator
  if (report.user_id !== userId) {
    return false;
  }
  
  // Requirement 2.2: Current date must equal creation date
  const reportDate = new Date(report.created_at);
  const today = new Date();
  
  // Compare dates (ignore time)
  const isSameDay = 
    reportDate.getFullYear() === today.getFullYear() &&
    reportDate.getMonth() === today.getMonth() &&
    reportDate.getDate() === today.getDate();
  
  return isSameDay;
}

/**
 * Validates that a lokasi_kerja value is one of the allowed options
 * 
 * @param lokasiKerja - The work location to validate
 * @returns true if valid, false otherwise
 */
export function isValidLokasiKerja(lokasiKerja: string): lokasiKerja is LokasiKerja {
  const validLocations: LokasiKerja[] = ['Remote', 'Kantor', 'Lokasi Proyek'];
  return validLocations.includes(lokasiKerja as LokasiKerja);
}

/**
 * Validates that all required fields are present in the report data
 * Photos are optional (Requirement 8.1)
 * 
 * @param data - Partial report data to validate
 * @returns true if all required fields are present, false otherwise
 */
export function hasRequiredFields(data: Partial<CreateReportRequest>): boolean {
  return !!(
    data.project_id &&
    data.lokasi_kerja &&
    data.pekerjaan_dikerjakan
    // foto_urls is optional, so not checked here
  );
}
