"use client";

import React from "react";
import { CheckCircle2, Circle, MapPin, Building2, Video, Clock } from "lucide-react";
import { Supervision } from "@/lib/firebase/db";

interface SupervisionTrackerProps {
    supervisions: Supervision[];
}

export const SupervisionTracker: React.FC<SupervisionTrackerProps> = ({ supervisions }) => {
    const siteSupervisions = supervisions.filter(s => s.type === 'Site' && s.status === 'completed');
    const campusSupervisions = supervisions.filter(s => s.type === 'Campus' && s.status === 'completed');

    const milestoneData = [
        { label: "Site Supervision", target: 1, current: siteSupervisions.length, icon: MapPin, color: "text-emerald-500" },
        { label: "Campus Supervision", target: 2, current: campusSupervisions.length, icon: Building2, color: "text-blue-500" },
    ];

    const allCompleted = siteSupervisions.length >= 1 && campusSupervisions.length >= 2;

    return (
        <div className="glass shadow-premium rounded-[2rem] p-8 border border-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-black text-upsi-navy tracking-tight">Supervision Milestones</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Mandatory Requirements</p>
                </div>
                {allCompleted ? (
                    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Requirement Met</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full border border-orange-100">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">In Progress</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {milestoneData.map((m, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-upsi-gold/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-white shadow-sm ${m.color}`}>
                                <m.icon size={20} />
                            </div>
                            <div className="flex -space-x-2">
                                {[...Array(m.target)].map((_, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${i < m.current ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        {i < m.current ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{m.label}</h4>
                        <div className="mt-2 flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Completion Status</span>
                            <span className="text-lg font-black text-slate-900 leading-none">{Math.min(m.current, m.target)} / {m.target}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Support/Other Supervision */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                <div className="flex items-center space-x-4 text-slate-400 italic text-sm">
                    <Video size={16} />
                    <span>Other online or ad-hoc sessions are tracked separately in your logbook.</span>
                </div>
            </div>
        </div>
    );
};
