import { Link, useNavigate } from "react-router-dom";
import { 
  Activity, 
  Shield, 
  BrainCircuit, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Microscope, 
  ClipboardCheck, 
  HeartPulse,
  ChevronRight,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { motion } from "motion/react";

export function LandingPage() {
  const { setDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    setDemoMode(true);
    navigate("/dashboard");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdfdfc]/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">DermRecord <span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#clinical" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Clinical Trust</a>
            <a href="#tech" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">The Engine</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">Practitioner Login</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 text-sm sm:text-base px-4 sm:px-6">Enter Suite</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl opacity-60 z-0" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-3xl opacity-60 z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modernizing Clinical Care Since 2026</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-heading font-medium text-slate-900 leading-[1.1] md:leading-[0.9] tracking-tight mb-8">
                Precision in <br/>
                <span className="italic text-blue-600">Dermatological</span> <br/>
                Intelligence.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Streamline your dermatology practice with AI-powered clinical documentation, intelligent symptom extraction, and evidence-based treatment summaries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-10 h-14 sm:h-16 rounded-2xl gap-2 shadow-xl shadow-blue-200">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 h-14 sm:h-16 rounded-2xl border-slate-200 hover:bg-slate-50 transition-colors" onClick={handleDemo}>
                  Explore Demo
                </Button>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 border-t border-slate-100 pt-8">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold font-heading text-slate-900">4.8s</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Analysis Time</p>
                </div>
                <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold font-heading text-slate-900">1.2M+</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Symptoms Extracted</p>
                </div>
                <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold font-heading text-slate-900">100%</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">HIPAA Compliant</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main Hero Image */}
                <div className="rounded-[40px] overflow-hidden shadow-2xl shadow-blue-100 border-8 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1579154341098-e4e158cc7f2a?q=80&w=1200" 
                    alt="Dermatology Lab" 
                    className="w-full aspect-[4/5] object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-4 -left-4 sm:-top-10 sm:-left-10 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-50 max-w-[160px] sm:max-w-[200px]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                    <Microscope className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">Advanced NLP</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-tight font-medium">Symptom extraction in real-time</p>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-10 bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl text-white max-w-[180px] sm:max-w-[240px]"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BrainCircuit className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">AI Feedback</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium italic text-blue-100 leading-relaxed">
                    "Detected potential seborrheic dermatitis with 94% confidence based on clinical terminology."
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 px-4 sm:px-0">
            <p className="text-blue-600 font-bold uppercase tracking-[0.2em] text-xs mb-4">Core Ecosystem</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-slate-900 mb-6 leading-tight">
              Clinical Excellence, <br/>
              <span className="italic">Powered by Artificial Intelligence</span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg font-light leading-relaxed">
              Designed for clinical practitioners who demand precision. Our engine processes data with the scrutiny of a specialist and the speed of modern tech.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="group p-10 rounded-[32px] bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-50 transition-all border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-800 mb-4">Deep Extraction</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                Our NLP model identifies dermatological symptoms, medications, and anatomical locations from unstructured clinical notes instantly.
              </p>
              <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Learn tech <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group p-10 rounded-[32px] bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-50 transition-all border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-800 mb-4">Structured Reports</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                Convert messy observations into high-quality medical reports. Standardize your clinical output without adding hours to your day.
              </p>
              <div className="mt-8 flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View format <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group p-10 rounded-[32px] bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-50 transition-all border border-transparent hover:border-blue-100">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-800 mb-4">Treatment RAG</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                Retrieval Augmented Generation pulls from a verified vector database of clinical guidelines to provide evidence-based suggestions.
              </p>
              <div className="mt-8 flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Database <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Clinical Section */}
      <section id="clinical" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 scale-150 rotate-12 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200" alt="Doctor bg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 text-center lg:text-left">
              <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs mb-6">Clinical Trust</p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-medium leading-[1.1] md:leading-[0.9] mb-8">
                The New Standard <br className="hidden sm:block"/>
                <span className="text-blue-400">for Modern Clinical</span> <br className="hidden sm:block"/>
                Documentation.
              </h2>
              <div className="space-y-8 mt-12 text-left">
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Military-Grade Security</h4>
                    <p className="text-slate-400 font-light leading-relaxed">End-to-end encryption for all patient records, ensuring complete confidentiality and full HIPAA compliance.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Designed by Clinicians</h4>
                    <p className="text-slate-400 font-light leading-relaxed">Built with the medical workflow in mind. We minimize clicks and maximize patient face-time.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/10 text-center sm:text-left">
                <p className="text-4xl font-heading font-bold mb-2">99%</p>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Accuracy Rate</p>
              </div>
              <div className="bg-blue-600 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] text-center sm:text-left">
                <p className="text-4xl font-heading font-bold mb-2">2x</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/70">Efficiency Boost</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/10 sm:mt-4 h-32 sm:h-48 flex flex-col justify-center sm:justify-end text-center sm:text-left">
                <p className="text-2xl font-heading font-bold mb-1">Instant</p>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">RAG Feedback</p>
              </div>
              <div className="bg-teal-500 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] sm:mt-4 h-32 sm:h-48 flex flex-col justify-center sm:justify-end text-center sm:text-left">
                <p className="text-2xl font-heading font-bold mb-1">Seamless</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/70">EHR Integration</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-32 bg-[#fdfdfc]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            className="bg-blue-600 rounded-[32px] sm:rounded-[50px] p-8 py-16 md:p-24 text-center text-white relative overflow-hidden mx-2 sm:mx-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
               <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading font-medium leading-[1.1] md:leading-[0.9] mb-8 sm:mb-10">
                Ready to elevate your <br className="hidden sm:block"/>
                <span className="italic opacity-80">clinical standard?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-slate-50 text-lg sm:text-xl px-8 sm:px-12 h-16 sm:h-20 rounded-2xl sm:rounded-3xl font-bold gap-3 shadow-2xl">
                    Join the Suite <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-transparent border-white/40 text-white hover:bg-white/10 text-lg sm:text-xl px-8 sm:px-12 h-16 sm:h-20 rounded-2xl sm:rounded-3xl font-bold"
                  onClick={handleDemo}
                >
                  Watch Demo
                </Button>
              </div>
              <p className="mt-8 text-blue-100 font-medium tracking-wide text-xs sm:text-sm opacity-80 px-4">
                No credit card required. Clinical-grade security enabled.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800">DermRecord AI</span>
            </div>
            
            <div className="flex gap-8 sm:gap-12 mt-8 md:mt-0">
              <div className="space-y-4 text-center md:text-left">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform</h5>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">Privacy</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">Security</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">Compliance</a>
                </nav>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Intelligence</h5>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">RAG Engine</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">NLP Core</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600">Models</a>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest tracking-widest">
              © 2026 DermRecord AI Systems. Advanced Healthcare Solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
