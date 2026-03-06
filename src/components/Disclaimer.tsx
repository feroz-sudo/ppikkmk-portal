"use client";

import React from "react";
import { ShieldCheck, Info } from "lucide-react";

interface DisclaimerProps {
    variant?: "compact" | "full";
    className?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ variant = "full", className = "" }) => {
    if (variant === "compact") {
        return (
            <div className={`text-[10px] text-gray-400 font-medium tracking-tight leading-tight ${className}`}>
                <p>© Universiti Pendidikan Sultan Idris (UPSI). All logos, names, and forms are copyrighted.</p>
                <p>Ensuring clinical practicum and internship efficiency.</p>
            </div>
        );
    }

    return (
        <div className={`bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
            <div className="flex items-start space-x-4">
                <div className="bg-upsi-gold/10 p-2 rounded-lg shrink-0">
                    <ShieldCheck className="text-upsi-gold" size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-upsi-navy uppercase tracking-wider mb-1">
                        Institutional Copyright Notice
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        All intellectual property, including institutional trademarks, logos of Universiti Pendidikan Sultan Idris (UPSI), and the structured clinical documentation frameworks within this portal, are the exclusive property of UPSI and are protected under prevailing copyright and intellectual property statutes.
                    </p>

                    <div className="flex items-center space-x-2 text-upsi-navy/80 mb-1">
                        <ShieldCheck size={14} className="text-upsi-gold" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Portal Objective</span>
                    </div>
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                        This specialized portal is engineered to facilitate the systematic and rigorous management of clinical practicum and internship requirements. By standardizing documentation workflows, the platform ensures that the professional integration of trainees and the evaluative oversight of supervisors are executed with maximum precision, efficiency, and methodological consistency.
                    </p>
                </div>
            </div>
        </div>
    );
};
