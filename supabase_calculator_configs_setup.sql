-- Calculator Configs Tabelle für Event-Konfigurationen
CREATE TABLE IF NOT EXISTS public.calculator_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    vk_percentage NUMERIC DEFAULT 100,
    termine INTEGER DEFAULT 1,
    gema_percentage NUMERIC DEFAULT 9.0,
    marketing_costs NUMERIC DEFAULT 0,
    artist_costs NUMERIC DEFAULT 0,
    location_costs NUMERIC DEFAULT 0,
    merchandiser_costs NUMERIC DEFAULT 0,
    travel_costs NUMERIC DEFAULT 0,
    rabatt NUMERIC DEFAULT 0,
    aufbauhelfer NUMERIC DEFAULT 0,
    variable_costs NUMERIC DEFAULT 0,
    ticketing_fee NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id)
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE public.calculator_configs ENABLE ROW LEVEL SECURITY;

-- Policy für authenticated users - alle Operationen erlauben
CREATE POLICY "Calculator configs are viewable by authenticated users" ON public.calculator_configs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Calculator configs are insertable by authenticated users" ON public.calculator_configs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Calculator configs are updatable by authenticated users" ON public.calculator_configs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Calculator configs are deletable by authenticated users" ON public.calculator_configs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Index für bessere Performance bei event_id Abfragen
CREATE INDEX IF NOT EXISTS idx_calculator_configs_event_id ON public.calculator_configs(event_id);

-- Trigger für automatisches Update der updated_at Spalte
CREATE OR REPLACE FUNCTION update_calculator_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculator_configs_updated_at
    BEFORE UPDATE ON public.calculator_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_calculator_configs_updated_at(); 