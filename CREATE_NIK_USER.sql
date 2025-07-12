-- Create Nik User in Supabase
-- This script creates the Nik user with admin privileges

-- First, create the user in auth.users (this should be done via Supabase Auth API)
-- Then insert the user data into the users table

INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID from auth.users
    'nik@sanrise.de',
    '$2a$10$hashedpasswordhere', -- Replace with actual hashed password
    'Nik Gojani',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Note: The actual user creation should be done via the Supabase Auth API
-- This SQL is just for reference and manual insertion if needed 