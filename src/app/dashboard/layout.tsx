"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Calendar,
    Settings,
    LogOut,
    FileText,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Lightbulb,
    Target,
    Flag,
    AlertTriangle,
    MessageSquare,
    HeartPulse,
    UsersRound,
    BrainCircuit,
    Presentation,
    BookOpen,
    Menu,
    Shield,
    Calculator,
    CheckCircle2,
    History as HistoryIcon,
    UserCheck,
    Inbox
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, User } from "@/lib/firebase/db";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isFormsOpen, setIsFormsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [assignedTrainees, setAssignedTrainees] = useState<User[]>([]);
    const [openSessions, setOpenSessions] = useState<Set<string>>(new Set(["M252 (Current)"]));
    const [openTrainees, setOpenTrainees] = useState<Set<string>>(new Set());
    const [openProgress, setOpenProgress] = useState<Set<string>>(new Set());

    const toggleSession = (session: string) => {
        const next = new Set(openSessions);
        if (next.has(session)) next.delete(session);
        else next.add(session);
        setOpenSessions(next);
    };

    const toggleTrainee = (uid: string) => {
        const next = new Set(openTrainees);
        if (next.has(uid)) next.delete(uid);
        else next.add(uid);
        setOpenTrainees(next);
    };

    const toggleProgress = (uid: string) => {
        const next = new Set(openProgress);
        if (next.has(uid)) next.delete(uid);
        else next.add(uid);
        setOpenProgress(next);
    };

    // Group trainees by Academic Session
    const sessionsGrouped = assignedTrainees.reduce((acc, t) => {
        const session = t.academicSession || "M252 (Current)";
        if (!acc[session]) acc[session] = [];
        acc[session].push(t);
        return acc;
    }, {
        "M252 (Current)": assignedTrainees.length === 0 ? [{
            uid: "demo-trainee",
            name: "Ahmad Feroz (Trial)",
            matricNumber: "M20241001148",
            academicSession: "M252 (Current)",
            role: "trainee",
            email: "demo@upsi.edu.my"
        } as any] : []
    } as Record<string, User[]>);

    useEffect(() => {
        const fetchTrainees = async () => {
            if (user && userRole === "supervisor") {
                const q = query(collection(db, "users"), where("assignedSupervisorId", "==", user.uid));
                const snapshot = await getDocs(q);
                const list = snapshot.docs.map(doc => ({ ...doc.data() } as User));
                setAssignedTrainees(list);
            }
        };
        fetchTrainees();
    }, [user, userRole]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    // Automatically open forms dropdown if we are on a form route
    useEffect(() => {
        if (pathname?.startsWith('/dashboard/forms')) {
            setIsFormsOpen(true);
        }
    }, [pathname]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    const isActive = (path: string) => pathname === path;
    const isFormActive = (path: string) => pathname === path;

    const baseLinkClass = "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover-lift";
    const getLinkClass = (path: string) =>
        `${baseLinkClass} ${isActive(path)
            ? 'bg-gradient-to-r from-upsi-gold to-yellow-500 text-upsi-navy font-bold shadow-lg shadow-upsi-gold/20'
            : 'hover:bg-white/10 text-white/80 hover:text-white'}`;

    const subLinkClass = "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200";
    const getSubLinkClass = (path: string) =>
        `${subLinkClass} ${isFormActive(path)
            ? 'bg-white/15 text-white font-bold border-l-4 border-upsi-gold shadow-sm'
            : 'text-blue-100/60 hover:bg-white/10 hover:text-white'}`;

    return (
        <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className={`w-full md:w-64 bg-upsi-navy text-white flex-col h-full ${isSidebarOpen ? 'flex' : 'hidden'} shrink-0`}>
                <div className="p-8 shrink-0">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                            <span className="text-upsi-navy font-black text-xl">P</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tighter">PPIKKMK</h2>
                    </div>
                    <p className="text-[10px] text-upsi-gold font-bold uppercase tracking-[0.2em] opacity-80 leading-tight">
                        PORTAL PRAKTIKUM & INTERNSHIP<br />
                        <span className="text-white/60 font-medium tracking-normal normal-case italic">Kaunseling (Kesihatan Mental Klinikal)</span>
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto pb-4 custom-scrollbar text-[11px]">
                    {userRole === "supervisor" ? (
                        <>
                            {/* SUPERVISOR NAV */}
                            <Link href="/dashboard/supervisor" className={getLinkClass("/dashboard/supervisor")}>
                                <LayoutDashboard size={18} />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Supervision Hub</span>
                            </Link>

                            <div className="pt-4 space-y-2">
                                <h3 className="px-3 py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Institutional Records</h3>

                                {Object.keys(sessionsGrouped).length === 0 && (
                                    <div className="px-3 py-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-white/30 italic">No assigned trainees found</p>
                                        <p className="text-[8px] text-upsi-gold/50 mt-1 uppercase tracking-tighter">Please link trainees via your ID</p>
                                    </div>
                                )}

                                {Object.entries(sessionsGrouped).map(([sessionName, trainees]) => (
                                    <div key={sessionName} className="space-y-1">
                                        {/* LAYER 1: ACADEMIC SESSION */}
                                        <button
                                            onClick={() => toggleSession(sessionName)}
                                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors group"
                                        >
                                            {openSessions.has(sessionName) ? <ChevronDown size={14} className="text-upsi-gold" /> : <ChevronRight size={14} />}
                                            <BookOpen size={14} className={openSessions.has(sessionName) ? "text-upsi-gold" : "text-blue-300"} />
                                            <span className="font-black uppercase tracking-widest text-white/90">{sessionName}</span>
                                        </button>

                                        {openSessions.has(sessionName) && (
                                            <div className="ml-4 pl-3 border-l border-white/10 space-y-1 mt-1">
                                                {trainees.length === 0 ? (
                                                    <p className="text-[9px] text-white/20 italic px-3 py-1">No trainees in this session</p>
                                                ) : (
                                                    trainees.map(trainee => (
                                                        <div key={trainee.uid} className="space-y-1">
                                                            {/* LAYER 2: TRAINEE NAME & MATRIC */}
                                                            <button
                                                                onClick={() => toggleTrainee(trainee.uid)}
                                                                className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors text-left ${openTrainees.has(trainee.uid) ? 'text-white' : 'text-white/60'}`}
                                                            >
                                                                {openTrainees.has(trainee.uid) ? <ChevronDown size={12} className="text-upsi-gold" /> : <ChevronRight size={12} />}
                                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold ${openTrainees.has(trainee.uid) ? 'bg-upsi-gold text-upsi-navy' : 'bg-white/10'}`}>
                                                                    {trainee.name.charAt(0)}
                                                                </div>
                                                                <span className="font-bold truncate uppercase tracking-tight">
                                                                    {trainee.name.split(' ')[0]} {trainee.matricNumber}
                                                                </span>
                                                            </button>

                                                            {openTrainees.has(trainee.uid) && (
                                                                <div className="ml-4 pl-3 border-l border-white/10 space-y-1">
                                                                    {/* LAYER 3: PROGRESS FOLDER */}
                                                                    <button
                                                                        onClick={() => toggleProgress(trainee.uid)}
                                                                        className={`w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors text-left ${openProgress.has(trainee.uid) ? 'text-blue-200' : 'text-white/40'}`}
                                                                    >
                                                                        {openProgress.has(trainee.uid) ? <ChevronDown size={11} className="text-upsi-gold" /> : <ChevronRight size={11} />}
                                                                        <Inbox size={11} className={openProgress.has(trainee.uid) ? "text-upsi-gold" : ""} />
                                                                        <span className="font-black text-[9px] uppercase tracking-[0.2em]">Progress</span>
                                                                    </button>

                                                                    {openProgress.has(trainee.uid) && (
                                                                        <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5">
                                                                            {/* LAYER 4: CATEGORIES */}
                                                                            <Link
                                                                                href={`/dashboard/supervisor/portfolio/${trainee.uid}?tab=ki`}
                                                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-tighter ${pathname.includes(trainee.uid) && searchParams.get('tab') === 'ki' ? 'bg-upsi-gold/20 text-upsi-gold' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                                                            >
                                                                                <UserPlus size={10} />
                                                                                <span>[KI] Individual</span>
                                                                            </Link>
                                                                            <Link
                                                                                href={`/dashboard/supervisor/portfolio/${trainee.uid}?tab=kk`}
                                                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-tighter ${pathname.includes(trainee.uid) && searchParams.get('tab') === 'kk' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                                                            >
                                                                                <Users size={10} />
                                                                                <span>[KK] Group</span>
                                                                            </Link>
                                                                            <Link
                                                                                href={`/dashboard/supervisor/portfolio/${trainee.uid}?tab=programs`}
                                                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-tighter ${pathname.includes(trainee.uid) && searchParams.get('tab') === 'programs' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                                                            >
                                                                                <HeartPulse size={10} />
                                                                                <span>[Program/Event]</span>
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* TRAINEE NAV */}
                            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/dashboard/logbook" className={getLinkClass("/dashboard/logbook")}>
                                <ClipboardList size={20} />
                                <span>Logbook / Lampiran A</span>
                            </Link>
                            <Link href="/dashboard/rumusan" className={getLinkClass("/dashboard/rumusan")}>
                                <Calculator size={20} />
                                <span>Rumusan / Lampiran B</span>
                            </Link>
                            <Link href="/dashboard/clients/ki" className={getLinkClass("/dashboard/clients/ki")}>
                                <UserPlus size={20} />
                                <span>Individual (KI)</span>
                            </Link>
                            <Link href="/dashboard/clients/kk" className={getLinkClass("/dashboard/clients/kk")}>
                                <Users size={20} />
                                <span>Group (KK)</span>
                            </Link>
                            <Link href="/dashboard/calendar" className={getLinkClass("/dashboard/calendar")}>
                                <Calendar size={20} />
                                <span>Academic Calendar</span>
                            </Link>
                            <Link href="/dashboard/guidelines" className={getLinkClass("/dashboard/guidelines")}>
                                <BookOpen size={20} />
                                <span>Guidelines</span>
                            </Link>

                            {/* FORMS DROPDOWN */}
                            <div>
                                <button
                                    onClick={() => setIsFormsOpen(!isFormsOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors mt-2 ${pathname?.startsWith('/dashboard/forms') ? 'bg-white/10 font-bold' : 'hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileText size={20} className={pathname?.startsWith('/dashboard/forms') ? "text-white" : "text-upsi-gold"} />
                                        <span>Clinical Forms</span>
                                    </div>
                                    {isFormsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {isFormsOpen && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-white/20 space-y-1 py-1">
                                        <Link href="/dashboard/forms/form1" className={getSubLinkClass("/dashboard/forms/form1")}>
                                            <ClipboardList size={16} className={isFormActive("/dashboard/forms/form1") ? "text-upsi-gold" : "text-blue-300"} />
                                            <span>Form 1: Intake</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form2" className={getSubLinkClass("/dashboard/forms/form2")}>
                                            <FileText size={16} className={isFormActive("/dashboard/forms/form2") ? "text-upsi-gold" : "text-green-300"} />
                                            <span>Form 2: Progressive Notes</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form3" className={getSubLinkClass("/dashboard/forms/form3")}>
                                            <Lightbulb size={16} className={isFormActive("/dashboard/forms/form3") ? "text-upsi-gold" : "text-yellow-300"} />
                                            <span>Form 3: Case Concept.</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form4" className={getSubLinkClass("/dashboard/forms/form4")}>
                                            <Target size={16} className={isFormActive("/dashboard/forms/form4") ? "text-upsi-gold" : "text-red-300"} />
                                            <span>Form 4: Treatment Plan</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form5" className={getSubLinkClass("/dashboard/forms/form5")}>
                                            <Flag size={16} className={isFormActive("/dashboard/forms/form5") ? "text-upsi-gold" : "text-purple-300"} />
                                            <span>Form 5: Termination</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form6" className={getSubLinkClass("/dashboard/forms/form6")}>
                                            <AlertTriangle size={16} className={isFormActive("/dashboard/forms/form6") ? "text-upsi-gold" : "text-orange-300"} />
                                            <span>Form 6: Crisis Report</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form7" className={getSubLinkClass("/dashboard/forms/form7")}>
                                            <MessageSquare size={16} className={isFormActive("/dashboard/forms/form7") ? "text-upsi-gold" : "text-teal-300"} />
                                            <span>Form 7: Consultation</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form11" className={getSubLinkClass("/dashboard/forms/form11")}>
                                            <UsersRound size={16} className={isFormActive("/dashboard/forms/form11") ? "text-upsi-gold" : "text-indigo-300"} />
                                            <span>Form 11: Group Counsel.</span>
                                        </Link>
                                        <Link href="/dashboard/forms/form13" className={getSubLinkClass("/dashboard/forms/form13")}>
                                            <BrainCircuit size={16} className={isFormActive("/dashboard/forms/form13") ? "text-upsi-gold" : "text-cyan-300"} />
                                            <span>Form 13: Psych Assess.</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* PROGRAMS & EVENTS */}
                            <Link href="/dashboard/programs" className={getLinkClass("/dashboard/programs")}>
                                <Presentation size={20} />
                                <span>Programs &amp; Events</span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-white/10 bg-black/20 shrink-0">
                    <Link href="/dashboard/settings" className={getLinkClass("/dashboard/settings") + " mb-3"}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-semibold"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>

                    <div className="mt-6 pt-4 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-upsi-gold mb-1">UPSI Copyrighted</p>
                        <p className="text-[8px] leading-tight text-white/50">
                            The PPIKKMK portal aids in smoothing the clinical practicum and internship process.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
                {/* Header */}
                <header className="glass border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-30">
                    {/* Toggle and Brand */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="md:hidden font-bold text-upsi-navy text-xl">
                            PPIKKMK
                        </div>
                    </div>

                    {/* Logo Placeholders */}
                    <div className="hidden lg:flex items-center h-12">
                        <Image
                            src="/upsi-logo.png"
                            alt="UPSI Logo"
                            width={140}
                            height={50}
                            className="object-contain w-auto h-full transition-all hover:scale-105"
                            priority
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 ml-4 group">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-upsi-navy transition-colors">{user.displayName}</div>
                            <div className="text-[10px] text-upsi-gold uppercase font-black tracking-widest leading-none mt-1">{userRole || "Loading..."}</div>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-upsi-navy to-blue-800 flex items-center justify-center text-white font-bold shadow-lg shadow-upsi-navy/20 active:scale-95 transition-transform overflow-hidden ring-2 ring-white">
                            {user.displayName?.charAt(0) || "U"}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </main>

                {/* Footer */}
                <footer className="glass border-t border-slate-200 py-6 px-8 flex flex-col items-center shrink-0">
                    <Disclaimer variant="compact" className="text-center opacity-70 mb-4" />
                    <div className="flex items-center space-x-2 text-slate-400 font-medium text-xs">
                        <span>Portal PPIKKMK</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>UPSI Official Clinical Platform</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>Created by Ahmad Feroz</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
