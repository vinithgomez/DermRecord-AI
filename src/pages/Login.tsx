import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Sparkles, Shield, Home } from "lucide-react";

type AuthView = 'login' | 'register' | 'forgot_password';

export function Login() {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'register') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Registration successful! You can now log in.");
        setView('login');
        setPassword("");
        setConfirmPassword("");
      } else if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else if (view === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        setMessage("Password reset link sent! Please check your email.");
        setView('login');
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 z-0 bg-blue-900/40 mix-blend-multiply" />
        
        {/* Floating Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-lg w-full">
          <p className="text-blue-700 font-bold tracking-widest text-xs uppercase mb-4">Established 2026</p>
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-8">
            Precision in every pixel. <br/>
            <span className="text-blue-700">Care in every clinical note.</span>
          </h1>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI-Powered Diagnostics</h3>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">Integrated dermatological analysis for faster, more accurate patient evaluations.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">HIPAA Compliant</h3>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">Enterprise-grade security ensuring patient confidentiality at every touchpoint.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="absolute top-6 right-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900 gap-2">
              <Home className="w-4 h-4" /> Return Home
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-900">DermRecord AI</span>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900">
                {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-slate-500 mt-2">
                {view === 'login' ? 'Please enter your credentials to access the clinical suite.' : 
                 view === 'register' ? 'Register as a new practitioner to access the suite.' : 
                 'Enter your email to receive a password reset link.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Professional Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="doctor@clinic.com" 
                    className="pl-10 bg-slate-100 border-transparent focus:bg-white h-12 rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {view !== 'forgot_password' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Security Password</Label>
                    {view === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setView('forgot_password')}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 uppercase tracking-wider"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pl-10 pr-10 bg-slate-100 border-transparent focus:bg-white h-12 rounded-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {view === 'register' && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pl-10 pr-10 bg-slate-100 border-transparent focus:bg-white h-12 rounded-lg"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
              {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">{message}</div>}

              <Button type="submit" className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-base font-medium gap-2 mt-2" disabled={loading}>
                {loading ? "Please wait..." : (
                  view === 'login' ? <>Access Suite <ArrowRight className="w-5 h-5" /></> :
                  view === 'register' ? "Create Account" : "Send Reset Link"
                )}
              </Button>
            </form>

            {/* Toggle View */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {view === 'login' ? (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-medium gap-2"
                onClick={() => { setView('register'); setError(null); setMessage(null); }}
              >
                <UserPlus className="w-5 h-5 text-teal-700" /> Register New Practitioner
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-medium gap-2"
                onClick={() => { setView('login'); setError(null); setMessage(null); }}
              >
                Back to Sign In
              </Button>
            )}

            {/* Footer */}
            <div className="pt-8 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                Protected by hardware-level encryption.<br/>
                © 2026 DermRecord AI Medical Systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
