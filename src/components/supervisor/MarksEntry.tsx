"use client";

import React, { useState, useEffect } from "react";
import { TraineeMarks, saveTraineeMarks, getTraineeMarks } from "@/lib/firebase/db";
import { Save, Calculator, Award, UserCheck, BookOpen, Briefcase, FileCheck, CheckCircle2 } from "lucide-react";

interface MarksEntryProps {
    traineeId: string;
    supervisorId: string;
}

export const MarksEntry: React.FC<MarksEntryProps> = ({ traineeId, supervisorId }) => {
    const [marks, setMarks] = useState<Omit<TraineeMarks, "id" | "updatedAt">>({
        traineeId,
        supervisorId,
        faceToFace: {
            individual: 0,
            group: 0
        },
        professionalActivities: 0,
        managementAdmin: 0,
        professionalDevelopment: 0,
        professionalIdentity: 0,
        total: 0,
        comments: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchMarks = async () => {
            setLoading(true);
            try {
                const existingMarks = await getTraineeMarks(traineeId);
                if (existingMarks) {
                    setMarks(existingMarks);
                }
            } catch (error) {
                console.error("Failed to fetch marks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, [traineeId]);

    const calculateTotal = (data: typeof marks) => {
        const total =
            data.faceToFace.individual +
            data.faceToFace.group +
            data.professionalActivities +
            data.managementAdmin +
            data.professionalDevelopment +
            data.professionalIdentity;
        return Math.min(100, Math.round(total * 100) / 100);
    };

    const handleMarkChange = (field: string, value: string, subfield?: 'individual' | 'group') => {
        const numValue = parseFloat(value) || 0;
        let newMarks = { ...marks };

        if (field === 'faceToFace' && subfield) {
            newMarks.faceToFace[subfield] = numValue;
        } else {
            (newMarks as any)[field] = numValue;
        }

        newMarks.total = calculateTotal(newMarks);
        setMarks(newMarks);
        setSuccess(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveTraineeMarks(marks);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save marks:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-upsi-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading evaluation sheet...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden font-[Arial,sans-serif]">
            <div className="p-10 bg-upsi-navy text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tight flex items-center space-x-3">
                        <Award className="text-upsi-gold" size={32} />
                        <span>Clinical Evaluation Sheet (M252)</span>
                    </h2>
                    <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest mt-1">Official Practicum/Internship Marking Scheme</p>
                </div>
                <div className="relative z-10 text-right">
                    <p className="text-[10px] font-black text-upsi-gold uppercase tracking-[0.2em] mb-1">Total Score</p>
                    <div className="text-5xl font-black leading-none">{marks.total}</div>
                </div>
                <Award className="absolute -bottom-10 -left-10 text-white/5" size={200} />
            </div>

            <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Face to Face */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-upsi-navy border-b border-slate-100 pb-2">
                            <UserCheck size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">1. Face-to-Face (40%)</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Individual (Max 25)</label>
                                <input
                                    type="number"
                                    max="25"
                                    value={marks.faceToFace.individual}
                                    onChange={(e) => handleMarkChange('faceToFace', e.target.value, 'individual')}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Group (Max 15)</label>
                                <input
                                    type="number"
                                    max="15"
                                    value={marks.faceToFace.group}
                                    onChange={(e) => handleMarkChange('faceToFace', e.target.value, 'group')}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Activities */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-upsi-navy border-b border-slate-100 pb-2">
                            <Briefcase size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">2. Prof. Activities (25%)</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Psychoeducation/PFA/Consultation</label>
                            <input
                                type="number"
                                max="25"
                                value={marks.professionalActivities}
                                onChange={(e) => handleMarkChange('professionalActivities', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Management & Admin */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-upsi-navy border-b border-slate-100 pb-2">
                            <BookOpen size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">3. Management/Admin (20%)</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Logbook, Reports, Reflections</label>
                            <input
                                type="number"
                                max="20"
                                value={marks.managementAdmin}
                                onChange={(e) => handleMarkChange('managementAdmin', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Prof Development & Identity */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-upsi-navy border-b border-slate-100 pb-2">
                            <FileCheck size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">4 & 5. Development & Identity (15%)</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Development (Max 5)</label>
                                <input
                                    type="number"
                                    max="5"
                                    value={marks.professionalDevelopment}
                                    onChange={(e) => handleMarkChange('professionalDevelopment', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Identity (Max 10)</label>
                                <input
                                    type="number"
                                    max="10"
                                    value={marks.professionalIdentity}
                                    onChange={(e) => handleMarkChange('professionalIdentity', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-upsi-navy focus:ring-2 focus:ring-upsi-gold/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-3 text-upsi-navy border-b border-slate-100 pb-2">
                        <Calculator size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Supervisor Cumulative Feedback</h3>
                    </div>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 h-32 outline-none focus:ring-2 focus:ring-upsi-navy/10 font-medium text-slate-700 leading-relaxed resize-none"
                        placeholder="Provide overall qualitative clinical feedback for the trainee..."
                        value={marks.comments || ""}
                        onChange={(e) => {
                            setMarks({ ...marks, comments: e.target.value });
                            setSuccess(false);
                        }}
                    />
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center space-x-3 ${success
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : "bg-upsi-navy text-white shadow-upsi-navy/30 hover:scale-[1.02] active:scale-95"
                            }`}
                    >
                        {saving ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : success ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{success ? "EVALUATION SAVED" : "SAVE EVALUATION"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
