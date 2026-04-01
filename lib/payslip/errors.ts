import { NextResponse } from 'next/server'

export type PayslipErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_PERIODE'
  | 'INVALID_STATUS_TRANSITION'
  | 'NEGATIVE_VALUE'
  | 'MISSING_FIELDS'
  | 'INVALID_PERIODE'
  | 'INVALID_REQUEST'
  | 'ACKNOWLEDGED_IMMUTABLE'
  | 'PUBLISH_NON_DRAFT'
  | 'ACKNOWLEDGE_NON_PUBLISHED'
  | 'PDF_GENERATION_FAILED'
  | 'SERVER_ERROR'

export function payslipError(
  code: PayslipErrorCode,
  message: string,
  status: number,
  details?: Record<string, string>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
