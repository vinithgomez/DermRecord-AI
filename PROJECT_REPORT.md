# DermRecord AI: Project Comprehensive Report

DermRecord AI is a production-grade clinical suite designed for dermatologists to manage patient records and leverage advanced Artificial Intelligence (Generative AI, NLP, and RAG) for diagnostic support and clinical documentation.

---

## 1. Executive Summary
DermRecord AI transforms unstructured clinical data into high-quality medical records. It uses Google's Gemini Pro models to bridge the gap between "rough clinical notes" and "formal medical documentation," while providing a multimodal diagnostic assistant for skin conditions.

## 2. Technical Architecture
- **Frontend**: React 19 (Vite) + TypeScript.
- **UI Framework**: Tailwind CSS with shadcn/ui components.
- **Backend Service**: Node.js/Express (handling API proxying and AI context windowing).
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **AI Core**: 
  - **NLP**: Extraction of symptoms, locations, and severity.
  - **RAG (Retrieval-Augmented Generation)**: Grounding summaries in the patient's specific longitudinal history.
  - **Multimodal**: Analyzing skin imagery combined with clinical observations.

---

## 3. Page-by-Page Analysis

### Page 1: Dashboard (`/dashboard`)
- **Purpose**: High-level practice overview.
- **Features**: 
  - Real-time stats (Total Patients, Today's Appointments, Diagnosis Rate).
  - "Quick Actions" panel for rapid patient registration.
  - Recent activity feed showing the latest clinical entries.

### Page 2: Patient Directory (`/patients`)
- **Purpose**: Searchable index of all patient lives.
- **Features**: 
  - Card-based directory with filtering.
  - Quick-view badges for patient status.
  - Responsive design for tablet/desktop use in clinical settings.

### Page 3: Patient Detail & Clinical Timeline (`/patients/:id`)
- **Purpose**: The primary workspace for practitioners during a consultation.
- **Features**:
  - **longitudinal Timeline**: A vertical feed of every clinical encounter.
  - **AI Clinical Note Drafting**: A "Smart Draft" button that analyzes the entire patient history to generate a follow-up visit note automatically.
  - **Smart Extraction**: Real-time NLP that highlights symptoms and anatomical locations discovered in the practitioner's notes.
  - **Patient Summary**: A RAG-driven summary that synthesizes months of records into a 3-sentence clinical overview.

### Page 4: AI Diagnosis Assistant (`/ai-diagnosis`)
- **Purpose**: Decision support tool for skin conditions.
- **Features**:
  - **Multimodal Input**: Accepts high-resolution skin images and descriptive text.
  - **Analysis Engine**: Provides suspected conditions, confidence levels, and suggested clinical next steps (RAG-grounded).
  - **Anatomy Mapping**: Links observations to anatomical regions.

### Page 5: Clinical Reports (`/reports`)
- **Purpose**: Generation of formal legal/medical documentation.
- **Features**:
  - **Manual/AI Hybrid Form**: Practitioners can fill details manually or use the "AI Auto-fill" feature.
  - **Contextual Generation**: AI reads the patient's specific records to populate "Examination Findings," "Diagnosis Notes," and "Treatment Plans."
  - **History Tracking**: A "Recent Reports" sidebar for accessing previously generated PDFs/Reports.

---

## 4. AI & NLP Implementation Details

### Clinical Note Auto-Generation
The system uses a specialized prompt that takes the `patientData` and a list of `recentRecords`. It predicts the logical next steps in a treatment plan and provides a plain-text draft (no asterisks or markdown) that the doctor can edit.

### Symptom & Entity Extraction
When a clinical note is saved, the API triggers an NLP pass. This pass identifies:
- **Primary Conditions** (e.g., Psoriasis, Eczema).
- **Secondary Symptoms** (e.g., Pruritus, Erythema).
- **Topographical Locations** (e.g., L-Forearm, Upper Back).

---

## 5. Security & Data Sovereignty
- **Authentication**: Secure login via Supabase.
- **Data Isolation**: Each practitioner can only see the records for their clinic (RLS).
- **Audit Logging**: Every report generation and clinical update is timestamped and attributed.

---

## 6. How to Extend
- **Integrating Lab Results**: The schema supports adding a `labs` table linked to `patient_id`.
- **E-Prescribing**: The `reports` data can be piped into an e-prescription API.
