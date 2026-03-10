"use client";

import { Log, LogCategory } from "@/lib/firebase/db";
import { FileDown, Calendar, Calculator, Sigma } from "lucide-react";

interface SummarySectionProps {
    logs: Log[];
}

export const SummarySection = ({ logs }: SummarySectionProps) => {
    // 16 Weeks breakdown
    const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

    const getWeekNumber = (dateStr: string) => {
        const date = new Date(dateStr);
        // This is a simplified week calculation, usually aligned to system start date
        // For PPIKKMK we might need a specific start date, but for now we'll use a standard ISO week or simple diff
        // Let's assume the first log's date is week 1 if not defined otherwise
        if (logs.length === 0) return 0;
        const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const start = new Date(sorted[0].date);
        const diff = Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(16, Math.max(1, diff + 1));
    };

    const categories: { label: string, keys: LogCategory[] | string[] }[] = [
        { label: "Kaunseling Individu", keys: ["Individual Counselling"] },
        { label: "Kaunseling Kelompok", keys: ["Group Counselling"] },
        { label: "Aktiviti / Intervensi", keys: ["Crisis Intervention", "PFA/MHPSS", "Psychoeducation/Community", "Testing & Assessment"] },
        { label: "Pentadbiran/Pengurusan", keys: ["Management & Admin", "Management/Admin"] },
        { label: "Perkembangan Profesional", keys: ["Professional Development"] },
        { label: "Penyeliaan", keys: ["Supervision"] }
    ];

    const getHours = (week: number, catKeys: LogCategory[]) => {
        return logs
            .filter(log => getWeekNumber(log.date) === week && catKeys.includes(log.category))
            .reduce((sum, log) => sum + log.hours, 0);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                <div className="bg-upsi-navy p-8 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-white text-xl font-black uppercase tracking-wider flex items-center">
                            <Calculator className="mr-3 text-upsi-gold" size={24} />
                            Rumusan Jam Praktikum Keseluruhan
                        </h2>
                        <p className="text-blue-100/60 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Automated Clinical Hours Audit (16 Weeks)</p>
                    </div>
                    <button onClick={() => window.print()} className="no-print bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center space-x-2">
                        <FileDown size={14} />
                        <span>Export Summary</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-4 text-[9px] font-black uppercase text-slate-400 text-center border-r border-slate-200">Minggu</th>
                                {categories.map(cat => (
                                    <th key={cat.label} className="px-4 py-4 text-[9px] font-black uppercase text-slate-500 text-center">{cat.label}</th>
                                ))}
                                <th className="px-4 py-4 text-[9px] font-black uppercase text-upsi-navy text-center bg-blue-50/50">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {weeks.map(w => {
                                let weekTotal = 0;
                                return (
                                    <tr key={w} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-4 py-3 text-center border-r border-slate-100 font-bold text-slate-400 text-xs">W{w}</td>
                                        {categories.map(cat => {
                                            const h = getHours(w, cat.keys as any);
                                            weekTotal += h;
                                            return <td key={cat.label} className={`px-4 py-3 text-center text-xs font-medium ${h > 0 ? 'text-slate-800 font-bold' : 'text-slate-300'}`}>{h || '-'}</td>
                                        })}
                                        <td className="px-4 py-3 text-center text-xs font-black text-upsi-navy bg-blue-50/20">{weekTotal || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <td className="px-4 py-5 text-center font-black text-[10px] uppercase border-r border-white/10">Jumlah Besar</td>
                                {categories.map(cat => {
                                    const total = logs.filter(l => cat.keys.includes(l.category)).reduce((s, l) => s + l.hours, 0);
                                    return <td key={cat.label} className="px-4 py-5 text-center font-black text-sm text-upsi-gold">{total || 0}</td>
                                })}
                                <td className="px-4 py-5 text-center font-black text-lg bg-upsi-gold text-upsi-navy">
                                    {logs.reduce((s, l) => s + l.hours, 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                <SummaryCard label="Face-to-Face Target" current={logs.filter(l => ["Individual Counselling", "Group Counselling", "Crisis Intervention", "PFA/MHPSS"].includes(l.category)).reduce((s, l) => s + l.hours, 0)} target={96} unit="HRS" />
                <SummaryCard label="Total Practicum Requirement" current={logs.reduce((s, l) => s + l.hours, 0)} target={252} unit="HRS" />
            </div>
        </div>
    );
};

const SummaryCard = ({ label, current, target, unit }: { label: string, current: number, target: number, unit: string }) => {
    const progress = Math.min(100, (current / target) * 100);
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</h3>
                    <div className="text-3xl font-black text-upsi-navy">{current} <span className="text-sm text-slate-400">/ {target} {unit}</span></div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-upsi-gold">{Math.round(progress)}%</div>
                </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-upsi-navy to-blue-600 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
