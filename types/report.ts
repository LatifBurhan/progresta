/**
 * TypeScript Types and Interfaces for Laporan Progres Project
 * Feature: Project Progress Report System
 * 
 * This file contains all type definitions for the project progress report feature,
 * including database models, API request/response types, and UI component props.
 */

/**
 * Lokasi Kerja (Work Location) options
 */
export type LokasiKerja = 'WFA' | 'Al-Wustho' | 'Client Site';

/**
 * Base interface for project_reports table
 * Represents a progress report record in the database
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */
export interface ProjectReport {
  id: string;
  user_id: string;
  project_id: string;
  lokasi_kerja: LokasiKerja;
  pekerjaan_dikerjakan: string;
  kendala: string | null;
  rencana_kedepan: string | null;
  foto_urls: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Extended report interface with joined data from related tables
 * Used for displaying reports in the UI with user and project names
 * Includes computed authorization flags (can_edit, can_delete)
 * 
 * Requirements: 4.5, 5.5
 */
export interface ProjectReportWithDetails extends ProjectReport {
  user_name: string;
  user_foto_profil?: string | null;
  project_name: string;
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * Project interface with divisions
 * Used for project selection dropdown
 * 
 * Requirements: 1.1, 1.2
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  tujuan?: string;
  pic?: string;
  prioritas?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status?: string;
  lampiran_files?: string[];
  isActive: boolean;
  createdBy?: string;
  urgency?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  divisions: Division[];
}

/**
 * Division interface
 * Represents a division/department in the organization
 */
export interface Division {
  id: string;
  name: string;
  color: string;
}

/**
 * Request body for creating a new report
 * All fields except optional ones (kendala, rencana_kedepan) are required
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */
export interface CreateReportRequest {
  project_id: string;
  lokasi_kerja: LokasiKerja;
  pekerjaan_dikerjakan: string;
  kendala?: string;
  rencana_kedepan?: string;
  foto_urls: string[];
}

/**
 * Request body for updating an existing report
 * All fields are optional to allow partial updates
 * 
 * Requirements: 2.3, 2.4
 */
export interface UpdateReportRequest {
  id: string;
  project_id?: string;
  lokasi_kerja?: LokasiKerja;
  pekerjaan_dikerjakan?: string;
  kendala?: string;
  rencana_kedepan?: string;
  foto_urls?: string[];
}

/**
 * Query parameters for filtering reports
 * Used in GET /api/reports/list endpoint
 * 
 * Requirements: 4.2, 4.3, 5.2, 5.3, 10.5
 */
export interface ReportFilters {
  project_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of photo upload operation
 * Contains the storage path and public URL for accessing the photo
 * 
 * Requirements: 6.5, 6.9
 */
export interface PhotoUploadResult {
  path: string;
  publicUrl: string;
}

/**
 * API response wrapper for successful operations
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API response wrapper for failed operations
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

/**
 * Generic API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Response type for report creation
 */
export interface CreateReportResponse {
  id: string;
  created_at: string;
}

/**
 * Response type for report update
 */
export interface UpdateReportResponse {
  id: string;
  updated_at: string;
}

/**
 * Response type for report list query
 * Includes pagination metadata
 * 
 * Requirements: 4.4, 4.5, 5.4, 5.5
 */
export interface ListReportsResponse {
  reports: ProjectReportWithDetails[];
  total: number;
  has_more: boolean;
}

/**
 * Response type for active projects query
 * 
 * Requirements: 1.1, 1.2
 */
export interface ListProjectsResponse {
  projects: Project[];
}

/**
 * Form data structure for ReportForm component
 * Used for managing form state in React
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export interface ReportFormData {
  project_id: string;
  lokasi_kerja: LokasiKerja;
  pekerjaan_dikerjakan: string;
  kendala: string;
  rencana_kedepan: string;
  foto_urls: string[];
}

/**
 * Validation error structure
 * Maps field names to error messages
 */
export interface ValidationErrors {
  [field: string]: string;
}
