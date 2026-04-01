import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // 1. Create the user in Auth
  // We use signUp here. In Production, you should use service_role key for admin actions.
  const email = 'admin@agrodryer.com'
  const password = 'adminpassword'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Super Admin',
      }
    }
  })

  if (authError) {
    // If user already exists, it might return an error or just return the user depending on Supabase settings
    if (authError.message.includes('already registered')) {
        return NextResponse.json({ message: 'User already exists' }, { status: 200 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
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

  return NextResponse.json({ 
    message: 'Superadmin created successfully', 
    user: { id: user.id, email: user.email },
    profile
  })
}
