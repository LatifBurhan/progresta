export function isPayslipManager(role: string): boolean {
  return ['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(role)
}

export function canManagePayslip(role: string): boolean {
  return isPayslipManager(role)
}
