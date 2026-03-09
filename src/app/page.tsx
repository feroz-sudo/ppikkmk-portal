"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";

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

  const handleSignIn = async (program: "practicum" | "internship" | "supervisor") => {
    setSigningIn(program);
    try {
      await signInWithGoogle(program);
    } finally {
      setSigningIn(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] relative overflow-hidden px-4 py-8">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 select-none pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-upsi-navy rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-upsi-gold rounded-full blur-[120px] opacity-40 animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/40 overflow-hidden relative border border-white/10">

          {/* Header */}
          <div className="bg-upsi-navy px-6 py-10 sm:px-10 sm:pt-12 sm:pb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />

            {/* Logos */}
            <div className="flex justify-center items-center mb-6 sm:mb-8 relative z-10">
              <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl hover-lift cursor-pointer flex items-center justify-center">
                <img
                  src="/upsi-logo.png"
                  alt="UPSI Logo"
                  className="h-14 sm:h-20 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-tight mb-2 relative z-10">
              Portal Praktikum &amp; Internship
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-upsi-gold uppercase tracking-[0.1em] leading-snug mb-6 relative z-10">
              Kaunseling (Kesihatan Mental Klinikal)
            </h2>

            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2 relative z-10">
              <span className="text-upsi-gold text-xl sm:text-2xl font-black tracking-widest">PPIKKMK</span>
              <div className="w-1.5 h-1.5 bg-upsi-gold rounded-full animate-ping" />
            </div>

            <p className="text-blue-100 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-6 opacity-60">
              Universiti Pendidikan Sultan Idris
            </p>
          </div>

          {/* Sign In Section */}
          <div className="p-6 sm:p-10 space-y-4 sm:space-y-5 bg-white">
            <p className="text-center text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8">
              Welcome to the official UPSI clinical portal.<br className="hidden sm:block" />
              Please authenticate to access your dashboard.
            </p>

            <div className="grid gap-3 sm:gap-4">
              {/* Practicum Trainee */}
              <button
                id="btn-practicum-signin"
                onClick={() => handleSignIn("practicum")}
                disabled={!!signingIn}
                className="w-full flex items-center space-x-4 bg-[#1e293b] text-white font-bold py-4 sm:py-5 px-5 sm:px-6 rounded-[1.25rem] sm:rounded-[1.5rem] hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-slate-200 group"
              >
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                  <GoogleIcon />
                </div>
                <span className="flex-1 text-left text-xs sm:text-sm uppercase tracking-wide truncate">
                  {signingIn === "practicum" ? "Authenticating..." : "Practicum Trainee Sign In"}
                </span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/10 flex items-center justify-center font-black text-[9px] sm:text-[10px] bg-[#334155] shrink-0">P</div>
              </button>

              {/* Internship Trainee */}
              <button
                id="btn-internship-signin"
                onClick={() => handleSignIn("internship")}
                disabled={!!signingIn}
                className="w-full flex items-center space-x-4 bg-upsi-gold text-upsi-navy font-black py-4 sm:py-5 px-5 sm:px-6 rounded-[1.25rem] sm:rounded-[1.5rem] hover:bg-yellow-500 transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-upsi-gold/20 group"
              >
                <div className="bg-upsi-navy/10 p-2 rounded-xl group-hover:bg-upsi-navy/20 transition-colors">
                  <GoogleIcon />
                </div>
                <span className="flex-1 text-left text-xs sm:text-sm uppercase tracking-wide truncate">
                  {signingIn === "internship" ? "Authenticating..." : "Internship Trainee Sign In"}
                </span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-upsi-navy/10 flex items-center justify-center font-black text-[9px] sm:text-[10px] bg-white/20 shrink-0">I</div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-4 my-2 sm:my-4 opacity-30">
              <div className="flex-1 h-px bg-slate-300" />
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Institutional Access</span>
              <div className="flex-1 h-px bg-slate-300" />
            </div>

            {/* Supervisor */}
            <button
              id="btn-supervisor-signin"
              onClick={() => handleSignIn("supervisor")}
              disabled={!!signingIn}
              className="w-full flex items-center space-x-4 bg-white border border-slate-200 text-slate-700 font-black py-4 sm:py-5 px-5 sm:px-6 rounded-[1.25rem] sm:rounded-[1.5rem] hover:bg-slate-50 hover:border-upsi-navy transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm group"
            >
              <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-slate-200 transition-colors">
                <GoogleIcon />
              </div>
              <span className="flex-1 text-left text-xs sm:text-sm uppercase tracking-wide truncate">
                {signingIn === "supervisor" ? "Authenticating..." : "Supervisor Portal Sign In"}
              </span>
            </button>

            {/* LEGAL DISCLAIMER */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
              <Disclaimer variant="full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 sm:mt-12 text-center text-[10px] sm:text-xs font-medium text-slate-400/60 transition-opacity hover:opacity-100 px-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>PPIKKMK Portal</span>
          <span className="w-1 h-1 bg-upsi-gold rounded-full hidden sm:inline-block" />
          <span>Universiti Pendidikan Sultan Idris</span>
        </div>
      </footer>
    </div>
  );
}
