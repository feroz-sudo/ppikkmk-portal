"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { ShieldCheck, BookOpen, UserCheck, Sparkles, ChevronRight, Lock } from "lucide-react";

// Official Google "G" SVG icon
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
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-upsi-gold border-t-transparent rounded-full animate-spin mx-auto shadow-2xl" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Secure Clinical Session...</p>
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
    <div className="min-h-screen w-full bg-[#0B132B] flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT PANEL: HERO & INSTITUTIONAL BRANDING */}
      <div className="w-full lg:w-7/12 xl:w-7/12 bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0F172A] p-8 sm:p-12 lg:p-16 text-white relative flex flex-col justify-between min-h-[480px] lg:min-h-screen border-r border-white/10">
        {/* Ambient Glow & Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-upsi-navy/40 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-upsi-gold/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Content Header */}
        <div className="relative z-10 space-y-10 my-auto lg:my-0">
          {/* Top Bar with Logo & Institutional Badge */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/30">
              <img
                src="/upsi-logo.png"
                alt="UPSI Logo"
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider leading-none">Universiti Pendidikan Sultan Idris</p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight mt-0.5">Fakulti Pembangunan Manusia</p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-upsi-gold/20 to-upsi-gold/10 backdrop-blur-md border border-upsi-gold/30 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-upsi-gold animate-pulse" />
              <span className="text-upsi-gold text-xs font-extrabold tracking-widest uppercase">PPIKKMK Portal</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4 pt-2">
            <div className="border-l-4 border-upsi-gold pl-4 sm:pl-6 space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-none text-white">
                Portal Praktikum <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-upsi-gold">&amp; Internship</span>
              </h1>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-upsi-gold uppercase tracking-wider">
                Kaunseling (Kesihatan Mental Klinikal)
              </h2>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed pt-2">
              Integrated clinical administration portal for real-time supervisory tracking, standardized logbook compliance, and official competency management.
            </p>
          </div>

          {/* Clinical Pillars */}
          <div className="hidden lg:grid gap-4 pt-4 max-w-xl">
            <div className="flex items-start space-x-4 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all">
              <div className="bg-upsi-gold/20 p-2.5 rounded-xl text-upsi-gold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Standardized Clinical Logbooks</h4>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">Automated calculation &amp; submission for Borang 1–13, Daily Logs &amp; Weekly Reflections.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all">
              <div className="bg-upsi-gold/20 p-2.5 rounded-xl text-upsi-gold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Faculty &amp; Site Supervisory Oversight</h4>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">Real-time attendance sign-off, live portfolio review, and clinical marks entry.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all">
              <div className="bg-upsi-gold/20 p-2.5 rounded-xl text-upsi-gold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Institutional Security &amp; Compliance</h4>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">Role-scoped encryption meeting UPSI clinical mental health program standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Official UPSI Clinical Management System</span>
          <span className="text-[10px] text-upsi-gold/80 bg-upsi-gold/10 px-3 py-1 rounded-full border border-upsi-gold/20">Version 2.4</span>
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION PORTAL */}
      <div className="w-full lg:w-5/12 xl:w-5/12 bg-slate-50 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-screen">
        <div className="my-auto space-y-6 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-upsi-navy uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100 mb-2">
              <Lock className="w-3.5 h-3.5 text-upsi-navy" />
              <span>Secure Authentication</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Access Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Select your institutional portal role below to authenticate with your registered Google account.
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-3 pt-2">
            {/* Practicum Trainee */}
            <div
              onClick={() => handleSignIn("practicum")}
              className={`p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${signingIn === "practicum" ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-slate-900 p-3 rounded-xl text-white group-hover:bg-slate-800 transition-colors shrink-0">
                  <GoogleIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-slate-800">
                      Practicum Trainee
                    </h4>
                    <span className="text-[10px] font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded-md">P</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {signingIn === "practicum" ? "Authenticating session..." : "Submit daily logbooks & clinical client cases"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900 transition-all shrink-0" />
              </div>
            </div>

            {/* Internship Trainee */}
            <div
              onClick={() => handleSignIn("internship")}
              className={`p-4 bg-white rounded-2xl border-2 border-upsi-gold/50 hover:border-upsi-gold shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${signingIn === "internship" ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-upsi-gold p-3 rounded-xl text-upsi-navy group-hover:bg-yellow-500 transition-colors shrink-0">
                  <GoogleIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-upsi-navy">
                      Internship Trainee
                    </h4>
                    <span className="text-[10px] font-extrabold text-upsi-navy bg-upsi-gold/40 px-2 py-0.5 rounded-md">I</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {signingIn === "internship" ? "Authenticating session..." : "Advanced clinical internship hours & reflections"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-upsi-navy transition-all shrink-0" />
              </div>
            </div>

            {/* Supervisor */}
            <div
              onClick={() => handleSignIn("supervisor")}
              className={`p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-upsi-navy shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${signingIn === "supervisor" ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-xl text-upsi-navy border border-blue-100 group-hover:bg-blue-100 transition-colors shrink-0">
                  <GoogleIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-upsi-navy">
                      Faculty / Site Supervisor
                    </h4>
                    <span className="text-[10px] font-extrabold text-upsi-navy bg-blue-100 px-2 py-0.5 rounded-md">S</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {signingIn === "supervisor" ? "Authenticating session..." : "Review logbooks, verify hours & submit evaluations"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-upsi-navy transition-all shrink-0" />
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-2">
            <Disclaimer variant="full" />
          </div>
        </div>

        {/* Footer copyright */}
        <footer className="pt-4 text-center text-[11px] font-medium text-slate-400 max-w-md mx-auto w-full">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="cursor-pointer hover:text-upsi-gold transition-colors font-bold text-slate-500"
              onClick={() => handleSignIn("admin")}
              title="Super Admin Access Portal"
            >
              PPIKKMK Management System
            </span>
            <span className="w-1 h-1 bg-upsi-gold rounded-full" />
            <span>Universiti Pendidikan Sultan Idris</span>
          </div>
        </footer>
      </div>
    </div>
  );
}



