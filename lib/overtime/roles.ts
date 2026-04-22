export function isGeneralAffair(role: string): boolean {
  return role === 'GENERAL_AFFAIR'
}

export function canApproveOvertime(role: string): boolean {
  return ['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(role)
}
