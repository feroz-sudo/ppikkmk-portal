"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FormHeader } from "@/components/forms/FormHeader";

export default function RefleksiMingguanForm() {
    const { user } = useAuth();
    const [debugMsg, setDebugMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [weekNumber, setWeekNumber] = useState("1");
    
    // 6 reflection fields
    const [kaunselingIndividu, setKaunselingIndividu] = useState("");
    const [kaunselingKelompok, setKaunselingKelompok] = useState("");
    const [aktivitiIntervensi, setAktivitiIntervensi] = useState("");
    const [pengurusan, setPengurusan] = useState("");
    const [perkembangan, setPerkembangan] = useState("");
    const [penyeliaan, setPenyeliaan] = useState("");

    const loadData = async (week: string) => {
        if (!user) return;
        try {
            setDebugMsg(`Loading data for Week ${week}...`);
            const docRef = doc(db, "weekly_forms", `${user.uid}_refleksi_${week}`);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                setKaunselingIndividu(data.kaunselingIndividu || "");
                setKaunselingKelompok(data.kaunselingKelompok || "");
                setAktivitiIntervensi(data.aktivitiIntervensi || "");
                setPengurusan(data.pengurusan || "");
                setPerkembangan(data.perkembangan || "");
                setPenyeliaan(data.penyeliaan || "");
                setDebugMsg(`Week ${week} loaded successfully.`);
            } else {
                setKaunselingIndividu(""); setKaunselingKelompok(""); setAktivitiIntervensi(""); 
                setPengurusan(""); setPerkembangan(""); setPenyeliaan("");
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
            const docRef = doc(db, "weekly_forms", `${user.uid}_refleksi_${weekNumber}`);
            await setDoc(docRef, {
                traineeId: user.uid,
                type: "refleksi",
                weekNumber,
                kaunselingIndividu, kaunselingKelompok, aktivitiIntervensi, pengurusan, perkembangan, penyeliaan,
                updatedAt: new Date()
            });
            setDebugMsg("Saved successfully.");
        } catch (error: any) {
            setDebugMsg("Save failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            <FormHeader title="Refleksi Kendiri Mingguan" subtitle="Weekly Self-Reflection Form" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                <form id="refleksiForm" onSubmit={handleSave} className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl print:shadow-none print:bg-transparent">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-indigo-50/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-black text-upsi-navy tracking-tight">REFLEKSI KENDIRI</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Mingguan</p>
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

                    <div className="p-8 space-y-6">
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6 font-medium text-sm text-slate-600">
                            Sila huraikan kekuatan, kelemahan, dan cara mengatasi bagi setiap elemen di bawah.
                        </div>

                        {/* List of 6 */}
                        <div className="space-y-6">
                            {[
                                { title: "1. Kaunseling/ Terapi Individu", state: kaunselingIndividu, set: setKaunselingIndividu },
                                { title: "2. Kaunseling/ Terapi Kelompok", state: kaunselingKelompok, set: setKaunselingKelompok },
                                { title: "3. Aktiviti / Intervensi", state: aktivitiIntervensi, set: setAktivitiIntervensi },
                                { title: "4. Pengurusan Pentadbiran", state: pengurusan, set: setPengurusan },
                                { title: "5. Perkembangan Profesional", state: perkembangan, set: setPerkembangan },
                                { title: "6. Penyeliaan (pengalaman diselia oleh Penyelia Akademik dan/atau Lapangan)", state: penyeliaan, set: setPenyeliaan }
                            ].map((item, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-700">
                                        {item.title}
                                    </div>
                                    <textarea 
                                        value={item.state} 
                                        onChange={(e) => item.set(e.target.value)}
                                        className="w-full p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-upsi-navy/20 resize-y"
                                        placeholder="Kekuatan: ...&#10;Kelemahan: ...&#10;Cara Mengatasi: ..."
                                    />
                                </div>
                            ))}
                        </div>
                        
                    </div>
                </form>
            </div>
            <FormActionBar formId="refleksiForm" formTitle={`Refleksi Kendiri - Minggu ${weekNumber}`} debugMsg={debugMsg} />
        </div>
    );
}
