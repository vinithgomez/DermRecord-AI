-- DermRecord AI v2 Database Schema (PostgreSQL / Supabase)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'admin')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patients Table
CREATE TABLE public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    contact_number TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Medical Records Table
CREATE TABLE public.medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    clinical_notes TEXT NOT NULL,
    structured_data JSONB, -- Stores NLP extracted symptoms, duration, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Diagnoses Table
CREATE TABLE public.diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
    condition_name TEXT NOT NULL,
    confidence_score NUMERIC,
    status TEXT CHECK (status IN ('suspected', 'confirmed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Appointments Table
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AI Logs Table (Audit trail)
CREATE TABLE public.ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL, -- 'nlp_extraction', 'rag_query', 'report_generation'
    input_data JSONB,
    output_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Knowledge Base Documents (For RAG)
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Document Embeddings (pgvector)
CREATE TABLE public.document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL, -- 768 dimensions for text-embedding-004
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_records_patient ON public.medical_records(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Row Level Security (RLS) Policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Example RLS: Doctors can see all patients (in a real clinic, might be restricted by assignment)
CREATE POLICY "Doctors can view all patients" ON public.patients FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('doctor', 'admin'))
);
CREATE POLICY "Doctors can insert patients" ON public.patients FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('doctor', 'admin'))
);
