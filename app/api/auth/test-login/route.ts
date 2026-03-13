import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    await createSession({
      userId: '35fd9a31-5400-43f4-8806-8a5356c39579', // HRD user ID
      email,
      role,
      name: 'HRD Test'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}