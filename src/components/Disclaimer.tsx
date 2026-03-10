import Link from "next/link";
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
                <p>Software Platform & Architecture © <Link href="/dashboard/admin" className="hover:text-upsi-gold transition-colors">Ahmad Feroz</Link>. All Rights Reserved.</p>
                <p>Forms, Branding & Clinical Content © Universiti Pendidikan Sultan Idris (UPSI).</p>
            </div>
        );
    }

    return (
        <div className={`bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
            <div className="flex items-start space-x-6">
                <div className="bg-upsi-gold/10 p-2 rounded-lg shrink-0">
                    <ShieldCheck className="text-upsi-gold" size={24} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* LEFT COLUMN: INSTITUTIONAL */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-upsi-navy uppercase tracking-[0.2em]">
                            Institutional Intellectual Property
                        </h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                            All institutional trademarks, official UPSI logos, and the structured clinical documentation frameworks (Lampiran A, B, and Clinical Forms) are the exclusive property of <span className="font-bold text-slate-800">Universiti Pendidikan Sultan Idris (UPSI)</span> and are protected under prevailing IP statutes.
                        </p>
                    </div>

                    {/* RIGHT COLUMN: SOFTWARE */}
                    <div className="space-y-3 border-l border-slate-200 pl-8">
                        <h4 className="text-[10px] font-black text-upsi-navy uppercase tracking-[0.2em]">
                            Software Platform Development
                        </h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                            The software platform, custom codebase, database architecture, and proprietary UI/UX workflows are developed and owned by <Link href="/dashboard/admin" className="font-bold text-slate-800 hover:text-upsi-navy transition-colors cursor-default">Ahmad Feroz</Link>. This digital ecosystem is engineered specifically to facilitate clinical management within UPSI protocols.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-upsi-navy/80 mb-2">
                    <Info size={14} className="text-upsi-gold" />
                    <span className="text-[11px] font-black uppercase tracking-widest leading-none">Portal Objective</span>
                </div>
                <p className="text-[11px] text-slate-500 italic leading-relaxed">
                    This specialized portal is engineered to facilitate the systematic and rigorous management of clinical practicum and internship requirements. By standardizing documentation workflows, the platform ensures that the professional integration of trainees and the evaluative oversight of supervisors are executed with maximum precision, efficiency, and methodological consistency.
                </p>
            </div>
        </div>
    );
};
