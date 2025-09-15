
const { createClient } = require('@supabase/supabase-js');

const projectId = 'lpcdzmolfrcdwieqpgwm';
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!adminEmail || !adminPassword || !supabaseServiceKey) {
  console.error('Please provide ADMIN_EMAIL, ADMIN_PASSWORD, and SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(`https://${projectId}.supabase.co`, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  // Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const adminUser = users.find(user => user.email === adminEmail);

  if (adminUser) {
    console.log('Admin user already exists. Updating metadata to ensure admin role.');
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { user_metadata: { role: 'admin' } }
    );

    if (updateError) {
      console.error('Error updating admin user metadata:', updateError);
    } else {
      console.log('Admin user metadata updated successfully:', updatedUser);
    }
    return;
  }

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  });

  if (error) {
    console.error('Error creating admin user:', error);
  } else {
    console.log('Admin user created successfully:', data);
  }
}

createAdmin();
