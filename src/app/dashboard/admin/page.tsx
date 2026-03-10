"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    getSystemStats,
    getRecentActivities,
    getAllUsers,
    User,
    Log,
    Session
} from "@/lib/firebase/db";
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
    TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
    const { user, userRole } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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
                    getRecentActivities(15),
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

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.matricNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-upsi-navy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center uppercase">
                        <ShieldCheck className="mr-4 text-upsi-navy" size={40} />
                        Admin Center
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center">
                        <Activity size={16} className="mr-2 text-emerald-500 animate-pulse" />
                        System-wide monitoring & governance dashboard
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Trainees"
                    value={stats?.totalTrainees}
                    icon={<Users className="text-blue-500" />}
                    color="blue"
                />
                <StatCard
                    label="Active Supervisors"
                    value={stats?.totalSupervisors}
                    icon={<UserCheck className="text-emerald-500" />}
                    color="emerald"
                />
                <StatCard
                    label="Clinical Hours"
                    value={stats?.totalHours}
                    unit="HRS"
                    icon={<Clock className="text-amber-500" />}
                    color="amber"
                />
                <StatCard
                    label="Pending Forms"
                    value={stats?.pendingVerifications}
                    icon={<AlertCircle className="text-rose-500" />}
                    color="rose"
                    alert={stats?.pendingVerifications > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-[600px]">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center">
                                <Users className="mr-3 text-upsi-gold" size={24} />
                                User Directory
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all w-full md:w-64 font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Information</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                                {u.matricNumber && <div className="text-[10px] font-black text-upsi-navy mt-1 uppercase">{u.matricNumber}</div>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${u.role === 'supervisor' ? 'bg-emerald-100 text-emerald-700' :
                                                    u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                                                {u.programType || 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button className="p-2 text-slate-300 hover:text-upsi-navy transition-colors">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-premium p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center mb-8 relative z-10">
                            <TrendingUp className="mr-3 text-upsi-gold" size={24} />
                            Activity Pulse
                        </h2>

                        <div className="space-y-6 relative z-10">
                            {recentActivities.map((act, i) => (
                                <div key={act.id} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 ${act.type === 'log' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            {act.type === 'log' ? <ClipboardList size={18} /> : <Activity size={18} />}
                                        </div>
                                        {i !== recentActivities.length - 1 && <div className="w-px h-full bg-white/5 my-2" />}
                                    </div>
                                    <div className="pb-6">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{format(act.timestamp, "hh:mm a")}</div>
                                        <div className="text-xs font-bold mt-1 text-white/90">
                                            {act.type === 'log' ? 'New logbook entry' : 'Clinical form submitted'}
                                        </div>
                                        <div className="text-[10px] text-white/50 mt-1 line-clamp-2 italic">
                                            {act.type === 'log' ? act.data.description : `Client: ${act.data.formData?.demographics?.name || 'N/A'}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, unit, icon, color, alert }: any) {
    return (
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 group hover:border-${color}-200 transition-all duration-300 relative overflow-hidden`}>
            {alert && (
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
            )}
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 bg-${color}-50 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
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
}
