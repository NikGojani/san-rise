-- Additional Supabase Tables Setup
-- This file contains SQL commands for additional tables needed in Supabase

-- Create calculator_configs table
CREATE TABLE IF NOT EXISTS calculator_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calculator_events table
CREATE TABLE IF NOT EXISTS calculator_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_data JSONB NOT NULL,
    config_id UUID REFERENCES calculator_configs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create corporate_costs table
CREATE TABLE IF NOT EXISTS corporate_costs (
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

-- Create employee_costs table
CREATE TABLE IF NOT EXISTS employee_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE calculator_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for calculator_configs
CREATE POLICY "Enable read access for all users" ON calculator_configs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON calculator_configs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON calculator_configs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON calculator_configs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for calculator_events
CREATE POLICY "Enable read access for all users" ON calculator_events
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON calculator_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON calculator_events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON calculator_events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for corporate_costs
CREATE POLICY "Enable read access for all users" ON corporate_costs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON corporate_costs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON corporate_costs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON corporate_costs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for employee_costs
CREATE POLICY "Enable read access for all users" ON employee_costs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON employee_costs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON employee_costs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON employee_costs
    FOR DELETE USING (auth.role() = 'authenticated'); 