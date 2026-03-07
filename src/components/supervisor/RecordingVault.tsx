"use client";

import React, { useState } from "react";
import { ClinicalRecording, updateRecordingFeedback } from "@/lib/firebase/db";
import { Video, Mic, CheckCircle2, MessageSquare, Play, Info, AlertCircle, X } from "lucide-react";

interface RecordingVaultProps {
    recordings: ClinicalRecording[];
    onUpdate: () => void;
}

export const RecordingVault: React.FC<RecordingVaultProps> = ({ recordings, onUpdate }) => {
    const [selectedRecording, setSelectedRecording] = useState<ClinicalRecording | null>(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    const kiRecordings = recordings.filter(r => r.type === 'KI');
    const kkRecordings = recordings.filter(r => r.type === 'KK');

    const handleFeedbackSubmit = async () => {
        if (!selectedRecording || !selectedRecording.id) return;
        setLoading(true);
        try {
            await updateRecordingFeedback(selectedRecording.id, feedback);
            setSelectedRecording(null);
            setFeedback("");
            onUpdate();
        } catch (error) {
            console.error("Failed to update recording feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    const RecordingCard = ({ recording }: { recording: ClinicalRecording }) => (
        <div
            onClick={() => {
                setSelectedRecording(recording);
                setFeedback(recording.feedback || "");
            }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-upsi-gold/30 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-upsi-gold/10 group-hover:text-upsi-gold transition-colors">
                    {recording.type === 'KI' ? <Mic size={24} /> : <Video size={24} />}
                </div>
                <div>
                    <h5 className="font-bold text-slate-800 text-sm">Session {recording.sessionId}</h5>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Client ID: {recording.clientId}</p>
                </div>
                {recording.status === 'reviewed' && (
                    <div className="ml-auto text-emerald-500">
                        <CheckCircle2 size={16} />
                    </div>
                )}
            </div>
            {/* Play Indicator overlay */}
            <div className="absolute inset-0 bg-upsi-navy/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white p-2 rounded-full shadow-lg text-upsi-navy">
                    <Play size={16} fill="currentColor" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3 px-2">
                <Video className="text-upsi-navy" size={24} />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Recording Vault</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Individual Recordings (KI) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">KI Recordings (3 Required)</h3>
                        <span className="text-[10px] font-bold text-upsi-navy bg-blue-50 px-2 py-0.5 rounded-full">
                            {kiRecordings.filter(r => r.status === 'reviewed').length}/3 Reviewed
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {kiRecordings.length === 0 ? (
                            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <Info size={20} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No KI recordings uploaded</p>
                            </div>
                        ) : kiRecordings.map(r => <RecordingCard key={r.id} recording={r} />)}
                    </div>
                </div>

                {/* Group Recordings (KK) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">KK Recordings (3 Required)</h3>
                        <span className="text-[10px] font-bold text-upsi-navy bg-blue-50 px-2 py-0.5 rounded-full">
                            {kkRecordings.filter(r => r.status === 'reviewed').length}/3 Reviewed
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {kkRecordings.length === 0 ? (
                            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <Info size={20} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No KK recordings uploaded</p>
                            </div>
                        ) : kkRecordings.map(r => <RecordingCard key={r.id} recording={r} />)}
                    </div>
                </div>
            </div>

            {/* Evaluation Modal */}
            {selectedRecording && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-upsi-navy text-white rounded-2xl">
                                    {selectedRecording.type === 'KI' ? <Mic size={24} /> : <Video size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-upsi-navy tracking-tight">Evaluate Recording</h3>
                                    <p className="text-[10px] text-upsi-gold font-black uppercase tracking-widest mt-1">
                                        Type: {selectedRecording.type} | Session: {selectedRecording.sessionId}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRecording(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-900 aspect-video rounded-3xl flex flex-col items-center justify-center text-slate-500 overflow-hidden relative group">
                                <Play size={48} className="mb-4 text-white group-hover:scale-110 transition-transform cursor-pointer" />
                                <span className="text-xs font-bold uppercase tracking-widest">Stream Recording</span>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[10px] text-white/60 truncate font-mono">{selectedRecording.storagePath}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3">
                                    <Info className="text-upsi-navy shrink-0" size={18} />
                                    <p className="text-[11px] text-upsi-navy/80 leading-relaxed font-medium">
                                        Please provide structured clinical feedback for this session. Your comments will be visible to the trainee in their session log.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Supervisor Clinical Feedback</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Enter clinical observations, strengths, and areas for improvement..."
                                        className="w-full h-48 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleFeedbackSubmit}
                                    disabled={loading}
                                    className="w-full py-4 bg-upsi-navy text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-upsi-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <MessageSquare size={16} className="mr-2" /> Save Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
