-- Füge das "termine" Feld zur events Tabelle hinzu
-- Führe dieses SQL im Supabase SQL Editor aus

-- Füge die neue Spalte hinzu
ALTER TABLE events 
ADD COLUMN termine INTEGER NOT NULL DEFAULT 2;

-- Aktualisiere bestehende Events mit einem Standard-Wert
UPDATE events 
SET termine = 2 
WHERE termine IS NULL;

-- Kommentar hinzufügen für bessere Dokumentation
COMMENT ON COLUMN events.termine IS 'Anzahl der Termine pro Monat für Calculator-Berechnungen';

-- Bestätige dass die Spalte hinzugefügt wurde
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'termine'; 