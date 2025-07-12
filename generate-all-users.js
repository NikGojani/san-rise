const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  {
    email: 'nik@sanrise.de',
    password: 'nik123',
    name: 'Nik Gojani',
    role: 'admin'
  },
  {
    email: 'admin@sanrise.de',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'user@sanrise.de',
    password: 'user123',
    name: 'Regular User',
    role: 'user'
  }
];

async function generateAllUsers() {
  try {
    for (const user of users) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      console.log(`Auth user created successfully: ${user.email}`);

      // Insert user data into users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: user.email,
            password: hashedPassword,
            name: user.name,
            role: user.role
          }
        ])
        .select();

      if (userError) {
        console.error(`Error inserting user data for ${user.email}:`, userError);
        continue;
      }

      console.log(`User data inserted successfully: ${user.email}`);
    }

    console.log('All users generated successfully!');

  } catch (error) {
    console.error('Error generating users:', error);
  }
}

generateAllUsers(); 