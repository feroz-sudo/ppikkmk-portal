"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    getSystemStats,
    getRecentActivities,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    User,
} from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
    Users,
    Clock,
    Activity,
    ShieldCheck,
    ChevronRight,
    Search,
    UserCheck,
    AlertCircle,
    ClipboardList,
    TrendingUp,
    Settings,
    ShieldAlert
} from "lucide-react";
import { format } from "date-fns";

function AdminDashboardContent() {
    const { user, userRole } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const activeTab = (tabParam || "overview").toLowerCase().trim();
    const [stats, setStats] = useState<any>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleRoleChange = async (uid: string, newRole: User['role']) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;
        setIsUpdating(uid);
        try {
            await updateUserRole(uid, newRole);
            setAllUsers(users => users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role:", error);
            alert("Failed to update user role.");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleStatusChange = async (uid: string, newStatus: 'active' | 'archived') => {
        const action = newStatus === 'archived' ? 'FREEZE' : 'UNFREEZE';
        if (!confirm(`Are you sure you want to ${action} this account? Frozen accounts cannot log in but their data remains for audit.`)) return;

        setIsUpdating(uid);
        try {
            await updateUserStatus(uid, newStatus);
            setAllUsers(users => users.map(u => u.uid === uid ? { ...u, clinicalStatus: newStatus } : u));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert(`Failed to ${action.toLowerCase()} account.`);
        } finally {
            setIsUpdating(null);
        }
    };

    // Create a mapping of UID to User object for quick lookups
    const userMap = allUsers?.reduce((acc: any, u) => {
        if (u && u.uid) {
            acc[u.uid] = u;
        }
        return acc;
    }, {}) || {};

    // Count trainees for each supervisor
    const supervisorTraineeCounts = allUsers?.reduce((acc: any, u) => {
        if (u && u.role === 'trainee' && u.assignedSupervisorId) {
            acc[u.assignedSupervisorId] = (acc[u.assignedSupervisorId] || 0) + 1;
        }
        return acc;
    }, {}) || {};

    useEffect(() => {
        if (userRole && userRole !== 'admin') {
            router.push("/dashboard");
        }
    }, [userRole, router]);

    useEffect(() => {
        async function fetchData() {
            if (userRole !== 'admin') return;
            try {
                const [s, a, u] = await Promise.all([
                    getSystemStats(),
                    getRecentActivities(50),
                    getAllUsers()
                ]);
                setStats(s);
                setRecentActivities(a);
                setAllUsers(u);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [userRole]);

    const filteredUsers = allUsers?.filter(u =>
        u?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u?.matricNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-vh-60">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing System Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-upsi-gold mb-2">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Module</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-800 tracking-tighter flex items-center uppercase">
                        Admin Center
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center tracking-tight">
                        <Activity size={16} className="mr-2 text-emerald-500 animate-pulse" />
                        System-wide monitoring & governance dashboard • <span className="text-upsi-navy font-black ml-1 uppercase">{activeTab}</span>
                    </p>
                </div>
            </div>

            {/* Stats Grid - Only visible on overview for better UX */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom flex-shrink-0">
                    <StatCard
                        label="Total Trainees"
                        value={stats?.totalTrainees}
                        icon={<Users size={20} className="text-blue-500" />}
                        color="blue"
                    />
                    <StatCard
                        label="Active Supervisors"
                        value={stats?.totalSupervisors}
                        icon={<UserCheck size={20} className="text-emerald-500" />}
                        color="emerald"
                    />
                    <StatCard
                        label="Clinical Hours"
                        value={stats?.totalHours}
                        unit="HRS"
                        icon={<Clock size={20} className="text-amber-500" />}
                        color="amber"
                    />
                    <StatCard
                        label="Pending Forms"
                        value={stats?.pendingVerifications}
                        icon={<AlertCircle size={20} className="text-rose-500" />}
                        color="rose"
                        alert={stats?.pendingVerifications > 0}
                    />
                </div>
            )}

            {/* Tabbed Content */}
            <div className="transition-all duration-500">
                {(activeTab === "overview" || activeTab === "users") && (
                    <div className={`space-y-6 ${activeTab === "overview" ? "lg:col-span-2" : "w-full"}`}>
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-[500px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center">
                                    <Users className="mr-3 text-upsi-gold" size={24} />
                                    User Directory
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email or matric..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all w-full md:w-80 font-bold text-xs"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Information</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role & Governance</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment / Specialized</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                                                    No users found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-800 text-sm">{u.name}</div>
                                                        <div className="text-xs text-slate-400">{u.email}</div>
                                                        {u.matricNumber && <div className="text-[9px] font-black text-upsi-navy mt-1 uppercase tracking-tighter shrink-0">{u.matricNumber}</div>}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter w-fit ${u.role === 'supervisor' ? 'bg-emerald-100 text-emerald-700' :
                                                                u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                            {u.role === 'supervisor' && (
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                    {supervisorTraineeCounts[u.uid] || 0} Managed Trainees
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                                                                {u.programType || 'GENERALIST'}
                                                            </span>
                                                            {u.role === 'trainee' && u.assignedSupervisorId && (
                                                                <span className="text-[9px] text-emerald-600 font-black mt-1 uppercase tracking-tighter flex items-center">
                                                                    <ShieldCheck size={10} className="mr-1" />
                                                                    SUPERVISOR: {userMap[u.assignedSupervisorId]?.name || 'ID: ' + u.assignedSupervisorId}
                                                                </span>
                                                            )}
                                                            {u.role === 'trainee' && !u.assignedSupervisorId && (
                                                                <span className="text-[9px] text-rose-400 font-black mt-1 uppercase tracking-tighter flex items-center italic">
                                                                    <AlertCircle size={10} className="mr-1" />
                                                                    UNASSIGNED
                                                                </span>
                                                            )}
                                                            {u.clinicalStatus === 'archived' && (
                                                                <span className="text-[9px] text-rose-600 font-black mt-1 uppercase tracking-tighter flex items-center">
                                                                    <ShieldAlert size={10} className="mr-1" />
                                                                    ACCOUNT FROZEN (AUDIT ONLY)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u.uid, e.target.value as User['role'])}
                                                            disabled={isUpdating === u.uid || u.uid === user?.uid}
                                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border mr-2 transition-all cursor-pointer outline-none
                                                                ${isUpdating === u.uid ? 'opacity-50 cursor-not-allowed' : 'hover:border-upsi-navy'}
                                                            `}
                                                        >
                                                            <option value="trainee">Trainee</option>
                                                            <option value="supervisor">Supervisor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>

                                                        <button
                                                            onClick={() => handleStatusChange(u.uid, u.clinicalStatus === 'archived' ? 'active' : 'archived')}
                                                            disabled={isUpdating === u.uid || u.uid === user?.uid}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                                                                ${u.clinicalStatus === 'archived'
                                                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'}
                                                                ${isUpdating === u.uid || u.uid === user?.uid ? 'opacity-50 cursor-not-allowed' : ''}
                                                            `}
                                                        >
                                                            {u.clinicalStatus === 'archived' ? 'Unfreeze' : 'Freeze'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === "overview" || activeTab === "activity") && (
                    <div className={`mt-8 space-y-6 ${activeTab === "overview" ? "" : "w-full"}`}>
                        <div className="bg-slate-900 rounded-[3rem] shadow-premium p-10 text-white relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-upsi-gold/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-[100px]" />

                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center mb-10 relative z-10">
                                <TrendingUp className="mr-3 text-upsi-gold" size={28} />
                                System Activity Pulse
                            </h2>

                            <div className={`grid grid-cols-1 ${activeTab === "overview" ? "gap-6 shadow-2xl" : "md:grid-cols-2 lg:grid-cols-3 gap-8"} relative z-10`}>
                                {recentActivities.map((act, i) => {
                                    const trainee = userMap[act.data.traineeId];
                                    const activityPath = act.type === 'log'
                                        ? `/dashboard/admin?tab=logs&id=${act.id}`
                                        : `/dashboard/admin?tab=sessions&id=${act.id}`;

                                    return (
                                        <Link
                                            key={act.id}
                                            href={activityPath}
                                            className="flex gap-5 group items-start bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-upsi-gold/30 transition-all hover:bg-white/[0.08] cursor-pointer"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${act.type === 'log' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {act.type === 'log' ? <ClipboardList size={22} /> : <Activity size={22} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                                                        {act.timestamp && !isNaN(act.timestamp.getTime())
                                                            ? format(act.timestamp, "MMM dd • hh:mm a")
                                                            : "Unknown Date"}
                                                    </div>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${act.type === 'log' ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
                                                </div>
                                                <div className="text-sm font-black text-white/95 leading-tight group-hover:text-upsi-gold transition-colors text-ellipsis overflow-hidden whitespace-nowrap">
                                                    {act.type === 'log' ? 'Logbook Submission' : 'Form Authentication'}
                                                </div>
                                                <div className="text-[10px] text-white/70 mt-1 font-bold uppercase tracking-tight">
                                                    BY: {trainee?.name || 'Unknown Trainee'}
                                                </div>
                                                <div className="text-[10px] text-white/40 mt-2 font-medium line-clamp-2 leading-relaxed italic">
                                                    {act.type === 'log' ? act.data.description : `Clinical intake for ${act.data.formData?.demographics?.name || 'Authorized Client'}`}
                                                </div>
                                                <div className="mt-4 flex items-center text-[8px] font-black uppercase text-upsi-gold tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
                                                    Direct Audit Inspection <ChevronRight size={10} className="ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {recentActivities.length === 0 && (
                                    <div className="text-center py-20 text-white/20 font-bold uppercase tracking-widest w-full border border-dashed border-white/10 rounded-3xl">
                                        No recent clinical activity detected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === "logs" || activeTab === "sessions") && (
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-[500px] p-8 lg:p-12">
                        <AuditInspector id={searchParams.get("id")} type={activeTab} userMap={userMap} />
                    </div>
                )}
            </div>
        </div>
    );
}

function AuditInspector({ id, type, userMap }: { id: string | null, type: string, userMap: any }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        async function fetchDoc() {
            try {
                // Ensure correct collection name
                const docRef = doc(db, type === 'logs' ? 'logs' : 'sessions', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setData(docSnap.data());
                } else {
                    setData(null);
                }
            } catch (error) {
                console.error("Error fetching audit data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDoc();
    }, [id, type]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin" />
            <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Retrieving Secure Clinical Audit...</p>
        </div>
    );

    if (!data) return (
        <div className="py-20 text-center space-y-4">
            <ShieldAlert size={48} className="mx-auto text-rose-300" />
            <div className="text-slate-400 italic font-bold">Record not found or has been securely destroyed.</div>
            <button onClick={() => router.push('/dashboard/admin?tab=activity')} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                Return to Pulse
            </button>
        </div>
    );

    const traineeName = userMap[data.traineeId]?.name || 'Unknown Trainee';
    const isLog = type === 'logs';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                <div>
                    <button onClick={() => router.push('/dashboard/admin?tab=activity')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-upsi-navy mb-4 flex items-center transition-colors">
                        <ChevronRight className="rotate-180 mr-1" size={12} /> Back to Activity Pulse
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center">
                        <ShieldCheck className="mr-3 text-emerald-500" size={28} />
                        Clinical Data Protocol Audit
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Unique Identifier: <span className="font-mono text-upsi-navy bg-slate-50 px-2 py-1 rounded">{id}</span></p>
                </div>
                <div className="text-left md:text-right">
                    <div className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isLog ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isLog ? 'LAMPIRAN A (LOG)' : (data.formData?.formType?.toUpperCase() || 'CLINICAL FORM')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center"><UserCheck size={12} className="mr-1" /> Author / Trainee</div>
                    <div className="font-bold text-slate-800">{traineeName}</div>
                    <div className="text-xs text-slate-500 mt-1">ID: {data.traineeId}</div>
                </div>
                {data.supervisorId ? (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center"><ShieldCheck size={12} className="mr-1" /> Assigned Supervisor</div>
                        <div className="font-bold text-slate-800">{userMap[data.supervisorId]?.name || 'Unknown'}</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest mt-2 ${data.supervisorStatus === 'verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            Status: {data.supervisorStatus || 'PENDING'}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 border-dashed">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center"><AlertCircle size={12} className="mr-1" /> Supervisor Action</div>
                        <div className="font-bold text-slate-400 italic">Not Required / Applicable</div>
                    </div>
                )}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center"><Clock size={12} className="mr-1" /> Timestamp / Event Date</div>
                    <div className="font-bold text-slate-800">{data.date || 'Unknown Date'}</div>
                    {data.timestamp && <div className="text-xs text-slate-500 mt-1">{new Date(data.timestamp.seconds * 1000).toLocaleString()}</div>}
                </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden mt-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-upsi-gold/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-upsi-gold mb-6 border-b border-white/10 pb-4 flex items-center">
                    <Settings size={14} className="mr-2 animate-spin-slow" /> Raw Encrypted Payload
                </h3>
                <pre className="text-[11px] font-mono text-emerald-400/80 overflow-auto max-h-[500px] custom-scrollbar leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
}

function StatCard({ label, value, unit, icon, color, alert, href }: any) {
    const CardContent = () => (
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 group hover:border-${color}-200 transition-all duration-300 relative overflow-hidden h-full ${href ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}`}>
            {alert && (
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
            )}
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 bg-${color}-50 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                {href && <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />}
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</h3>
                <div className="text-4xl font-black text-slate-800 tracking-tighter">
                    {value}
                    {unit && <span className="text-sm text-slate-300 ml-1 uppercase">{unit}</span>}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block h-full"><CardContent /></Link>;
    }

    return <CardContent />;
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-vh-60">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-upsi-navy border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Admin Dashboard...</p>
                </div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}

