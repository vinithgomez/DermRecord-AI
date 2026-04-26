import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/api";

export function RegisterPatient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [previousConditions, setPreviousConditions] = useState("");
  const [history, setHistory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      // 1. Create Patient
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Unknown";

      const patientRes = await apiFetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: gender.toLowerCase(),
          contact_number: contact,
        })
      });

      if (!patientRes.ok) throw new Error("Failed to create patient");
      const patient = await patientRes.json();

      // 2. Create Initial Medical Record
      const clinicalNotes = `
Skin Symptoms / Complaints:
${symptoms}

Previous Skin Conditions / Diagnosis:
${previousConditions}

Dermatological History & Allergies:
${history}
      `.trim();

      const recordRes = await apiFetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          doctor_id: user?.id || "00000000-0000-0000-0000-000000000000", // Fallback if no user
          clinical_notes: clinicalNotes,
        })
      });

      if (!recordRes.ok) throw new Error("Failed to create medical record");

      return patient;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      
      // Reset form state
      setName("");
      setDob("");
      setGender("");
      setContact("");
      setSymptoms("");
      setPreviousConditions("");
      setHistory("");
      setFile(null);
      
      // Show popup
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob || !gender) {
      alert("Please fill in all required fields (Name, Date of Birth, Gender).");
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          The Patient Registered
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900">Register Dermatology Patient</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Patient Skin Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input 
                  id="contact" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Skin Symptoms / Complaints</Label>
              <Textarea 
                id="symptoms" 
                value={symptoms} 
                onChange={(e) => setSymptoms(e.target.value)} 
                placeholder="e.g., itchy red patches on elbows, persistent acne on cheeks..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousConditions">Previous Skin Conditions / Diagnosis</Label>
              <Textarea 
                id="previousConditions" 
                value={previousConditions} 
                onChange={(e) => setPreviousConditions(e.target.value)} 
                placeholder="e.g., eczema, psoriasis, contact dermatitis..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="history">Dermatological History & Allergies</Label>
              <Textarea 
                id="history" 
                value={history} 
                onChange={(e) => setHistory(e.target.value)} 
                placeholder="e.g., family history of melanoma, drug allergies, previous treatments..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Report / Dermoscopy Image (PDF)</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="cursor-pointer"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#7fbcd2] hover:bg-[#6aaabf] text-white font-semibold py-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Registering..." : "Register Patient"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
