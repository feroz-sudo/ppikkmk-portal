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
    dateDay: string;
    location: string;
    time: string;
    activity: string;
    notes: string;
}

export default function LogHarianForm() {
    const { user } = useAuth();
    const [debugMsg, setDebugMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [weekNumber, setWeekNumber] = useState("1");
    const [logs, setLogs] = useState<DailyLog[]>([
        { id: "1", dateDay: "", location: "", time: "", activity: "", notes: "" }
    ]);

    // Summary State
    const [f2fIndiv, setF2fIndiv] = useState("");
    const [f2fKelompok, setF2fKelompok] = useState("");
    const [profAct, setProfAct] = useState("");
    const [admin, setAdmin] = useState("");
    const [profDev, setProfDev] = useState("");
    const [supervision, setSupervision] = useState("");

    const loadData = async (week: string) => {
        if (!user) return;
        try {
            setDebugMsg(`Loading data for Week ${week}...`);
            const docRef = doc(db, "weekly_forms", `${user.uid}_logHarian_${week}`);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                setLogs(data.logs || []);
                setF2fIndiv(data.f2fIndiv || "");
                setF2fKelompok(data.f2fKelompok || "");
                setProfAct(data.profAct || "");
                setAdmin(data.admin || "");
                setProfDev(data.profDev || "");
                setSupervision(data.supervision || "");
                setDebugMsg(`Week ${week} loaded successfully.`);
            } else {
                // reset or ignore
                setLogs([{ id: Date.now().toString(), dateDay: "", location: "", time: "", activity: "", notes: "" }]);
                setF2fIndiv(""); setF2fKelompok(""); setProfAct(""); setAdmin(""); setProfDev(""); setSupervision("");
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
            const docRef = doc(db, "weekly_forms", `${user.uid}_logHarian_${weekNumber}`);
            await setDoc(docRef, {
                traineeId: user.uid,
                type: "logHarian",
                weekNumber,
                logs,
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

    const addRow = () => {
        setLogs([...logs, { id: Date.now().toString(), dateDay: "", location: "", time: "", activity: "", notes: "" }]);
    };

    const deleteRow = (id: string) => {
        setLogs(logs.filter(l => l.id !== id));
    };

    const updateRow = (id: string, field: keyof DailyLog, value: string) => {
        setLogs(logs.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const totalJam = [f2fIndiv, f2fKelompok, profAct, admin, profDev, supervision]
        .map(v => parseFloat(v) || 0)
        .reduce((a, b) => a + b, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            <FormHeader title="Log Harian & Rumusan Jam" subtitle="Weekly Logbook Tracker" />
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
                        {/* Daily Log Table */}
                        <div>
                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-4">Senarai Log Harian</h3>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3 font-bold text-slate-600 w-1/6">Tarikh / Hari</th>
                                            <th className="p-3 font-bold text-slate-600 w-1/6">Lokasi</th>
                                            <th className="p-3 font-bold text-slate-600 w-1/6">Masa</th>
                                            <th className="p-3 font-bold text-slate-600 w-1/4">Aktiviti Praktikum</th>
                                            <th className="p-3 font-bold text-slate-600 w-1/4">Catatan</th>
                                            <th className="p-3 text-center no-print w-12">Hapus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50">
                                                <td className="p-0">
                                                    <textarea required value={log.dateDay} onChange={(e) => updateRow(log.id, "dateDay", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="01/01 Mon" rows={2} />
                                                </td>
                                                <td className="p-0">
                                                    <textarea required value={log.location} onChange={(e) => updateRow(log.id, "location", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="Klinik UPSI" rows={2} />
                                                </td>
                                                <td className="p-0">
                                                    <textarea required value={log.time} onChange={(e) => updateRow(log.id, "time", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="08:00 - 10:00" rows={2} />
                                                </td>
                                                <td className="p-0">
                                                    <textarea required value={log.activity} onChange={(e) => updateRow(log.id, "activity", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="Sesi Kaunseling Individu" rows={2} />
                                                </td>
                                                <td className="p-0">
                                                    <textarea required value={log.notes} onChange={(e) => updateRow(log.id, "notes", e.target.value)} className="w-full h-full p-3 resize-none bg-transparent" placeholder="..." rows={2} />
                                                </td>
                                                <td className="p-3 text-center no-print">
                                                    <button type="button" onClick={() => deleteRow(log.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={addRow} className="no-print mt-3 flex items-center space-x-2 text-upsi-navy font-bold text-xs uppercase tracking-widest hover:text-blue-600 bg-slate-50 px-4 py-2 rounded-xl transition-all">
                                <Plus size={14} /> <span>Tambah Baris</span>
                            </button>
                        </div>

                        {/* Rumusan Jam Harian Table */}
                        <div>
                            <h3 className="font-black text-slate-800 tracking-tight text-lg mb-4 bg-slate-100 p-4 rounded-xl text-center uppercase">RUMUSAN JAM HARIAN AKTIVITI PRAKTIKUM</h3>
                            
                            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-white p-4 font-black text-slate-700 bg-slate-50">Perkhidmatan Bersemuka (F2F)</div>
                                <div className="bg-white p-4 font-black text-slate-700 bg-slate-50">Aktiviti Profesional Kaunselor KMK</div>
                                
                                {/* Row 1 */}
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">1. Kaunseling Individu KMK</span>
                                    <input type="number" step="0.5" value={f2fIndiv} onChange={(e) => setF2fIndiv(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">1. Aktiviti / Intervensi (Krisis, PFA, Pengujian, dll)</span>
                                    <input type="number" step="0.5" value={profAct} onChange={(e) => setProfAct(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>

                                {/* Row 2 */}
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">2. Kaunseling Kelompok KMK</span>
                                    <input type="number" step="0.5" value={f2fKelompok} onChange={(e) => setF2fKelompok(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">2. Pengurusan dan Pentadbiran</span>
                                    <input type="number" step="0.5" value={admin} onChange={(e) => setAdmin(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>

                                {/* Row 3 */}
                                <div className="bg-white p-4 flex justify-between items-center">
                                </div>
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">3. Perkembangan Profesional</span>
                                    <input type="number" step="0.5" value={profDev} onChange={(e) => setProfDev(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>

                                {/* Row 4 */}
                                <div className="bg-white p-4 flex justify-between items-center">
                                </div>
                                <div className="bg-white p-4 flex justify-between items-center">
                                    <span className="text-sm">4. Penyeliaan</span>
                                    <input type="number" step="0.5" value={supervision} onChange={(e) => setSupervision(e.target.value)} className="w-16 border rounded p-1 text-center font-bold" />
                                </div>

                                {/* Total Row */}
                                <div className="col-span-2 bg-upsi-navy text-white p-4 flex justify-end items-center space-x-6">
                                    <span className="font-black text-lg tracking-widest uppercase">JUMLAH JAM</span>
                                    <div className="bg-white/20 px-6 py-2 rounded-xl text-xl font-black">{totalJam} Jam</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
            <FormActionBar formId="logHarianForm" formTitle={`Log Harian - Minggu ${weekNumber}`} debugMsg={debugMsg} />
        </div>
    );
}
