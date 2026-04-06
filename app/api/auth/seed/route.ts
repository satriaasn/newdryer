import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryEmail = searchParams.get('email')
  
  const supabase = createRouteHandlerClient({ cookies })

  // 1. Create the user in Auth
  const email = queryEmail || 'admin@agrodryer.com'
  const password = 'adminpassword'

  console.log('Attempting to seed user:', email)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: 'Super Admin',
      }
    }
  })

  if (authError) {
    console.error('Auth Error:', authError)
    if (authError.message.includes('already registered')) {
        return NextResponse.json({ message: 'User already exists', email }, { status: 200 })
    }
    return NextResponse.json({ error: authError.message, details: authError }, { status: 400 })
  }

  const user = authData.user
  if (!user) return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })

  // 2. Create the profile in the profiles table
  // Note: Supabase often has a trigger to automatically create profiles.
  // We check if it exists first.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: 'Super Admin',
      role: 'admin', // Using 'admin' as the primary high-level role
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // 3. Initialize app_settings with default branding
  const { data: settings, error: settingsError } = await supabase
    .from('app_settings')
    .upsert({
      id: 1,
      app_name: 'Dashboard Monitoring Hibah Dryer',
      app_slogan: 'Real-time oversight of national agricultural drying infrastructure',
      copyright: '© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved.',
      updated_at: new Date().toISOString()
    })
    .select()

  if (settingsError) {
    console.error('Settings Seed Error (ensure table exists):', settingsError)
  }

  return NextResponse.json({ 
    message: 'Superadmin created successfully', 
    user: { id: user.id, email: user.email },
    profile,
    settings
  })
}
