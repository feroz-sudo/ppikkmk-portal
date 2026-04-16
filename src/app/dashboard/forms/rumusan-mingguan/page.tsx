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
                setDebugMsg(`Week ${week} loaded successfully.`);
            } else {
                setMatrix({});
                setDebugMsg("No previous saves for this week.");
            }
        } catch (error: any) {
            setDebugMsg("Error: " + error.message);
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
            <FormHeader title="Rumusan Jam Mingguan" subtitle="Weekly Hours Summary" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                <form id="rumusanMingguanForm" onSubmit={handleSave} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl print:shadow-none print:bg-transparent">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-teal-50/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-black text-upsi-navy tracking-tight">RUMUSAN JAM MINGGUAN</h2>
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

                    <div className="p-8">
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-r border-b border-slate-200 font-black text-slate-700 w-[25%] uppercase text-xs">Aktiviti</th>
                                        {DAYS.map(day => (
                                            <th key={day.id} className="p-2 border-r border-b border-slate-200 font-bold text-slate-600 text-center text-xs uppercase w-[9%]">
                                                {day.label}
                                            </th>
                                        ))}
                                        <th className="p-3 border-b border-slate-200 font-black text-upsi-navy text-center uppercase text-xs">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CATEGORIES.map(cat => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                                            <td className="p-3 border-r border-slate-200 text-slate-700 font-bold text-xs">{cat.label}</td>
                                            {DAYS.map(day => (
                                                <td key={day.id} className="p-0 border-r border-slate-200">
                                                    <input 
                                                        type="number" 
                                                        step="0.5"
                                                        value={matrix[cat.id]?.[day.id] || ""}
                                                        onChange={(e) => updateCell(cat.id, day.id, e.target.value)}
                                                        className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-upsi-navy/20"
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-3 text-center font-black text-upsi-navy bg-slate-50/50">
                                                {getRowTotal(cat.id) > 0 ? getRowTotal(cat.id) : ""}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Footer / Total Row */}
                                    <tr className="bg-slate-100">
                                        <td className="p-4 border-r border-slate-200 font-black text-slate-800 text-right uppercase tracking-widest text-xs">
                                            Jumlah Jam
                                        </td>
                                        {DAYS.map(day => (
                                            <td key={day.id} className="p-3 border-r border-slate-200 text-center font-black text-slate-700">
                                                {getColTotal(day.id) > 0 ? getColTotal(day.id) : ""}
                                            </td>
                                        ))}
                                        <td className="p-4 text-center font-black text-white bg-upsi-navy text-lg">
                                            {getGrandTotal()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 grid grid-cols-2 gap-12 max-w-4xl mx-auto items-end pt-12">
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
            <FormActionBar formId="rumusanMingguanForm" formTitle={`Rumusan Mingguan - Minggu ${weekNumber}`} debugMsg={debugMsg} />
        </div>
    );
}
