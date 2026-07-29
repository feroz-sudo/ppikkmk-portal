"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { ShieldCheck, BookOpen, UserCheck } from "lucide-react";

// Google "G" SVG icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-upsi-gold border-t-transparent rounded-full animate-spin mx-auto shadow-xl" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing PPIKKMK...</p>
        </div>
      </div>
    );
  }

  const handleSignIn = async (program: "practicum" | "internship" | "supervisor" | "admin") => {
    if (program === "admin") {
      localStorage.removeItem("adminOverrideRole");
      localStorage.removeItem("adminOverrideProgram");
    } else {
      localStorage.setItem("adminOverrideRole", program === "supervisor" ? "supervisor" : "trainee");
      if (program !== "supervisor") {
        localStorage.setItem("adminOverrideProgram", program);
      } else {
        localStorage.removeItem("adminOverrideProgram");
      }
    }

    const authPromise = signInWithGoogle(program);
    setSigningIn(program);

    try {
      await authPromise;
    } catch (error) {
       // Error is already handled inside AuthContext
    } finally {
      setSigningIn(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT PANEL: HERO BRANDING (Spans full height & 50%+ width on laptops/desktops) */}
      <div className="w-full lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-upsi-navy via-[#1010a3] to-[#0a0a75] p-6 sm:p-10 lg:p-16 text-white relative flex flex-col justify-between min-h-[420px] lg:min-h-screen">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-upsi-gold/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content Header */}
        <div className="relative z-10 space-y-8 my-auto lg:my-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-center border border-white/20">
              <img
                src="/upsi-logo.png"
                alt="UPSI Logo"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2">
              <span className="text-upsi-gold text-lg sm:text-xl font-black tracking-widest">PPIKKMK</span>
              <div className="w-2.5 h-2.5 bg-upsi-gold rounded-full animate-ping" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-tight">
              Portal Praktikum &amp; Internship
            </h1>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-upsi-gold uppercase tracking-wider leading-snug">
              Kaunseling (Kesihatan Mental Klinikal)
            </h2>
            <p className="text-blue-100/70 font-semibold text-xs sm:text-sm uppercase tracking-widest">
              Universiti Pendidikan Sultan Idris
            </p>
          </div>

          {/* Pillars on Desktop */}
          <div className="hidden lg:grid gap-4 pt-6 max-w-xl">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <BookOpen className="w-6 h-6 text-upsi-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Standardized Clinical Logbooks</h4>
                <p className="text-blue-100/80 text-xs mt-0.5">Automated tracking for Borang 2–6, Weekly Reflections &amp; Daily Logs</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <UserCheck className="w-6 h-6 text-upsi-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Real-Time Supervisory Evaluation</h4>
                <p className="text-blue-100/80 text-xs mt-0.5">Instant review, attendance sign-off, and marks computation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-upsi-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Secure Institutional Data</h4>
                <p className="text-blue-100/80 text-xs mt-0.5">Encrypted, role-based access adhering to UPSI clinical standards</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-6 border-t border-white/10 text-xs text-blue-200/60 font-medium">
          Official Digital Portal for UPSI Master of Counseling (Clinical Mental Health)
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION FORM (Spans full height right half on desktop) */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-slate-50 lg:bg-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between min-h-screen lg:min-h-screen">
        <div className="my-auto space-y-8 max-w-xl mx-auto w-full">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Authentication Portal
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Welcome to the official UPSI clinical portal. Please authenticate with your official credentials to access your dashboard.
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-4">
            {/* Practicum Trainee */}
            <button
              id="btn-practicum-signin"
              onClick={() => handleSignIn("practicum")}
              disabled={!!signingIn}
              className="w-full flex items-center space-x-4 bg-[#1e293b] text-white font-bold py-4.5 px-6 rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 shadow-xl shadow-slate-200 group cursor-pointer"
            >
              <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
                <GoogleIcon />
              </div>
              <span className="flex-1 text-left text-sm uppercase tracking-wide truncate font-bold">
                {signingIn === "practicum" ? "Authenticating..." : "Practicum Trainee Sign In"}
              </span>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-black text-xs bg-[#334155] shrink-0">P</div>
            </button>

            {/* Internship Trainee */}
            <button
              id="btn-internship-signin"
              onClick={() => handleSignIn("internship")}
              disabled={!!signingIn}
              className="w-full flex items-center space-x-4 bg-upsi-gold text-upsi-navy font-black py-4.5 px-6 rounded-2xl hover:bg-yellow-500 transition-all active:scale-[0.99] disabled:opacity-60 shadow-xl shadow-upsi-gold/20 group cursor-pointer"
            >
              <div className="bg-upsi-navy/10 p-2.5 rounded-xl group-hover:bg-upsi-navy/20 transition-colors shrink-0">
                <GoogleIcon />
              </div>
              <span className="flex-1 text-left text-sm uppercase tracking-wide truncate font-bold">
                {signingIn === "internship" ? "Authenticating..." : "Internship Trainee Sign In"}
              </span>
              <div className="w-8 h-8 rounded-full border border-upsi-navy/10 flex items-center justify-center font-black text-xs bg-white/30 shrink-0">I</div>
            </button>
          </div>

          {/* Institutional Access Divider */}
          <div className="flex items-center space-x-4 my-6 opacity-30">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Institutional Access</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          {/* Supervisor Sign In */}
          <button
            id="btn-supervisor-signin"
            onClick={() => handleSignIn("supervisor")}
            disabled={!!signingIn}
            className="w-full flex items-center space-x-4 bg-white border-2 border-slate-200 text-slate-700 font-black py-4.5 px-6 rounded-2xl hover:bg-slate-50 hover:border-upsi-navy transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm group cursor-pointer"
          >
            <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-slate-200 transition-colors shrink-0">
              <GoogleIcon />
            </div>
            <span className="flex-1 text-left text-sm uppercase tracking-wide truncate font-bold">
              {signingIn === "supervisor" ? "Authenticating..." : "Supervisor Portal Sign In"}
            </span>
          </button>

          {/* Legal Disclaimer */}
          <div className="pt-4 border-t border-slate-100">
            <Disclaimer variant="full" />
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 text-center text-xs font-medium text-slate-400 max-w-xl mx-auto w-full">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="cursor-pointer hover:text-upsi-gold transition-colors font-bold"
              onClick={() => handleSignIn("admin")}
              title="Super Admin Access"
            >
              PPIKKMK Portal
            </span>
            <span className="w-1.5 h-1.5 bg-upsi-gold rounded-full" />
            <span>Universiti Pendidikan Sultan Idris</span>
          </div>
        </footer>
      </div>
    </div>
  );
}


