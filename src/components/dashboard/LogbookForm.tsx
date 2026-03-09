"use client";

import { useState } from "react";
import { LogCategory, addLogEntry } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, BookOpen, Send, ChevronDown } from "lucide-react";

interface LogbookFormProps {
    onLogAdded: () => void;
}

export const LogbookForm = ({ onLogAdded }: LogbookFormProps) => {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<LogCategory>("Individual Counselling");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !hours) return;

        setIsSubmitting(true);
        try {
            await addLogEntry({
                traineeId: user.uid,
                date,
                category,
                hours: parseFloat(hours),
                description
            });
            setDescription("");
            setHours("");
            onLogAdded();
        } catch (error) {
            console.error("Error adding log:", error);
            alert("Failed to add log entry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass rounded-[2rem] shadow-premium overflow-hidden border border-white">
            <div className="bg-upsi-navy px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                <h3 className="text-lg md:text-xl font-black text-white flex items-center space-x-3 relative z-10">
                    <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
                        <BookOpen size={20} className="text-upsi-gold" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="truncate">Daily Logbook Entry</span>
                        <span className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mt-0.5 truncate">Clinical Attendance Log</span>
                    </div>
                </h3>
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
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Clinical Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as LogCategory)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <optgroup label="Face-to-Face">
                                <option value="Individual Counselling">Individual Counselling</option>
                                <option value="Group Counselling">Group Counselling</option>
                            </optgroup>
                            <optgroup label="Non-Face-to-Face">
                                <option value="PFA/MHPSS">PFA / MHPSS</option>
                                <option value="Management/Admin">Management / Admin</option>
                                <option value="Professional Development">Professional Development</option>
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
                            <span className="uppercase tracking-widest text-xs">Validating Entry</span>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
