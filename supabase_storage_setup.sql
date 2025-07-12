-- Supabase Storage Setup für Datei-Uploads
-- Diese SQL-Befehle müssen im Supabase Dashboard unter "SQL Editor" ausgeführt werden

-- 1. Storage Buckets erstellen
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', true),
('contracts', 'contracts', true),
('events', 'events', true),
('employees', 'employees', true),
('tasks', 'tasks', true),
('additional-costs', 'additional-costs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies für authenticated users

-- Additional Costs Bucket Policies (Neue Policies zuerst, da sie am wichtigsten sind)
CREATE POLICY "Additional Costs are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');

CREATE POLICY "Additional Costs are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'additional-costs' 
  AND auth.role() = 'authenticated'
  AND (LOWER(RIGHT(name, 4)) = '.pdf' 
    OR LOWER(RIGHT(name, 4)) = '.doc' 
    OR LOWER(RIGHT(name, 5)) = '.docx'
    OR LOWER(RIGHT(name, 4)) = '.jpg'
    OR LOWER(RIGHT(name, 5)) = '.jpeg'
    OR LOWER(RIGHT(name, 4)) = '.png')
);

CREATE POLICY "Additional Costs are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');

CREATE POLICY "Additional Costs are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');

-- Documents Bucket Policies
CREATE POLICY "Documents are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Documents are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Documents are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Documents are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Contracts Bucket Policies
CREATE POLICY "Contracts are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Contracts are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Contracts are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Contracts are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- Events Bucket Policies
CREATE POLICY "Events are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'events' AND auth.role() = 'authenticated');

CREATE POLICY "Events are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'events' AND auth.role() = 'authenticated');

CREATE POLICY "Events are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'events' AND auth.role() = 'authenticated');

CREATE POLICY "Events are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'events' AND auth.role() = 'authenticated');

-- Employees Bucket Policies
CREATE POLICY "Employees are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'employees' AND auth.role() = 'authenticated');

CREATE POLICY "Employees are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'employees' AND auth.role() = 'authenticated');

CREATE POLICY "Employees are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'employees' AND auth.role() = 'authenticated');

CREATE POLICY "Employees are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'employees' AND auth.role() = 'authenticated');

-- Tasks Bucket Policies
CREATE POLICY "Tasks are viewable by authenticated users" ON storage.objects 
FOR SELECT USING (bucket_id = 'tasks' AND auth.role() = 'authenticated');

CREATE POLICY "Tasks are insertable by authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'tasks' AND auth.role() = 'authenticated');

CREATE POLICY "Tasks are updatable by authenticated users" ON storage.objects 
FOR UPDATE USING (bucket_id = 'tasks' AND auth.role() = 'authenticated');

CREATE POLICY "Tasks are deletable by authenticated users" ON storage.objects 
FOR DELETE USING (bucket_id = 'tasks' AND auth.role() = 'authenticated');

-- 3. RLS für storage.objects aktivieren (falls noch nicht aktiv)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Maximale Dateigröße für Uploads setzen (15MB)
UPDATE storage.buckets 
SET max_file_size = 15728640  -- 15MB in Bytes
WHERE id = 'additional-costs'; 