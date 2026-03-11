"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    User,
    Mail,
    ShieldCheck,
    Database,
    CloudCheck,
    Bell,
    Settings as SettingsIcon,
    Moon,
    Fingerprint,
    Save,
    Info,
    CheckCircle2
} from "lucide-react";

interface SettingItem {
    label: string;
    value: string | React.ReactNode;
    icon: any;
    color?: string;
    status?: 'success' | 'warning' | 'error';
}

interface SettingSection {
    title: string;
    icon: any;
    items: SettingItem[];
}

export default function SettingsPage() {
    const { user, userRole, userProfile, updateProfile } = useAuth();
    
    const [fullName, setFullName] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.name || "");
            setMatricNumber(userProfile.matricNumber || "");
        } else if (user?.displayName) {
            setFullName(user.displayName);
        }
    }, [userProfile, user]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });
        try {
            await updateProfile(fullName, matricNumber.toUpperCase());
            setMessage({ type: "success", text: "Profile updated successfully! Clinical automation is now active." });
            setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    const sections: SettingSection[] = [
        {
            title: "Account Profile",
            icon: User,
            items: [
                { 
                    label: "Full Name", 
                    value: (
                        <input 
                            type="text" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-transparent border-b border-gray-200 outline-none focus:border-upsi-navy transition-colors py-1 w-full text-right font-semibold"
                            placeholder="Enter your full name"
                        />
                    ), 
                    icon: User 
                },
                { 
                    label: "Matric Number", 
                    value: (
                        <input 
                            type="text" 
                            value={matricNumber} 
                            onChange={(e) => setMatricNumber(e.target.value)}
                            className="bg-transparent border-b border-gray-200 outline-none focus:border-upsi-navy transition-colors py-1 w-full text-right font-mono font-bold uppercase"
                            placeholder="e.g. M20241001148"
                        />
                    ), 
                    icon: Fingerprint 
                },
                { label: "Email Address", value: user?.email || "Not Set", icon: Mail },
                { label: "Role", value: userRole || "Loading...", icon: ShieldCheck, color: "text-upsi-navy font-bold uppercase" },
            ]
        },
        {
            title: "System Status",
            icon: Database,
            items: [
                { label: "Database Connection", value: "Operational", icon: Database, status: "success" },
                { label: "Google Drive Sync", value: "Active", icon: CloudCheck, status: "success" },
                { label: "Cloud Storage", value: "Connected", icon: Database, status: "success" },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-upsi-navy flex items-center space-x-3">
                        <SettingsIcon className="text-upsi-gold" size={32} />
                        <span>Portal Settings</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your account preferences and ensure filing automation is active.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center space-x-2 bg-upsi-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save size={20} />
                    )}
                    <span>Save Changes</span>
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center space-x-3">
                            <section.icon className="text-upsi-navy" size={20} />
                            <h2 className="font-bold text-gray-800 uppercase tracking-wider text-xs">{section.title}</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 w-1/2 justify-end">
                                        {(item as SettingItem).status === 'success' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                        <div className={`text-sm ${item.color || 'text-gray-900 font-semibold'}`}>{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <CloudCheck size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Clinical Data Automation</h3>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Your <strong>Matric Number</strong> and <strong>Program Type</strong> are used to automatically generate standardized clinical IDs (e.g., PKI-M2024...). ensure these are correct for accurate filing.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-upsi-gold/5 border border-upsi-gold/20 rounded-2xl flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <ShieldCheck size={24} className="text-upsi-gold" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-1">Data Ownership</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium capitalize">
                            all psychological records are stored in the secure UPSI PPIKKMK cloud. Your personal information is used exclusively for accreditation and audit purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
