-- Supabase Missing Tables Setup
-- This file contains the SQL commands to create missing tables in Supabase

-- Create additional_costs table
CREATE TABLE IF NOT EXISTS additional_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT DEFAULT 'SAN RISE GMBH',
    logo_url TEXT,
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (company_name, theme) 
VALUES ('SAN RISE GMBH', 'light')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE additional_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for additional_costs
CREATE POLICY "Enable read access for all users" ON additional_costs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON additional_costs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON additional_costs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON additional_costs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for settings
CREATE POLICY "Enable read access for all users" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON settings
    FOR DELETE USING (auth.role() = 'authenticated'); 