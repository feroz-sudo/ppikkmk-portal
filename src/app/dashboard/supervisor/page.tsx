"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, User, Supervision, getSupervisorPendingRequests, updateSupervisionStatus } from "@/lib/firebase/db";
import { Users, FileText, ChevronRight, Calendar, Clock, MapPin, Building2, Video, Check, X, AlertCircle } from "lucide-react";

export default function SupervisorDashboard() {
    const { user, userRole } = useAuth();
    const [trainees, setTrainees] = useState<User[]>([]);
    const [requests, setRequests] = useState<Supervision[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        if (user && userRole === "supervisor") {
            setLoading(true);
            try {
                // Find users who have this supervisor assigned
                const q = query(collection(db, "users"), where("assignedSupervisorId", "==", user.uid));
                const [traineeSnapshot, supervisionRequests] = await Promise.all([
                    getDocs(q),
                    getSupervisorPendingRequests(user.uid)
                ]);

                const traineeList = traineeSnapshot.docs.map(doc => ({ ...doc.data() } as User));
                setTrainees(traineeList);
                setRequests(supervisionRequests);
            } catch (error) {
                console.error("Failed to fetch supervisor data", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, userRole]);

    const handleStatusUpdate = async (requestId: string, status: Supervision['status']) => {
        setActionLoading(requestId);
        try {
            await updateSupervisionStatus(requestId, status);
            await fetchData();
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (userRole !== "supervisor") {
        return (
            <div className="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-100">
                Access Denied. You do not have supervisor privileges.
            </div>
        );
    }

    const pendingRequests = requests.filter((r: Supervision) => r.status === 'pending');
    const confirmedRequests = requests.filter((r: Supervision) => r.status === 'confirmed');

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="bg-upsi-navy text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden glass-dark">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Users size={150} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter flex items-center space-x-3 mb-2">
                        <Users className="text-upsi-gold" size={40} />
                        <span>Supervisor Portal</span>
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">Manage clinical milestones and review trainee progress.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Requests Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Pending Requests</h2>
                        <span className="bg-upsi-gold text-upsi-navy px-2 py-0.5 rounded-md text-[10px] font-black">{pendingRequests.length}</span>
                    </div>

                    <div className="space-y-4">
                        {pendingRequests.length === 0 ? (
                            <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending requests</p>
                            </div>
                        ) : (
                            pendingRequests.map((req: Supervision) => (
                                <div key={req.id} className="bg-white p-6 rounded-[2rem] shadow-premium border border-slate-100 hover:border-upsi-gold/30 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            {req.type === 'Campus' ? <Building2 size={18} /> : req.type === 'Site' ? <MapPin size={18} /> : <Video size={18} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-upsi-gold tracking-widest">{req.type}</span>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="font-bold text-slate-800">{trainees.find((t: User) => t.uid === req.traineeId)?.name || "Trainee"}</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                                            <span className="flex items-center"><Calendar size={12} className="mr-1" /> {req.date instanceof Date ? req.date.toDateString() : (req.date as any).toDate().toDateString()}</span>
                                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {req.proposedTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleStatusUpdate(req.id!, 'confirmed')}
                                            disabled={!!actionLoading}
                                            className="flex-1 py-2.5 bg-upsi-navy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center"
                                        >
                                            <Check size={14} className="mr-1" /> Confirm
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id!, 'cancelled')}
                                            disabled={!!actionLoading}
                                            className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2 pt-4">Confirmed Schedule</h2>
                    <div className="space-y-4">
                        {confirmedRequests.map((req: Supervision) => (
                            <div key={req.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800">{trainees.find((t: User) => t.uid === req.traineeId)?.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                                            {req.type} • {req.proposedTime}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStatusUpdate(req.id!, 'completed')}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-black text-upsi-navy rounded-lg hover:bg-upsi-navy hover:text-white transition-all shadow-sm"
                                >
                                    COMPLETE
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trainees List Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Assigned Trainees</h2>
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-upsi-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating Trainee Data...</p>
                            </div>
                        ) : trainees.length === 0 ? (
                            <div className="p-20 text-center text-slate-400">No trainees assigned.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {trainees.map((trainee: User) => (
                                    <div key={trainee.uid} className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center space-x-6">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg group-hover:rotate-3 transition-transform">
                                                    {trainee.name.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-xl tracking-tight">{trainee.name}</h3>
                                                <div className="flex items-center mt-1 space-x-3">
                                                    <span className="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">{trainee.matricNumber}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{trainee.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button className="flex items-center space-x-2 bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl hover:border-upsi-navy hover:text-upsi-navy transition-all text-sm font-black uppercase tracking-widest shadow-sm">
                                                <FileText size={18} />
                                                <span>Review Docs</span>
                                            </button>
                                            <button className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-2xl hover:bg-upsi-navy transition-all shadow-xl shadow-slate-200 active:scale-90">
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
