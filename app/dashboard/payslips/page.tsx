import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { getPayslipsByUser } from '@/lib/payslip/queries'
import PayslipEmployeeClient from './PayslipEmployeeClient'

export default async function PayslipEmployeePage() {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }

  let initialPayslips = []
  try {
    initialPayslips = await getPayslipsByUser(session.userId)
  } catch {
    // proceed with empty
  }

  return <PayslipEmployeeClient initialPayslips={initialPayslips} />
}
