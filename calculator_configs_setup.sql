-- Calculator Configurations Tabelle erstellen
-- Diese Tabelle speichert die Calculator-spezifischen Berechnungsparameter für Events
CREATE TABLE calculator_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Basis-Parameter
    vk_percentage INTEGER NOT NULL DEFAULT 100,
    termine INTEGER NOT NULL DEFAULT 1,
    gema_percentage DECIMAL(5,2) NOT NULL DEFAULT 9,
    
    -- Kosten-Parameter
    marketing_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    artist_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    location_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    merchandiser_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    travel_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    rabatt DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Optionale Kosten
    aufbauhelfer DECIMAL(10,2) NOT NULL DEFAULT 0,
    variable_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
    ticketing_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: Ein Event kann nur eine Calculator-Config haben
    UNIQUE(event_id)
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE calculator_configs ENABLE ROW LEVEL SECURITY;

-- Policy für alle CRUD-Operationen
CREATE POLICY "Allow all operations on calculator_configs for authenticated users" ON calculator_configs
FOR ALL USING (auth.role() = 'authenticated');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calculator_configs_updated_at 
    BEFORE UPDATE ON calculator_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Index für bessere Performance
CREATE INDEX idx_calculator_configs_event_id ON calculator_configs(event_id);
CREATE INDEX idx_calculator_configs_created_at ON calculator_configs(created_at);

-- Kommentare zur Dokumentation
COMMENT ON TABLE calculator_configs IS 'Speichert Calculator-spezifische Berechnungsparameter für Events';
COMMENT ON COLUMN calculator_configs.event_id IS 'Referenz zum Event aus der events Tabelle';
COMMENT ON COLUMN calculator_configs.vk_percentage IS 'Verkaufsprozentsatz (0-100)';
COMMENT ON COLUMN calculator_configs.termine IS 'Anzahl Termine pro Monat';
COMMENT ON COLUMN calculator_configs.gema_percentage IS 'GEMA-Prozentsatz';
COMMENT ON COLUMN calculator_configs.ticketing_fee IS 'Ticketing Fee - wenn > 0 wird Shopify Fee automatisch berechnet'; 