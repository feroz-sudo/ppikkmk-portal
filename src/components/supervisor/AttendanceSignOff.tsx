"use client";

import React, { useState } from "react";
import { AttendanceSignOff as AttendanceType, signOffAttendance } from "@/lib/firebase/db";
import { CheckCircle2, Clock, Calendar, ShieldCheck, AlertCircle, X, ChevronRight } from "lucide-react";

interface AttendanceSignOffProps {
    attendanceLogs: AttendanceType[];
    traineeName: string;
    supervisorId: string;
    onUpdate: () => void;
}

export const AttendanceSignOff: React.FC<AttendanceSignOffProps> = ({ attendanceLogs, traineeName, supervisorId, onUpdate }) => {
    const [selectedWeek, setSelectedWeek] = useState<AttendanceType | null>(null);
    const [loading, setLoading] = useState(false);
    const [signatureType, setSignatureType] = useState("");

    const handleSignOff = async () => {
        if (!selectedWeek || !selectedWeek.id) return;
        setLoading(true);
        try {
            await signOffAttendance(selectedWeek.id, supervisorId, `Digital Signature: ${traineeName} (Verified by ${supervisorId})`);
            setSelectedWeek(null);
            onUpdate();
        } catch (error) {
            console.error("Failed to sign off attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const pendingLogs = attendanceLogs.filter(a => a.status === 'pending');
    const signedLogs = attendanceLogs.filter(a => a.status === 'signed');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Attendance Sign-Off</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{traineeName}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {pendingLogs.length === 0 ? (
                    <div className="p-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
                        <ShieldCheck className="mx-auto text-emerald-100 mb-4" size={48} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All attendance logs verified</p>
                    </div>
                ) : (
                    pendingLogs.map(log => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedWeek(log)}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-upsi-navy-30 transition-all cursor-pointer group shadow-premium flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-upsi-navy group-hover:text-white transition-colors">
                                    <Clock size={28} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 tracking-tight">Week of {log.weekStartDate}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Total Logged: <span className="text-upsi-navy font-black">{log.totalHours} HRS</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="text-xs font-black text-orange-500 uppercase italic">Pending Audit</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-upsi-navy group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Signed Section (Summary) */}
            {signedLogs.length > 0 && (
                <div className="mt-12 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Verified Weeks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {signedLogs.map(log => (
                            <div key={log.id} className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">WEEK {log.weekStartDate}</p>
                                    <p className="text-lg font-black text-slate-800 leading-none mt-1">{log.totalHours} <span className="text-xs">HRS</span></p>
                                </div>
                                <CheckCircle2 className="text-emerald-500" size={24} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sign-Off Modal */}
            {selectedWeek && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col border border-white">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-center">
                            <div className="flex-1">
                                <ShieldCheck className="mx-auto text-upsi-navy mb-4" size={48} />
                                <h3 className="text-2xl font-black text-upsi-navy tracking-tight">Weekly Audit Sign-Off</h3>
                                <p className="text-xs text-upsi-gold font-bold uppercase tracking-widest mt-1">Verification for {selectedWeek.weekStartDate}</p>
                            </div>
                            <button onClick={() => setSelectedWeek(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="bg-blue-50 p-6 rounded-2xl flex items-start space-x-4">
                                <AlertCircle className="text-upsi-navy shrink-0 mt-1" size={24} />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-upsi-navy">Confirm Attendance Verification</p>
                                    <p className="text-xs text-upsi-navy/70 leading-relaxed">
                                        I hereby verify that <span className="font-bold underline">{traineeName}</span> has completed the reported <span className="font-bold">{selectedWeek.totalHours} hours</span> of clinical/professional work at their assigned setting for the week of {selectedWeek.weekStartDate}.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center relative group">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 group-hover:text-upsi-navy transition-colors">Digital Signature Area</p>
                                    <div className="font-mono text-xl text-slate-800 opacity-50 select-none italic tracking-tighter">
                                        [ SIGNED DIGITALLY BY SUPERVISOR ]
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white px-6 py-2 rounded-full shadow-lg border border-slate-100 text-upsi-navy font-black text-[10px] uppercase tracking-widest">Click to Confirm</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOff}
                                    disabled={loading}
                                    className="w-full py-5 bg-upsi-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-upsi-navy/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <ShieldCheck size={18} className="mr-2" /> VERIFY & SIGN LOGBOOK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
