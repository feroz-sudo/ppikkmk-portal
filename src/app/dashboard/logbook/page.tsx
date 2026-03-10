"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeLogs, Log, deleteLogEntry } from "@/lib/firebase/db";
import {
    ClipboardList,
    FileDown,
    Trash2,
    CheckCircle2,
    Clock,
    Filter,
    ArrowUpDown,
    CheckSquare,
    MoreVertical,
    Plus,
    Edit2
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { LogbookForm } from "@/components/dashboard/LogbookForm";

// Helper to group logs by week
const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
        label: `${monday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`
    };
};

export default function LogbookPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState<string>("All");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Log | undefined>(undefined);

    const fetchLogs = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const fetchedLogs = await getTraineeLogs(user.uid);
                setLogs(fetchedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this log entry?")) {
            await deleteLogEntry(id);
            fetchLogs();
        }
    };

    // Grouping Logic
    const weeks = Array.from(new Set(logs.map(log => getWeekRange(log.date).label))).sort((a, b) => b.localeCompare(a));
    const filteredLogs = selectedWeek === "All" ? logs : logs.filter(log => getWeekRange(log.date).label === selectedWeek);

    const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <ClipboardList className="mr-3 text-upsi-navy" size={32} />
                        Logbook / Lampiran A
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Official Clinical Attendance Record</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setSelectedLog(undefined);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-upsi-navy text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-upsi-navy/20 hover-lift"
                    >
                        <Plus size={18} />
                        <span>Add New Entry</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover-lift"
                    >
                        <FileDown size={18} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Filter & Summary Bar */}
            <div className="glass p-6 rounded-[2rem] shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Week</span>
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-upsi-navy cursor-pointer ml-2"
                        >
                            <option value="All">Full Semester</option>
                            {weeks.map(week => <option key={week} value={week}>{week}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Entries</div>
                        <div className="text-2xl font-black text-slate-800 leading-none">{filteredLogs.length}</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Hours</div>
                        <div className="text-3xl font-black text-upsi-navy leading-none">
                            {totalHours} <span className="text-sm">HRS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="glass rounded-[2rem] shadow-premium overflow-hidden border border-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Description</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Hours</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-upsi-gold border-t-transparent rounded-full animate-spin" />
                                        <p className="mt-4 text-slate-500 font-medium">Loading clinical logs...</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No entries found for this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-800">{new Date(log.date).toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(log.date).toLocaleDateString('en-MY', { weekday: 'short' })}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider
                                                ${log.category === 'Individual Counselling' ? 'bg-emerald-100 text-emerald-700' :
                                                    log.category === 'Group Counselling' ? 'bg-cyan-100 text-cyan-700' :
                                                        'bg-slate-100 text-slate-600'}`}>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 whitespace-pre-wrap min-w-[300px]">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-8 bg-blue-50 text-upsi-navy font-black rounded-lg border border-blue-100 group-hover:bg-upsi-navy group-hover:text-white transition-colors">
                                                {log.hours}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {log.status === 'verified' ? (
                                                <div className="flex items-center justify-center text-emerald-500" title="Verified by Supervisor">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center text-slate-300" title="Pending Verification">
                                                    <Clock size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-upsi-navy hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Entry"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(log.id!)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Disclaimer variant="full" className="mt-8" />

            {/* Logbook Form Modal */}
            {isFormOpen && (
                <LogbookForm
                    onLogAdded={fetchLogs}
                    initialData={selectedLog}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {/* Print Styles for Lampiran A */}
            <style jsx global>{`
                @media print {
                    .glass {
                        box-shadow: none !important;
                        background: white !important;
                        border: 1px solid #eee !important;
                    }
                    button, .no-print {
                        display: none !important;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #ddd !important;
                        padding: 12px 8px !important;
                    }
                    th {
                        background-color: #f8f8f8 !important;
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    );
}
