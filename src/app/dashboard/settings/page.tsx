"use client";

import React from "react";
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
    Fingerprint
} from "lucide-react";

interface SettingItem {
    label: string;
    value: string;
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
    const { user, userRole } = useAuth();

    const sections: SettingSection[] = [
        {
            title: "Account Profile",
            icon: User,
            items: [
                { label: "Full Name", value: user?.displayName || "Not Set", icon: User },
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
        },
        {
            title: "Security & Preferences",
            icon: SettingsIcon,
            items: [
                { label: "Two-Factor Auth", value: "Disabled", icon: Fingerprint },
                { label: "System Notifications", value: "Enabled", icon: Bell },
                { label: "Dark Mode", value: "System", icon: Moon },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-upsi-navy flex items-center space-x-3">
                    <SettingsIcon className="text-upsi-gold" size={32} />
                    <span>Portal Settings</span>
                </h1>
                <p className="text-gray-500 mt-2">Manage your account preferences and view system status.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center space-x-3">
                            <section.icon className="text-upsi-navy" size={20} />
                            <h2 className="font-bold text-gray-800">{section.title}</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {(item as SettingItem).status === 'success' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                        <span className={`text-sm ${item.color || 'text-gray-900 font-semibold'}`}>{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <CloudCheck size={24} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">Google Drive Integration</h3>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                        Your clinical documents are automatically synchronized with the official UPSI PPIKKMK Drive.
                        This ensures data redundancy and compliance with established protocols.
                    </p>
                </div>
            </div>
        </div>
    );
}
