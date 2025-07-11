-- CREATE_EMPLOYEES_TABLE_COMPLETE.sql
-- Komplette Neuerstellung der employees Tabelle mit Nik, Adrian und Sebastian Tury

-- Erstelle die employees Tabelle neu
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "grossSalary" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "netSalary" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "additionalCostsPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
  address TEXT,
  "startDate" DATE,
  email TEXT UNIQUE,
  phone TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Füge die ursprünglichen Mitarbeiter ein
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
  "isActive",
  files
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
  true,
  '[]'::jsonb
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
  true,
  '[]'::jsonb
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
  true,
  '[]'::jsonb
);

-- Erstelle Indexes für bessere Performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_active ON employees("isActive");
CREATE INDEX idx_employees_name ON employees(name);

-- RLS (Row Level Security) aktivieren
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy für authenticated users
CREATE POLICY "Enable read access for authenticated users" ON employees
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON employees
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON employees
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON employees
FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Prüfung der eingefügten Daten
SELECT 
  id,
  name,
  role,
  "grossSalary",
  "netSalary",
  "additionalCostsPercentage",
  "isActive",
  email
FROM employees 
ORDER BY name;

-- Berechne Gesamtkosten zur Kontrolle
SELECT 
  name,
  "grossSalary",
  ("grossSalary" * "additionalCostsPercentage" / 100) AS "additionalCosts",
  ("grossSalary" + ("grossSalary" * "additionalCostsPercentage" / 100)) AS "totalMonthlyCosts"
FROM employees 
WHERE "isActive" = true
ORDER BY name; 