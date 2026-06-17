"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeSessions, getTraineeClients, Session, Client, deleteSession } from "@/lib/firebase/db";
import Link from "next/link";
import {
    History, Search, Filter, Trash2, Edit, Eye, ClipboardList, FileText, Lightbulb, Target,
    Flag, AlertTriangle, MessageSquare, BrainCircuit, AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function SessionHistoryPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientFilter, setSelectedClientFilter] = useState("all");
    const [selectedFormFilter, setSelectedFormFilter] = useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

    // Modal state for deletion confirmation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

    const availableForms = [
        { id: "Form1", name: "Form 1: Intake Report", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-300" },
        { id: "Form2", name: "Form 2: Progressive Notes", icon: FileText, color: "text-green-500", bg: "bg-green-50", border: "border-green-300" },
        { id: "Form3", name: "Form 3: Case Conceptualization", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-300" },
        { id: "Form4", name: "Form 4: Treatment Planning", icon: Target, color: "text-red-500", bg: "bg-red-50", border: "border-red-300" },
        { id: "Form5", name: "Form 5: Termination Session", icon: Flag, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-300" },
        { id: "Form6", name: "Form 6: Crisis Intervention", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-300" },
        { id: "Form7", name: "Form 7: Consultation Report", icon: MessageSquare, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-300" },
        { id: "Form8", name: "Form 8: PFA / MHPSS", icon: FileText, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-300" },
        { id: "Form11", name: "Form 11: Group Counselling", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-300" },
        { id: "Form13", name: "Form 13: Psych Assessment", icon: BrainCircuit, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-300" },
    ];

    async function fetchData() {
        if (!user) return;
        try {
            const [allSessions, allClients] = await Promise.all([
                getTraineeSessions(user.uid),
                getTraineeClients(user.uid)
            ]);
            // Sort sessions by date descending
            allSessions.sort((a, b) => {
                const dateA = a.createdAt instanceof Object && 'seconds' in a.createdAt 
                    ? (a.createdAt as any).seconds * 1000 
                    : new Date(a.createdAt as any).getTime();
                const dateB = b.createdAt instanceof Object && 'seconds' in b.createdAt 
                    ? (b.createdAt as any).seconds * 1000 
                    : new Date(b.createdAt as any).getTime();
                return dateB - dateA;
            });
            setSessions(allSessions);
            setClients(allClients);
        } catch (error) {
            console.error("Failed to fetch sessions and clients:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [user]);

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.demographics.name : "Unknown Client";
    };

    const getClientCode = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? `${client.type}${client.clientId}` : "KI000";
    };

    const getFormIcon = (formType: string) => {
        const matched = availableForms.find(f => f.id === formType);
        return matched ? matched.icon : FileText;
    };

    const getFormColor = (formType: string) => {
        const matched = availableForms.find(f => f.id === formType);
        return matched ? `${matched.color} ${matched.bg} ${matched.border}` : "text-gray-500 bg-gray-50 border-gray-300";
    };

    const handleDeleteClick = (session: Session) => {
        setSessionToDelete(session);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!sessionToDelete || !sessionToDelete.id) return;
        try {
            await deleteSession(sessionToDelete.id);
            setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Failed to delete session. Please try again.");
        } finally {
            setIsModalOpen(false);
            setSessionToDelete(null);
        }
    };

    const cancelDelete = () => {
        setIsModalOpen(false);
        setSessionToDelete(null);
    };

    // Filter and search logic
    const filteredSessions = sessions.filter(session => {
        const clientName = getClientName(session.clientId).toLowerCase();
        const clientCode = getClientCode(session.clientId).toLowerCase();
        const sessionNum = String(session.sessionId).toLowerCase();
        const formName = (session.formType || "").toLowerCase();
        const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || 
                              clientCode.includes(searchTerm.toLowerCase()) || 
                              sessionNum.includes(searchTerm.toLowerCase()) || 
                              formName.includes(searchTerm.toLowerCase());

        const matchesClient = selectedClientFilter === "all" || session.clientId === selectedClientFilter;
        const matchesForm = selectedFormFilter === "all" || session.formType === selectedFormFilter;
        const matchesStatus = selectedStatusFilter === "all" || 
            (selectedStatusFilter === "pending" && (!session.status || session.status === "pending")) || 
            session.status === selectedStatusFilter;

        return matchesSearch && matchesClient && matchesForm && matchesStatus;
    });

    // Stats calculations
    const totalSessionsCount = sessions.length;
    const pendingCount = sessions.filter(s => !s.status || s.status === 'pending').length;
    const verifiedCount = sessions.filter(s => s.status === 'verified').length;
    const revisionCount = sessions.filter(s => s.status === 'revision_requested').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Session Reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header Banner */}
            <div className="bg-upsi-navy rounded-3xl shadow-xl border-t-4 border-upsi-gold p-8 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <History size={150} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black flex items-center space-x-3 mb-2 tracking-tight">
                        <History className="text-upsi-gold animate-pulse" size={32} />
                        <span>Centralized Session History</span>
                    </h1>
                    <p className="text-blue-100 max-w-2xl text-sm leading-relaxed">
                        Manage all clinical session reports created across your individual (KI) and group (KK) clients. Review feedback, make revisions, and view/download auto-generated PDFs.
                    </p>
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass shadow-premium rounded-2xl p-6 hover-lift border-b-4 border-blue-500/50 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-600 block mb-1">Total Reports</span>
                        <div className="text-4xl font-black text-slate-800">{totalSessionsCount}</div>
                    </div>
                </div>

                <div className="glass shadow-premium rounded-2xl p-6 hover-lift border-b-4 border-amber-500/50 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-600 block mb-1">Pending Review</span>
                        <div className="text-4xl font-black text-slate-800 flex items-center justify-between">
                            <span>{pendingCount}</span>
                            {pendingCount > 0 && <Clock className="text-amber-500 animate-spin" size={24} />}
                        </div>
                    </div>
                </div>

                <div className="glass shadow-premium rounded-2xl p-6 hover-lift border-b-4 border-emerald-500/50 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-600 block mb-1">Verified Reports</span>
                        <div className="text-4xl font-black text-slate-800 flex items-center justify-between">
                            <span>{verifiedCount}</span>
                            {verifiedCount > 0 && <CheckCircle2 className="text-emerald-500" size={24} />}
                        </div>
                    </div>
                </div>

                <div className="glass shadow-premium rounded-2xl p-6 hover-lift border-b-4 border-rose-500/50 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-rose-600 block mb-1">Needs Revision</span>
                        <div className="text-4xl font-black text-slate-800 flex items-center justify-between">
                            <span>{revisionCount}</span>
                            {revisionCount > 0 && <AlertCircle className="text-rose-500 animate-bounce" size={24} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="glass p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by client name, code, form name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-upsi-navy outline-none text-slate-700 bg-white placeholder-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2 border border-slate-200 rounded-xl bg-white px-3 py-2 text-sm w-full md:w-auto">
                        <Filter size={16} className="text-slate-400 shrink-0" />
                        <select
                            className="outline-none bg-transparent text-slate-600 w-full"
                            value={selectedClientFilter}
                            onChange={(e) => setSelectedClientFilter(e.target.value)}
                        >
                            <option value="all">All Clients</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.demographics.name} ({c.type}{c.clientId})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 border border-slate-200 rounded-xl bg-white px-3 py-2 text-sm w-full md:w-auto">
                        <select
                            className="outline-none bg-transparent text-slate-600 w-full"
                            value={selectedFormFilter}
                            onChange={(e) => setSelectedFormFilter(e.target.value)}
                        >
                            <option value="all">All Form Types</option>
                            {availableForms.map(f => (
                                <option key={f.id} value={f.id}>{f.id} ({f.name.split(': ')[1] || f.name})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 border border-slate-200 rounded-xl bg-white px-3 py-2 text-sm w-full md:w-auto">
                        <select
                            className="outline-none bg-transparent text-slate-600 w-full"
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="revision_requested">Revision Requested</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Session Reports List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredSessions.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <History size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No Reports Found</h3>
                        <p className="mt-2 text-sm text-gray-400 max-w-md">No reports match your filters or you have not logged any sessions yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Client & Session</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Form Type</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Supervisor Feedback</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Date Logged</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSessions.map((session) => {
                                    const formColorClasses = getFormColor(session.formType);
                                    const IconComponent = getFormIcon(session.formType);
                                    const formattedDate = new Date(
                                        session.createdAt instanceof Object && 'seconds' in session.createdAt
                                            ? (session.createdAt as { seconds: number }).seconds * 1000
                                            : session.createdAt as Date
                                    ).toLocaleDateString();

                                    const isRevision = session.status === "revision_requested";
                                    const isVerified = session.status === "verified";

                                    return (
                                        <tr key={session.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900">{getClientName(session.clientId)}</div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-[10px] font-mono text-upsi-navy font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">
                                                        {getClientCode(session.clientId)}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs font-bold text-upsi-navy bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                                                        Session {session.sessionId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1.5 rounded border ${formColorClasses.split(' ').slice(1).join(' ')}`}>
                                                        <IconComponent size={14} className={formColorClasses.split(' ')[0]} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{session.formType}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider inline-block ${
                                                    isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                    isRevision ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' :
                                                    'bg-amber-50 text-amber-600 border border-amber-200'
                                                }`}>
                                                    {session.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 max-w-xs">
                                                {session.supervisorFeedback ? (
                                                    <p className="text-xs text-slate-600 line-clamp-2 italic" title={session.supervisorFeedback}>
                                                        &ldquo;{session.supervisorFeedback}&rdquo;
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-slate-300 italic">No feedback yet</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-500">
                                                {formattedDate}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/dashboard/forms/${session.formType.toLowerCase()}?clientId=${session.clientId}&sessionId=${encodeURIComponent(session.sessionId)}&docId=${session.id}`}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-upsi-navy transition-all"
                                                        title="Edit Session Data"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            const { generateSessionPDF } = await import("@/lib/pdf/generatePDF");
                                                            const client = clients.find(c => c.id === session.clientId);
                                                            if (client) {
                                                                const pdfBlob = await generateSessionPDF(session, client);
                                                                const url = URL.createObjectURL(pdfBlob);
                                                                window.open(url);
                                                            } else {
                                                                alert("Client data not found to generate PDF.");
                                                            }
                                                        }}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-upsi-navy transition-all"
                                                        title="View PDF"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(session)}
                                                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                                        title="Delete Session"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Delete Session Report"
                message={`Are you sure to delete Session ${sessionToDelete?.sessionId} (${sessionToDelete?.formType})? This action will permanently remove this report from the portal and delete any linked logbook entries.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
