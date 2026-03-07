"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, User, Supervision, updateSupervisionStatus, onSnapshot } from "@/lib/firebase/db";
import {
    Users,
    FileText,
    ChevronRight,
    Calendar,
    Clock,
    MapPin,
    Building2,
    Video,
    Check,
    X,
    AlertCircle,
    Inbox,
    Award,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function SupervisorDashboard() {
    const { user, userRole } = useAuth();
    const [trainees, setTrainees] = useState<User[]>([]);
    const [requests, setRequests] = useState<Supervision[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!user || userRole !== "supervisor") return;

        setLoading(true);

        // 1. Real-time Assigned Trainees
        const traineesQuery = query(
            collection(db, "users"),
            where("assignedSupervisorId", "==", user.uid)
        );

        const unsubscribeTrainees = onSnapshot(traineesQuery, (snapshot) => {
            const traineeList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
            setTrainees(traineeList);
            setLoading(false);
        }, (error) => {
            console.error("Trainees listener error:", error);
            setLoading(false);
        });

        // 2. Real-time Supervision Requests
        const requestsQuery = query(
            collection(db, "supervisions"),
            where("supervisorId", "==", user.uid)
        );

        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
            const requestsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supervision));
            setRequests(requestsList);
        }, (error) => {
            console.error("Requests listener error:", error);
        });

        return () => {
            unsubscribeTrainees();
            unsubscribeRequests();
        };
    }, [user, userRole]);

    const handleStatusUpdate = async (requestId: string, status: Supervision['status']) => {
        setActionLoading(requestId);
        try {
            await updateSupervisionStatus(requestId, status);
            // No need to manually fetchData(), the onSnapshot listener handles it!
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (userRole !== "supervisor") {
        return (
            <div className="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-100">
                Access Denied. Supervisor privileges required.
            </div>
        );
    }

    const pendingRequests = requests.filter((r: Supervision) => r.status === 'pending');

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 font-[Arial,sans-serif]">
            {/* Professional Header */}
            <div className="bg-upsi-navy text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden glass-dark">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Inbox size={200} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter flex items-center space-x-4 mb-4">
                        <Inbox className="text-upsi-gold" size={48} />
                        <span>Supervision Hub</span>
                    </h1>
                    <p className="text-blue-100/80 text-xl font-medium max-w-2xl leading-relaxed">
                        Clinical management center for supervising academic practicum and internship placements.
                        Review pending requests and manage assigned trainee portfolios.
                    </p>
                </div>
                <Award className="absolute -bottom-10 -left-10 text-white/5 rotate-12" size={250} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Pending Actions Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Supervision Requests</h2>
                        <span className="bg-upsi-gold text-upsi-navy px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-upsi-gold/20">
                            {pendingRequests.length} PENDING
                        </span>
                    </div>

                    <div className="space-y-6">
                        {pendingRequests.length === 0 ? (
                            <div className="p-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center">
                                <CheckCircle2 className="text-slate-200 mb-4" size={40} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                    Queue Clean.<br />All sessions confirmed.
                                </p>
                            </div>
                        ) : (
                            pendingRequests.map((req: Supervision) => (
                                <div key={req.id} className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 hover:border-upsi-gold/30 transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-3 bg-blue-50 text-upsi-navy rounded-2xl group-hover:scale-110 transition-transform">
                                            {req.type === 'Campus' ? <Building2 size={24} /> : req.type === 'Site' ? <MapPin size={24} /> : <Video size={24} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-upsi-gold tracking-widest">{req.type} Visit</span>
                                    </div>
                                    <div className="mb-8">
                                        <h4 className="font-black text-slate-800 text-lg tracking-tight mb-2">
                                            {trainees.find((t: User) => t.uid === req.traineeId)?.name || "Trainee"}
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <Calendar size={14} className="mr-2 text-upsi-gold" />
                                                {req.date instanceof Date ? req.date.toDateString() : (req.date as any).toDate().toDateString()}
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <Clock size={14} className="mr-2 text-upsi-gold" />
                                                {req.proposedTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleStatusUpdate(req.id!, 'confirmed')}
                                            disabled={!!actionLoading}
                                            className="flex-1 py-4 bg-upsi-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-upsi-navy/30 transition-all flex items-center justify-center active:scale-95"
                                        >
                                            {actionLoading === req.id ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            ) : (
                                                <Check size={14} className="mr-2" />
                                            )}
                                            CONFIRM
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id!, 'cancelled')}
                                            disabled={!!actionLoading}
                                            className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Portfolio Status Summary Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Assigned Portfolio Status</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="col-span-2 p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-upsi-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Auditing Portfolios...</p>
                            </div>
                        ) : trainees.length === 0 ? (
                            <div className="col-span-2 p-12 bg-white rounded-[2.5rem] border border-slate-100 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                No assigned portfolios linked to your ID
                            </div>
                        ) : (
                            trainees.map((trainee: User) => (
                                <Link
                                    key={trainee.uid}
                                    href={`/dashboard/supervisor/portfolio/${trainee.uid}`}
                                    className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 hover:border-upsi-navy/20 transition-all group flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between mb-10">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-upsi-navy to-blue-800 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
                                                {trainee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-upsi-navy transition-colors truncate max-w-[150px]">
                                                    {trainee.name}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{trainee.matricNumber}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trainee.clinicalStatus === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {trainee.clinicalStatus || 'Active'}
                                        </span>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <FileText size={14} className="text-upsi-gold" />
                                            <span>Portfolio Audit</span>
                                        </div>
                                        <div className="flex items-center text-upsi-navy group-hover:translate-x-2 transition-transform">
                                            <span className="text-[10px] font-black uppercase tracking-widest mr-2">Open</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
