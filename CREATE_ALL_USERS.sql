-- Erstelle alle Benutzer für San Rise
-- Alle haben zunächst das Passwort "wirwollengeld"
-- 
-- ANLEITUNG: Führe dieses SQL im Supabase SQL Editor aus
--
-- Login Daten:
-- Nik (Admin): wirwollengeld
-- Adrian (Admin): wirwollengeld
-- Peen (Team): wirwollengeld  
-- Stury (Team): wirwollengeld

INSERT INTO users (
  username, 
  display_name, 
  email, 
  password_hash, 
  role, 
  avatar, 
  is_active, 
  created_at, 
  last_login
) VALUES 
  -- Admins
  ('Nik', 'Nik', 'nik@sanrise.de', '$2b$10$MTCZJsN9fbPUmSWIe/ddbOibWRy9rGJjlZrFlRUQg..vyrHOqN/Vy', 'admin', NULL, true, NOW(), NULL),
  ('Adrian', 'Adrian', 'adrian@sanrise.de', '$2b$10$Ij00iKEx.0yz.LZ8md0jvOly1mDW9lw8thymGqcscN/X3iaO70GBi', 'admin', NULL, true, NOW(), NULL),
  -- Team Mitglieder  
  ('Peen', 'Peen', 'peen@sanrise.de', '$2b$10$Y.z.Ed3.55RPvcj091WB0eYDwXL0pEzSTQaFxFXkfK5KqJUfjw9BK', 'team', NULL, true, NOW(), NULL),
  ('Stury', 'Stury', 'stury@sanrise.de', '$2b$10$LrEoof2LgdK1PNnGme7Bf.vFJVLZb05.4uvIuCnF6XGYWH7L3R38K', 'team', NULL, true, NOW(), NULL)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = true;

-- Bestätige dass alle User erstellt wurden
SELECT username, display_name, email, role, is_active, created_at 
FROM users 
ORDER BY role DESC, username; 