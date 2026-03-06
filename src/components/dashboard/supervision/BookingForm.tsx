"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Building2, Video, MessageSquare, Link as LinkIcon, AlertCircle } from "lucide-react";
import { addSupervisionRequest, getTraineeClients, Client, User } from "@/lib/firebase/db";
import { Timestamp } from "firebase/firestore";

interface BookingFormProps {
    trainee: User;
    onClose: () => void;
    onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ trainee, onClose, onSuccess }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState({
        type: 'Campus' as 'Campus' | 'Site' | 'Online',
        date: "",
        proposedTime: "",
        traineeNotes: "",
        linkedClientId: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClients = async () => {
            const traineeClients = await getTraineeClients(trainee.uid);
            setClients(traineeClients);
        };
        fetchClients();
    }, [trainee.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.proposedTime) {
            setError("Please select both date and time.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await addSupervisionRequest({
                traineeId: trainee.uid,
                supervisorId: trainee.assignedSupervisorId || "pending",
                type: formData.type,
                status: 'pending',
                date: new Date(formData.date),
                proposedTime: formData.proposedTime,
                traineeNotes: formData.traineeNotes,
                linkedClientId: formData.linkedClientId || undefined
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to book supervision.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-upsi-navy tracking-tight">Book Supervision</h3>
                        <p className="text-xs text-upsi-gold font-bold uppercase tracking-widest mt-1">Request a Session</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                            <AlertCircle size={18} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    {/* Type Selector */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'Campus', icon: Building2, label: 'Campus' },
                            { id: 'Site', icon: MapPin, label: 'Site' },
                            { id: 'Online', icon: Video, label: 'Online' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: t.id as any })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${formData.type === t.id
                                        ? "bg-upsi-navy border-upsi-navy text-white shadow-lg shadow-upsi-navy/20"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-upsi-gold/30 hover:bg-slate-50"
                                    }`}
                            >
                                <t.icon size={20} className="mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Supervision Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Proposed Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="time"
                                    value={formData.proposedTime}
                                    onChange={(e) => setFormData({ ...formData, proposedTime: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Linked Client File (Optional)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={formData.linkedClientId}
                                onChange={(e) => setFormData({ ...formData, linkedClientId: e.target.value })}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                            >
                                <option value="">No linked file</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.demographics.name} ({c.clientId})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notes for Supervisor</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                            <textarea
                                value={formData.traineeNotes}
                                onChange={(e) => setFormData({ ...formData, traineeNotes: e.target.value })}
                                placeholder="E.g., I would like to discuss the case conceptualization for this client..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-upsi-gold/20 focus:border-upsi-gold transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-3xl bg-upsi-navy text-white font-black uppercase tracking-widest shadow-xl shadow-upsi-navy/20 hover:scale-[1.02] active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? "Booking..." : "Submit Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};
