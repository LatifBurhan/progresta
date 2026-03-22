import { NextRequest, NextResponse } from 'next/server'
import { loginAction } from '@/app/actions/auth-actions'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    console.log('=== LOGIN DEBUG START ===')
    console.log('Email:', formData.get('email'))
    console.log('Password length:', (formData.get('password') as string)?.length)
    
    // Call the actual login action
    const result = await loginAction(null, formData)
    
    console.log('Login action result:', result)
    console.log('=== LOGIN DEBUG END ===')
    
    return NextResponse.json({
      success: true,
      loginActionResult: result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Login debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}