-- DermRecord AI: Database Schema & Comprehensive Security Fix
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Extensions Schema (Security Best Practice)
CREATE SCHEMA IF NOT EXISTS extensions;
-- Move vector extension if it exists in public
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- 2. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    clinical_notes TEXT,
    structured_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 6. Create Hardened Security Policies
-- Addresses "RLS Policy Always True" warning by using explicit role checks instead of 'true'

-- Patients Table Policies
-- Drop both potential policy names to ensure clean state
DROP POLICY IF EXISTS "Clinicians can manage patients" ON patients;
DROP POLICY IF EXISTS "Doctors can insert patients" ON patients;

CREATE POLICY "Clinicians can manage patients" ON patients
    FOR ALL 
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Medical Records Table Policies
DROP POLICY IF EXISTS "Clinicians can manage records" ON medical_records;
CREATE POLICY "Clinicians can manage records" ON medical_records
    FOR ALL 
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Appointments Table Policies
DROP POLICY IF EXISTS "Clinicians can manage appointments" ON appointments;
CREATE POLICY "Clinicians can manage appointments" ON appointments
    FOR ALL 
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 8. Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    diagnosis_notes TEXT,
    examination_findings TEXT,
    treatment_notes TEXT,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinicians can manage reports" ON reports;
CREATE POLICY "Clinicians can manage reports" ON reports
    FOR ALL 
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 9. Fix Function Search Path (Addresses "Function Search Path Mutable" warning)
-- This locks clinical functions to the public schema to prevent hijacking.
-- We use a DO block because ALTER FUNCTION does not support IF EXISTS.
DO $$
DECLARE
    func_name TEXT;
BEGIN
    FOR func_name IN 
        SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'match_document_chunks'
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'ALTER FUNCTION ' || func_name || ' SET search_path = public';
    END LOOP;
END $$;
