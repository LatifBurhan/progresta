import { NextResponse } from 'next/server'

export type OvertimeErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACTIVE_SESSION_EXISTS'
  | 'NO_ACTIVE_SESSION'
  | 'MISSING_FIELDS'
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'EDIT_WINDOW_EXPIRED'
  | 'ALREADY_APPROVED'
  | 'NOT_FOUND'

export function overtimeError(
  code: OvertimeErrorCode,
  message: string,
  status: number,
  details?: Record<string, string[]>
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
