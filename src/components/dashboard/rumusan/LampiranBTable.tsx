"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, Log, Session } from "@/lib/firebase/db";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { Printer, Save, RefreshCw, Edit3, Check, Calculator, FileText, CheckCircle2 } from "lucide-react";

export interface WeekRowData {
    week: number;
    indivSesi: number;
    indivJam: number;
    kelompokSesi: number;
    kelompokJam: number;
    aktivitiSlot: number;
    aktivitiJam: number;
    profDevSlot: number;
    profDevJam: number;
    adminJam: number;
    customRowTotal?: number;
}

export function LampiranBTable() {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Initial 18 weeks data
    const [rows, setRows] = useState<WeekRowData[]>(() =>
        Array.from({ length: 18 }, (_, i) => ({
            week: i + 1,
            indivSesi: 0,
            indivJam: 0,
            kelompokSesi: 0,
            kelompokJam: 0,
            aktivitiSlot: 0,
            aktivitiJam: 0,
            profDevSlot: 0,
            profDevJam: 0,
            adminJam: 0,
        }))
    );

    const [academicSupervisor, setAcademicSupervisor] = useState("Dr. Mazita Ahmad");
    const [traineeName, setTraineeName] = useState("");

    useEffect(() => {
        if (user) {
            setTraineeName(userProfile?.name || user.displayName || "Ahmad Feroz Bin Abdul Samad");
            loadRumusanData();
        }
    }, [user, userProfile]);

    const loadRumusanData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch saved Lampiran B data from Firestore if exists
            const docRef = doc(db, "rumusan_jam_praktikum", user.uid);
            const docSnap = await getDoc(docRef);

            // 2. Fetch logs and sessions to compute auto-calculated values
            const logsQuery = query(collection(db, "logs"), where("traineeId", "==", user.uid));
            const logsSnap = await getDocs(logsQuery);
            const logs = logsSnap.docs.map(d => d.data() as Log);

            const sessionsQuery = query(collection(db, "sessions"), where("traineeId", "==", user.uid));
            const sessionsSnap = await getDocs(sessionsQuery);
            const sessions = sessionsSnap.docs.map(d => d.data() as Session);

            // Helper to get week number (Week 1 starts 09/03/2026)
            const startDate = new Date("2026-03-09");
            const getWeekNum = (dateStr: any) => {
                if (!dateStr) return 1;
                let d: Date;
                if (typeof dateStr === "string") d = new Date(dateStr);
                else if (dateStr.toDate) d = dateStr.toDate();
                else if (dateStr.seconds) d = new Date(dateStr.seconds * 1000);
                else d = new Date(dateStr);

                const diffMs = d.getTime() - startDate.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const week = Math.floor(diffDays / 7) + 1;
                return Math.min(18, Math.max(1, week));
            };

            // Compute auto-calculated values
            const computedRows: WeekRowData[] = Array.from({ length: 18 }, (_, i) => ({
                week: i + 1,
                indivSesi: 0,
                indivJam: 0,
                kelompokSesi: 0,
                kelompokJam: 0,
                aktivitiSlot: 0,
                aktivitiJam: 0,
                profDevSlot: 0,
                profDevJam: 0,
                adminJam: 0,
            }));

            // Process sessions for slots
            sessions.forEach(s => {
                const w = getWeekNum(s.date);
                if (w >= 1 && w <= 18) {
                    const r = computedRows[w - 1];
                    if (["Form1", "Form2", "Form5"].includes(s.formType)) {
                        r.indivSesi += 1;
                    } else if (s.formType === "Form11") {
                        r.kelompokSesi += 1;
                    } else if (["Form8", "Form13", "Form7", "Form6"].includes(s.formType)) {
                        r.aktivitiSlot += 1;
                    }
                }
            });

            // Process logs for hours and remaining slots
            logs.forEach(l => {
                const w = getWeekNum(l.date);
                if (w >= 1 && w <= 18) {
                    const r = computedRows[w - 1];
                    const h = l.hours || 0;
                    if (l.category === "Individual Counselling") {
                        r.indivJam = Math.round((r.indivJam + h) * 10) / 10;
                    } else if (l.category === "Group Counselling") {
                        r.kelompokJam = Math.round((r.kelompokJam + h) * 10) / 10;
                    } else if (["Crisis Intervention", "PFA/MHPSS", "Psychoeducation/Community", "Testing & Assessment", "Supervision"].includes(l.category)) {
                        r.aktivitiJam = Math.round((r.aktivitiJam + h) * 10) / 10;
                        if (l.category === "Psychoeducation/Community" && (l.description?.toLowerCase().includes("outreach") || l.description?.toLowerCase().includes("webinar"))) {
                            r.aktivitiSlot += 1;
                        }
                    } else if (l.category === "Professional Development") {
                        r.profDevJam = Math.round((r.profDevJam + h) * 10) / 10;
                        r.profDevSlot += 1;
                    } else if (l.category === "Management & Admin") {
                        r.adminJam = Math.round((r.adminJam + h) * 10) / 10;
                    }
                }
            });

            if (docSnap.exists() && docSnap.data().rows) {
                const savedRows = docSnap.data().rows as WeekRowData[];
                setRows(savedRows);
                if (docSnap.data().academicSupervisor) {
                    setAcademicSupervisor(docSnap.data().academicSupervisor);
                }
            } else {
                setRows(computedRows);
            }
        } catch (error) {
            console.error("Error loading Lampiran B data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (weekIndex: number, field: keyof WeekRowData, value: string) => {
        const numVal = parseFloat(value) || 0;
        setRows(prev => {
            const updated = [...prev];
            updated[weekIndex] = {
                ...updated[weekIndex],
                [field]: numVal
            };
            return updated;
        });
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const docRef = doc(db, "rumusan_jam_praktikum", user.uid);
            await setDoc(docRef, {
                traineeId: user.uid,
                traineeName,
                academicSupervisor,
                rows,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 4000);
        } catch (error) {
            console.error("Error saving Lampiran B:", error);
            alert("Ralat semasa menyimpan borang rumusan.");
        } finally {
            setSaving(false);
        }
    };

    // Calculate row total
    const getRowTotal = (r: WeekRowData) => {
        if (r.customRowTotal !== undefined) return r.customRowTotal;
        return Math.round((r.indivJam + r.kelompokJam + r.aktivitiJam + r.profDevJam + r.adminJam) * 10) / 10;
    };

    // Calculate column totals
    const grandTotals = rows.reduce(
        (acc, r) => ({
            indivSesi: acc.indivSesi + (r.indivSesi || 0),
            indivJam: Math.round((acc.indivJam + (r.indivJam || 0)) * 10) / 10,
            kelompokSesi: acc.kelompokSesi + (r.kelompokSesi || 0),
            kelompokJam: Math.round((acc.kelompokJam + (r.kelompokJam || 0)) * 10) / 10,
            aktivitiSlot: acc.aktivitiSlot + (r.aktivitiSlot || 0),
            aktivitiJam: Math.round((acc.aktivitiJam + (r.aktivitiJam || 0)) * 10) / 10,
            profDevSlot: acc.profDevSlot + (r.profDevSlot || 0),
            profDevJam: Math.round((acc.profDevJam + (r.profDevJam || 0)) * 10) / 10,
            adminJam: Math.round((acc.adminJam + (r.adminJam || 0)) * 10) / 10,
            rowTotal: Math.round((acc.rowTotal + getRowTotal(r)) * 10) / 10,
        }),
        {
            indivSesi: 0,
            indivJam: 0,
            kelompokSesi: 0,
            kelompokJam: 0,
            aktivitiSlot: 0,
            aktivitiJam: 0,
            profDevSlot: 0,
            profDevJam: 0,
            adminJam: 0,
            rowTotal: 0,
        }
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-upsi-navy"></div>
                <p className="text-sm font-semibold text-slate-600">Memuatkan Borang Rumusan Jam Praktikum (Lampiran B)...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar (No Print) */}
            <div className="no-print bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-upsi-navy text-upsi-gold rounded-xl shadow-md">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Lampiran B: Borang Rumusan Jam Praktikum
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Automated & Editable Summary Matrix (Weeks 1 – 18)
                        </p>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-sm ${
                            isEditing
                                ? "bg-amber-500 text-white border-amber-600 shadow-amber-200"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
                        <span>{isEditing ? "Mod Melihat" : "Mod Suntingan (Edit)"}</span>
                    </button>

                    <button
                        onClick={loadRumusanData}
                        title="Kira Semula Dari Log Harian"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                    >
                        <RefreshCw size={16} />
                        <span>Kira Semula (Auto)</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
                    >
                        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
                        <span>Simpan Perubahan</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-upsi-navy text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition-all shadow-md shadow-upsi-navy/20"
                    >
                        <Printer size={16} />
                        <span>Cetak (Lampiran B)</span>
                    </button>
                </div>
            </div>

            {savedNotice && (
                <div className="no-print bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span className="font-bold text-sm">Borang Rumusan Jam Praktikum (Lampiran B) berjaya disimpan ke pangkalan data!</span>
                </div>
            )}

            {/* Print & View Container - Formatted Exactly Like Official Lampiran B */}
            <div className="lampiran-b-document bg-white p-6 md:p-10 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">

                {/* Page 1 (Weeks 1 to 10) */}
                <div className="print-page print:min-h-screen flex flex-col justify-between mb-8 print:mb-0 print:pb-6">
                    <div>
                        {/* Header Document */}
                        <div className="flex justify-between items-start mb-2">
                            <div></div>
                            <div className="text-right">
                                <h3 className="font-black text-slate-900 text-sm tracking-widest uppercase">LAMPIRAN B</h3>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="font-black text-slate-900 text-base md:text-lg tracking-wider uppercase">
                                BORANG RUMUSAN JAM PRAKTIKUM
                            </h2>
                        </div>

                        {/* Main Matrix Table Part 1 (Weeks 1-10) */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse border border-black text-[11px] font-sans">
                                <thead>
                                    <tr className="border-b border-black font-bold">
                                        <th rowSpan={3} className="border border-black p-1 w-12 bg-slate-50 print:bg-transparent">
                                            Minggu
                                        </th>
                                        <th colSpan={4} className="border border-black p-1 bg-slate-50 print:bg-transparent">
                                            1. Perkhidmatan Bersemuka
                                        </th>
                                        <th colSpan={5} className="border border-black p-1 bg-slate-50 print:bg-transparent">
                                            2. Aktiviti Berkaitan Tugas Profesional Kaunselor
                                        </th>
                                        <th rowSpan={3} className="border border-black p-1 w-24 bg-slate-50 print:bg-transparent">
                                            Jumlah jam dan minit
                                        </th>
                                    </tr>
                                    <tr className="border-b border-black font-bold">
                                        <th colSpan={2} className="border border-black p-1.5 align-top">
                                            <div>Kaunseling Individu</div>
                                            <div className="font-semibold text-[10px]">Anggaran 60 jam</div>
                                        </th>
                                        <th colSpan={2} className="border border-black p-1.5 align-top">
                                            <div>Kaunseling Kelompok</div>
                                            <div className="font-semibold text-[10px]">Anggaran 36 jam</div>
                                        </th>
                                        <th colSpan={2} className="border border-black p-1.5 align-top text-left font-normal text-[9.5px] leading-tight">
                                            <div className="font-bold text-[10.5px]">A. Aktiviti Psikopendidikan /Intervensi Psikososial</div>
                                            <div className="font-semibold text-[10px]">Anggaran 90 jam</div>
                                            <div className="mt-0.5">i. PFA/Mental Health Psychosocial Support</div>
                                            <div>ii. Pengujian: Tadbir, Analisis dan Interpretasi</div>
                                            <div>iii. Konsultasi dan Rujukan</div>
                                        </th>
                                        <th colSpan={2} className="border border-black p-1.5 align-top text-left font-normal text-[9.5px] leading-tight">
                                            <div className="font-bold text-[10.5px]">C. Perkembangan Profesional</div>
                                            <div className="font-semibold text-[10px]">Anggaran 14 jam</div>
                                            <div className="mt-0.5">i. Pembentang/peserta konferens</div>
                                            <div>ii. Bengkel berkaitan bidang</div>
                                        </th>
                                        <th colSpan={1} className="border border-black p-1.5 align-top text-left font-normal text-[9.5px] leading-tight">
                                            <div className="font-bold text-[10.5px]">B. Pengurusan dan Pentadbiran</div>
                                            <div className="font-semibold text-[10px]">Anggaran 52 jam</div>
                                            <div className="mt-0.5">i. Pengurusan fail, rekod dan buku log</div>
                                            <div>ii. Laporan Akhir</div>
                                            <div>iii. Refleksi</div>
                                        </th>
                                    </tr>
                                    <tr className="border-b border-black font-semibold text-[10px]">
                                        <th className="border border-black p-1 w-14">Jumlah sesi</th>
                                        <th className="border border-black p-1 w-16">Jumlah jam/minit</th>
                                        <th className="border border-black p-1 w-14">Jumlah sesi</th>
                                        <th className="border border-black p-1 w-16">Jumlah jam/minit</th>
                                        <th className="border border-black p-1 w-14">Jumlah slot</th>
                                        <th className="border border-black p-1 w-16">Jumlah jam dan minit</th>
                                        <th className="border border-black p-1 w-14">Jumlah slot</th>
                                        <th className="border border-black p-1 w-16">Jumlah jam dan minit</th>
                                        <th className="border border-black p-1 w-20">Jumlah jam dan minit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.slice(0, 10).map((r, idx) => {
                                        const rTotal = getRowTotal(r);
                                        return (
                                            <tr key={r.week} className="border-b border-black h-8">
                                                <td className="border border-black font-bold text-center bg-slate-50/50 print:bg-transparent">
                                                    {r.week}
                                                </td>

                                                {/* Indiv Sesi */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.indivSesi || ""}
                                                            onChange={e => handleCellChange(idx, "indivSesi", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.indivSesi || ""
                                                    )}
                                                </td>

                                                {/* Indiv Jam */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.indivJam || ""}
                                                            onChange={e => handleCellChange(idx, "indivJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.indivJam || ""
                                                    )}
                                                </td>

                                                {/* Kelompok Sesi */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.kelompokSesi || ""}
                                                            onChange={e => handleCellChange(idx, "kelompokSesi", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.kelompokSesi || ""
                                                    )}
                                                </td>

                                                {/* Kelompok Jam */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.kelompokJam || ""}
                                                            onChange={e => handleCellChange(idx, "kelompokJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.kelompokJam || ""
                                                    )}
                                                </td>

                                                {/* Aktiviti Slot */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.aktivitiSlot || ""}
                                                            onChange={e => handleCellChange(idx, "aktivitiSlot", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.aktivitiSlot || ""
                                                    )}
                                                </td>

                                                {/* Aktiviti Jam */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.aktivitiJam || ""}
                                                            onChange={e => handleCellChange(idx, "aktivitiJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.aktivitiJam || ""
                                                    )}
                                                </td>

                                                {/* ProfDev Slot */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.profDevSlot || ""}
                                                            onChange={e => handleCellChange(idx, "profDevSlot", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.profDevSlot || ""
                                                    )}
                                                </td>

                                                {/* ProfDev Jam */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.profDevJam || ""}
                                                            onChange={e => handleCellChange(idx, "profDevJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.profDevJam || ""
                                                    )}
                                                </td>

                                                {/* Admin Jam */}
                                                <td className="border border-black p-0 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.adminJam || ""}
                                                            onChange={e => handleCellChange(idx, "adminJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.adminJam || ""
                                                    )}
                                                </td>

                                                {/* Row Total */}
                                                <td className="border border-black font-bold text-center bg-slate-50/50 print:bg-transparent">
                                                    {rTotal || ""}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Page Break for Print */}
                <div className="print:page-break-before my-8 print:my-0"></div>

                {/* Page 2 (Weeks 11 to 18 + Jumlah + Signatures) */}
                <div className="print-page print:min-h-screen flex flex-col justify-between">
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse border border-black text-[11px] font-sans">
                                <tbody>
                                    {rows.slice(10, 18).map((r, idxOffset) => {
                                        const idx = idxOffset + 10;
                                        const rTotal = getRowTotal(r);
                                        return (
                                            <tr key={r.week} className="border-b border-black h-8">
                                                <td className="border border-black font-bold text-center w-12 bg-slate-50/50 print:bg-transparent">
                                                    {r.week}
                                                </td>

                                                {/* Indiv Sesi */}
                                                <td className="border border-black p-0 text-center w-14">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.indivSesi || ""}
                                                            onChange={e => handleCellChange(idx, "indivSesi", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.indivSesi || ""
                                                    )}
                                                </td>

                                                {/* Indiv Jam */}
                                                <td className="border border-black p-0 text-center w-16">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.indivJam || ""}
                                                            onChange={e => handleCellChange(idx, "indivJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.indivJam || ""
                                                    )}
                                                </td>

                                                {/* Kelompok Sesi */}
                                                <td className="border border-black p-0 text-center w-14">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.kelompokSesi || ""}
                                                            onChange={e => handleCellChange(idx, "kelompokSesi", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.kelompokSesi || ""
                                                    )}
                                                </td>

                                                {/* Kelompok Jam */}
                                                <td className="border border-black p-0 text-center w-16">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.kelompokJam || ""}
                                                            onChange={e => handleCellChange(idx, "kelompokJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.kelompokJam || ""
                                                    )}
                                                </td>

                                                {/* Aktiviti Slot */}
                                                <td className="border border-black p-0 text-center w-14">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.aktivitiSlot || ""}
                                                            onChange={e => handleCellChange(idx, "aktivitiSlot", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.aktivitiSlot || ""
                                                    )}
                                                </td>

                                                {/* Aktiviti Jam */}
                                                <td className="border border-black p-0 text-center w-16">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.aktivitiJam || ""}
                                                            onChange={e => handleCellChange(idx, "aktivitiJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.aktivitiJam || ""
                                                    )}
                                                </td>

                                                {/* ProfDev Slot */}
                                                <td className="border border-black p-0 text-center w-14">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={r.profDevSlot || ""}
                                                            onChange={e => handleCellChange(idx, "profDevSlot", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1"
                                                        />
                                                    ) : (
                                                        r.profDevSlot || ""
                                                    )}
                                                </td>

                                                {/* ProfDev Jam */}
                                                <td className="border border-black p-0 text-center w-16">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.profDevJam || ""}
                                                            onChange={e => handleCellChange(idx, "profDevJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.profDevJam || ""
                                                    )}
                                                </td>

                                                {/* Admin Jam */}
                                                <td className="border border-black p-0 text-center w-20">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={r.adminJam || ""}
                                                            onChange={e => handleCellChange(idx, "adminJam", e.target.value)}
                                                            className="w-full h-full text-center bg-amber-50 focus:bg-white focus:outline-none p-1 font-semibold"
                                                        />
                                                    ) : (
                                                        r.adminJam || ""
                                                    )}
                                                </td>

                                                {/* Row Total */}
                                                <td className="border border-black font-bold text-center w-24 bg-slate-50/50 print:bg-transparent">
                                                    {rTotal || ""}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* 2 Blank rows as in official template */}
                                    <tr className="border-b border-black h-8">
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                    </tr>
                                    <tr className="border-b border-black h-8">
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                        <td className="border border-black"></td>
                                    </tr>

                                    {/* JUMLAH Row */}
                                    <tr className="border-b border-black font-extrabold h-9 bg-slate-100 print:bg-transparent">
                                        <td className="border border-black text-center p-1 text-xs">Jumlah</td>
                                        <td className="border border-black text-center p-1">{grandTotals.indivSesi || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.indivJam || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.kelompokSesi || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.kelompokJam || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.aktivitiSlot || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.aktivitiJam || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.profDevSlot || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.profDevJam || ""}</td>
                                        <td className="border border-black text-center p-1">{grandTotals.adminJam || ""}</td>
                                        <td className="border border-black text-center p-1 text-xs font-black">
                                            {grandTotals.rowTotal || 252}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Signatures Block at Bottom of Page 2 */}
                    <div className="mt-12 pt-6 text-[11px] font-sans">
                        <div className="grid grid-cols-2 gap-8 items-end">
                            <div>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        Nama & Tandatangan Pelajar: <span className="font-bold border-b border-black pb-0.5 px-2">{traineeName}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold">
                                    Nama, Cop dan Tandatangan Penyelia Akademik:{" "}
                                    <span className="font-bold border-b border-black pb-0.5 px-2">{academicSupervisor}</span>
                                </p>
                                <p className="font-semibold">
                                    Tarikh: <span className="border-b border-black pb-0.5 px-8"></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .no-print, header, sidebar, nav {
                        display: none !important;
                    }
                    .lampiran-b-document {
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                    }
                    .print\\:page-break-before {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    table {
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid black !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 12mm;
                    }
                }
            `}</style>
        </div>
    );
}
