import { supabaseAdmin } from '@/lib/supabase'

/**
 * Roles that can manage payslips across ALL departments
 * These roles are not restricted by department
 */
const UNRESTRICTED_ROLES = ['GENERAL_AFFAIR', 'CEO', 'ADMIN']

/**
 * Check if user role can access all departments
 */
export function canAccessAllDepartments(role: string): boolean {
  return UNRESTRICTED_ROLES.includes(role)
}

/**
 * Get admin's department ID
 * Returns null if user has unrestricted access (GENERAL_AFFAIR, CEO, ADMIN)
 * Returns the first department the admin belongs to for other roles
 */
export async function getAdminDepartment(userId: string, userRole: string): Promise<string | null> {
  // Unrestricted roles can access all departments
  if (canAccessAllDepartments(userRole)) {
    return null
  }

  const { data, error } = await supabaseAdmin
    .from('user_departments')
    .select('department_id')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching admin department:', error)
    return null
  }
  
  return data?.department_id || null
}

/**
 * Get department name by ID
 */
export async function getDepartmentName(departmentId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select('name')
    .eq('id', departmentId)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching department name:', error)
    return null
  }
  
  return data?.name || null
}

/**
 * Check if all users belong to the specified department
 */
export async function validateUsersDepartment(
  userIds: string[],
  departmentId: string
): Promise<{ valid: boolean; invalidUsers: string[] }> {
  const { data, error } = await supabaseAdmin
    .from('user_departments')
    .select('user_id')
    .eq('department_id', departmentId)
    .in('user_id', userIds)
  
  if (error) {
    console.error('Error validating users department:', error)
    return { valid: false, invalidUsers: userIds }
  }
  
  const validUserIds = new Set(data?.map(d => d.user_id) || [])
  const invalidUsers = userIds.filter(id => !validUserIds.has(id))
  
  return {
    valid: invalidUsers.length === 0,
    invalidUsers
  }
}
