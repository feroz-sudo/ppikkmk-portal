"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeLogs, Log, deleteLogEntry } from "@/lib/firebase/db";
import {
    ClipboardList,
    FileDown,
    Trash2,
    CheckCircle2,
    Clock,
    Filter,
    ArrowUpDown,
    CheckSquare,
    MoreVertical,
    Plus,
    Edit2,
    User,
    Brain,
    Sigma,
    Calendar as CalendarIcon
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { LogbookForm } from "@/components/dashboard/LogbookForm";
import { ProfileSection } from "@/components/dashboard/logbook/ProfileSection";
import { ContractSection } from "@/components/dashboard/logbook/ContractSection";
import { ReflectionSection } from "@/components/dashboard/logbook/WeeklyReflection";
import { SummarySection } from "@/components/dashboard/logbook/SummarySection";

// Helper to group logs by week
const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
        label: `${monday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`
    };
};

export default function LogbookPage() {
    const { user, userProfile } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState<string>("All");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Log | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'harian' | 'profile' | 'kontrak' | 'refleksi' | 'rumusan'>('harian');
    const [importing, setImporting] = useState(false);

    const fetchLogs = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const fetchedLogs = await getTraineeLogs(user.uid);
                setLogs(fetchedLogs.sort((a, b) => {
                    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    const timeA = a.startTime || "00:00";
                    const timeB = b.startTime || "00:00";
                    return timeB.localeCompare(timeA);
                }));
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    const handleImportLogs = async () => {
        if (!user) return;
        if (!confirm("Adakah anda pasti mahu mengimport semua log harian daripada fail LOG HARIAN.md? Ini akan memadamkan log sedia ada anda untuk mengelakkan pertindihan dan menyelaraskan semua borang mingguan.")) return;
        
        setImporting(true);
        try {
            const res = await fetch("/api/read-log-harian");
            const data = await res.json();
            if (data.error) {
                alert("Gagal membaca file: " + data.error);
                return;
            }
            
            const content = data.content;
            const lines = content.split("\n");
            
            let currentWeek = 0;
            let currentDayId = "";
            let currentDayLabel = "";
            let currentDayDate = "";
            
            const weeklyData: Record<number, {
                logsByDay: Record<string, any[]>;
                f2fIndiv: number;
                f2fKelompok: number;
                profAct: number;
                admin: number;
                profDev: number;
                supervision: number;
            }> = {};
            
            const dayNameMap: Record<string, string> = {
                monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun",
                isnin: "mon", selasa: "tue", rabu: "wed", khamis: "thu", jumaat: "fri", sabtu: "sat", ahad: "sun"
            };

            const CATEGORIES = {
                INDIV: "Individual Counselling" as const,
                GROUP: "Group Counselling" as const,
                CRISIS: "Crisis Intervention" as const,
                PFA: "PFA/MHPSS" as const,
                PSYCHO: "Psychoeducation/Community" as const,
                TEST: "Testing & Assessment" as const,
                ADMIN: "Management & Admin" as const,
                DEV: "Professional Development" as const,
                SUPERVISION: "Supervision" as const
            };

            const determineCategory = (activity: string, location: string) => {
                const act = activity.toLowerCase();
                if (act.includes("individual counselling") || act.includes("kaunseling individu") || /\bPKIM\d+/i.test(act)) {
                    return CATEGORIES.INDIV;
                }
                if (act.includes("group counselling") || act.includes("kaunseling kelompok") || /\bPKKM\d+/i.test(act)) {
                    return CATEGORIES.GROUP;
                }
                if (act.includes("crisis") || act.includes("krisis") || act.includes("suicide") || act.includes("self-harm")) {
                    return CATEGORIES.CRISIS;
                }
                if (act.includes("pfa") || act.includes("mhpss") || act.includes("psychological first aid") || act.includes("hotline")) {
                    return CATEGORIES.PFA;
                }
                if (act.includes("psychoeducation") || act.includes("psikopendidikan") || act.includes("talk") || act.includes("outreach") || act.includes("poster") || act.includes("proposal") || act.includes("broadcast")) {
                    return CATEGORIES.PSYCHO;
                }
                if (act.includes("inventory") || act.includes("inventori") || act.includes("testing") || act.includes("assessment") || act.includes("ujian") || act.includes("sidek") || act.includes("saringan")) {
                    return CATEGORIES.TEST;
                }
                if (act.includes("supervision") || act.includes("penyeliaan") || act.includes("meeting with supervisor") || act.includes("supervisor")) {
                    return CATEGORIES.SUPERVISION;
                }
                if (act.includes("professional development") || act.includes("webinar") || act.includes("reading") || act.includes("read") || act.includes("literatur")) {
                    return CATEGORIES.DEV;
                }
                return CATEGORIES.ADMIN;
            };

            const calculateHours = (timeStr: string) => {
                if (!timeStr || timeStr.trim() === "-" || !timeStr.includes("-")) return 0;
                try {
                    const parts = timeStr.split("-");
                    const parseTime = (s: string) => {
                        s = s.trim().toLowerCase();
                        let hours = 0, minutes = 0;
                        const match = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
                        if (match) {
                            hours = parseInt(match[1]);
                            minutes = parseInt(match[2]);
                            const ampm = match[3];
                            if (ampm === "pm" && hours < 12) hours += 12;
                            if (ampm === "am" && hours === 12) hours = 0;
                        } else {
                            const simpleMatch = s.match(/^(\d{1,2})(?::(\d{2}))?$/);
                            if (simpleMatch) {
                                hours = parseInt(simpleMatch[1]);
                                minutes = simpleMatch[2] ? parseInt(simpleMatch[2]) : 0;
                            }
                        }
                        return hours * 60 + minutes;
                    };
                    const startMin = parseTime(parts[0]);
                    const endMin = parseTime(parts[1]);
                    if (endMin > startMin) {
                        return parseFloat(((endMin - startMin) / 60).toFixed(2));
                    }
                } catch (e: any) {
                    console.error("Error calculating hours for:", timeStr, e.message);
                }
                return 0;
            };

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const weekMatch = line.match(/MINGGU KE:\s*(\d+)/i);
                if (weekMatch) {
                    currentWeek = parseInt(weekMatch[1]);
                    if (!weeklyData[currentWeek]) {
                        weeklyData[currentWeek] = {
                            logsByDay: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
                            f2fIndiv: 0, f2fKelompok: 0, profAct: 0, admin: 0, profDev: 0, supervision: 0
                        };
                    }
                    if (!line.includes("BUKU LOG HARIAN")) {
                        continue;
                    }
                }

                const dayHeaderMatch = line.match(/BUKU LOG HARIAN.*?(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|ISNIN|SELASA|RABU|KHAMIS|JUMAAT|SABTU|AHAD).*?(\d{2}\/\d{2}\/\d{4})/i);
                if (dayHeaderMatch) {
                    const dayLabel = dayHeaderMatch[1];
                    currentDayLabel = dayLabel;
                    currentDayId = dayNameMap[dayLabel.toLowerCase()] || "mon";
                    const rawDate = dayHeaderMatch[2];
                    const parts = rawDate.split("/");
                    currentDayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    continue;
                }

                if (line.startsWith("|")) {
                    if (line.toLowerCase().includes("lokasi") || line.includes("---")) continue;
                    const cols = line.split("|").map((s: string) => s.trim());
                    if (cols.length >= 5) {
                        const location = cols[1];
                        const timeRange = cols[2];
                        const activity = cols[3];
                        const notes = cols[4];

                        if (!location && !timeRange && !activity) continue;

                        const category = determineCategory(activity, location || "");
                        const hours = calculateHours(timeRange);

                        const logEntry = {
                            location: location || "-",
                            time: timeRange || "-",
                            activity: activity || "-",
                            notes: notes || "-",
                            category,
                            hours
                        };

                        if (currentWeek && currentDayId) {
                            weeklyData[currentWeek].logsByDay[currentDayId].push(logEntry);
                        }
                    }
                }
            }

            const { db } = await import("@/lib/firebase/db");
            const { collection, addDoc, getDocs, query, where, doc, setDoc, writeBatch } = await import("firebase/firestore");
            
            // Delete old logs
            const q = query(collection(db, "logs"), where("traineeId", "==", user.uid));
            const oldLogsSnap = await getDocs(q);
            let batch = writeBatch(db);
            let count = 0;
            for (const d of oldLogsSnap.docs) {
                batch.delete(d.ref);
                count++;
                if (count >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                }
            }
            if (count > 0) {
                await batch.commit();
            }

            let totalAdded = 0;
            const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

            for (const [weekNumStr, weekObj] of Object.entries(weeklyData)) {
                const weekNum = parseInt(weekNumStr);
                let weekF2FIndiv = 0;
                let weekF2FKelompok = 0;
                let weekProfAct = 0;
                let weekAdmin = 0;
                let weekProfDev = 0;
                let weekSupervision = 0;

                const cleanLogsByDay: Record<string, any[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
                const matrix: Record<string, Record<string, string>> = {};
                const categoriesList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
                categoriesList.forEach(cId => {
                    matrix[cId] = { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" };
                });

                for (const dayId of dayKeys) {
                    const logsList = weekObj.logsByDay[dayId] || [];
                    
                    const startDateSem = new Date(2026, 2, 9);
                    const startOffset = (weekNum - 1) * 7;
                    const dayOffset = dayKeys.indexOf(dayId);
                    const date = new Date(startDateSem);
                    date.setDate(startDateSem.getDate() + startOffset + dayOffset);
                    
                    const formatLocal = (d: Date) => {
                        const y = d.getFullYear();
                        const m = (d.getMonth() + 1).toString().padStart(2, '0');
                        const day = d.getDate().toString().padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    };
                    const dateStr = formatLocal(date);

                    for (const log of logsList) {
                        const logRef = await addDoc(collection(db, "logs"), {
                            traineeId: user.uid,
                            date: dateStr,
                            location: log.location,
                            startTime: log.time.split("-")[0]?.trim() || "-",
                            endTime: log.time.split("-")[1]?.trim() || "-",
                            hours: log.hours,
                            category: log.category,
                            description: log.activity,
                            notes: log.notes,
                            status: "pending",
                            createdAt: new Date()
                        });

                        totalAdded++;

                        const dailyLogObj = {
                            id: logRef.id,
                            location: log.location,
                            time: log.time,
                            activity: log.activity,
                            notes: log.notes,
                            hours: log.hours,
                            category: log.category
                        };
                        cleanLogsByDay[dayId].push(dailyLogObj);

                        if (log.category === CATEGORIES.INDIV) {
                            weekF2FIndiv += log.hours;
                            const val = parseFloat(matrix['a'][dayId]) || 0;
                            matrix['a'][dayId] = (val + log.hours).toFixed(1);
                        } else if (log.category === CATEGORIES.GROUP) {
                            weekF2FKelompok += log.hours;
                            const val = parseFloat(matrix['b'][dayId]) || 0;
                            matrix['b'][dayId] = (val + log.hours).toFixed(1);
                        } else if (log.category === CATEGORIES.ADMIN) {
                            weekAdmin += log.hours;
                            const val = parseFloat(matrix['g'][dayId]) || 0;
                            matrix['g'][dayId] = (val + log.hours).toFixed(1);
                        } else if (log.category === CATEGORIES.DEV) {
                            weekProfDev += log.hours;
                            const val = parseFloat(matrix['h'][dayId]) || 0;
                            matrix['h'][dayId] = (val + log.hours).toFixed(1);
                        } else if (log.category === CATEGORIES.SUPERVISION) {
                            weekSupervision += log.hours;
                            const val = parseFloat(matrix['i'][dayId]) || 0;
                            matrix['i'][dayId] = (val + log.hours).toFixed(1);
                        } else {
                            weekProfAct += log.hours;
                            let catKey = 'c';
                            if (log.category === CATEGORIES.CRISIS) catKey = 'c';
                            else if (log.category === CATEGORIES.PFA) catKey = 'd';
                            else if (log.category === CATEGORIES.PSYCHO) catKey = 'e';
                            else if (log.category === CATEGORIES.TEST) catKey = 'f';
                            
                            const val = parseFloat(matrix[catKey][dayId]) || 0;
                            matrix[catKey][dayId] = (val + log.hours).toFixed(1);
                        }
                    }
                }

                categoriesList.forEach(cId => {
                    dayKeys.forEach(dayId => {
                        if (matrix[cId][dayId] === "" || parseFloat(matrix[cId][dayId]) === 0) {
                            matrix[cId][dayId] = "";
                        }
                    });
                });

                const flatLogs: any[] = [];
                const dayNames: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
                dayKeys.forEach(dayId => {
                    const startDateSem = new Date(2026, 2, 9);
                    const startOffset = (weekNum - 1) * 7;
                    const dayOffset = dayKeys.indexOf(dayId);
                    const date = new Date(startDateSem);
                    date.setDate(startDateSem.getDate() + startOffset + dayOffset);
                    const dd = date.getDate().toString().padStart(2, '0');
                    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
                    const yyyy = date.getFullYear();
                    const dateDayStr = `${dd}/${mm}/${yyyy} ${dayNames[dayId]}`;

                    (cleanLogsByDay[dayId] || []).forEach(l => {
                        flatLogs.push({
                            ...l,
                            dateDay: dateDayStr
                        });
                    });
                });

                await setDoc(doc(db, "weekly_forms", `${user.uid}_logHarian_${weekNum}`), {
                    traineeId: user.uid,
                    type: "logHarian",
                    weekNumber: String(weekNum),
                    logs: flatLogs,
                    logsByDay: cleanLogsByDay,
                    f2fIndiv: String(weekF2FIndiv),
                    f2fKelompok: String(weekF2FKelompok),
                    profAct: String(weekProfAct),
                    admin: String(weekAdmin),
                    profDev: String(weekProfDev),
                    supervision: String(weekSupervision),
                    updatedAt: new Date()
                });

                const startDateSem = new Date(2026, 2, 9);
                const startOffset = (weekNum - 1) * 7;
                const monday = new Date(startDateSem);
                monday.setDate(startDateSem.getDate() + startOffset);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                
                const formatLocal = (d: Date) => {
                    const y = d.getFullYear();
                    const m = (d.getMonth() + 1).toString().padStart(2, '0');
                    const day = d.getDate().toString().padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };

                await setDoc(doc(db, "weekly_forms", `${user.uid}_rumusanMingguan_${weekNum}`), {
                    traineeId: user.uid,
                    type: "rumusanMingguan",
                    weekNumber: String(weekNum),
                    startDate: formatLocal(monday),
                    endDate: formatLocal(sunday),
                    matrix,
                    updatedAt: new Date()
                });
            }

            alert(`Import Berjaya! Penuhkan log harian dari file markdown selesai. ${totalAdded} entri log dimasukkan dan semua rumusan mingguan dikemaskini.`);
            fetchLogs();
        } catch (error: any) {
            console.error("Import failed:", error);
            alert(`Gagal mengimport: ${error.message || "Ralat tidak diketahui"}`);
        } finally {
            setImporting(false);
        }
    };


    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id: string) => {
        if (!id) return;
        if (window.confirm("Are you sure you want to delete this log entry?")) {
            await deleteLogEntry(id);
            fetchLogs();
        }
    };

    // Grouping Logic
    const weeks = Array.from(new Set(logs.map(log => getWeekRange(log.date).label))).sort((a, b) => b.localeCompare(a));
    const filteredLogs = selectedWeek === "All" ? logs : logs.filter(log => getWeekRange(log.date).label === selectedWeek);
    const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);

    const tabs = [
        { id: 'harian', label: 'Log Harian', icon: <ClipboardList size={18} /> },
        { id: 'profile', label: 'Maklumat Diri', icon: <User size={18} /> },
        { id: 'kontrak', label: 'Kontrak (B)', icon: <CheckSquare size={18} /> },
        { id: 'refleksi', label: 'Refleksi Mingguan', icon: <Brain size={18} /> },
        { id: 'rumusan', label: 'Rumusan Jam', icon: <Sigma size={18} /> },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center uppercase">
                        <ClipboardList className="mr-3 text-upsi-navy" size={32} />
                        Buku Log Praktikum
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">UPSI Comprehensive Clinical Attendance Record</p>
                </div>
                <div className="flex items-center space-x-3">
                    {(userProfile?.matricNumber?.toLowerCase() === "m20241001148") && (
                        <button
                            onClick={handleImportLogs}
                            disabled={importing}
                            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover-lift disabled:opacity-50"
                        >
                            <FileDown size={18} />
                            <span className="text-xs uppercase tracking-widest">{importing ? 'Importing...' : 'Import Registers'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setSelectedLog(undefined);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-upsi-navy text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-upsi-navy/20 hover-lift"
                    >
                        <Plus size={18} />
                        <span className="text-xs uppercase tracking-widest">New Entry</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover-lift"
                    >
                        <FileDown size={18} />
                        <span className="text-xs uppercase tracking-widest">Global Print</span>
                    </button>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-2 no-print">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-upsi-navy text-white shadow-lg shadow-upsi-navy/20 active:scale-95' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm'}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'harian' && (
                <div className="space-y-6">
                    {/* Filter & Summary Bar */}
                    <div className="glass p-6 rounded-[2rem] shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white no-print">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
                                <Filter size={16} className="text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Week</span>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-upsi-navy cursor-pointer ml-2 outline-none"
                                >
                                    <option value="All">Full Semester</option>
                                    {weeks.map(week => <option key={week} value={week}>{week}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Entries</div>
                                <div className="text-2xl font-black text-slate-800 leading-none">{filteredLogs.length}</div>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{selectedWeek === 'All' ? 'Total' : 'Weekly'} Hours</div>
                                <div className="text-3xl font-black text-upsi-navy leading-none">
                                    {totalHours.toFixed(1)} <span className="text-sm">HRS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-100">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center no-print">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Daily Logs: {selectedWeek}</span>
                            <button onClick={() => window.print()} className="flex items-center space-x-2 text-upsi-navy hover:bg-white px-4 py-2 rounded-xl transition-all border border-transparent hover:border-upsi-navy/10 font-bold text-[10px] uppercase tracking-widest">
                                <FileDown size={14} />
                                <span>Print Current Table</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Location / Category</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[40%]">Notes / Description</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Hours</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest px-6 py-12 italic">Loading Logs...</td></tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest px-6 py-12 italic">No logs found</td></tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group text-[11px]">
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-slate-800">{new Date(log.date).toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(log.date).toLocaleDateString('en-MY', { weekday: 'short' })}</div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="text-slate-700 font-black tracking-tight">{log.startTime || '--:--'}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 whitespace-nowrap">to {log.endTime || '--:--'}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-upsi-navy uppercase truncate max-w-[120px]">{log.location || 'N/A'}</div>
                                                    <div className="mt-1">
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">{log.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                                                    {log.description}
                                                </td>
                                                <td className="px-6 py-5 text-center font-black text-upsi-navy bg-slate-50/30">
                                                    {log.hours}
                                                </td>
                                                <td className="px-6 py-5 text-center no-print border-l border-slate-50">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLog(log);
                                                                setIsFormOpen(true);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-upsi-navy hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(log.id!)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'kontrak' && <ContractSection />}
            {activeTab === 'refleksi' && <ReflectionSection />}
            {activeTab === 'rumusan' && <SummarySection logs={logs} />}

            <Disclaimer variant="full" className="mt-8 no-print" />

            {/* Logbook Form Modal */}
            {isFormOpen && (
                <LogbookForm
                    onLogAdded={fetchLogs}
                    initialData={selectedLog}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            <style jsx global>{`
                @media print {
                    .no-print, button, select { display: none !important; }
                    body { background: white !important; }
                    .glass { box-shadow: none !important; border: 1px solid #eee !important; background: white !important; }
                    table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt; }
                    th, td { border: 1px solid #ddd !important; padding: 10px !important; color: black !important; }
                    textarea { border: none !important; resize: none !important; }
                    h1, h2, h3 { color: black !important; }
                }
            `}</style>
        </div>
    );
}
