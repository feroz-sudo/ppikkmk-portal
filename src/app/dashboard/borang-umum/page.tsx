"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
    db, 
    getTraineeLogs, 
    getTraineeClients, 
    getTraineeSessions, 
    getTraineeProfile, 
    Log, 
    Client, 
    Session,
    TraineeProfile
} from "@/lib/firebase/db";
import { 
    FolderOpen, 
    Printer, 
    Download, 
    FileText, 
    Calendar, 
    User, 
    BookOpen, 
    Activity, 
    Users, 
    HelpCircle, 
    UserCheck,
    CheckCircle2,
    Settings,
    Calculator
} from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, addDays } from "date-fns";

export default function BorangUmumPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [profile, setProfile] = useState<TraineeProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Form inputs (prefilled from profile if available)
    const [settingName, setSettingName] = useState("Unit Kaunseling BHEPA USM");
    const [studentName, setStudentName] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [academicSupervisor, setAcademicSupervisor] = useState("Dr. Nor Shafrin binti Ahmad");
    const [dateOfDeclaration, setDateOfDeclaration] = useState(format(new Date(), "yyyy-MM-dd"));

    const [activeTab, setActiveTab] = useState<string>("lampiran-a");

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    async function fetchData() {
        try {
            setLoading(true);
            const [userLogs, userClients, userSessions, userProfile] = await Promise.all([
                getTraineeLogs(user!.uid),
                getTraineeClients(user!.uid),
                getTraineeSessions(user!.uid),
                getTraineeProfile(user!.uid)
            ]);

            setLogs(userLogs);
            setClients(userClients);
            setSessions(userSessions);
            if (userProfile) {
                setProfile(userProfile);
                setStudentName(userProfile.fullName || "");
                setMatricNumber(userProfile.matricNumber || "");
                if (userProfile.practicumSite) {
                    setSettingName(userProfile.practicumSite);
                }
            } else {
                setStudentName(user?.displayName || "");
            }
        } catch (error) {
            console.error("Failed to load data for Borang Umum", error);
        } finally {
            setLoading(false);
        }
    }

    // --- Helper calculations & mappings ---

    // 1. Lampiran A Attendance
    const generateLampiranA = () => {
        const weeks = [];
        const startDateSem = new Date(2026, 2, 9); // 9 March 2026
        const dayNames = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"];
        
        // Define public holiday date strings for easy checks
        const holidays: Record<string, string> = {
            "20/03/2026": "PUBLIC HOLIDAY (Hari Raya Aidilfitri)",
            "23/03/2026": "PUBLIC HOLIDAY (Hari Raya Aidilfitri)",
            "24/03/2026": "PUBLIC HOLIDAY (Hari Raya Aidilfitri)",
            "01/05/2026": "PUBLIC HOLIDAY (Labour Day)",
            "15/06/2026": "PUBLIC HOLIDAY (Hari Raya Aidiladha)",
            "16/06/2026": "PUBLIC HOLIDAY (Hari Raya Aidiladha)"
        };

        for (let w = 1; w <= 18; w++) {
            const days = [];
            for (let d = 0; d < 5; d++) {
                const dayDate = addDays(startDateSem, (w - 1) * 7 + d);
                const dateStr = format(dayDate, "dd/MM/yyyy");
                const dayName = dayNames[d];
                
                let dutyTime = "8.00 pagi - 5.00 ptg";
                let catatan = "";
                
                if (holidays[dateStr]) {
                    dutyTime = "-";
                    catatan = holidays[dateStr];
                } else if (dayName === "Jumaat" && w >= 5 && w <= 16) {
                    dutyTime = "-";
                    catatan = "Classes at UPSI";
                }

                days.push({
                    date: dateStr,
                    day: dayName,
                    time: dutyTime,
                    catatan
                });
            }
            weeks.push({ weekNumber: w, days });
        }
        return weeks;
    };

    const getJsDate = (d: any): Date => {
        if (!d) return new Date();
        if (d instanceof Date) return d;
        if (typeof d.toDate === "function") return d.toDate();
        if (d.seconds) return new Date(d.seconds * 1000);
        return new Date(d);
    };

    // 2. Lampiran C: Individual Sessions Register
    const getIndividualSessions = () => {
        // Individual counseling sessions are Form 2
        return sessions
            .filter(s => s.formType === "Form2")
            .sort((a, b) => {
                const dateA = getJsDate(a.date);
                const dateB = getJsDate(b.date);
                return dateA.getTime() - dateB.getTime();
            })
            .map((s, idx) => {
                const clientObj = clients.find(c => c.id === s.clientId);
                const dateObj = getJsDate(s.date);
                return {
                    bil: idx + 1,
                    clientName: clientObj?.demographics?.name || s.formData?.personalData?.clientFullName || "Client Name",
                    clientCode: clientObj?.clientId || "N/A",
                    date: format(dateObj, "dd/MM/yyyy"),
                    time: (s as any).time || s.formData?.personalData?.sessionTime || s.formData?.personalData?.time || "09:00 - 10:00",
                    sessionNo: s.sessionId || "N/A",
                    duration: s.duration ? `${s.duration.toFixed(1)} jam` : "1.0 jam"
                };
            });
    };

    // 3. Lampiran D: Group Sessions Register
    const getGroupSessions = () => {
        return sessions
            .filter(s => s.formType === "Form11")
            .sort((a, b) => {
                const dateA = getJsDate(a.date);
                const dateB = getJsDate(b.date);
                return dateA.getTime() - dateB.getTime();
            })
            .map((s, idx) => {
                const dateObj = getJsDate(s.date);
                return {
                    bil: idx + 1,
                    groupName: s.formData?.groupName || "Group Name",
                    memberCount: s.formData?.numberOfMembers || "N/A",
                    date: format(dateObj, "dd/MM/yyyy"),
                    time: (s as any).time || s.formData?.personalData?.sessionTime || s.formData?.personalData?.time || "20:00 - 21:45",
                    sessionNo: s.sessionId || "N/A",
                    duration: s.duration ? `${s.duration.toFixed(1)} jam` : "1.7 jam"
                };
            });
    };

    // 4. Lampiran E: Individual Progress Register
    const getIndividualProgress = () => {
        // Find all KI clients
        const kiClients = clients.filter(c => c.type === "KI" || c.clientId?.startsWith("0"));
        return kiClients.map((client, idx) => {
            // Find all sessions for this client
            const clientSess = sessions
                .filter(s => s.clientId === client.id)
                .sort((a, b) => {
                    const dateA = getJsDate(a.date);
                    const dateB = getJsDate(b.date);
                    return dateA.getTime() - dateB.getTime();
                });

            const sessionDates: Record<number, string> = {};
            for (let sIdx = 0; sIdx < 9; sIdx++) {
                if (clientSess[sIdx]) {
                    const dateObj = getJsDate(clientSess[sIdx].date);
                    sessionDates[sIdx + 1] = format(dateObj, "dd/MM/yyyy");
                } else {
                    sessionDates[sIdx + 1] = "-";
                }
            }

            return {
                bil: idx + 1,
                clientName: client.demographics?.name || "Client Name",
                clientCode: client.clientId || "N/A",
                sessions: sessionDates
            };
        });
    };

    // 5. Lampiran F: Group Progress Register
    const getGroupProgress = () => {
        const groups = Array.from(new Set(sessions.filter(s => s.formType === "Form11").map(s => s.formData?.groupName).filter(Boolean)));
        return groups.map((gName, idx) => {
            const groupSess = sessions
                .filter(s => s.formType === "Form11" && s.formData?.groupName === gName)
                .sort((a, b) => {
                    const dateA = getJsDate(a.date);
                    const dateB = getJsDate(b.date);
                    return dateA.getTime() - dateB.getTime();
                });

            const sessionDates: Record<number, string> = {};
            for (let sIdx = 0; sIdx < 7; sIdx++) {
                if (groupSess[sIdx]) {
                    const dateObj = getJsDate(groupSess[sIdx].date);
                    sessionDates[sIdx + 1] = format(dateObj, "dd/MM/yyyy");
                } else {
                    sessionDates[sIdx + 1] = "-";
                }
            }

            return {
                bil: idx + 1,
                groupName: gName as string,
                sessions: sessionDates
            };
        });
    };

    // 6. Lampiran G: PFA Register
    const getPFARegister = () => {
        return logs
            .filter(l => l.category === "PFA/MHPSS")
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((l, idx) => {
                let clientName = "Hotline PFA Client";
                let clientCode = "N/A";
                const desc = l.description || "";
                if (desc.includes("-")) {
                    clientName = desc.split("-")[1]?.trim() || clientName;
                }
                return {
                    bil: idx + 1,
                    clientName,
                    clientCode,
                    date: format(parseISO(l.date), "dd/MM/yyyy"),
                    time: `${l.startTime || "09:00"} - ${l.endTime || "09:30"}`,
                    duration: `${l.hours.toFixed(1)} jam`
                };
            });
    };

    // 7. Lampiran H: Testing Register
    const getTestingRegister = () => {
        const fromLogs = logs
            .filter(l => l.category === "Testing & Assessment")
            .map(l => ({
                date: l.date,
                name: "Testing Client",
                time: `${l.startTime || "09:00"} - ${l.endTime || "10:00"}`,
                hours: l.hours
            }));
            
        const fromSessions = sessions
            .filter(s => s.formType === "Form13")
            .map(s => {
                const clientObj = clients.find(c => c.id === s.clientId);
                const dateObj = getJsDate(s.date);
                return {
                    date: format(dateObj, "yyyy-MM-dd"),
                    name: clientObj?.demographics?.name || s.formData?.personalData?.clientFullName || "Testing Client",
                    time: "09:00 - 10:00",
                    hours: s.duration || 1.0
                };
            });

        return [...fromLogs, ...fromSessions]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((t, idx) => ({
                bil: idx + 1,
                clientName: t.name,
                clientCode: "N/A",
                date: format(parseISO(t.date), "dd/MM/yyyy"),
                time: t.time,
                duration: `${t.hours.toFixed(1)} jam`
            }));
    };

    // 8. Lampiran I: Consultation Register
    const getConsultationRegister = () => {
        return logs
            .filter(l => l.category === "Management & Admin" && (l.description.toLowerCase().includes("consult") || l.description.toLowerCase().includes("rujukan")))
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((l, idx) => ({
                bil: idx + 1,
                clientName: "Referral / Consultation Contact",
                clientCode: "N/A",
                date: format(parseISO(l.date), "dd/MM/yyyy"),
                time: `${l.startTime || "09:00"} - ${l.endTime || "10:00"}`,
                duration: `${l.hours.toFixed(1)} jam`
            }));
    };

    // 9. Lampiran I (part 2): Professional Development Register
    const getPDRegister = () => {
        return logs
            .filter(l => l.category === "Professional Development")
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((l, idx) => ({
                bil: idx + 1,
                courseName: l.description,
                date: format(parseISO(l.date), "dd/MM/yyyy"),
                time: `${l.startTime || "09:00"} - ${l.endTime || "12:00"}`,
                duration: `${l.hours.toFixed(1)} jam`
            }));
    };

    // 10. Penilaian Summary Totals
    const calculatePenilaianTotals = () => {
        const indivHours = sessions.filter(s => s.formType === "Form2").reduce((sum, s) => sum + (s.duration || 1.0), 0);
        const groupHours = sessions.filter(s => s.formType === "Form11").reduce((sum, s) => sum + (s.duration || 1.7), 0);
        const pfaHours = logs.filter(l => l.category === "PFA/MHPSS").reduce((sum, l) => sum + l.hours, 0);
        const testHours = logs.filter(l => l.category === "Testing & Assessment").reduce((sum, l) => sum + l.hours, 0) + sessions.filter(s => s.formType === "Form13").reduce((sum, s) => sum + (s.duration || 1.0), 0);
        
        const consultHours = logs.filter(l => l.category === "Management & Admin" && (l.description.toLowerCase().includes("consult") || l.description.toLowerCase().includes("rujukan"))).reduce((sum, l) => sum + l.hours, 0);
        const adminHours = logs.filter(l => l.category === "Management & Admin").reduce((sum, l) => sum + l.hours, 0);
        const pdHours = logs.filter(l => l.category === "Professional Development").reduce((sum, l) => sum + l.hours, 0);
        const supervisionHours = logs.filter(l => l.category === "Supervision").reduce((sum, l) => sum + l.hours, 0);

        return {
            indiv: Math.round(indivHours * 10) / 10,
            group: Math.round(groupHours * 10) / 10,
            pfa: Math.round(pfaHours * 10) / 10,
            test: Math.round(testHours * 10) / 10,
            consult: Math.round(consultHours * 10) / 10,
            admin: Math.round(adminHours * 10) / 10,
            pd: Math.round(pdHours * 10) / 10,
            supervision: Math.round(supervisionHours * 10) / 10
        };
    };

    const totals = calculatePenilaianTotals();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading General Reports...</p>
                </div>
            </div>
        );
    }

    const lampiranAWeeks = generateLampiranA();

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header Banner */}
            <div className="bg-upsi-navy rounded-3xl shadow-xl border-t-4 border-upsi-gold p-8 mb-8 text-white relative overflow-hidden no-print">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <FolderOpen size={150} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black flex items-center space-x-3 mb-2 tracking-tight">
                        <FolderOpen className="text-upsi-gold animate-pulse" size={32} />
                        <span>Borang Umum / Lampiran A-I</span>
                    </h1>
                    <p className="text-blue-200 text-sm font-medium max-w-2xl">
                        Comprehensive logbook appendices, registers, and evaluation matrices (Lampiran A to I) prefilled dynamically using your clients, sessions, and log records.
                    </p>
                </div>
            </div>

            {/* Input Config Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm no-print">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-upsi-navy" />
                    <span>Prefill Settings & Configuration</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nama Setting</label>
                        <input 
                            type="text" 
                            value={settingName} 
                            onChange={(e) => setSettingName(e.target.value)}
                            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-upsi-navy" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nama Pelajar</label>
                        <input 
                            type="text" 
                            value={studentName} 
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-upsi-navy" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">No Matrik</label>
                        <input 
                            type="text" 
                            value={matricNumber} 
                            onChange={(e) => setMatricNumber(e.target.value)}
                            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-upsi-navy" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nama Penyelia Akademik</label>
                        <input 
                            type="text" 
                            value={academicSupervisor} 
                            onChange={(e) => setAcademicSupervisor(e.target.value)}
                            className="w-full text-xs font-bold px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-upsi-navy" 
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 no-print">
                {[
                    { id: "lampiran-a", label: "Lampiran A (Kehadiran)", icon: Calendar },
                    { id: "lampiran-c", label: "Lampiran C (Reg Indiv)", icon: User },
                    { id: "lampiran-d", label: "Lampiran D (Reg Kelompok)", icon: Users },
                    { id: "lampiran-e", label: "Lampiran E (Prog Indiv)", icon: Activity },
                    { id: "lampiran-f", label: "Lampiran F (Prog Kelompok)", icon: Users },
                    { id: "lampiran-g", label: "Lampiran G (Daftar PFA)", icon: HelpCircle },
                    { id: "lampiran-h", label: "Lampiran H (Daftar Ujian)", icon: FileText },
                    { id: "lampiran-i1", label: "Lampiran I1 (Daftar Rujukan)", icon: BookOpen },
                    { id: "lampiran-i2", label: "Lampiran I2 (Daftar PD)", icon: CheckCircle2 },
                    { id: "penilaian", label: "Borang Penilaian (Hours Summary)", icon: Calculator }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                                isActive 
                                    ? "bg-upsi-navy text-white border-upsi-navy shadow-md" 
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-end gap-3 mb-6 no-print">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <Printer size={16} />
                    <span>Print Appendix</span>
                </button>
            </div>

            {/* --- printable content area --- */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm min-h-[600px] print:border-none print:shadow-none print:p-0 text-slate-800">
                
                {/* Prefilled Header for Official Paperwork */}
                <div className="mb-8 border-b-2 border-slate-900 pb-6">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">UNIVERSITI PENDIDIKAN SULTAN IDRIS</h2>
                        <h3 className="text-md font-bold uppercase text-slate-700 mt-1">FACULTY OF HUMAN DEVELOPMENT</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-800">
                        <div>Nama Setting: <span className="underline ml-1">{settingName || "-"}</span></div>
                        <div>Nama Penyelia Akademik: <span className="underline ml-1">{academicSupervisor || "-"}</span></div>
                        <div>Nama Pelajar: <span className="underline ml-1">{studentName || "-"}</span></div>
                        <div>No. Matrik: <span className="underline ml-1">{matricNumber || "-"}</span></div>
                    </div>
                </div>

                {/* --- TAB CONTENT: Lampiran A --- */}
                {activeTab === "lampiran-a" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN A</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">BORANG KEHADIRAN LATIHAN PRAKTIKUM</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-20">Minggu</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-24">Hari</th>
                                        <th className="border border-slate-900 p-2 w-48">Masa bertugas</th>
                                        <th className="border border-slate-900 p-2 w-40">Tandatangan penyelia lapangan</th>
                                        <th className="border border-slate-900 p-2 w-40">Tandatangan penyelia akademik</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lampiranAWeeks.map((week) => (
                                        <React.Fragment key={week.weekNumber}>
                                            {week.days.map((day, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    {idx === 0 && (
                                                        <td rowSpan={5} className="border border-slate-900 text-center font-bold">
                                                            Minggu {week.weekNumber}
                                                        </td>
                                                    )}
                                                    <td className="border border-slate-900 p-2 text-center">{day.date}</td>
                                                    <td className="border border-slate-900 p-2 text-center">{day.day}</td>
                                                    <td className="border border-slate-900 p-2 text-center font-bold">
                                                        {day.catatan ? day.catatan : day.time}
                                                    </td>
                                                    {idx === 0 && (
                                                        <>
                                                            <td rowSpan={5} className="border border-slate-900"></td>
                                                            <td rowSpan={5} className="border border-slate-900"></td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran C --- */}
                {activeTab === "lampiran-c" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN C</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">DAFTAR SESI KAUNSELING INDIVIDU</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Kod Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Sesi No.</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getIndividualSessions().length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="border border-slate-900 p-8 text-center text-slate-400 italic">No individual counseling sessions logged yet.</td>
                                        </tr>
                                    ) : (
                                        getIndividualSessions().map((s) => (
                                            <tr key={s.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{s.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{s.clientName}</td>
                                                <td className="border border-slate-900 p-2 font-mono">{s.clientCode}</td>
                                                <td className="border border-slate-900 p-2">{s.date}</td>
                                                <td className="border border-slate-900 p-2">{s.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold text-upsi-navy">{s.sessionNo}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{s.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran D --- */}
                {activeTab === "lampiran-d" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN D</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">DAFTAR SESI KAUNSELING KELOMPOK</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Kelompok</th>
                                        <th className="border border-slate-900 p-2 w-28">Bilangan Ahli</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Sesi No.</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getGroupSessions().length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="border border-slate-900 p-8 text-center text-slate-400 italic">No group counseling sessions logged yet.</td>
                                        </tr>
                                    ) : (
                                        getGroupSessions().map((s) => (
                                            <tr key={s.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{s.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{s.groupName}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{s.memberCount}</td>
                                                <td className="border border-slate-900 p-2">{s.date}</td>
                                                <td className="border border-slate-900 p-2">{s.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold text-upsi-navy">{s.sessionNo}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{s.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran E --- */}
                {activeTab === "lampiran-e" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN E</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">DAFTAR PROGRES KAUNSELING INDIVIDU</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12" rowSpan={2}>Bil</th>
                                        <th className="border border-slate-900 p-2" rowSpan={2}>Nama / Kod Klien</th>
                                        <th className="border border-slate-900 p-2" colSpan={9}>Tarikh Sesi</th>
                                    </tr>
                                    <tr className="bg-slate-50 text-center font-bold">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                            <th key={n} className="border border-slate-900 p-1 w-20">Sesi {n}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getIndividualProgress().length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="border border-slate-900 p-8 text-center text-slate-400 italic">No clients found to compile progress.</td>
                                        </tr>
                                    ) : (
                                        getIndividualProgress().map((p) => (
                                            <tr key={p.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{p.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">
                                                    <div>{p.clientName}</div>
                                                    <span className="text-[9px] font-mono text-slate-400">{p.clientCode}</span>
                                                </td>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <td key={n} className="border border-slate-900 p-1 font-medium">{p.sessions[n]}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran F --- */}
                {activeTab === "lampiran-f" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN F</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">DAFTAR PROGRES KAUNSELING KELOMPOK</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12" rowSpan={2}>Bil</th>
                                        <th className="border border-slate-900 p-2" rowSpan={2}>Nama Kelompok</th>
                                        <th className="border border-slate-900 p-2" colSpan={7}>Tarikh Sesi</th>
                                    </tr>
                                    <tr className="bg-slate-50 text-center font-bold">
                                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                            <th key={n} className="border border-slate-900 p-1 w-24">Sesi {n}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getGroupProgress().length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="border border-slate-900 p-8 text-center text-slate-400 italic">No group sessions logged yet.</td>
                                        </tr>
                                    ) : (
                                        getGroupProgress().map((p) => (
                                            <tr key={p.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{p.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{p.groupName}</td>
                                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                    <td key={n} className="border border-slate-900 p-1 font-medium">{p.sessions[n]}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran G --- */}
                {activeTab === "lampiran-g" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN G</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">BORANG DAFTAR PFA / MENTAL HEALTH PSYCHOSOCIAL SUPPORT</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Kod Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPFARegister().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="border border-slate-900 p-8 text-center text-slate-400 italic">No PFA/MHPSS entries found in logs.</td>
                                        </tr>
                                    ) : (
                                        getPFARegister().map((p) => (
                                            <tr key={p.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{p.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{p.clientName}</td>
                                                <td className="border border-slate-900 p-2 font-mono">{p.clientCode}</td>
                                                <td className="border border-slate-900 p-2">{p.date}</td>
                                                <td className="border border-slate-900 p-2">{p.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{p.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran H --- */}
                {activeTab === "lampiran-h" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN H</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">BORANG DAFTAR PENGUJIAN: TADBIR, ANALISIS DAN INTERPRETASI</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Kod Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getTestingRegister().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="border border-slate-900 p-8 text-center text-slate-400 italic">No testing and assessment entries found.</td>
                                        </tr>
                                    ) : (
                                        getTestingRegister().map((t) => (
                                            <tr key={t.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{t.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{t.clientName}</td>
                                                <td className="border border-slate-900 p-2 font-mono">{t.clientCode}</td>
                                                <td className="border border-slate-900 p-2">{t.date}</td>
                                                <td className="border border-slate-900 p-2">{t.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{t.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran I1 --- */}
                {activeTab === "lampiran-i1" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN I</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">BORANG DAFTAR KONSULTASI DAN RUJUKAN</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Kod Klien</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getConsultationRegister().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="border border-slate-900 p-8 text-center text-slate-400 italic">No consultation/referral entries found in logs.</td>
                                        </tr>
                                    ) : (
                                        getConsultationRegister().map((c) => (
                                            <tr key={c.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{c.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{c.clientName}</td>
                                                <td className="border border-slate-900 p-2 font-mono">{c.clientCode}</td>
                                                <td className="border border-slate-900 p-2">{c.date}</td>
                                                <td className="border border-slate-900 p-2">{c.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{c.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Lampiran I2 --- */}
                {activeTab === "lampiran-i2" && (
                    <div className="space-y-6">
                        <div className="text-right font-black text-sm uppercase">LAMPIRAN I (PART 2)</div>
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">BORANG DAFTAR PERKEMBANGAN PROFESIONAL</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2 w-12">Bil</th>
                                        <th className="border border-slate-900 p-2">Nama Kursus / Bengkel & Penganjur</th>
                                        <th className="border border-slate-900 p-2 w-28">Tarikh</th>
                                        <th className="border border-slate-900 p-2 w-32">Masa</th>
                                        <th className="border border-slate-900 p-2 w-24">Jam/Minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPDRegister().length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="border border-slate-900 p-8 text-center text-slate-400 italic">No professional development activities logged yet.</td>
                                        </tr>
                                    ) : (
                                        getPDRegister().map((p) => (
                                            <tr key={p.bil} className="hover:bg-slate-50/50 text-center">
                                                <td className="border border-slate-900 p-2 font-bold">{p.bil}</td>
                                                <td className="border border-slate-900 p-2 text-left font-bold">{p.courseName}</td>
                                                <td className="border border-slate-900 p-2">{p.date}</td>
                                                <td className="border border-slate-900 p-2">{p.time}</td>
                                                <td className="border border-slate-900 p-2 font-bold">{p.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: Evaluation / Hours Summary --- */}
                {activeTab === "penilaian" && (
                    <div className="space-y-6">
                        <h1 className="text-center font-black text-md uppercase border border-slate-900 py-2">PENILAIAN PRAKTIKUM KKH60503 - SUMMARY OF HOURS</h1>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-900 text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-center font-black">
                                        <th className="border border-slate-900 p-2">Komponen Penyeliaan / Tugas Profesional</th>
                                        <th className="border border-slate-900 p-2 w-32">Anggaran Jam Minima</th>
                                        <th className="border border-slate-900 p-2 w-32">Jumlah Jam Terkumpul</th>
                                        <th className="border border-slate-900 p-2 w-32">Peratusan Markah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="font-bold">
                                        <td className="border border-slate-900 p-2 bg-slate-50/30" colSpan={4}>1. Perkhidmatan Bersemuka (Face-to-Face)</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">i. Kaunseling Individu</td>
                                        <td className="border border-slate-900 p-2 text-center">60.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">{totals.indiv} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">25%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">ii. Kaunseling Kelompok</td>
                                        <td className="border border-slate-900 p-2 text-center">36.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">{totals.group} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">15%</td>
                                    </tr>
                                    <tr className="font-bold bg-slate-50/50">
                                        <td className="border border-slate-900 p-2 pl-6">Jumlah Perkhidmatan Bersemuka</td>
                                        <td className="border border-slate-900 p-2 text-center">96.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center text-upsi-navy">{Math.round((totals.indiv + totals.group) * 10) / 10} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">40%</td>
                                    </tr>
                                    
                                    <tr className="font-bold">
                                        <td className="border border-slate-900 p-2 bg-slate-50/30" colSpan={4}>2. Aktiviti Berkaitan Tugas Profesional Kaunselor</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">
                                            <div>A. Aktiviti Psikopendidikan / Intervensi Psikososial</div>
                                            <span className="text-[10px] text-slate-500 font-medium italic">(PFA, Testing & Assessment, Konsultasi & Rujukan)</span>
                                        </td>
                                        <td className="border border-slate-900 p-2 text-center">90.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">{Math.round((totals.pfa + totals.test + totals.consult) * 10) / 10} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">25%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">
                                            <div>B. Pengurusan dan Pentadbiran</div>
                                            <span className="text-[10px] text-slate-500 font-medium italic">(Pengurusan fail, rekod, buku log, refleksi, laporan)</span>
                                        </td>
                                        <td className="border border-slate-900 p-2 text-center">52.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">{totals.admin} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">20%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">
                                            <div>C. Perkembangan Profesional</div>
                                            <span className="text-[10px] text-slate-500 font-medium italic">(Lectures, workshops, webinars)</span>
                                        </td>
                                        <td className="border border-slate-900 p-2 text-center">14.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">{totals.pd} jam</td>
                                        <td className="border border-slate-900 p-2 text-center">5%</td>
                                    </tr>
                                    
                                    <tr className="font-bold">
                                        <td className="border border-slate-900 p-2 bg-slate-50/30" colSpan={4}>3. Identiti Profesional (Sahsiah)</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-900 p-2 pl-6">Sikap, sahsiah, disiplin dan profesionalisme</td>
                                        <td className="border border-slate-900 p-2 text-center">10.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center font-bold text-upsi-navy">10.0 jam</td>
                                        <td className="border border-slate-900 p-2 text-center">10%</td>
                                    </tr>

                                    <tr className="font-black bg-slate-100 text-center text-sm">
                                        <td className="border border-slate-900 p-3 text-left">JUMLAH BESAR</td>
                                        <td className="border border-slate-900 p-3">252.0 jam</td>
                                        <td className="border border-slate-900 p-3 text-upsi-navy">
                                            {Math.round((totals.indiv + totals.group + totals.pfa + totals.test + totals.consult + totals.admin + totals.pd + 10.0) * 10) / 10} jam
                                        </td>
                                        <td className="border border-slate-900 p-3">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Signatures & Declaration Block (For paper printing) */}
                <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs font-bold text-slate-800">
                    <div className="space-y-12">
                        <div>Tandatangan Pelajar:</div>
                        <div className="border-b border-slate-400 w-48 h-8" />
                        <div>
                            <div>Nama: <span className="font-normal">{studentName}</span></div>
                            <div>Tarikh: <span className="font-normal">{dateOfDeclaration}</span></div>
                        </div>
                    </div>
                    <div className="space-y-12">
                        <div>Tandatangan & Cop Penyelia Akademik:</div>
                        <div className="border-b border-slate-400 w-48 h-8" />
                        <div>
                            <div>Nama: <span className="font-normal">{academicSupervisor}</span></div>
                            <div>Tarikh: <span className="font-normal">{dateOfDeclaration}</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
