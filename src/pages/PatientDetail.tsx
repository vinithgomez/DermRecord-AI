import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BrainCircuit, FileText, Activity, History, Edit, Trash2, Wand2, TrendingUp } from "lucide-react";
import { apiFetch } from "../lib/api";
import { extractClinicalData, generateRagContextFallback, retrieveRagContext, improveClinicalNotes, generateReport, generatePatientSummary } from "../lib/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PatientDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Consultation State
  const [notes, setNotes] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [ragContext, setRagContext] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Treatment Progress State
  const [progressNote, setProgressNote] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [treatmentGiven, setTreatmentGiven] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editContact, setEditContact] = useState("");

  const { data: patient } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await apiFetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      const data = await res.json();
      
      // Initialize edit state
      setEditFirstName(data.first_name || "");
      setEditLastName(data.last_name || "");
      setEditDob(data.date_of_birth || "");
      setEditGender(data.gender || "");
      setEditContact(data.contact_number || "");
      
      return data;
    }
  });

  const { data: records } = useQuery({
    queryKey: ["records", id],
    queryFn: async () => {
      const res = await apiFetch(`/api/patients/${id}/records`);
      if (!res.ok) throw new Error("Failed to fetch records");
      return res.json();
    }
  });

  const extractMutation = useMutation({
    mutationFn: async (clinicalNotes: string) => {
      return await extractClinicalData(clinicalNotes);
    },
    onSuccess: (data) => {
      setExtractedData(data);
      if (data.symptoms?.length > 0) {
        ragMutation.mutate(data.symptoms.join(", "));
      }
    },
    onError: (error: any) => {
      alert(`AI Extraction Error: ${error.message}`);
    }
  });

  const improveNotesMutation = useMutation({
    mutationFn: async (currentNotes: string) => {
      return await improveClinicalNotes(currentNotes);
    },
    onSuccess: (data) => {
      setNotes(data);
    }
  });

  const ragMutation = useMutation({
    mutationFn: async (query: string) => {
      // Calls the local Vector Database to retrieve relevant medical guidelines
      return await retrieveRagContext(query);
    },
    onSuccess: (data) => {
      setRagContext(data);
    },
    onError: (error: any) => {
      console.error("RAG Error:", error);
      setRagContext("Failed to retrieve context. Please try again.");
    }
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      return await generateReport(patient, notes, extractedData, ragContext);
    },
    onSuccess: (data) => {
      setReport(data);
    }
  });

  const summaryMutation = useMutation({
    mutationFn: async () => {
      return await generatePatientSummary(patient, records || []);
    }
  });

  const saveRecordMutation = useMutation({
    mutationFn: async () => {
      const url = editingRecordId ? `/api/records/${editingRecordId}` : "/api/records";
      const method = editingRecordId ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: id,
          clinical_notes: notes,
          structured_data: extractedData
        })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", id] });
      alert(editingRecordId ? "Record updated successfully!" : "Record saved successfully!");
      setEditingRecordId(null);
      setNotes("");
      setExtractedData(null);
      setActiveTab("history");
    }
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const res = await apiFetch(`/api/records/${recordId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", id] });
      setRecordToDelete(null);
    }
  });

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      deleteRecordMutation.mutate(recordToDelete);
    }
  };

  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      const combinedNotes = `Progress Note:\n${progressNote}\n\nTreatment Given:\n${treatmentGiven}\n\nNext Steps:\n${nextSteps}`;
      const res = await apiFetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: id,
          clinical_notes: combinedNotes,
          structured_data: {
            type: "treatment_progress",
            status,
            severity,
            progressNote,
            treatmentGiven,
            nextSteps
          }
        })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", id] });
      alert("Treatment progress saved!");
      setProgressNote("");
      setStatus("");
      setSeverity("");
      setTreatmentGiven("");
      setNextSteps("");
      setActiveTab("history");
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirstName,
          last_name: editLastName,
          date_of_birth: editDob,
          gender: editGender,
          contact_number: editContact,
        })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    },
    onError: (error: any) => {
      alert(`Error updating profile: ${error.message}`);
    }
  });

  const handleEditRecord = (record: any) => {
    setNotes(record.clinical_notes);
    setExtractedData(record.structured_data);
    setEditingRecordId(record.id);
    setActiveTab("consultation");
  };

  if (!patient) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {patient.first_name} {patient.last_name}
        </h1>
        <Badge variant="outline" className="text-sm px-3 py-1">
          DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 max-w-3xl bg-transparent">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white shadow-sm border border-gray-200">Profile</TabsTrigger>
          <TabsTrigger value="consultation" className="data-[state=active]:bg-white shadow-sm border border-gray-200">Consultation</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white shadow-sm border border-gray-200">Treatment Progress</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white shadow-sm border border-gray-200">Medical History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Patient Profile</CardTitle>
              {!isEditingProfile && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="gap-2">
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={editGender} onValueChange={setEditGender}>
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
                      <Label>Contact Number</Label>
                      <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 justify-end">
                    <Button variant="outline" onClick={() => {
                      setIsEditingProfile(false);
                      setEditFirstName(patient.first_name || "");
                      setEditLastName(patient.last_name || "");
                      setEditDob(patient.date_of_birth || "");
                      setEditGender(patient.gender || "");
                      setEditContact(patient.contact_number || "");
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => updateProfileMutation.mutate()}
                      disabled={updateProfileMutation.isPending}
                      className="bg-[#0052cc] hover:bg-[#0042a3] text-white"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">First Name</h4>
                    <p className="text-lg">{patient.first_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Name</h4>
                    <p className="text-lg">{patient.last_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                    <p className="text-lg">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Age</h4>
                    <p className="text-lg">{calculateAge(patient.date_of_birth)} years</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                    <p className="text-lg capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                    <p className="text-lg">{patient.contact_number || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registered On</h4>
                    <p className="text-lg">{new Date(patient.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingRecordId ? "Edit Clinical Notes" : "New Clinical Notes"}</CardTitle>
              {editingRecordId && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingRecordId(null);
                  setNotes("");
                  setExtractedData(null);
                }}>
                  Cancel Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea 
                  placeholder="Enter patient symptoms, history, and observations..." 
                  className="min-h-[200px] pb-12"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="gap-2"
                    onClick={() => improveNotesMutation.mutate(notes)}
                    disabled={!notes || improveNotesMutation.isPending}
                  >
                    <Wand2 className="w-4 h-4" />
                    {improveNotesMutation.isPending ? "Improving..." : "Improve Notes"}
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => extractMutation.mutate(notes)}
                  disabled={!notes || extractMutation.isPending}
                  className="gap-2"
                >
                  <BrainCircuit className="w-4 h-4" />
                  {extractMutation.isPending ? "Analyzing..." : "Analyze with AI"}
                </Button>
                <Button 
                  variant={editingRecordId ? "default" : "outline"}
                  onClick={() => saveRecordMutation.mutate()}
                  disabled={!notes || saveRecordMutation.isPending}
                >
                  {editingRecordId ? "Update Record" : "Save Record"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-500" />
                AI Skin Condition Summary
              </CardTitle>
              <Button 
                onClick={() => summaryMutation.mutate()}
                disabled={summaryMutation.isPending || !records}
                variant="secondary"
              >
                {summaryMutation.isPending ? "Generating..." : "Generate Summary"}
              </Button>
            </CardHeader>
            <CardContent>
              {summaryMutation.data?.summary ? (
                <div className="prose max-w-none bg-blue-50/50 p-6 rounded-lg border border-blue-100 whitespace-pre-wrap">
                  {summaryMutation.data.summary}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 border-2 border-dashed rounded-lg">
                  Click generate to create an AI summary of the patient's condition and treatment progress based on their history.
                </div>
              )}
            </CardContent>
          </Card>

          {extractedData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    AI Insight
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.symptoms?.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Duration</h4>
                      <p className="text-sm">{extractedData.duration || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Severity</h4>
                      <Badge variant={extractedData.severity?.toLowerCase() === 'high' ? 'destructive' : 'outline'}>
                        {extractedData.severity || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Possible Conditions</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {extractedData.possible_conditions?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Recommended Tests</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {extractedData.recommended_tests?.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    RAG Knowledge Retrieval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ragMutation.isPending ? (
                    <div className="text-sm text-gray-500 animate-pulse">Searching medical literature...</div>
                  ) : ragContext ? (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                      {ragContext}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No context retrieved yet.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Please enter clinical notes and click "Analyze with AI" first to view insights.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Treatment Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); saveProgressMutation.mutate(); }} className="space-y-6">
                <div className="space-y-2">
                  <Label>Progress Note *</Label>
                  <Textarea 
                    placeholder="Describe the current condition, changes observed..." 
                    required
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Improving">Improving</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Worsening">Worsening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Treatment Given</Label>
                  <Textarea 
                    placeholder="e.g., topical corticosteroid, phototherapy session..." 
                    value={treatmentGiven}
                    onChange={(e) => setTreatmentGiven(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Steps / Follow-up</Label>
                  <Textarea 
                    placeholder="e.g., review in 2 weeks, switch to calcineurin inhibitor..." 
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#7fbcd2] hover:bg-[#6aaabf] text-white"
                  disabled={!progressNote || saveProgressMutation.isPending}
                >
                  {saveProgressMutation.isPending ? "Saving..." : "Save Progress Note"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                Past Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records?.length > 0 ? (
                <div className="space-y-6">
                  {records.map((record: any) => (
                    <div key={record.id} className="border rounded-lg p-4 bg-gray-50 relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditRecord(record)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setRecordToDelete(record.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-sm text-gray-500 font-medium">
                          {new Date(record.created_at).toLocaleString()}
                          {record.structured_data?.type === 'treatment_progress' && (
                            <Badge className="ml-3 bg-green-100 text-green-800 hover:bg-green-100">Treatment Progress</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 pr-20">
                        <h4 className="text-sm font-semibold mb-2">Clinical Notes</h4>
                        <p className="text-sm whitespace-pre-wrap text-gray-700">{record.clinical_notes}</p>
                      </div>
                      
                      {record.structured_data && record.structured_data.type !== 'treatment_progress' && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">AI Extracted Data</h4>
                          <div className="bg-white p-3 rounded border text-sm">
                            <p><strong>Symptoms:</strong> {record.structured_data.symptoms?.join(", ")}</p>
                            <p><strong>Conditions:</strong> {record.structured_data.possible_conditions?.join(", ")}</p>
                          </div>
                        </div>
                      )}

                      {record.structured_data?.type === 'treatment_progress' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white p-3 rounded border text-sm">
                          <div><span className="font-semibold text-gray-500">Status:</span> {record.structured_data.status}</div>
                          <div><span className="font-semibold text-gray-500">Severity:</span> {record.structured_data.severity}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  No past medical records found for this patient.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medical record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordToDelete(null)} disabled={deleteRecordMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRecord} disabled={deleteRecordMutation.isPending}>
              {deleteRecordMutation.isPending ? "Deleting..." : "Delete Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
