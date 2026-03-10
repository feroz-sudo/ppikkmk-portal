"use client";

import { useState, useEffect } from "react";
import { WeeklyReflection, saveWeeklyReflection, getWeeklyReflection } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Save, Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export const ReflectionSection = () => {
    const { user } = useAuth();
    const [week, setWeek] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reflection, setReflection] = useState<Omit<WeeklyReflection, "id" | "updatedAt" | "status">>({
        traineeId: "",
        weekNumber: 1,
        reflections: {
            individualCounselling: "",
            groupCounselling: "",
            activitiesIntervention: "",
            adminManagement: "",
            professionalDevelopment: "",
            supervision: ""
        }
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadReflection = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await getWeeklyReflection(user.uid, week);
                if (data) {
                    setReflection({
                        traineeId: data.traineeId,
                        weekNumber: data.weekNumber,
                        reflections: data.reflections
                    });
                } else {
                    setReflection({
                        traineeId: user.uid,
                        weekNumber: week,
                        reflections: {
                            individualCounselling: "",
                            groupCounselling: "",
                            activitiesIntervention: "",
                            adminManagement: "",
                            professionalDevelopment: "",
                            supervision: ""
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadReflection();
    }, [user, week]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await saveWeeklyReflection(reflection);
            setMessage({ type: 'success', text: `Reflection for Week ${week} saved!` });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to save reflection.' });
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { key: "individualCounselling", label: "Kaunseling/ Terapi Individu", desc: "Kekuatan, kelemahan dan cara mengatasi" },
        { key: "groupCounselling", label: "Kaunseling/ Terapi Kelompok", desc: "Kekuatan, kelemahan dan cara mengatasi" },
        { key: "activitiesIntervention", label: "Aktiviti / Intervensi", desc: "Kekuatan, kelemahan dan cara mengatasi" },
        { key: "adminManagement", label: "Pengurusan Pentadbiran", desc: "Kekuatan, kelemahan dan cara mengatasi" },
        { key: "professionalDevelopment", label: "Perkembangan Profesional", desc: "Kekuatan, kelemahan dan cara mengatasi" },
        { key: "supervision", label: "Penyeliaan", desc: "Pengalaman diselia (Akademik/Lapangan)" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* WEEK SELECTOR */}
            <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] shadow-premium border border-slate-100">
                <button
                    onClick={() => setWeek(prev => Math.max(1, prev - 1))}
                    disabled={week === 1}
                    className="p-3 hover:bg-slate-50 text-slate-400 disabled:opacity-30 transition-all rounded-2xl"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="text-center">
                    <h2 className="text-xl font-black text-upsi-navy uppercase tracking-widest">Minggu {week}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Weekly Self-Reflection</p>
                </div>

                <button
                    onClick={() => setWeek(prev => Math.min(16, prev + 1))}
                    disabled={week === 16}
                    className="p-3 hover:bg-slate-50 text-slate-400 disabled:opacity-30 transition-all rounded-2xl"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {loading ? (
                <div className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-upsi-gold mb-4" size={32} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Retrieving Weekly Insight...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                    <div className="bg-upsi-navy p-8 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-white text-xl font-black uppercase tracking-wider flex items-center">
                                <Brain className="mr-3 text-upsi-gold" size={24} />
                                Refleksi Kendiri Praktikum
                            </h2>
                            <p className="text-blue-100/60 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Minggu {week} Detailed Review</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="no-print bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center space-x-2"
                        >
                            <Save size={14} />
                            <span>Print Reflection</span>
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {categories.map((cat) => (
                                <div key={cat.key} className="space-y-3">
                                    <label className="block">
                                        <span className="text-[10px] font-black text-upsi-navy uppercase tracking-[0.2em] ml-1">{cat.label}</span>
                                        <span className="block text-[9px] text-slate-400 italic mb-2 ml-1">{cat.desc}</span>
                                        <textarea
                                            value={(reflection.reflections as any)[cat.key]}
                                            onChange={e => setReflection({
                                                ...reflection,
                                                reflections: { ...reflection.reflections, [cat.key]: e.target.value }
                                            })}
                                            rows={5}
                                            placeholder={`Write your reflection for ${cat.label.toLowerCase()}...`}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all font-medium text-slate-700 text-sm resize-none shadow-inner"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl border flex items-center space-x-3 max-w-md mx-auto animate-in fade-in zoom-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-upsi-navy text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-upsi-navy/30 hover-lift transition-all flex items-center shrink-0 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save className="mr-3" size={18} />}
                                Save Week {week} Reflection
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
