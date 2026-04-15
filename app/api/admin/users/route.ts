import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Standard client for auth check
// Admin client for user management
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables (URL or SERVICE_ROLE_KEY)");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

const checkAdmin = async () => {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { 
      allowed: false, 
      error: "Sesi login tidak ditemukan. Silakan login ulang.",
      diagnostics: { userError: userError?.message }
    };
  }

  const adminClient = getAdminClient();
  
  // Use maybeSingle to avoid "Cannot coerce" error when 0 rows found
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return { 
      allowed: false, 
      error: "Gagal membaca profil dari database.",
      diagnostics: { profileError: profileError.message, userId: user.id }
    };
  }

  // Auto-create profile if it doesn't exist yet
  if (!profile) {
    const meta = user.user_metadata || {};
    const defaultRole = (meta.role || 'admin').toLowerCase();
    await adminClient.from('profiles').upsert({
      id: user.id,
      full_name: meta.full_name || user.email?.split('@')[0] || 'User',
      role: defaultRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    // If auto-created with admin role, allow through
    if (['admin', 'administrator', 'superadmin'].includes(defaultRole)) {
      return { allowed: true, userId: user.id };
    }
    return {
      allowed: false,
      error: "Profil baru dibuat otomatis, tapi role bukan admin.",
      diagnostics: { autoCreatedRole: defaultRole, userId: user.id }
    };
  }

  const roleData = (profile.role || "").toLowerCase().trim();
  const adminRoles = ['admin', 'administrator', 'superadmin'];
  
  if (!adminRoles.includes(roleData)) {
    return { 
      allowed: false, 
      error: `Role Anda '${roleData}' tidak memiliki akses admin.`,
      diagnostics: { detectedRole: roleData, userId: user.id }
    };
  }

  return { allowed: true, userId: user.id };
};

export async function GET() {
  const auth = await checkAdmin();
  if (!auth.allowed) {
    return NextResponse.json({ 
      error: "Unauthorized", 
      message: auth.error,
      diagnostics: auth.diagnostics 
    }, { status: 401 });
  }

  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await checkAdmin();
  if (!auth.allowed) {
    return NextResponse.json({ 
      error: "Unauthorized", 
      message: auth.error,
      diagnostics: auth.diagnostics 
    }, { status: 401 });
  }

  try {
    const { email, password, full_name, role } = await req.json();
    const adminClient = getAdminClient();

    // 1. Create User in Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) throw authError;

    // 2. Create Profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name,
        role,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // Cleanup if profile fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await checkAdmin();
  if (!auth.allowed) {
    return NextResponse.json({ 
      error: "Unauthorized", 
      message: auth.error,
      diagnostics: auth.diagnostics 
    }, { status: 401 });
  }

  try {
    const { id, full_name, role, password } = await req.json();
    const adminClient = getAdminClient();

    // 1. Update Password if provided
    if (password) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
        password: password
      });
      if (authError) throw authError;
    }

    // 2. Update Profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await checkAdmin();
  if (!auth.allowed) {
    return NextResponse.json({ 
      error: "Unauthorized", 
      message: auth.error,
      diagnostics: auth.diagnostics 
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = getAdminClient();

    // Delete from Auth (this usually triggers cascade to profiles if set up, but let's be safe)
    const { error } = await adminClient.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
