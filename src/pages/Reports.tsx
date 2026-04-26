import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "../lib/api";
import { FileText, Plus, Sparkles, Clock, User, Calendar as CalendarIcon, Loader2, FileSpreadsheet } from "lucide-react";
import { generateReportDetails } from "../lib/ai";
import { Badge } from "@/components/ui/badge";

export function Reports() {
  const queryClient = useQueryClient();
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await apiFetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    }
  });

  const { data: reports, isLoading: isReportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await apiFetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    }
  });

  const createReportMutation = useMutation({
    mutationFn: async (newReport: any) => {
      const res = await apiFetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport)
      });
      if (!res.ok) throw new Error("Failed to create report");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      alert("Report generated successfully!");
      // Reset form
      setSelectedPatientId("");
      setDiagnosisNotes("");
      setExaminationFindings("");
      setTreatmentNotes("");
    }
  });

  const handleAutoFill = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    try {
      setIsAutoFilling(true);
      // Fetch patient records and patient data
      const [patientRes, recordsRes] = await Promise.all([
        apiFetch(`/api/patients/${selectedPatientId}`),
        apiFetch(`/api/patients/${selectedPatientId}/records`)
      ]);

      if (!patientRes.ok || !recordsRes.ok) throw new Error("Failed to fetch patient data or records");

      const patientData = await patientRes.json();
      const recordsData = await recordsRes.json();

      if (recordsData.length === 0) {
        alert("This patient has no clinical records to auto-fill from.");
        setIsAutoFilling(false);
        return;
      }

      const details = await generateReportDetails(patientData, recordsData);
      setDiagnosisNotes(details.diagnosis_notes);
      setExaminationFindings(details.examination_findings);
      setTreatmentNotes(details.treatment_notes);
    } catch (error: any) {
      alert(`Auto-fill error: ${error.message}`);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorName || !reportDate) {
      alert("Please fill in all required fields.");
      return;
    }

    createReportMutation.mutate({
      patient_id: selectedPatientId,
      doctor_name: doctorName,
      report_date: reportDate,
      diagnosis_notes: diagnosisNotes,
      examination_findings: examinationFindings,
      treatment_notes: treatmentNotes
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 font-heading">Clinical Reports</h1>
          <p className="text-gray-500 mt-2">Generate formal dermatological reports for patients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-blue-50">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
              <div>
                <CardTitle className="text-2xl font-heading">Report Details</CardTitle>
                <CardDescription>Fill in the diagnosis and treatment plan</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={handleAutoFill}
                disabled={isAutoFilling || !selectedPatientId}
              >
                {isAutoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Auto-fill from Records
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="patient" className="text-sm font-semibold">Patient *</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger id="patient" className="bg-gray-50/50">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold">Date *</Label>
                    <div className="relative">
                      <Input 
                        id="date" 
                        type="date" 
                        value={reportDate} 
                        onChange={(e) => setReportDate(e.target.value)} 
                        className="bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-sm font-semibold">Dermatologist Name *</Label>
                  <Input 
                    id="doctor" 
                    placeholder="Dr. Jane Smith" 
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-semibold">Skin Condition Diagnosis Notes</Label>
                  <Textarea 
                    id="diagnosis" 
                    placeholder="e.g., plaque psoriasis, moderate severity..." 
                    className="min-h-[100px] bg-gray-50/50"
                    value={diagnosisNotes}
                    onChange={(e) => setDiagnosisNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="findings" className="text-sm font-semibold">Examination Findings</Label>
                  <Textarea 
                    id="findings" 
                    placeholder="e.g., well-demarcated erythematous plaques with silvery scale..." 
                    className="min-h-[100px] bg-gray-50/50"
                    value={examinationFindings}
                    onChange={(e) => setExaminationFindings(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment" className="text-sm font-semibold">Treatment / Prescription Notes</Label>
                  <Textarea 
                    id="treatment" 
                    placeholder="e.g., topical corticosteroids, phototherapy schedule..." 
                    className="min-h-[100px] bg-gray-50/50"
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#82c0d9] hover:bg-[#68a6bf] text-white py-6 text-lg rounded-xl transition-all shadow-md mt-4"
                  disabled={createReportMutation.isPending}
                >
                  {createReportMutation.isPending ? "Generating..." : "Generate Derm Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports List */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-md border-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-heading">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isReportsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <p className="text-sm text-gray-400">Loading reports...</p>
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report: any) => (
                    <div key={report.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-400" />
                          <p className="text-sm font-bold text-slate-800">
                            {report.patients?.first_name} {report.patients?.last_name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {new Date(report.report_date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                        {report.diagnosis_notes || "No diagnosis notes"}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" /> Report
                        </span>
                        <span>{report.doctor_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm">No reports generated yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
