import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Camera, Eye, BrainCircuit, Activity, ImageIcon, Loader2, X } from "lucide-react";
import { analyzeSkinCondition } from "../lib/ai";

export function AIDiagnosis() {
  const [observation, setObservation] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please ensure permissions are granted.");
          setIsCameraOpen(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        setIsCameraOpen(false);
      }
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return await analyzeSkinCondition(selectedImage, observation);
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    }
  });

  const handleAnalyze = () => {
    if (selectedImage || observation.trim()) {
      analyzeMutation.mutate();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2b3a67] mb-2">AI Skin Diagnosis</h1>
          <p className="text-gray-500">Harnessing neural networks for dermatological precision.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#a8f0d8] text-[#0f5c42] px-3 py-1.5 rounded-full text-xs font-bold tracking-wider">
          <div className="w-2 h-2 bg-[#0f5c42] rounded-full animate-pulse"></div>
          AI ENGINE: ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Input */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#0052cc] rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Clinical Input</h2>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleImageUpload}
                />
                <div className="w-16 h-16 bg-[#e6efff] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8 text-[#0052cc]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Patient Image</h3>
                <p className="text-sm text-gray-500 mb-6">Drag and drop clinical photos or dermoscopy images</p>
                <Button variant="outline" className="text-[#0052cc] border-[#0052cc] hover:bg-[#e6efff] font-bold px-8">
                  BROWSE FILES
                </Button>
              </div>

              {/* Divider */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">OR USE HARDWARE</span>
                </div>
              </div>

              {/* Camera Area */}
              {isCameraOpen ? (
                <div className="mb-8 space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button 
                      onClick={() => setIsCameraOpen(false)}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <Button onClick={captureImage} className="w-full h-12 bg-[#0052cc] hover:bg-[#0042a3] text-white font-bold gap-2">
                    <Camera className="w-5 h-5" /> Capture Photo
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="secondary" 
                  className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-base gap-3 mb-8"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <Camera className="w-5 h-5 text-[#0052cc]" /> Live Camera Capture
                </Button>
              )}

              {/* Observation Textarea */}
              <div className="space-y-3 mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Clinical Observation</label>
                <Textarea 
                  placeholder="Describe texture, size, evolution, or patient symptoms..." 
                  className="min-h-[120px] bg-gray-50 border-transparent focus:bg-white resize-none text-base p-4"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>

              {/* Analyze Button */}
              <Button 
                className="w-full h-14 bg-[#0052cc] hover:bg-[#0042a3] text-white font-bold text-lg gap-3"
                onClick={handleAnalyze}
                disabled={(!selectedImage && !observation.trim()) || analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</>
                ) : (
                  <><BrainCircuit className="w-6 h-6" /> Analyze with AI</>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Preview & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preview Card (Always visible) */}
          <Card className="border-0 shadow-sm bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Analysis Preview</h2>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="bg-gray-50 rounded-xl aspect-square flex flex-col items-center justify-center p-8 text-center border border-gray-100">
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Waiting for Input</h3>
                    <p className="text-sm text-gray-400 max-w-[200px]">
                      Upload a patient photo to begin the AI diagnostic mapping process.
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis Result Card */}
          {analysisResult && (
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <div className="bg-[#0052cc] p-4 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" /> AI Assessment
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Possible Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.possible_conditions?.map((condition: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Severity</h3>
                  <Badge className={`border-0 font-bold px-3 py-1 ${
                    ["SEVERE", "HIGH", "URGENT"].includes(analysisResult.severity?.toUpperCase())
                      ? "bg-[#ffd6d6] text-[#cc0000]" 
                      : "bg-[#a8f0d8] text-[#0f5c42]"
                  }`}>
                    {analysisResult.severity?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Analysis</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysisResult.analysis}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {analysisResult.recommendations?.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedImage(null);
                    setObservation("");
                  }}
                >
                  Clear Results & Start Over
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
