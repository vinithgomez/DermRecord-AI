import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractClinicalData(clinicalNotes: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Extract structured clinical data from the following notes:\n\n${clinicalNotes}`,
      config: {
        systemInstruction: "You are an expert dermatology AI assistant. Extract symptoms, duration, severity, body parts, possible conditions, risk level, and recommended tests from the clinical notes. Output strictly in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            duration: { type: Type.STRING },
            severity: { type: Type.STRING },
            body_parts: { type: Type.ARRAY, items: { type: Type.STRING } },
            possible_conditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            risk_level: { type: Type.STRING },
            recommended_tests: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["symptoms", "duration", "severity", "body_parts", "possible_conditions", "risk_level", "recommended_tests"]
        }
      }
    });

    const text = response.text || "{}";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error in extractClinicalData:", error);
    return {
      symptoms: [],
      duration: "Unknown",
      severity: "Unknown",
      body_parts: [],
      possible_conditions: [],
      risk_level: "Unknown",
      recommended_tests: []
    };
  }
}

export async function generateRagContextFallback(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Provide a brief medical literature context for the following symptoms: ${query}`,
      config: { systemInstruction: "You are a medical literature retrieval system. Provide a short, factual summary of standard medical knowledge regarding the given symptoms." }
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateRagContextFallback:", error);
    return "Failed to retrieve context. Please try again.";
  }
}

export async function generateEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });
  return response.embeddings?.[0]?.values || [];
}

export async function generateReport(patientData: any, clinicalNotes: string, extractedData: any, ragContext: string) {
  const prompt = `
    Generate a structured medical report for a dermatology patient.
    
    Patient Data: ${JSON.stringify(patientData)}
    Clinical Notes: ${clinicalNotes}
    Extracted Data: ${JSON.stringify(extractedData)}
    Relevant Medical Knowledge (RAG Context): ${ragContext}
    
    The report should include:
    - Patient summary
    - Symptoms
    - Possible diagnoses (with reasoning based on RAG context)
    - Risk level
    - Recommended tests
    - Suggested treatment direction
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert dermatology assistant. Generate a clear, evidence-based medical report for doctors.",
    }
  });

  return response.text;
}

export async function improveClinicalNotes(notes: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Please improve, format, and professionalize the following clinical notes. Make them concise, medically accurate, and well-structured:\n\n${notes}`,
    config: {
      systemInstruction: "You are an expert dermatology assistant. Your task is to rewrite raw clinical notes into professional, structured medical documentation. Do not add new medical facts, just improve the writing and structure.",
    }
  });
  return response.text;
}

export async function generatePatientSummary(patientData: any, records: any[]) {
  const prompt = `
    Generate a concise AI Skin Condition Summary and Treatment Progress overview for this patient based on their profile and medical history.
    
    Patient Data: ${JSON.stringify(patientData)}
    Medical Records (History): ${JSON.stringify(records)}
    
    The summary should include:
    - Current primary skin condition(s)
    - Overall treatment progress (e.g., improving, worsening, stable)
    - Key treatments given so far
    - Next steps or follow-ups needed
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert dermatology assistant. Provide a concise, high-level summary of the patient's skin condition and treatment progress.",
    }
  });

  return response.text;
}
