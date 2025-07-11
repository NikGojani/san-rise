-- SIMPLE_EMPLOYEES_SETUP.sql
-- Einfache Erstellung der employees Tabelle

-- Lösche die Tabelle falls sie existiert
DROP TABLE IF EXISTS employees;

-- Erstelle die employees Tabelle neu (einfacher)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "grossSalary" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "netSalary" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "additionalCostsPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
  address TEXT,
  "startDate" TEXT,
  email TEXT,
  phone TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  files JSONB DEFAULT '[]'::jsonb
);

-- Füge die drei Mitarbeiter ein
INSERT INTO employees (
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
  'Nik Gojani',
  'CEO & Founder',
  5500.00,
  3200.00,
  25.00,
  'Hauptstraße 1, 12345 Berlin',
  '2023-01-01',
  'nik@sanrise.de',
  '+49 123 456 789',
  true
),
(
  'Adrian Henningsen', 
  'CTO & Co-Founder',
  5200.00,
  3000.00,
  25.00,
  'Techstraße 2, 12345 Berlin',
  '2023-01-01',
  'adrian@sanrise.de',
  '+49 123 456 790',
  true
),
(
  'Sebastian Tury',
  'Event Manager', 
  4200.00,
  2600.00,
  22.00,
  'Eventstraße 3, 12345 Berlin',
  '2023-02-01',
  'sebastian@sanrise.de',
  '+49 123 456 791',
  true
);

-- Prüfe das Ergebnis
SELECT 
  name,
  role,
  "grossSalary",
  "isActive"
FROM employees
ORDER BY name; 