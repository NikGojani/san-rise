-- RESTORE_ORIGINAL_EMPLOYEES.sql
-- Wiederherstellung der ursprünglichen Mitarbeiter

-- Lösche die aktuellen Test-Mitarbeiter
DELETE FROM employees WHERE name IN ('Anna Schmidt', 'Max Mustermann');

-- Füge die ursprünglichen Mitarbeiter wieder ein
INSERT INTO employees (
  id,
  name,
  role,
  "grossSalary",
  "netSalary",
  "additionalCostsPercentage",
  address,
  "startDate",
  email,
  phone,
  "isActive"
) VALUES 
(
  'nik-gojani-001',
  'Nik Gojani',
  'CEO & Founder',
  5500,
  3200,
  25,
  'Hauptstraße 1, 12345 Berlin',
  '2023-01-01',
  'nik@sanrise.de',
  '+49 123 456 789',
  true
),
(
  'adrian-henningsen-002',
  'Adrian Henningsen',
  'CTO & Co-Founder',
  5200,
  3000,
  25,
  'Techstraße 2, 12345 Berlin',
  '2023-01-01',
  'adrian@sanrise.de',
  '+49 123 456 790',
  true
),
(
  'sebastian-tury-003',
  'Sebastian Tury',
  'Event Manager',
  4200,
  2600,
  22,
  'Eventstraße 3, 12345 Berlin',
  '2023-02-01',
  'sebastian@sanrise.de',
  '+49 123 456 791',
  true
);

-- Prüfung der eingefügten Daten
SELECT 
  name,
  role,
  "grossSalary",
  "netSalary",
  "isActive"
FROM employees 
ORDER BY name; 