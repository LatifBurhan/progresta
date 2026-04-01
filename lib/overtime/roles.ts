export function isGeneralAffair(role: string): boolean {
  return role === 'GENERAL_AFFAIR'
}

export function canApproveOvertime(role: string): boolean {
  return isGeneralAffair(role)
}
