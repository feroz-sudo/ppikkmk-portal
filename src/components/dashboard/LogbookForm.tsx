"use client";

import { useState, useEffect } from "react";
import { LogCategory, addLogEntry, updateLogEntry, Log } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, BookOpen, Send, ChevronDown, X, MapPin } from "lucide-react";

interface LogbookFormProps {
    onLogAdded: () => void;
    initialData?: Log;
    onClose?: () => void;
}

export const LogbookForm = ({ onLogAdded, initialData, onClose }: LogbookFormProps) => {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<LogCategory>("Individual Counselling");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setDate(initialData.date);
            setCategory(initialData.category);
            setHours(initialData.hours.toString());
            setDescription(initialData.description);
            setLocation(initialData.location || "");
            setStartTime(initialData.startTime || "");
            setEndTime(initialData.endTime || "");
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !hours) return;

        setIsSubmitting(true);
        try {
            const logData = {
                traineeId: user.uid,
                date,
                category,
                hours: parseFloat(hours),
                description,
                location,
                startTime,
                endTime
            };
            // ... rest of the content (skipped for conciseness in this thought but will be provided in tool)

            if (initialData?.id) {
                await updateLogEntry(initialData.id, logData);
            } else {
                await addLogEntry(logData);
            }

            setDescription("");
            setHours("");
            onLogAdded();
            if (onClose) onClose();
        } catch (error) {
            console.error("Error saving log:", error);
            alert("Failed to save log entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formContent = (
        <div className={`glass rounded-[2rem] shadow-premium overflow-hidden border border-white ${onClose ? 'w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-300' : ''}`}>
            <div className="bg-upsi-navy px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center relative z-10">
                    <h3 className="text-lg md:text-xl font-black text-white flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
                            <BookOpen size={20} className="text-upsi-gold" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{initialData ? 'Edit Clinical Log' : 'Daily Logbook Entry'}</span>
                            <span className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mt-0.5 truncate">Clinical Attendance Log</span>
                        </div>
                    </h3>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Date of Activity</label>
                        <div className="relative group">
                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-upsi-navy transition-colors" />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min="2026-03-09"
                                max="2026-07-10"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Duration (Hours)</label>
                        <div className="relative group">
                            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-upsi-navy transition-colors" />
                            <input
                                type="number"
                                required
                                min="0.5"
                                step="0.5"
                                placeholder="e.g. 1.5"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Location (Lokasi)</label>
                    <div className="relative group">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-upsi-navy transition-colors" />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Bilik Kaunseling 1 / On-site"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Start Time</label>
                        <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">End Time</label>
                        <input
                            type="time"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Clinical Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as LogCategory)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <optgroup label="Direct Service (Bersemuka)">
                                <option value="Individual Counselling">Individual Counselling</option>
                                <option value="Group Counselling">Group Counselling</option>
                                <option value="Crisis Intervention">Crisis Intervention</option>
                                <option value="PFA/MHPSS">PFA / MHPSS</option>
                            </optgroup>
                            <optgroup label="Professional Activities">
                                <option value="Psychoeducation/Community">Psychoeducation / Community</option>
                                <option value="Testing & Assessment">Testing & Assessment</option>
                                <option value="Management & Admin">Management & Admin</option>
                                <option value="Professional Development">Professional Development</option>
                                <option value="Supervision">Supervision (Clinical/Triadic/Group)</option>
                            </optgroup>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Activity Description</label>
                    <textarea
                        required
                        rows={3}
                        placeholder="Briefly describe the clinical activity or session goals..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none shadow-inner"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group flex justify-center items-center space-x-3 bg-upsi-navy text-white font-black py-4 px-6 rounded-2xl hover:bg-blue-900 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-50 shadow-lg shadow-upsi-navy/20 active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="uppercase tracking-widest text-xs">Processing...</span>
                        </div>
                    ) : (
                        <>
                            <span className="uppercase tracking-widest text-xs">{initialData ? 'Update Clinical Entry' : 'Validating Entry'}</span>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );

    return onClose ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            {formContent}
        </div>
    ) : formContent;
};
