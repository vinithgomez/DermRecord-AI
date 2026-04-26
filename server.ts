import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import { supabase } from "./src/server/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Patients API ---
  app.get("/api/patients", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
      } else {
        // Mock data
        res.json([
          { id: "1", first_name: "John", last_name: "Doe", date_of_birth: "1985-06-15", gender: "male", contact_number: "555-0123", created_at: new Date().toISOString() },
          { id: "2", first_name: "Jane", last_name: "Smith", date_of_birth: "1992-11-20", gender: "female", contact_number: "555-0987", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: "3", first_name: "Michael", last_name: "Johnson", date_of_birth: "1978-03-10", gender: "male", contact_number: "555-1122", created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
          { id: "4", first_name: "Emily", last_name: "Davis", date_of_birth: "2001-08-25", gender: "female", contact_number: "555-3344", created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
          { id: "5", first_name: "David", last_name: "Wilson", date_of_birth: "1965-12-05", gender: "male", contact_number: "555-5566", created_at: new Date(Date.now() - 86400000 * 45).toISOString() }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('patients').insert([req.body]).select();
        if (error) throw error;
        res.json(data[0]);
      } else {
        res.json({ id: Date.now().toString(), created_at: new Date().toISOString(), ...req.body });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('patients').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        res.json(data);
      } else {
        res.json({ id: req.params.id, first_name: "John", last_name: "Doe", date_of_birth: "1985-06-15", gender: "male", contact_number: "555-0123", created_at: new Date().toISOString() });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('patients').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
      } else {
        res.json({ id: req.params.id, ...req.body });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { error } = await supabase.from('patients').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } else {
        res.json({ success: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Appointments API ---
  app.get("/api/appointments", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, patients(first_name, last_name)')
          .order('appointment_date', { ascending: true })
          .limit(10);
        if (error) throw error;
        res.json(data);
      } else {
        res.json([
          { id: "1", patient_id: "1", appointment_date: new Date(Date.now() + 86400000).toISOString(), status: "Scheduled", patients: { first_name: "John", last_name: "Doe" } },
          { id: "2", patient_id: "2", appointment_date: new Date(Date.now() + 86400000 * 2).toISOString(), status: "Scheduled", patients: { first_name: "Jane", last_name: "Smith" } }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Medical Records API ---
  app.get("/api/records/recent", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*, patients(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        res.json(data);
      } else {
        res.json([
          { id: "1", patient_id: "1", record_type: "consultation", clinical_notes: "Patient presents with mild eczema on arms.", structured_data: { possible_conditions: ["Eczema"], severity: "Mild" }, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), patients: { first_name: "John", last_name: "Doe" } },
          { id: "2", patient_id: "2", record_type: "consultation", clinical_notes: "Severe acne on face.", structured_data: { possible_conditions: ["Acne Vulgaris"], severity: "Severe" }, created_at: new Date(Date.now() - 86400000).toISOString(), patients: { first_name: "Jane", last_name: "Smith" } }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/patients/:id/records", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('medical_records').select('*').eq('patient_id', req.params.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
      } else {
        res.json([
          { id: "1", patient_id: req.params.id, record_type: "consultation", clinical_notes: "Patient presents with mild eczema on arms.", extracted_data: { symptoms: ["eczema", "itching"], severity: "mild" }, created_at: new Date(Date.now() - 86400000 * 10).toISOString() }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/records", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('medical_records').insert([req.body]).select();
        if (error) throw error;
        res.json(data[0]);
      } else {
        res.json({ id: Date.now().toString(), created_at: new Date().toISOString(), ...req.body });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/records/:id", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('medical_records').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
      } else {
        res.json({ id: req.params.id, ...req.body });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/records/:id", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { error } = await supabase.from('medical_records').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } else {
        res.json({ success: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Reports API ---
  app.get("/api/reports", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase
          .from('reports')
          .select('*, patients(first_name, last_name)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
      } else {
        // Mock data
        res.json([
          { 
            id: "1", 
            patient_id: "1", 
            doctor_name: "Dr. Jane Smith", 
            diagnosis_notes: "Observed mild dermatitis.", 
            examination_findings: "Erythema on the right forearm.",
            treatment_notes: "Apply topical steroid twice daily.",
            report_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            patients: { first_name: "John", last_name: "Doe" } 
          }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const isDemo = req.headers['x-demo-mode'] === 'true';
      const isConfigured = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder');
      if (isConfigured && !isDemo) {
        const { data, error } = await supabase.from('reports').insert([req.body]).select();
        if (error) throw error;
        res.json(data[0]);
      } else {
        res.json({ id: Date.now().toString(), created_at: new Date().toISOString(), ...req.body });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- AI / NLP / RAG API ---
  // AI endpoints have been moved to the frontend (src/lib/ai.ts) to comply with Gemini API guidelines.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
