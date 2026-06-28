import { createClient } from '@supabase/supabase-js';

// NOTE: You need to set SUPABASE_SERVICE_ROLE_KEY in your environment variables!
// You can get this from your Supabase project settings > API > Project API keys > service_role secret
const SUPABASE_URL = 'https://ilpsaouboehkkeigibui.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = 'admin@khala.com';
  const password = 'Admin123!';

  console.log('Creating admin user...');

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Khala Admin',
      role: 'admin',
    },
  });

  if (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }

  console.log('Admin user created successfully!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
}

createAdminUser();
