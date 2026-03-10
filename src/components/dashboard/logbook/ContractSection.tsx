"use client";

import { useState, useEffect } from "react";
import { PracticumContract, savePracticumContract, getPracticumContract } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Building2, UserCircle, Briefcase, Calendar, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const ContractSection = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contract, setContract] = useState<PracticumContract>({
        traineeId: "",
        internshipSite: "",
        semesterYear: "",
        localPreceptor: { name: "", phone: "", email: "" },
        academicSupervisor: { name: "", phone: "", email: "" },
        practicumCoordinator: { name: "", email: "" },
        startDate: "",
        endDate: "",
        isAgreed: false
    } as PracticumContract);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadContract = async () => {
            if (!user) return;
            try {
                const data = await getPracticumContract(user.uid);
                if (data) {
                    setContract(data);
                } else {
                    setContract(prev => ({ ...prev, traineeId: user.uid }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadContract();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await savePracticumContract(contract);
            setMessage({ type: 'success', text: 'Contract updated successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update contract.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-upsi-gold mb-4" size={32} />
            <p className="text-slate-400 font-bold uppercase tracking-widest">Auditing Documents...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                <div className="bg-upsi-navy p-8 border-b border-white/10">
                    <h2 className="text-white text-xl font-black uppercase tracking-wider flex items-center">
                        <FileText className="mr-3 text-upsi-gold" size={24} />
                        Kontrak & Perjanjian Praktikum
                    </h2>
                    <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Formal Clinical Agreement (Lampiran B)</p>
                </div>

                <form onSubmit={handleSave} className="p-10 space-y-12">
                    {/* SECTION 1: GENERAL INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">General Placement</h3>
                            <div className="space-y-4">
                                <InputField label="Tapak Internship" icon={<Building2 size={16} />} value={contract.internshipSite} onChange={v => setContract({ ...contract, internshipSite: v })} placeholder="Agency Name" />
                                <InputField label="Semester / Tahun" icon={<Calendar size={16} />} value={contract.semesterYear} onChange={v => setContract({ ...contract, semesterYear: v })} placeholder="e.g. Sem 2 2023/2024" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Tarikh Mula" icon={<Calendar size={14} />} type="date" value={contract.startDate} onChange={v => setContract({ ...contract, startDate: v })} placeholder="" />
                                    <InputField label="Tarikh Tamat" icon={<Calendar size={14} />} type="date" value={contract.endDate} onChange={v => setContract({ ...contract, endDate: v })} placeholder="" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">Clinical Coordinator</h3>
                            <div className="space-y-4">
                                <InputField label="Nama Penyelaras" icon={<UserCircle size={16} />} value={contract.practicumCoordinator.name} onChange={v => setContract({ ...contract, practicumCoordinator: { ...contract.practicumCoordinator, name: v } })} placeholder="Coordinator name" />
                                <InputField label="Email Penyelaras" icon={<UserCircle size={16} />} value={contract.practicumCoordinator.email} onChange={v => setContract({ ...contract, practicumCoordinator: { ...contract.practicumCoordinator, email: v } })} placeholder="Coordinator email" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: SUPERVISORS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">Penyelia Lapangan (Local Preceptor)</h3>
                            <div className="space-y-4">
                                <InputField label="Nama" icon={<Briefcase size={16} />} value={contract.localPreceptor.name} onChange={v => setContract({ ...contract, localPreceptor: { ...contract.localPreceptor, name: v } })} placeholder="Preceptor name" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Telefon" icon={<Briefcase size={14} />} value={contract.localPreceptor.phone} onChange={v => setContract({ ...contract, localPreceptor: { ...contract.localPreceptor, phone: v } })} placeholder="Phone" />
                                    <InputField label="Email" icon={<Briefcase size={14} />} value={contract.localPreceptor.email} onChange={v => setContract({ ...contract, localPreceptor: { ...contract.localPreceptor, email: v } })} placeholder="Email" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-upsi-gold pl-4 ml-1">Penyelia Akademik</h3>
                            <div className="space-y-4">
                                <InputField label="Nama" icon={<UserCircle size={16} />} value={contract.academicSupervisor.name} onChange={v => setContract({ ...contract, academicSupervisor: { ...contract.academicSupervisor, name: v } })} placeholder="Supervisor name" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Telefon" icon={<UserCircle size={14} />} value={contract.academicSupervisor.phone} onChange={v => setContract({ ...contract, academicSupervisor: { ...contract.academicSupervisor, phone: v } })} placeholder="Phone" />
                                    <InputField label="Email" icon={<UserCircle size={14} />} value={contract.academicSupervisor.email} onChange={v => setContract({ ...contract, academicSupervisor: { ...contract.academicSupervisor, email: v } })} placeholder="Email" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: AGREEMENT */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                        <h3 className="text-xs font-black text-upsi-navy uppercase tracking-[0.2em] mb-4 text-center">Perjanjian Praktikum</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic text-center mb-8 max-w-3xl mx-auto">
                            "Saya mengaku bahawa saya telah membaca dan memahami Kod Etika Lembaga Kaunselor Malaysia dan akan mempraktikkan kaunseling seiring dengan standard yang telah ditetapkan. Saya bersetuju untuk mematuhi polisi pentadbiran, peraturan, standard dan amalan di tempat praktikum dan akan memastikan saya bertingkah laku secara profesional."
                        </p>

                        <div className="flex items-center justify-center space-x-6">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${contract.isAgreed ? 'bg-upsi-navy border-upsi-navy' : 'border-slate-300 group-hover:border-upsi-navy'}`}>
                                    {contract.isAgreed && <CheckCircle2 className="text-upsi-gold" size={18} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={contract.isAgreed}
                                    onChange={e => setContract({ ...contract, isAgreed: e.target.checked })}
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${contract.isAgreed ? 'text-upsi-navy' : 'text-slate-400'}`}>I hereby agree to the terms</span>
                            </label>
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
                            className="bg-upsi-navy text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-upsi-navy/30 hover-lift transition-all flex items-center shrink-0 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save className="mr-3" size={18} />}
                            Authorize & Save Contract
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, icon, value, onChange, placeholder, disabled, type = "text" }: { label: string, icon: any, value: string, onChange: (v: string) => void, placeholder: string, disabled?: boolean, type?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-upsi-navy transition-colors">
                {icon}
            </div>
            <input
                type={type}
                disabled={disabled}
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-upsi-navy/5 focus:border-upsi-navy outline-none transition-all font-bold text-slate-700 text-sm disabled:opacity-50"
            />
        </div>
    </div>
);
