import { GoogleGenAI, Type } from "@google/genai";
import { VectorStore } from "./vectorStore";
import { medicalGuidelines } from "./medicalKnowledge";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Vector Store
const medicalVectorStore = new VectorStore();
let isVectorStoreInitialized = false;

async function initVectorStore() {
  if (isVectorStoreInitialized) return;
  
  console.log("Initializing Medical Vector Database...");
  for (let i = 0; i < medicalGuidelines.length; i++) {
    const text = medicalGuidelines[i];
    try {
      const response = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text,
      });
      
      if (response.embeddings && response.embeddings[0].values) {
        medicalVectorStore.addDocument({
          id: `doc_${i}`,
          text: text,
          embedding: response.embeddings[0].values
        });
      }
    } catch (err) {
      console.error("Failed to embed document:", err);
    }
  }
  isVectorStoreInitialized = true;
  console.log("Vector Database initialized with", medicalGuidelines.length, "documents.");
}

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
    throw error;
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
    throw error;
  }
}

export async function retrieveRagContext(query: string) {
  try {
    // 1. Ensure the vector database is populated
    await initVectorStore();

    // 2. Embed the user's query
    const queryEmbeddingRes = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: query,
    });

    const queryEmbedding = queryEmbeddingRes.embeddings?.[0].values;
    if (!queryEmbedding) throw new Error("Failed to generate query embedding");

    // 3. Perform Vector Search using Cosine Similarity
    const topDocs = medicalVectorStore.search(queryEmbedding, 2); // Get top 2 most relevant guidelines

    // 4. Format the retrieved context
    if (topDocs.length === 0) return "No specific medical guidelines found in the vector database.";
    
    const contextText = topDocs.map(doc => `[Similarity Score: ${(doc.score * 100).toFixed(1)}%] ${doc.text}`).join("\n\n");
    return `Retrieved Medical Guidelines from Vector DB:\n\n${contextText}`;
  } catch (error) {
    console.error("Error in retrieveRagContext:", error);
    // Fallback if embedding fails
    return generateRagContextFallback(query);
  }
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
      systemInstruction: "You are an expert dermatology assistant. Provide a concise, high-level summary of the patient's skin condition and treatment progress. Output strictly in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING }
        },
        required: ["summary"]
      }
    }
  });

  const text = response.text || "{}";
  const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanText);
}

export async function generateReportDetails(patientData: any, records: any[]) {
  const prompt = `
    Based on the following patient data and medical medical records, generate details for a formal dermatology report.
    
    Patient Data: ${JSON.stringify(patientData)}
    Medical Records: ${JSON.stringify(records)}
    
    Provide:
    1. Skin Condition Diagnosis Notes: A summary of the suspected or confirmed conditions.
    2. Examination Findings: Key clinical observations from the history.
    3. Treatment / Prescription Notes: Current and recommended treatments.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert dermatology assistant. Provide structured report details. Output strictly in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis_notes: { type: Type.STRING },
          examination_findings: { type: Type.STRING },
          treatment_notes: { type: Type.STRING }
        },
        required: ["diagnosis_notes", "examination_findings", "treatment_notes"]
      }
    }
  });

  const text = response.text || "{}";
  const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanText);
}

export async function analyzeSkinCondition(imageStr: string | null, observation: string) {
  try {
    const parts: any[] = [];
    
    if (imageStr) {
      // Extract base64 part from data URL
      const base64Data = imageStr.split(',')[1];
      const mimeType = imageStr.split(';')[0].split(':')[1];
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }
    
    if (observation) {
      parts.push(`Clinical observation: ${observation}`);
    }
    
    if (parts.length === 0) {
      throw new Error("No input provided for analysis.");
    }
    
    parts.push("Analyze the provided skin image and/or clinical observation. Provide a structured diagnosis including possible conditions, severity, and recommended next steps.");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: parts,
      config: {
        systemInstruction: "You are an expert dermatology AI assistant. Analyze the provided clinical inputs (image and/or text) and provide a structured dermatological assessment. Output strictly in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possible_conditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            severity: { type: Type.STRING },
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["possible_conditions", "severity", "analysis", "recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error in analyzeSkinCondition:", error);
    throw error;
  }
}
