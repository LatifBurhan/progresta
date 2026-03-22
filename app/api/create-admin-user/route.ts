import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Create admin user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@progresta.com',
      password: '123456',
      email_confirm: true
    })
    
    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 500 })
    }
    
    // Create user record in database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        email: 'admin@progresta.com',
        role: 'ADMIN',
        status_pending: false
      }])
      .select()
      .single()
    
    if (dbError) {
      console.error('❌ Database user creation failed:', dbError)
      return NextResponse.json({
        success: false,
        error: dbError.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      }
    })
    
  } catch (error: any) {
    console.error('❌ Create admin user failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}