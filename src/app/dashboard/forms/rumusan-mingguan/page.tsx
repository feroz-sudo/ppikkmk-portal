"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FormHeader } from "@/components/forms/FormHeader";

const CATEGORIES = [
    { id: "a", label: "a. Kaunseling Individu" },
    { id: "b", label: "b. Kaunseling Kelompok" },
    { id: "c", label: "c. Intervensi Krisis" },
    { id: "d", label: "d. Psychological First Aid (PFA) / Mental Health Psychosocial Support (MHPSS)" },
    { id: "e", label: "e. Aktiviti Psikopendidikan / Komuniti" },
    { id: "f", label: "f. Pengujian: Tadbir, Analisis, Interpretasi" },
    { id: "g", label: "g. Pengurusan dan Pentadbiran" },
    { id: "h", label: "h. Perkembangan Profesional" },
    { id: "i", label: "i. Penyeliaan" }
];

const DAYS = [
    { id: "mon", label: "Isnin" },
    { id: "tue", label: "Selasa" },
    { id: "wed", label: "Rabu" },
    { id: "thu", label: "Khamis" },
    { id: "fri", label: "Jumaat" },
    { id: "sat", label: "Sabtu" },
    { id: "sun", label: "Ahad" }
];

export default function RumusanMingguanForm() {
    const { user } = useAuth();
    const [debugMsg, setDebugMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [weekNumber, setWeekNumber] = useState("1");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Matrix State
    const [matrix, setMatrix] = useState<Record<string, Record<string, string>>>({});

    const updateCell = (catId: string, dayId: string, value: string) => {
        setMatrix(prev => ({
            ...prev,
            [catId]: {
                ...(prev[catId] || {}),
                [dayId]: value
            }
        }));
    };

    const loadData = async (week: string) => {
        if (!user) return;
        try {
            setDebugMsg(`Loading data for Week ${week}...`);
            const docRef = doc(db, "weekly_forms", `${user.uid}_rumusanMingguan_${week}`);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                setMatrix(data.matrix || {});
                setStartDate(data.startDate || "");
                setEndDate(data.endDate || "");
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
            
            // Semester start date (Monday of Week 1) in local timezone
            const startSemDate = new Date(2026, 2, 9);
            const startOffset = (weekNum - 1) * 7;
            const monday = new Date(startSemDate);
            monday.setDate(startSemDate.getDate() + startOffset);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            
            const formatLocal = (d: Date) => {
                const y = d.getFullYear();
                const m = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                return `${y}-${m}-${day}`;
            };
            const startStr = formatLocal(monday);
            const endStr = formatLocal(sunday);
            
            setStartDate(startStr);
            setEndDate(endStr);
            
            const { getTraineeLogs } = await import("@/lib/firebase/db");
            const allLogs = await getTraineeLogs(user.uid);
            
            const weeklyLogs = allLogs.filter(log => log.date >= startStr && log.date <= endStr);
            
            // Initialize empty matrix
            const newMatrix: Record<string, Record<string, string>> = {};
            CATEGORIES.forEach(c => {
                newMatrix[c.id] = {};
                DAYS.forEach(d => {
                    newMatrix[c.id][d.id] = "";
                });
            });
            
            const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const catMap: Record<string, string> = {
                'Individual Counselling': 'a',
                'Group Counselling': 'b',
                'Crisis Intervention': 'c',
                'PFA/MHPSS': 'd',
                'Psychoeducation/Community': 'e',
                'Testing & Assessment': 'f',
                'Management & Admin': 'g',
                'Professional Development': 'h',
                'Supervision': 'i'
            };
            
            weeklyLogs.forEach(log => {
                const hrs = log.hours || 0;
                if (hrs <= 0) return;
                
                const dateObj = new Date(log.date);
                const dayId = dayKeys[dateObj.getDay()];
                const catId = catMap[log.category];
                
                if (catId && dayId) {
                    const currentVal = parseFloat(newMatrix[catId][dayId]) || 0;
                    newMatrix[catId][dayId] = (currentVal + hrs).toFixed(1);
                }
            });
            
            // Clean up empty strings
            CATEGORIES.forEach(c => {
                DAYS.forEach(d => {
                    if (parseFloat(newMatrix[c.id][d.id]) === 0) {
                        newMatrix[c.id][d.id] = "";
                    }
                });
            });
            
            setMatrix(newMatrix);
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
            const docRef = doc(db, "weekly_forms", `${user.uid}_rumusanMingguan_${weekNumber}`);
            await setDoc(docRef, {
                traineeId: user.uid,
                type: "rumusanMingguan",
                weekNumber,
                startDate,
                endDate,
                matrix,
                updatedAt: new Date()
            });
            setDebugMsg("Saved successfully.");
        } catch (error: any) {
            setDebugMsg("Save failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRowTotal = (catId: string) => {
        return DAYS.reduce((sum, day) => sum + (parseFloat(matrix[catId]?.[day.id]) || 0), 0);
    };

    const getColTotal = (dayId: string) => {
        return CATEGORIES.reduce((sum, cat) => sum + (parseFloat(matrix[cat.id]?.[dayId]) || 0), 0);
    };

    const getGrandTotal = () => {
        return CATEGORIES.reduce((sum, cat) => sum + getRowTotal(cat.id), 0);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            <FormHeader title="Rumusan Jam Mingguan" refCode="PPIKKMK/RUMUSAN_MINGGUAN" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar print:overflow-visible print:w-full print:p-0">
                <form id="rumusanMingguanForm" onSubmit={handleSave} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl print:shadow-none print:bg-transparent print:max-w-full print:w-full">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-teal-50/50 rounded-t-2xl">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h2 className="text-2xl font-black text-upsi-navy tracking-tight">RUMUSAN JAM MINGGUAN</h2>
                                <button
                                    type="button"
                                    onClick={() => syncFromLogbook(weekNumber)}
                                    className="no-print text-xs font-black bg-white hover:bg-slate-100 border border-slate-300 text-upsi-navy px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                    Sync from Logbook
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Buku Log Praktikum</p>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
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
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-white p-2 px-4 rounded-xl shadow-sm border border-slate-200">
                                <span>Dari</span>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-b border-slate-300 focus:outline-none focus:border-upsi-navy bg-transparent" />
                                <span>ke</span>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-b border-slate-300 focus:outline-none focus:border-upsi-navy bg-transparent" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="w-full overflow-x-auto border border-slate-200 rounded-xl print:overflow-visible print:border-black">
                            <table className="w-full text-center text-sm border-collapse print:text-[11px]">
                                <colgroup>
                                    <col className="w-1/4 print:w-1/4" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[12%]" />
                                </colgroup>
                                <thead className="bg-slate-50 border-b border-slate-200 print:bg-transparent">
                                    <tr>
                                        <th className="p-3 font-bold border border-slate-200 text-left print:p-1 print:border-black uppercase">Aktiviti</th>
                                        {DAYS.map(day => (
                                            <th key={day.id} className="p-3 font-bold border border-slate-200 print:p-1 print:border-black uppercase text-xs">
                                                {day.label}
                                            </th>
                                        ))}
                                        <th className="p-3 font-black text-slate-800 border border-slate-200 print:p-1 print:border-black uppercase text-xs">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CATEGORIES.map(cat => (
                                        <tr key={cat.id} className="hover:bg-slate-50">
                                            <td className="p-3 border border-slate-200 text-left font-bold text-slate-700 leading-tight print:p-2 print:border-black">
                                                {cat.label}
                                            </td>
                                            {DAYS.map(day => (
                                                <td key={day.id} className="border border-slate-200 focus-within:bg-slate-50/50 print:border-black p-0 align-middle">
                                                    <input 
                                                        type="number" 
                                                        step="0.5"
                                                        value={matrix[cat.id]?.[day.id] || ""}
                                                        onChange={(e) => updateCell(cat.id, day.id, e.target.value)}
                                                        className="w-full h-full bg-transparent border-none text-center outline-none focus:ring-2 focus:ring-upsi-navy/20 font-medium py-3 print:py-1 print:min-w-0"
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-3 font-black text-slate-800 border border-slate-200 print:border-black print:p-2 align-middle">
                                                {getRowTotal(cat.id) > 0 ? getRowTotal(cat.id) : "-"}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Footer / Total Row */}
                                    <tr className="bg-upsi-navy text-white print:bg-transparent print:text-black">
                                        <td className="p-4 border border-slate-200 print:border-black text-right font-black uppercase tracking-widest print:p-2">JUMLAH JAM</td>
                                        {DAYS.map(day => (
                                            <td key={day.id} className="p-4 border border-slate-200 print:border-black font-black print:p-2">
                                                {getColTotal(day.id) > 0 ? getColTotal(day.id) : "-"}
                                            </td>
                                        ))}
                                        <td className="p-4 border border-slate-200 font-black text-xl text-upsi-gold bg-black/20 print:bg-transparent print:text-black print:border-black print:p-2">
                                            {getGrandTotal() > 0 ? getGrandTotal() : "0"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 grid grid-cols-2 gap-12 max-w-4xl mx-auto items-end pt-12 break-inside-avoid print:mt-6 print:pt-6">
                            <div className="text-center">
                                <div className="border-b-2 border-slate-400 w-full mb-2"></div>
                                <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Tandatangan Kaunselor Pelatih</p>
                                <p className="text-[10px] text-slate-400 mt-1">Tarikh: ...........................</p>
                            </div>
                            <div className="text-center">
                                <div className="border-b-2 border-slate-400 w-full mb-2"></div>
                                <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Tandatangan Penyelia Akademik</p>
                                <p className="text-[10px] text-slate-400 mt-1">Tarikh: ...........................</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <FormActionBar
                formName={`Rumusan Mingguan - Minggu ${weekNumber}`}
                isSubmitting={isSubmitting}
                onSave={() => handleSave({ preventDefault: () => {} } as React.FormEvent)}
            />
        </div>
    );
}
