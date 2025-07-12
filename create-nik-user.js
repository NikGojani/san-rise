const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNikUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('nik123', 10);
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'nik@sanrise.de',
      password: 'nik123',
      email_confirm: true,
      user_metadata: {
        name: 'Nik Gojani'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created successfully:', authData.user);

    // Insert user data into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: 'nik@sanrise.de',
          password: hashedPassword,
          name: 'Nik Gojani',
          role: 'admin'
        }
      ])
      .select();

    if (userError) {
      console.error('Error inserting user data:', userError);
      return;
    }

    console.log('User data inserted successfully:', userData);
    console.log('Nik user created successfully!');

  } catch (error) {
    console.error('Error creating Nik user:', error);
  }
}

createNikUser(); 