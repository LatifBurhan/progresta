import { supabaseAdmin } from '@/lib/supabase'

export async function getActiveSession(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('overtime_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data
}

export interface GetOvertimeRequestsOptions {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}

export async function getOvertimeRequests(
  userId: string,
  options: GetOvertimeRequestsOptions = {}
) {
  const { limit = 20, offset = 0, dateFrom, dateTo } = options

  let query = supabaseAdmin
    .from('overtime_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export interface GetAllOvertimeRequestsOptions {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
  approvalStatus?: 'pending' | 'approved'
}

export async function getAllOvertimeRequests(
  options: GetAllOvertimeRequestsOptions = {}
) {
  const { limit = 20, offset = 0, dateFrom, dateTo, approvalStatus } = options

  let query = supabaseAdmin
    .from('overtime_requests')
    .select('*, users(email, name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)
  if (approvalStatus) query = query.eq('approval_status', approvalStatus)

  const { data, error } = await query
  if (error) throw error
  return data
}
