-- Calculator Events Tabelle erstellen
CREATE TABLE calculator_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ticket_count INTEGER NOT NULL DEFAULT 0,
    ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    vk_percentage INTEGER NOT NULL DEFAULT 100,
    termine INTEGER NOT NULL DEFAULT 1,
    gema_percentage DECIMAL(5,2) NOT NULL DEFAULT 9,
    marketing_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    artist_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    location_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    merchandiser_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    travel_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    rabatt DECIMAL(10,2) NOT NULL DEFAULT 0,
    aufbauhelfer DECIMAL(10,2) NOT NULL DEFAULT 0,
    variable_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    ticketing_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE calculator_events ENABLE ROW LEVEL SECURITY;

-- Policy für alle CRUD-Operationen (angepasst je nach Ihren Authentifizierungsanforderungen)
CREATE POLICY "Allow all operations on calculator_events for authenticated users" ON calculator_events
FOR ALL USING (auth.role() = 'authenticated');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calculator_events_updated_at 
    BEFORE UPDATE ON calculator_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Index für bessere Performance
CREATE INDEX idx_calculator_events_date ON calculator_events(date);
CREATE INDEX idx_calculator_events_created_at ON calculator_events(created_at); 