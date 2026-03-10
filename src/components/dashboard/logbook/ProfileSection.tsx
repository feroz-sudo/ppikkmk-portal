"use client";

import { useState, useEffect } from "react";
import { TraineeProfile, saveTraineeProfile, getTraineeProfile } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Hash, MapPin, Phone, AlertCircle, Save, Loader2, ShieldAlert } from "lucide-react";

export const ProfileSection = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<TraineeProfile>({
        uid: "",
        fullName: "",
        matricNumber: "",
        icNumber: "",
        address: "",
        phone: "",
        email: "",
        practicumSite: "",
        siteAddress: "",
        emergencyContact: ""
    } as TraineeProfile);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const data = await getTraineeProfile(user.uid);
                if (data) {
                    setProfile(data);
                } else {
                    setProfile(prev => ({ ...prev, uid: user.uid, email: user.email || "" }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await saveTraineeProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-upsi-gold mb-4" size={32} />
            <p className="text-slate-400 font-bold uppercase tracking-widest">Loading Profile...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                <div className="bg-upsi-navy p-8 border-b border-white/10">
                    <h2 className="text-white text-xl font-black uppercase tracking-wider flex items-center">
                        <User className="mr-3 text-upsi-gold" size={24} />
                        Maklumat Diri Kaunselor Pelatih
                    </h2>
                    <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Professional Trainee Identification</p>
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PERSONAL INFO */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">Personal Details</h3>

                            <div className="space-y-4">
                                <InputField label="Nama Penuh" icon={<User size={16} />} value={profile.fullName} onChange={v => setProfile({ ...profile, fullName: v })} placeholder="Full name as per IC" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="No. Matriks" icon={<Hash size={16} />} value={profile.matricNumber} onChange={v => setProfile({ ...profile, matricNumber: v })} placeholder="Matrix ID" />
                                    <InputField label="No. KP" icon={<Hash size={16} />} value={profile.icNumber} onChange={v => setProfile({ ...profile, icNumber: v })} placeholder="IC Number" />
                                </div>
                                <InputField label="Email" icon={<Mail size={16} />} value={profile.email} onChange={v => setProfile({ ...profile, email: v })} placeholder="Official email" disabled />
                                <InputField label="No. Telefon" icon={<Phone size={16} />} value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} placeholder="Contact number" />
                            </div>
                        </div>

                        {/* SITE INFO */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">Practicum Placement</h3>

                            <div className="space-y-4">
                                <InputField label="Tempat Praktikum" icon={<MapPin size={16} />} value={profile.practicumSite} onChange={v => setProfile({ ...profile, practicumSite: v })} placeholder="Site name" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Alamat Tetap / Penginapan</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all font-bold text-slate-700 text-sm"
                                        rows={3}
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        placeholder="Home address during practicum"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Alamat Tempat Praktikum</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all font-bold text-slate-700 text-sm"
                                        rows={3}
                                        value={profile.siteAddress}
                                        onChange={e => setProfile({ ...profile, siteAddress: e.target.value })}
                                        placeholder="Full address of placement"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <div className="max-w-md mx-auto space-y-4 text-center">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Emergency Contact</h3>
                            <InputField label="Nama & No. Tel Kecemasan" icon={<ShieldAlert size={16} />} value={profile.emergencyContact} onChange={v => setProfile({ ...profile, emergencyContact: v })} placeholder="Person to contact / Phone" />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl border flex items-center space-x-3 max-w-md mx-auto animate-in fade-in zoom-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            {message.type === 'success' ? <Save size={18} /> : <AlertCircle size={18} />}
                            <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-upsi-gold text-upsi-navy px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-upsi-gold/30 hover-lift transition-all flex items-center shrink-0 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save className="mr-3" size={18} />}
                            Update Digital Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, icon, value, onChange, placeholder, disabled }: { label: string, icon: any, value: string, onChange: (v: string) => void, placeholder: string, disabled?: boolean }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-upsi-navy transition-colors">
                {icon}
            </div>
            <input
                type="text"
                disabled={disabled}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all font-bold text-slate-700 text-sm disabled:opacity-50"
            />
        </div>
    </div>
);
