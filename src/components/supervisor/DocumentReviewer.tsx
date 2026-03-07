"use client";

import React, { useState } from "react";
import { Session, Client, User, updateSession, syncSessionWithLog } from "@/lib/firebase/db";
import { FileText, CheckCircle2, AlertCircle, MessageSquare, X, ExternalLink, Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface DocumentReviewerProps {
    sessions: (Session & { id: string })[];
    clients: Client[];
    trainees: User[];
    onUpdate: () => void;
    title?: string;
    showAll?: boolean;
}

export const DocumentReviewer: React.FC<DocumentReviewerProps> = ({ sessions, clients, trainees, onUpdate, title, showAll }) => {
    const [selectedSession, setSelectedSession] = useState<(Session & { id: string }) | null>(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: Session['status']) => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            await updateSession(selectedSession.id, {
                status,
                supervisorFeedback: feedback,
                verificationDate: new Date(),
            });

            if (status === 'verified') {
                await syncSessionWithLog({ ...selectedSession, status: 'verified', supervisorFeedback: feedback });
            }

            setSelectedSession(null);
            setFeedback("");
            onUpdate();
        } catch (error) {
            console.error("Failed to update session:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSession = (session: Session & { id: string }) => {
        setSelectedSession(session);
        setFeedback(session.supervisorFeedback || "");
    };

    const getTraineeName = (traineeId: string) => trainees.find(t => t.uid === traineeId)?.name || "Unknown Trainee";
    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.demographics.name || "Unknown Client";

    const filteredSessions = showAll ? sessions : sessions.filter(s => s.status !== 'verified');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{title || "Review Queue"}</h2>
                <span className="bg-upsi-gold text-upsi-navy px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                    {filteredSessions.length} DOCUMENTS
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredSessions.length === 0 ? (
                    <div className="p-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
                        <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No documents found in this category</p>
                    </div>
                ) : (
                    filteredSessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => handleSelectSession(session)}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-upsi-navy/30 transition-all cursor-pointer group shadow-premium"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-upsi-navy flex items-center justify-center group-hover:bg-upsi-navy group-hover:text-white transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 tracking-tight">{session.formType} - Session {session.sessionId}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {getTraineeName(session.traineeId)} • {getClientName(session.clientId)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${session.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                        session.status === 'revision_requested' ? 'bg-orange-50 text-orange-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {session.status || 'pending'}
                                    </span>
                                    <div className="flex items-center text-[10px] text-slate-400 font-bold">
                                        <Clock size={12} className="mr-1" />
                                        {session.date instanceof Date ? session.date.toDateString() : (session.date as any).toDate().toDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-50 rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-white">
                        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-upsi-navy tracking-tight">Clinical Monitoring</h3>
                                <p className="text-xs text-upsi-gold font-bold uppercase tracking-widest mt-1">
                                    {selectedSession.formType} | {getClientName(selectedSession.clientId)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Artifact</h5>
                                        <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Read Only</div>
                                    </div>
                                    <div className="space-y-4 font-serif text-slate-700 leading-relaxed max-h-[500px] overflow-y-auto pr-4">
                                        {Object.entries(selectedSession.formData || {}).map(([key, value]) => (
                                            <div key={key} className="border-b border-slate-50 pb-4">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <div className="text-sm bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                                                    {typeof value === 'object' ? (
                                                        <div className="space-y-2">
                                                            {Object.entries(value || {}).map(([subKey, subVal]) => (
                                                                <div key={subKey}>
                                                                    <span className="text-[8px] font-bold text-slate-300 uppercase">{subKey}</span>
                                                                    <p className="text-xs">{String(subVal)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : String(value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Feedback</h5>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Add clinical feedback or revision notes..."
                                        className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                                    />
                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={() => handleAction('verified')}
                                            disabled={loading}
                                            className="w-full py-4 bg-upsi-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-lg shadow-upsi-navy/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={16} className="mr-2 text-upsi-gold" /> Save & Approve
                                        </button>
                                        {selectedSession.status !== 'verified' && (
                                            <button
                                                onClick={() => handleAction('revision_requested')}
                                                disabled={loading}
                                                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <AlertCircle size={16} className="mr-2" /> Request Revision
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
