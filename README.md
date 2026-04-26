# DermRecord AI

DermRecord AI is a sophisticated, AI-driven clinical suite designed for modern dermatologists. It streamlines patient record-keeping, clinical documentation, and diagnostic decision support through advanced natural language processing and computer vision.

## 🌟 Key Features

- **Advanced Patient Management**: Centralized dashboard for managing patient profiles, history, and clinical timelines.
- **AI Symptom Extraction**: Automatically identifies dermatological symptoms, anatomical locations, and severity from unstructured clinical notes.
- **Smart Clinical Diagnosis**: Utilizes Google Gemini AI to analyze skin conditions based on patient history, observations, and optionally medical imagery.
- **Automated Clinical Reporting**: Generate formal, structured dermatological reports with AI-assisted auto-fill from existing patient records.
- **Responsive Clinical Suite**: A high-performance, responsive interface designed for use in both laboratory and clinical environments.
- **Robust Security**: Built-in Row Level Security (RLS) via Supabase to ensure patient data privacy and integrity.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **AI Engine**: [Google Gemini AI SDK](https://ai.google.dev/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- A Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/dermrecord-ai.git
   cd dermrecord-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *See `.env.example` for the full list of required variables.*

4. **Initialize the Database**:
   - Go to your Supabase project's SQL Editor.
   - Run the contents of `schema.sql` to create the initial tables.
   - Run `supabase_security_fix.sql` to apply security policies and create the reports table.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 📦 Project Structure

- `src/components`: Reusable UI components powered by shadcn/ui.
- `src/pages`: Main application views (Dashboard, Patients, Reports, etc.).
- `src/lib`: Core logic including AI services, Supabase client, and authentication context.
- `server.ts`: Express backend serving as an API layer for sensitive operations.
- `schema.sql`: Database schema definition.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
