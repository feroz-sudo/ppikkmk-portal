"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FormHeader } from "@/components/forms/FormHeader";

interface DailyLog {
    id: string;
    location: string;
    time: string;
    activity: string;
    notes: string;
}

const DAYS_CONFIG = [
    { id: "mon", label: "Isnin (Monday)" },
    { id: "tue", label: "Selasa (Tuesday)" },
    { id: "wed", label: "Rabu (Wednesday)" },
    { id: "thu", label: "Khamis (Thursday)" },
    { id: "fri", label: "Jumaat (Friday)" },
    { id: "sat", label: "Sabtu (Saturday)" },
    { id: "sun", label: "Ahad (Sunday)" }
];

export default function LogHarianForm() {
    const { user } = useAuth();
    const [debugMsg, setDebugMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [weekNumber, setWeekNumber] = useState("1");
    const [logsByDay, setLogsByDay] = useState<Record<string, DailyLog[]>>({
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: []
    });

    // Summary State
    const [f2fIndiv, setF2fIndiv] = useState("");
    const [f2fKelompok, setF2fKelompok] = useState("");
    const [profAct, setProfAct] = useState("");
    const [admin, setAdmin] = useState("");
    const [profDev, setProfDev] = useState("");
    const [supervision, setSupervision] = useState("");

    const getDayDateString = (dayId: string) => {
        const weekNum = parseInt(weekNumber) || 1;
        const startDate = new Date("2026-03-16"); // Monday of Week 1
        const startOffset = (weekNum - 1) * 7;
        const dayOffsets: Record<string, number> = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
        
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + startOffset + (dayOffsets[dayId] || 0));
        
        return date.toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const loadData = async (week: string) => {
        if (!user) return;
        try {
            setDebugMsg(`Loading data for Week ${week}...`);
            const docRef = doc(db, "weekly_forms", `${user.uid}_logHarian_${week}`);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.logsByDay) {
                    setLogsByDay(data.logsByDay);
                } else if (data.logs) {
                    // Backwards compatibility: Map flat logs array to logsByDay based on dateDay/dates
                    const initial: Record<string, DailyLog[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
                    const flatLogs = data.logs as any[];
                    flatLogs.forEach(l => {
                        const dateDayLower = (l.dateDay || "").toLowerCase();
                        if (dateDayLower.includes("mon") || dateDayLower.includes("isnin") || dateDayLower.includes("16/03") || dateDayLower.includes("23/03") || dateDayLower.includes("30/03") || dateDayLower.includes("06/04") || dateDayLower.includes("13/04") || dateDayLower.includes("20/04") || dateDayLower.includes("27/04") || dateDayLower.includes("04/05") || dateDayLower.includes("11/05") || dateDayLower.includes("18/05") || dateDayLower.includes("25/05") || dateDayLower.includes("01/06") || dateDayLower.includes("08/06") || dateDayLower.includes("15/06") || dateDayLower.includes("22/06")) initial.mon.push(l);
                        else if (dateDayLower.includes("tue") || dateDayLower.includes("selasa")) initial.tue.push(l);
                        else if (dateDayLower.includes("wed") || dateDayLower.includes("rabu")) initial.wed.push(l);
                        else if (dateDayLower.includes("thu") || dateDayLower.includes("khamis")) initial.thu.push(l);
                        else if (dateDayLower.includes("fri") || dateDayLower.includes("jumaat")) initial.fri.push(l);
                        else if (dateDayLower.includes("sat") || dateDayLower.includes("sabtu")) initial.sat.push(l);
                        else if (dateDayLower.includes("sun") || dateDayLower.includes("ahad")) initial.sun.push(l);
                        else initial.mon.push(l); // fallback
                    });
                    setLogsByDay(initial);
                } else {
                    setLogsByDay({ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] });
                }
                setF2fIndiv(data.f2fIndiv || "");
                setF2fKelompok(data.f2fKelompok || "");
                setProfAct(data.profAct || "");
                setAdmin(data.admin || "");
                setProfDev(data.profDev || "");
                setSupervision(data.supervision || "");
                setDebugMsg(`Week ${week} loaded successfully.`);
            } else {
                await syncFromLogbook(week);
            }
        } catch (error: any) {
            setDebugMsg("Error: " + error.message);
        }
    };

    const syncFromLogbook = async (week: string) => {
        if (!user) return;
        try {
            setDebugMsg(`Syncing from Logbook for Week ${week}...`);
            const weekNum = parseInt(week) || 1;
            
            // Semester start date (Monday of Week 1)
            const startDate = new Date("2026-03-16");
            const startOffset = (weekNum - 1) * 7;
            const monday = new Date(startDate);
            monday.setDate(startDate.getDate() + startOffset);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            
            const startStr = monday.toISOString().split('T')[0];
            const endStr = sunday.toISOString().split('T')[0];
            
            const { getTraineeLogs } = await import("@/lib/firebase/db");
            const allLogs = await getTraineeLogs(user.uid);
            
            const weeklyLogs = allLogs.filter(log => log.date >= startStr && log.date <= endStr);
            
            // Sort by date then startTime ascending (oldest first for daily progression)
            weeklyLogs.sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return (a.startTime || "00:00").localeCompare(b.startTime || "00:00");
            });
            
            const newLogsByDay: Record<string, DailyLog[]> = {
                mon: [],
                tue: [],
                wed: [],
                thu: [],
                fri: [],
                sat: [],
                sun: []
            };
            
            const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            
            weeklyLogs.forEach((log, idx) => {
                const date = new Date(log.date);
                const dayKey = dayKeys[date.getDay()];
                if (newLogsByDay[dayKey]) {
                    newLogsByDay[dayKey].push({
                        id: log.id || `${Date.now()}-${idx}`,
                        location: log.location || "UPSI",
                        time: `${log.startTime || '--:--'} - ${log.endTime || '--:--'}`,
                        activity: log.description || "",
                        notes: ""
                    });
                }
            });
            
            setLogsByDay(newLogsByDay);
            
            let sumIndiv = 0;
            let sumKelompok = 0;
            let sumProfAct = 0;
            let sumAdmin = 0;
            let sumProfDev = 0;
            let sumSupervision = 0;
            
            weeklyLogs.forEach(log => {
                const hrs = log.hours || 0;
                if (log.category === 'Individual Counselling') {
                    sumIndiv += hrs;
                } else if (log.category === 'Group Counselling') {
                    sumKelompok += hrs;
                } else if (['Crisis Intervention', 'PFA/MHPSS', 'Psychoeducation/Community', 'Testing & Assessment'].includes(log.category)) {
                    sumProfAct += hrs;
                } else if (log.category === 'Management & Admin') {
                    sumAdmin += hrs;
                } else if (log.category === 'Professional Development') {
                    sumProfDev += hrs;
                } else if (log.category === 'Supervision') {
                    sumSupervision += hrs;
                }
            });
            
            setF2fIndiv(sumIndiv > 0 ? sumIndiv.toFixed(1) : "");
            setF2fKelompok(sumKelompok > 0 ? sumKelompok.toFixed(1) : "");
            setProfAct(sumProfAct > 0 ? sumProfAct.toFixed(1) : "");
            setAdmin(sumAdmin > 0 ? sumAdmin.toFixed(1) : "");
            setProfDev(sumProfDev > 0 ? sumProfDev.toFixed(1) : "");
            setSupervision(sumSupervision > 0 ? sumSupervision.toFixed(1) : "");
            setDebugMsg(`Week ${week} logs synced successfully.`);
        } catch (error: any) {
            console.error("Sync failed:", error);
            setDebugMsg("Sync failed: " + error.message);
        }
    };

    useEffect(() => {
        loadData(weekNumber);
    }, [weekNumber, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            // Flatten logsByDay for backwards compatibility with print/table summaries
            const flatLogs: any[] = [];
            const dayNames: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
            
            Object.keys(logsByDay).forEach(dayId => {
                const dayDate = getDayDateString(dayId);
                const dayName = dayNames[dayId] || dayId;
                (logsByDay[dayId] || []).forEach(l => {
                    flatLogs.push({
                        ...l,
                        dateDay: `${dayDate} ${dayName}`
                    });
                });
            });

            const docRef = doc(db, "weekly_forms", `${user.uid}_logHarian_${weekNumber}`);
            await setDoc(docRef, {
                traineeId: user.uid,
                type: "logHarian",
                weekNumber,
                logs: flatLogs,
                logsByDay,
                f2fIndiv, f2fKelompok, profAct, admin, profDev, supervision,
                updatedAt: new Date()
            });
            setDebugMsg("Saved successfully.");
        } catch (error: any) {
            setDebugMsg("Save failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRow = (dayId: string) => {
        setLogsByDay(prev => ({
            ...prev,
            [dayId]: [
                ...(prev[dayId] || []),
                { id: Date.now().toString() + Math.random().toString(), location: "", time: "", activity: "", notes: "" }
            ]
        }));
    };

    const deleteRow = (dayId: string, rowId: string) => {
        setLogsByDay(prev => ({
            ...prev,
            [dayId]: (prev[dayId] || []).filter(l => l.id !== rowId)
        }));
    };

    const updateRow = (dayId: string, rowId: string, field: keyof DailyLog, value: string) => {
        setLogsByDay(prev => ({
            ...prev,
            [dayId]: (prev[dayId] || []).map(l => l.id === rowId ? { ...l, [field]: value } : l)
        }));
    };

    const totalJam = [f2fIndiv, f2fKelompok, profAct, admin, profDev, supervision]
        .map(v => parseFloat(v) || 0)
        .reduce((a, b) => a + b, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            <FormHeader title="Log Harian & Rumusan Jam" refCode="PPIKKMK/LOG_HARIAN" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                <form id="logHarianForm" onSubmit={handleSave} className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl print:shadow-none print:bg-transparent">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-blue-50/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-black text-upsi-navy tracking-tight">LOG HARIAN</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Buku Log Praktikum</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Minggu Ke:</span>
                            <input 
                                type="number" 
                                min="1" max="20"
                                value={weekNumber} 
                                onChange={(e) => setWeekNumber(e.target.value)}
                                className="w-16 font-black text-lg text-center bg-transparent border-b-2 border-upsi-gold focus:outline-none focus:border-upsi-navy"
                            />
                        </div>
                    </div>

                    <div className="p-8 space-y-12">
                        {/* Daily Logs Grouped by Day */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Senarai Log Harian (Daily Logs)</h3>
                                <button
                                    type="button"
                                    onClick={() => syncFromLogbook(weekNumber)}
                                    className="no-print text-xs font-black bg-slate-100 hover:bg-slate-200 border border-slate-300 text-upsi-navy px-3.5 py-1.5 rounded-lg transition-all"
                                >
                                    Sync from Logbook
                                </button>
                            </div>

                            {DAYS_CONFIG.map((day) => {
                                const dayLogs = logsByDay[day.id] || [];
                                const dayDate = getDayDateString(day.id);
                                return (
                                    <div key={day.id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                            <span className="font-extrabold text-sm text-upsi-navy uppercase tracking-wider">
                                                {day.label} — {dayDate}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{dayLogs.length} Rows</span>
                                        </div>

                                        {dayLogs.length === 0 ? (
                                            <p className="text-xs text-slate-400 italic py-2">Tiada aktiviti didaftarkan untuk hari ini.</p>
                                        ) : (
                                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            <th className="p-3 font-bold text-slate-600 w-1/4">Lokasi</th>
                                                            <th className="p-3 font-bold text-slate-600 w-1/4">Masa</th>
                                                            <th className="p-3 font-bold text-slate-600 w-1/3">Aktiviti Praktikum</th>
                                                            <th className="p-3 font-bold text-slate-600 w-1/3">Catatan</th>
                                                            <th className="p-3 text-center no-print w-12">Hapus</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {dayLogs.map((log) => (
                                                            <tr key={log.id} className="hover:bg-slate-50/50">
                                                                <td className="p-0">
                                                                    <textarea required value={log.location} onChange={(e) => updateRow(day.id, log.id, "location", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="Klinik UPSI" rows={2} />
                                                                </td>
                                                                <td className="p-0">
                                                                    <textarea required value={log.time} onChange={(e) => updateRow(day.id, log.id, "time", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="08:00 - 10:00" rows={2} />
                                                                </td>
                                                                <td className="p-0">
                                                                    <textarea required value={log.activity} onChange={(e) => updateRow(day.id, log.id, "activity", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="Sesi Kaunseling Individu" rows={2} />
                                                                </td>
                                                                <td className="p-0">
                                                                    <textarea required value={log.notes} onChange={(e) => updateRow(day.id, log.id, "notes", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="..." rows={2} />
                                                                </td>
                                                                <td className="p-3 text-center no-print">
                                                                    <button type="button" onClick={() => deleteRow(day.id, log.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <button type="button" onClick={() => addRow(day.id)} className="no-print flex items-center space-x-2 text-upsi-navy font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-all">
                                            <Plus size={12} /> <span>Tambah Baris ({day.label.split(" ")[0]})</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rumusan Jam Harian Table */}
                        <div>
                            <h3 className="font-black text-slate-800 tracking-tight text-lg mb-4 bg-slate-100 p-4 rounded-xl text-center uppercase">RUMUSAN JAM HARIAN AKTIVITI PRAKTIKUM</h3>
                            
                            <table className="w-full border-collapse border border-slate-200 bg-white">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="p-4 font-black text-slate-700 border border-slate-200 w-1/2 text-left">Perkhidmatan Bersemuka (F2F)</th>
                                        <th className="p-4 font-black text-slate-700 border border-slate-200 w-1/2 text-left">Aktiviti Profesional Kaunselor KMK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row 1 */}
                                    <tr>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">1. Kaunseling Individu KMK</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        * Temubual Pengambilan/ Temubual Klinikal<br/>
                                                        * Penilaian / saringan status mental<br/>
                                                        <span className="italic">* Wajib dalam semua jenis sesi kaunseling</span>
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={f2fIndiv} onChange={(e) => setF2fIndiv(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">1. Aktiviti / Intervensi</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        i. Intervensi Krisis<br/>
                                                        ii. PFA / MHPSS<br/>
                                                        iii. Pengujian: Tadbir, Analisis, Interpretasi<br/>
                                                        iv. Aktiviti Psikopendidikan / Komuniti<br/>
                                                        &bull; Outreach komuniti / kampus<br/>
                                                        &bull; Rujukan &bull; Konsultasi &bull; Pembentangan program atau kes
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={profAct} onChange={(e) => setProfAct(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 2 */}
                                    <tr>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">2. Kaunseling Kelompok KMK</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        * Temubual Pengambilan/ Temubual Klinikal<br/>
                                                        * Penilaian / saringan status mental<br/>
                                                        <span className="italic">* Wajib dalam semua jenis sesi kaunseling</span>
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={f2fKelompok} onChange={(e) => setF2fKelompok(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">2. Pengurusan dan Pentadbiran</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        &bull; Pengurusan rekod dan buku log<br/>
                                                        &bull; Konseptualisasi / formulasi kes<br/>
                                                        &bull; Penulisan laporan Refleksi
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={admin} onChange={(e) => setAdmin(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 3 */}
                                    <tr>
                                        <td className="p-4 border border-slate-200 align-top">
                                        </td>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">3. Perkembangan Profesional</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        &bull; Pembentang / peserta konferens profesional / bengkel berkaitan bidang<br/>
                                                        &bull; Membaca literatur professional
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={profDev} onChange={(e) => setProfDev(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 4 */}
                                    <tr>
                                        <td className="p-4 border border-slate-200 align-top">
                                        </td>
                                        <td className="p-4 border border-slate-200 align-top">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-sm font-bold">4. Penyeliaan</div>
                                                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                                                        &bull; Individu<br/>
                                                        &bull; Triadik<br/>
                                                        &bull; Kumpulan
                                                    </div>
                                                </div>
                                                <input type="number" step="0.5" value={supervision} onChange={(e) => setSupervision(e.target.value)} className="w-16 border rounded p-1 text-center font-bold print:border-b print:border-x-0 print:border-t-0 print:rounded-none" />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Total Row */}
                                    <tr>
                                        <td colSpan={2} className="p-0 border border-slate-200">
                                            <div className="bg-upsi-navy text-white p-4 flex justify-end items-center space-x-6">
                                                <span className="font-black text-lg tracking-widest uppercase">JUMLAH JAM</span>
                                                <div className="bg-white/20 px-6 py-2 rounded-xl text-xl font-black print:text-black print:bg-transparent print:border print:border-black print:rounded-none">{totalJam} Jam</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </form>
            </div>
            <FormActionBar
                formName={`Log Harian - Minggu ${weekNumber}`}
                isSubmitting={isSubmitting}
                onSave={() => handleSave({ preventDefault: () => {} } as React.FormEvent)}
            />
        </div>
    );
}
