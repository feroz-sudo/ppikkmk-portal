"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getTraineeLogs, getTraineeSessions, Log, Session } from "@/lib/firebase/db";
import { ProgressBar, GroupedProgress } from "@/components/dashboard/ProgressBar";
import { LogbookForm } from "@/components/dashboard/LogbookForm";
import { LayoutDashboard, Users, UserPlus, Clock, Target, Calendar, CheckCircle2 } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

import { SupervisionTracker } from "@/components/dashboard/supervision/SupervisionTracker";
import { BookingForm } from "@/components/dashboard/supervision/BookingForm";
import { getTraineeSupervisions, Supervision } from "@/lib/firebase/db";

// Target Constraints
const TARGETS = {
    TOTAL: 252,
    FTF_TOTAL: 96,
    INDIVIDUAL: 60,
    GROUP: 36,
    NFTF_TOTAL: 156,
    PFA: 90,
    ADMIN: 52,
    PRD: 14
};

export default function DashboardPage() {
    const { user, userRole } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [supervisions, setSupervisions] = useState<Supervision[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        if (!userRole) return;

        if (userRole === 'admin') {
            router.replace("/dashboard/admin");
        } else if (userRole === 'supervisor') {
            router.replace("/dashboard/supervisor");
        }
    }, [userRole, router]);

    const fetchDashboardData = useCallback(async () => {
        if (user && userRole === 'trainee') {
            setLoading(true);
            try {
                const [fetchedLogs, fetchedSessions, fetchedSupervisions] = await Promise.all([
                    getTraineeLogs(user.uid),
                    getTraineeSessions(user.uid),
                    getTraineeSupervisions(user.uid)
                ]);
                setLogs(fetchedLogs);
                setSessions(fetchedSessions);
                setSupervisions(fetchedSupervisions);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        } else if (userRole && userRole !== 'trainee') {
            setLoading(false);
        }
    }, [user, userRole]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const calcHours = (category: string) => {
        return logs
            .filter((log: Log) => log.category === category)
            .reduce((sum: number, log: Log) => sum + log.hours, 0);
    };

    const indivSessionsCount = sessions.filter((s: Session) => s.formType === 'Form2').length;
    const groupSessionsCount = sessions.filter((s: Session) => s.formType === 'Form11').length;

    const currentIndividual = calcHours("Individual Counselling");
    const currentGroup = calcHours("Group Counselling");
    const currentFTF = currentIndividual + currentGroup;

    const currentPFA = calcHours("PFA/MHPSS");
    const currentAdmin = calcHours("Management/Admin");
    const currentPRD = calcHours("Professional Development");
    const currentNFTF = currentPFA + currentAdmin + currentPRD;

    const totalCurrent = currentFTF + currentNFTF;
    const totalPercentage = Math.min(100, Math.round((totalCurrent / TARGETS.TOTAL) * 100));

    const ftfPercentage = Math.min(100, Math.round((currentFTF / TARGETS.FTF_TOTAL) * 100));
    const nftfPercentage = Math.min(100, Math.round((currentNFTF / TARGETS.NFTF_TOTAL) * 100));

    if (loading || userRole !== 'trainee') {
        return (
            <div className="flex items-center justify-center min-vh-60">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personalizing Experience...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {showBooking && user && (
                <BookingForm
                    trainee={user as any}
                    onClose={() => setShowBooking(false)}
                    onSuccess={fetchDashboardData}
                />
            )}

            <div className="relative overflow-hidden bg-upsi-navy rounded-[2rem] p-8 text-white shadow-2xl glass-dark">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <LayoutDashboard size={120} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center text-center lg:text-left">
                    <div className="mb-6 lg:mb-0">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">My Clinical Progress</h1>
                        <p className="text-blue-100 font-medium flex items-center justify-center lg:justify-start text-sm md:text-base">
                            <Calendar size={16} className="mr-2" />
                            March 9, 2026 – July 10, 2026 (18 Weeks)
                        </p>
                    </div>
                    <div className="flex flex-col items-center lg:items-end space-y-4 w-full lg:w-auto">
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-upsi-gold font-black text-2xl md:text-3xl leading-none">{totalCurrent} <span className="text-lg">HRS</span></div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 mt-1">Total Validated</div>
                            </div>
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                <CheckCircle2 className="text-upsi-gold" size={28} />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowBooking(true)}
                            className="w-full lg:w-auto bg-upsi-gold text-upsi-navy px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-upsi-gold/20"
                        >
                            Request Supervision
                        </button>
                    </div>
                </div>

                <div className="mt-8 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-2 gap-2">
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/70">Master Requirement (252h)</span>
                        <span className="text-base md:text-lg font-black text-upsi-gold">{totalPercentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-2xl h-6 p-1 overflow-hidden border border-white/10 glass">
                        <div
                            className="bg-gradient-to-r from-upsi-gold to-yellow-500 h-full rounded-xl transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,179,20,0.5)]"
                            style={{ width: `${totalPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <SupervisionTracker supervisions={supervisions} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass shadow-premium rounded-3xl p-6 hover-lift border-b-4 border-emerald-500/50">
                    <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                        <UserPlus size={18} />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">Individual Sessions</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{indivSessionsCount} <span className="text-sm text-slate-400">/ 60</span></div>
                </div>

                <div className="glass shadow-premium rounded-3xl p-6 hover-lift border-b-4 border-cyan-500/50">
                    <div className="flex items-center space-x-3 text-cyan-600 mb-2">
                        <Users size={18} />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">Group Sessions</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{groupSessionsCount} <span className="text-sm text-slate-400">/ 36</span></div>
                </div>

                <div className="glass shadow-premium rounded-3xl p-6 hover-lift border-b-4 border-blue-500/50">
                    <div className="flex items-center space-x-3 text-blue-600 mb-2">
                        <Target size={18} />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">FTF Target</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{ftfPercentage}% <span className="text-sm text-slate-400">/ 96h</span></div>
                </div>

                <div className="glass shadow-premium rounded-3xl p-6 hover-lift border-b-4 border-purple-500/50">
                    <div className="flex items-center space-x-3 text-purple-600 mb-2">
                        <Clock size={18} />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">NFTF Target</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{nftfPercentage}% <span className="text-sm text-slate-400">/ 156h</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GroupedProgress
                        title="Face-to-Face (FTF)"
                        totalCurrent={currentFTF}
                        totalTarget={TARGETS.FTF_TOTAL}
                    >
                        <ProgressBar
                            label="Individual Counselling"
                            current={currentIndividual}
                            target={TARGETS.INDIVIDUAL}
                            colorClass="bg-[#28a745]"
                        />
                        <ProgressBar
                            label="Group Counselling"
                            current={currentGroup}
                            target={TARGETS.GROUP}
                            colorClass="bg-[#17a2b8]"
                        />
                    </GroupedProgress>

                    <GroupedProgress
                        title="Non Face-to-Face (NFTF)"
                        totalCurrent={currentNFTF}
                        totalTarget={TARGETS.NFTF_TOTAL}
                    >
                        <ProgressBar
                            label="PFA / MHPSS"
                            current={currentPFA}
                            target={TARGETS.PFA}
                            colorClass="bg-[#fd7e14]"
                        />
                        <ProgressBar
                            label="Management & Admin"
                            current={currentAdmin}
                            target={TARGETS.ADMIN}
                            colorClass="bg-[#6f42c1]"
                        />
                        <ProgressBar
                            label="Professional Dev."
                            current={currentPRD}
                            target={TARGETS.PRD}
                            colorClass="bg-[#e83e8c]"
                        />
                    </GroupedProgress>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <LogbookForm onLogAdded={fetchDashboardData} />
                    <div className="glass p-6 rounded-[2rem] shadow-premium border border-slate-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Entries</h3>
                        {loading ? (
                            <div className="text-center text-gray-500 py-4">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-center text-gray-500 py-4 text-sm">No entries yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {logs.sort((a: Log, b: Log) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((log: Log) => (
                                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">{log.category}</div>
                                            <div className="text-xs text-gray-500 mt-1">{log.date}</div>
                                        </div>
                                        <div className="text-sm font-bold text-upsi-navy bg-blue-50 px-2 py-1 rounded">
                                            +{log.hours}h
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Disclaimer variant="full" className="mt-12" />
        </div>
    );
}
