"use client";

import React from "react";
import { Log } from "@/lib/firebase/db";
import { Target, Users, UserPlus, Clock } from "lucide-react";

interface SupervisorAnalyticsProps {
    logs: Log[];
}

export const SupervisorAnalytics: React.FC<SupervisorAnalyticsProps> = ({ logs }) => {
    const TARGETS = {
        TOTAL: 252,
        KI: 60,
        KK: 36,
        PROF: 156 // PFA + Admin + PD
    };

    const calculateHours = (categories: string[]) => {
        return logs
            .filter(log => categories.includes(log.category))
            .reduce((sum, log) => sum + (log.hours || 0), 0);
    };

    const stats = [
        {
            label: "Total Progress",
            current: logs.reduce((sum, log) => sum + (log.hours || 0), 0),
            target: TARGETS.TOTAL,
            icon: Target,
            color: "from-upsi-navy to-blue-800"
        },
        {
            label: "Individual (KI)",
            current: calculateHours(["Individual Counselling"]),
            target: TARGETS.KI,
            icon: UserPlus,
            color: "from-emerald-500 to-teal-600"
        },
        {
            label: "Group (KK)",
            current: calculateHours(["Group Counselling"]),
            target: TARGETS.KK,
            icon: Users,
            color: "from-blue-500 to-indigo-600"
        },
        {
            label: "Professional",
            current: calculateHours(["PFA/MHPSS", "Management/Admin", "Professional Development"]),
            target: TARGETS.PROF,
            icon: Clock,
            color: "from-orange-500 to-amber-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
                const percentage = Math.min(100, Math.round((s.current / s.target) * 100));
                return (
                    <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-premium border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                                    <s.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{percentage}%</span>
                            </div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</h4>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-2xl font-black text-slate-900">{s.current}</span>
                                <span className="text-xs font-bold text-slate-400">/ {s.target} HRS</span>
                            </div>
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-1000`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
                            <s.icon size={80} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
