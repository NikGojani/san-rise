-- ===============================================
-- SUPABASE STORAGE SETUP - VEREINFACHT
-- ===============================================
-- Führen Sie diese Befehle in der Supabase SQL Editor aus

-- 1. Storage Buckets erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'employee-files', 'employee-files', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'employee-files');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'contract-files', 'contract-files', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contract-files');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'additional-costs', 'additional-costs', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'additional-costs');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'event-files', 'event-files', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'event-files');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'task-files', 'task-files', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'task-files');

-- 2. Storage Policies erstellen (ohne Owner-Probleme)
-- Employee Files Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload employee files') THEN
        CREATE POLICY "Allow authenticated users to upload employee files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'employee-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view employee files') THEN
        CREATE POLICY "Allow authenticated users to view employee files" ON storage.objects
            FOR SELECT USING (bucket_id = 'employee-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update employee files') THEN
        CREATE POLICY "Allow authenticated users to update employee files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'employee-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete employee files') THEN
        CREATE POLICY "Allow authenticated users to delete employee files" ON storage.objects
            FOR DELETE USING (bucket_id = 'employee-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Contract Files Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload contract files') THEN
        CREATE POLICY "Allow authenticated users to upload contract files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'contract-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view contract files') THEN
        CREATE POLICY "Allow authenticated users to view contract files" ON storage.objects
            FOR SELECT USING (bucket_id = 'contract-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update contract files') THEN
        CREATE POLICY "Allow authenticated users to update contract files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'contract-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete contract files') THEN
        CREATE POLICY "Allow authenticated users to delete contract files" ON storage.objects
            FOR DELETE USING (bucket_id = 'contract-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Additional Costs Files Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload additional cost files') THEN
        CREATE POLICY "Allow authenticated users to upload additional cost files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view additional cost files') THEN
        CREATE POLICY "Allow authenticated users to view additional cost files" ON storage.objects
            FOR SELECT USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update additional cost files') THEN
        CREATE POLICY "Allow authenticated users to update additional cost files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete additional cost files') THEN
        CREATE POLICY "Allow authenticated users to delete additional cost files" ON storage.objects
            FOR DELETE USING (bucket_id = 'additional-costs' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Event Files Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload event files') THEN
        CREATE POLICY "Allow authenticated users to upload event files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'event-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view event files') THEN
        CREATE POLICY "Allow authenticated users to view event files" ON storage.objects
            FOR SELECT USING (bucket_id = 'event-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update event files') THEN
        CREATE POLICY "Allow authenticated users to update event files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'event-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete event files') THEN
        CREATE POLICY "Allow authenticated users to delete event files" ON storage.objects
            FOR DELETE USING (bucket_id = 'event-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Task Files Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload task files') THEN
        CREATE POLICY "Allow authenticated users to upload task files" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'task-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view task files') THEN
        CREATE POLICY "Allow authenticated users to view task files" ON storage.objects
            FOR SELECT USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update task files') THEN
        CREATE POLICY "Allow authenticated users to update task files" ON storage.objects
            FOR UPDATE USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete task files') THEN
        CREATE POLICY "Allow authenticated users to delete task files" ON storage.objects
            FOR DELETE USING (bucket_id = 'task-files' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- ✅ ERFOLGREICH! Alle Storage Buckets und Policies wurden erstellt. 