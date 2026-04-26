import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { PatientDetail } from "./pages/PatientDetail";
import { RegisterPatient } from "./pages/RegisterPatient";
import { Reports } from "./pages/Reports";
import { AIDiagnosis } from "./pages/AIDiagnosis";
import { Login } from "./pages/Login";
import { UpdatePassword } from "./pages/UpdatePassword";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Activity, Users, FileText, LayoutDashboard, LogOut, UserPlus, Home, Menu, X, BrainCircuit } from "lucide-react";
import { useState } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, demoMode } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user && !demoMode) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function AppLayout() {
  const { signOut, user, demoMode } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          DermRecord AI
        </Link>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2" onClick={closeSidebar}>
            <Activity className="w-6 h-6" />
            <span className="hidden md:inline">DermRecord AI</span>
            <span className="md:hidden">Menu</span>
          </Link>
          <button onClick={closeSidebar} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link to="/" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Home className="w-5 h-5" /> Home Page
          </Link>
          <Link to="/dashboard" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/patients" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/patients') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5" /> Patients
          </Link>
          <Link to="/register-patient" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/register-patient') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <UserPlus className="w-5 h-5" /> Register Patient
          </Link>
          <Link to="/ai-diagnosis" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/ai-diagnosis') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <BrainCircuit className="w-5 h-5" /> AI Diagnosis
          </Link>
          <Link to="/reports" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/reports') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <FileText className="w-5 h-5" /> Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2 truncate px-2">
            {user?.email || (demoMode ? "Demo User" : "")}
          </div>
          <button 
            onClick={() => { signOut(); closeSidebar(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> {demoMode ? "Exit Demo" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/register-patient" element={<RegisterPatient />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
