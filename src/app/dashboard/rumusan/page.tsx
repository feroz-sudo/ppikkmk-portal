"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, getTraineeLogs, Log, LogCategory } from "@/lib/firebase/db";
import {
    Calculator,
    Calendar,
    Download,
    FileText,
    Printer,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval, addWeeks, subWeeks } from "date-fns";

interface WeeklySummary {
    weekStart: Date;
    weekEnd: Date;
    weekNumber: number;
    categories: Record<LogCategory, number>;
    total: number;
}

export default function RumusanPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user]);

    async function fetchLogs() {
        try {
            const userLogs = await getTraineeLogs(user!.uid);
            setLogs(userLogs);
            calculateSummaries(userLogs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    }

    function calculateSummaries(logData: Log[]) {
        if (logData.length === 0) return;

        // Group logs by week
        const weeks: Record<string, Log[]> = {};

        logData.forEach(log => {
            const date = (log.date as any) instanceof Date ? log.date as unknown as Date : parseISO(log.date as string);
            const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
            const key = format(weekStart, "yyyy-MM-dd");

            if (!weeks[key]) weeks[key] = [];
            weeks[key].push(log);
        });

        // Convert to sorted array of WeeklySummary
        const sortedWeeks = Object.keys(weeks).sort();
        const summaryData: WeeklySummary[] = sortedWeeks.map((key, index) => {
            const weekStart = parseISO(key);
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const weekLogs = weeks[key];

            const categories: Record<LogCategory, number> = {
                "Individual Counselling": 0,
                "Group Counselling": 0,
                "Crisis Intervention": 0,
                "PFA/MHPSS": 0,
                "Psychoeducation/Community": 0,
                "Testing & Assessment": 0,
                "Management & Admin": 0,
                "Professional Development": 0,
                "Supervision": 0
            };

            weekLogs.forEach(log => {
                if (categories[log.category] !== undefined) {
                    categories[log.category] += log.hours;
                }
            });

            const total = Object.values(categories).reduce((sum, h) => sum + h, 0);

            return {
                weekStart,
                weekEnd,
                weekNumber: index + 1,
                categories,
                total
            };
        });

        setSummaries(summaryData);
    }

    const categories: LogCategory[] = [
        "Individual Counselling",
        "Group Counselling",
        "Crisis Intervention",
        "PFA/MHPSS",
        "Psychoeducation/Community",
        "Testing & Assessment",
        "Management & Admin",
        "Professional Development",
        "Supervision"
    ];

    const grandTotals = summaries.reduce((acc, week) => {
        categories.forEach(cat => {
            acc[cat] = (acc[cat] || 0) + week.categories[cat];
        });
        acc.total = (acc.total || 0) + week.total;
        return acc;
    }, { total: 0 } as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-upsi-navy"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-upsi-navy rounded-lg text-white shadow-lg shadow-upsi-navy/20">
                            <Calculator size={28} />
                        </div>
                        <span>Rumusan Mingguan <span className="text-upsi-navy font-black">(Lampiran B)</span></span>
                    </h1>
                    <p className="text-gray-500 font-medium">Weekly internship hours summary and compilation.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Printer size={20} />
                        <span>Print Report</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-upsi-navy text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-upsi-navy/20 active:scale-95">
                        <Download size={20} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Print-only header */}
            <div className="hidden print:block mb-8 border-b-2 border-gray-900 pb-6 text-center">
                <h1 className="text-2xl font-bold uppercase tracking-widest">Rumusan Mingguan Perkhidmatan Kaunseling (Lampiran B)</h1>
                <p className="text-lg font-bold mt-2 uppercase tracking-wide">Internship in Clinical Mental Health Counselling</p>
                <div className="flex justify-between mt-6 text-sm font-bold uppercase">
                    <span>Nama: {user?.displayName || "Trainee Name"}</span>
                    <span>Tahun: 2026</span>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 no-print">
                {categories.map((cat, i) => (
                    <div key={cat} className="glass-card p-6 rounded-2xl border border-white/40 shadow-xl shadow-gray-200/40 group hover:-translate-y-1 transition-all duration-300">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-upsi-navy transition-colors">{cat}</h3>
                        <p className="text-2xl font-bold text-upsi-navy mt-2">{grandTotals[cat] || 0} <span className="text-sm font-medium text-gray-500 uppercase ml-1">hrs</span></p>
                    </div>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 print:bg-white border-b border-gray-100">
                                <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 w-24 text-center">Week No.</th>
                                <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 w-64">Date Range</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 text-center">KI</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 text-center">KK</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 text-center">AI</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-upsi-navy border-r border-gray-100 text-center bg-blue-50/30">PP (Admin)</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 text-center">PE</th>
                                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-r border-gray-100 text-center">PY</th>
                                <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-upsi-navy text-center bg-gray-50/80">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaries.length === 0 ? (
                                <tr>
                                    <td colSpan={categories.length + 3} className="px-8 py-20 text-center text-gray-400 italic">
                                        No logs found to compile Lampiran B.
                                    </td>
                                </tr>
                            ) : (
                                summaries.map((week, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6 font-black text-gray-700 bg-gray-50/20 group-hover:bg-upsi-navy/5 transition-colors border-r border-gray-50 text-center">
                                            {week.weekNumber}
                                        </td>
                                        <td className="px-8 py-6 border-r border-gray-50">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{format(week.weekStart, "dd MMM")} - {format(week.weekEnd, "dd MMM yyyy")}</span>
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mt-1 italic">Week {idx + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold">{week.categories["Individual Counselling"] || "-"}</td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold">{week.categories["Group Counselling"] || "-"}</td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold">{
                                            (week.categories["Crisis Intervention"] || 0) +
                                            (week.categories["PFA/MHPSS"] || 0) +
                                            (week.categories["Psychoeducation/Community"] || 0) +
                                            (week.categories["Testing & Assessment"] || 0) || "-"
                                        }</td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold bg-blue-50/20 text-upsi-navy">{week.categories["Management & Admin"] || "-"}</td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold">{week.categories["Professional Development"] || "-"}</td>
                                        <td className="px-6 py-6 border-r border-gray-50 text-center font-bold">{week.categories["Supervision"] || "-"}</td>
                                        <td className="px-8 py-6 text-center font-black text-upsi-navy bg-gray-50/50 group-hover:bg-upsi-navy/5 transition-colors">
                                            {week.total}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-100 bg-upsi-navy font-bold">
                            <tr className="text-white">
                                <td colSpan={2} className="px-8 py-6 uppercase tracking-[0.2em] text-[11px] font-black text-right">Grand Totals:</td>
                                <td className="px-6 py-6 text-center text-lg">{grandTotals["Individual Counselling"] || 0}</td>
                                <td className="px-6 py-6 text-center text-lg">{grandTotals["Group Counselling"] || 0}</td>
                                <td className="px-6 py-6 text-center text-lg">{
                                    (grandTotals["Crisis Intervention"] || 0) +
                                    (grandTotals["PFA/MHPSS"] || 0) +
                                    (grandTotals["Psychoeducation/Community"] || 0) +
                                    (grandTotals["Testing & Assessment"] || 0)
                                }</td>
                                <td className="px-6 py-6 text-center text-lg bg-blue-900/30">{grandTotals["Management & Admin"] || 0}</td>
                                <td className="px-6 py-6 text-center text-lg">{grandTotals["Professional Development"] || 0}</td>
                                <td className="px-6 py-6 text-center text-lg">{grandTotals["Supervision"] || 0}</td>
                                <td className="px-8 py-6 text-center text-xl font-black bg-blue-900/50">{grandTotals.total || 0}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 no-print">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest pl-4 border-l-2 border-upsi-red">
                    <FileText size={16} />
                    <span>Auto-Generated Lampiran B Report</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium italic text-right max-w-sm">
                    All data compiled from validated Lampiran A logbook entries. In case of discrepancies, please verify individual log records.
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    body {
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    * {
                        -webkit-print-color-adjust: exact;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #e2e8f0 !important;
                    }
                    .glass-card {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
