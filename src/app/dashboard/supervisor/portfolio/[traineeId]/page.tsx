"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    User,
    Log,
    Session,
    Client,
    ClinicalRecording,
    Supervision,
    AttendanceSignOff as AttendanceType,
    getTraineeLogs,
    getTraineeClients,
    getTraineeSessions,
    getTraineeRecordings,
    getTraineeAttendance,
    getTraineeSupervisionRequests,
    onSnapshot,
    doc,
    query,
    collection,
    where,
    orderBy,
    db
} from "@/lib/firebase/db";
import {
    ChevronLeft,
    LayoutDashboard,
    FileText,
    Video,
    ClipboardList,
    Award,
    AlertCircle,
    CheckCircle2,
    Users,
    HeartPulse,
    Clock,
    History,
    Calendar
} from "lucide-react";
import { SupervisorAnalytics } from "@/components/supervisor/SupervisorAnalytics";
import { DocumentReviewer } from "@/components/supervisor/DocumentReviewer";
import { RecordingVault } from "@/components/supervisor/RecordingVault";
import { AttendanceSignOff } from "@/components/supervisor/AttendanceSignOff";
import { MarksEntry } from "@/components/supervisor/MarksEntry";

export default function TraineePortfolioPage() {
    const { user, userRole } = useAuth();
    const params = useParams();
    const router = useRouter();
    const traineeId = params.traineeId as string;

    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as any;

    const [trainee, setTrainee] = useState<User | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [sessions, setSessions] = useState<(Session & { id: string })[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [recordings, setRecordings] = useState<ClinicalRecording[]>([]);
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [requests, setRequests] = useState<Supervision[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'analytics' | 'ki' | 'kk' | 'programs' | 'recordings' | 'attendance' | 'requests' | 'marks'>(initialTab || 'analytics');

    // Sync activeTab with initialTab if it changes (e.g. from sidebar navigation)
    useEffect(() => {
        if (initialTab && (['analytics', 'ki', 'kk', 'programs', 'recordings', 'attendance', 'requests', 'marks'] as any[]).includes(initialTab)) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (!traineeId || userRole !== 'supervisor') return;

        setLoading(true);

        // 1. Trainee User Data
        const unsubscribeUser = onSnapshot(doc(db, "users", traineeId), (snapshot: any) => {
            if (snapshot.exists()) {
                setTrainee(snapshot.data() as User);
            }
            setLoading(false);
        });

        // 2. Logs
        const logsQuery = query(collection(db, "logs"), where("traineeId", "==", traineeId));
        const unsubscribeLogs = onSnapshot(logsQuery, (snapshot: any) => {
            setLogs(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as Log)));
        });

        // 3. Sessions
        const sessionsQuery = query(collection(db, "sessions"), where("traineeId", "==", traineeId));
        const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot: any) => {
            setSessions(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as Session & { id: string })));
        });

        // 4. Clients
        const clientsQuery = query(collection(db, "clients"), where("traineeId", "==", traineeId));
        const unsubscribeClients = onSnapshot(clientsQuery, (snapshot: any) => {
            setClients(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as Client)));
        });

        // 5. Recordings
        const recordingsQuery = query(collection(db, "clinical_recordings"), where("traineeId", "==", traineeId));
        const unsubscribeRecordings = onSnapshot(recordingsQuery, (snapshot: any) => {
            setRecordings(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as ClinicalRecording)));
        });

        // 6. Attendance
        const attendanceQuery = query(collection(db, "attendance_signoffs"), where("traineeId", "==", traineeId));
        const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot: any) => {
            setAttendance(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as AttendanceType)));
        });

        // 7. Supervision Requests
        const requestsQuery = query(collection(db, "supervisions"), where("traineeId", "==", traineeId), orderBy("createdAt", "desc"));
        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot: any) => {
            setRequests(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() } as Supervision)));
        });

        return () => {
            unsubscribeUser();
            unsubscribeLogs();
            unsubscribeSessions();
            unsubscribeClients();
            unsubscribeRecordings();
            unsubscribeAttendance();
            unsubscribeRequests();
        };
    }, [traineeId, userRole]);

    if (userRole !== 'supervisor') {
        return (
            <div className="p-12 text-center text-red-500 font-bold bg-white rounded-[2rem] shadow-premium border border-red-50">
                Unauthorized Access. Supervisor privileges required.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-20 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-upsi-gold border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-[0.3em]">Hydrating Portfolio...</p>
            </div>
        );
    }

    if (!trainee) {
        return (
            <div className="max-w-7xl mx-auto p-20 text-center">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-xl font-bold text-slate-800">Trainee Not Found</p>
                <button onClick={() => router.push('/dashboard/supervisor')} className="mt-6 text-upsi-navy font-bold flex items-center justify-center space-x-2 mx-auto">
                    <ChevronLeft size={16} />
                    <span>Return to Portal</span>
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'analytics', label: 'Status', icon: LayoutDashboard },
        { id: 'ki', label: 'KI (Individual)', icon: FileText },
        { id: 'kk', label: 'KK (Group)', icon: Users },
        { id: 'programs', label: 'Program/Event', icon: HeartPulse },
        { id: 'recordings', label: 'Recordings', icon: Video },
        { id: 'attendance', label: 'Logbook', icon: ClipboardList },
        { id: 'requests', label: 'Requests', icon: History },
        { id: 'marks', label: 'Marks', icon: Award }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 font-[Arial,sans-serif]">
            {/* Header */}
            <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => router.push('/dashboard/supervisor')}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-upsi-navy to-blue-900 text-white flex items-center justify-center font-black text-3xl shadow-xl">
                        {trainee.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{trainee.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trainee.clinicalStatus === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                {trainee.clinicalStatus || 'Active'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {trainee.matricNumber} | {trainee.programType}
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                                ? "bg-white text-upsi-navy shadow-sm"
                                : "text-slate-400 hover:text-upsi-navy"
                                }`}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* View Port */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'analytics' && <SupervisorAnalytics logs={logs} />}

                {activeTab === 'ki' && (
                    <DocumentReviewer
                        sessions={sessions.filter(s => {
                            const client = clients.find(c => c.id === s.clientId);
                            return client?.type === 'KI';
                        })}
                        clients={clients.filter(c => c.type === 'KI')}
                        trainees={[trainee]}
                        onUpdate={() => { }} // Listener handles it
                        title="Individual Counseling [KI]"
                        showAll={true}
                    />
                )}

                {activeTab === 'kk' && (
                    <DocumentReviewer
                        sessions={sessions.filter(s => {
                            const client = clients.find(c => c.id === s.clientId);
                            return client?.type === 'KK';
                        })}
                        clients={clients.filter(c => c.type === 'KK')}
                        trainees={[trainee]}
                        onUpdate={() => { }} // Listener handles it
                        title="Group Counseling [KK]"
                        showAll={true}
                    />
                )}

                {activeTab === 'programs' && (
                    <DocumentReviewer
                        sessions={sessions.filter(s => s.formType === 'Form8')}
                        clients={[...clients, { id: 'PROGRAM', demographics: { name: 'Program/Event' } } as Client]}
                        trainees={[trainee]}
                        onUpdate={() => { }} // Listener handles it
                        title="Program & Outreach Monitoring"
                        showAll={true}
                    />
                )}

                {activeTab === 'recordings' && (
                    <RecordingVault
                        recordings={recordings}
                        onUpdate={() => { }} // Listener handles it
                    />
                )}

                {activeTab === 'attendance' && (
                    <AttendanceSignOff
                        attendanceLogs={attendance}
                        traineeName={trainee.name}
                        supervisorId={user?.uid || ""}
                        onUpdate={() => { }} // Listener handles it
                    />
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Supervision History</h2>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{requests.length} Requests</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.length === 0 ? (
                                <div className="col-span-full p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                                    <Clock className="mx-auto text-slate-200 mb-4" size={48} />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No supervision visits recorded</p>
                                </div>
                            ) : (
                                requests.map(req => (
                                    <div key={req.id} className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-50 text-upsi-navy rounded-2xl">
                                                <History size={20} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest ${req.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-lg mb-2">{req.type} Supervision</h4>
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-slate-500 flex items-center">
                                                <Calendar size={14} className="mr-2 text-upsi-gold" />
                                                {req.date instanceof Date ? req.date.toDateString() : (req.date as any).toDate().toDateString()}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 flex items-center">
                                                <Clock size={14} className="mr-2 text-upsi-gold" />
                                                {req.proposedTime}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'marks' && user && (
                    <MarksEntry
                        traineeId={trainee.uid}
                        supervisorId={user.uid}
                    />
                )}
            </div>
        </div>
    );
}
