"use client";

import React, { useEffect, useState } from "react";
import {
    FolderOpen, FileText, PlusCircle,
    ClipboardList, Lightbulb, Target, Flag, AlertTriangle, MessageSquare, BrainCircuit, Play, Save
} from "lucide-react";
import Link from "next/link";
import { getTraineeClients, getClientSessions, Client, Session, db } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";

interface PageProps {
    params: Promise<{
        type: string;
        clientId: string;
    }>;
}

export default function ClientFolderPage({ params }: PageProps) {
    const unwrappedParams = React.use(params);
    const { type, clientId } = unwrappedParams;
    const { user } = useAuth();

    const [client, setClient] = useState<Client | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState("");
    const [savingSummary, setSavingSummary] = useState(false);

    const [showNewSession, setShowNewSession] = useState(false);
    const [newSessionId, setNewSessionId] = useState("");

    // Manifest of all 10 Forms
    const availableForms = [
        { id: "form1", name: "Intake Report", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-300" },
        { id: "form2", name: "Progressive Notes", icon: FileText, color: "text-green-500", bg: "bg-green-50", border: "border-green-300" },
        { id: "form3", name: "Case Conceptualization", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-300" },
        { id: "form4", name: "Treatment Planning", icon: Target, color: "text-red-500", bg: "bg-red-50", border: "border-red-300" },
        { id: "form5", name: "Termination Session", icon: Flag, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-300" },
        { id: "form6", name: "Crisis Intervention", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-300" },
        { id: "form7", name: "Consultation Report", icon: MessageSquare, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-300" },
        { id: "form13", name: "Psych Assessment", icon: BrainCircuit, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-300" },
        { id: "form8", name: "PFA / MHPSS", icon: FileText, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-300" },
        { id: "form11", name: "Group Counselling", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-300" },
    ];

    const [selectedForms, setSelectedForms] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                // Find Document ID for this client
                const clients = await getTraineeClients(user.uid);
                const matchedClient = clients.find(c =>
                    c.type.toLowerCase() === type.toLowerCase() &&
                    String(c.clientId).toLowerCase() === String(clientId).toLowerCase()
                );

                if (matchedClient) {
                    setClient(matchedClient);
                    setSummary(matchedClient.demographics.clinicalSummary || "");

                    if (matchedClient.id) {
                        const clientSessions = await getClientSessions(matchedClient.id);
                        setSessions(clientSessions);
                    }
                }
            } catch (error) {
                console.error("Failed to load client data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user, type, clientId]);

    const handleSaveSummary = async () => {
        if (!client || !client.id) return;
        setSavingSummary(true);
        try {
            const clientRef = doc(db, "clients", client.id);
            await updateDoc(clientRef, {
                "demographics.clinicalSummary": summary
            });
            alert("Clinical Summary saved successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to save summary.");
        } finally {
            setSavingSummary(false);
        }
    };

    const toggleFormSelection = (formId: string) => {
        setSelectedForms(prev =>
            prev.includes(formId) ? prev.filter(id => id !== formId) : [...prev, formId]
        );
    };

    // Grouping by Session Number
    const groupedSessions = sessions.reduce((acc, curr) => {
        if (!acc[curr.sessionId]) acc[curr.sessionId] = [];
        acc[curr.sessionId].push(curr);
        return acc;
    }, {} as Record<string, Session[]>);

    const sortedGroupKeys = Object.keys(groupedSessions).sort();

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="bg-upsi-navy rounded-xl shadow-md border-t-4 border-upsi-gold p-8 mb-6 text-white flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3 mb-2">
                        <FolderOpen className="text-upsi-gold" size={28} />
                        <span>Client Session Folder</span>
                    </h1>
                    <p className="text-blue-100 flex items-center space-x-2">
                        <span className="bg-blue-900 border border-blue-800 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
                            {type}{clientId}
                        </span>
                        <span>{client ? client.demographics.name : "Loading..."}</span>
                    </p>
                </div>
                <button
                    onClick={() => setShowNewSession(!showNewSession)}
                    className="bg-upsi-gold text-upsi-navy font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm flex items-center space-x-2"
                >
                    <PlusCircle size={20} />
                    <span>Start New Session</span>
                </button>
            </div>

            {/* Session Hub: New Session Form Manifest */}
            {showNewSession && (
                <div className="bg-white rounded-xl shadow-sm border border-upsi-gold p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Session Hub: Select Required Clinical Forms</h2>

                    <div className="flex items-center space-x-4 mb-6">
                        <label className="font-semibold text-sm text-gray-700">Assign Session ID Number:</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded px-3 py-1.5 focus:border-upsi-navy outline-none"
                            placeholder="e.g. 01, 02, Intake"
                            value={newSessionId}
                            onChange={(e) => setNewSessionId(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {availableForms.map((form) => {
                            const isSelected = selectedForms.includes(form.id);
                            return (
                                <div
                                    key={form.id}
                                    onClick={() => toggleFormSelection(form.id)}
                                    className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all ${isSelected ? form.bg + ' ' + form.border + ' ring-2 ring-upsi-navy' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <form.icon className={`${isSelected ? form.color : 'text-gray-400'} mb-2`} size={24} />
                                    <span className={`text-xs font-bold ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{form.name}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href={selectedForms.length > 0 && newSessionId ? `/dashboard/forms/${selectedForms[0]}?clientId=${client?.id}&sessionId=${encodeURIComponent(newSessionId)}&manifest=${selectedForms.join(',')}` : '#'}
                            className={`flex items-center space-x-2 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm ${selectedForms.length > 0 && newSessionId ? 'bg-upsi-navy text-white hover:bg-blue-900' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Play size={18} />
                            <span>Launch Selected Forms</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Clinical Summary Module */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Target size={20} className="mr-2 text-red-500" />
                        Clinical Summary & Overarching Goals
                    </h2>
                    <button
                        onClick={handleSaveSummary}
                        disabled={savingSummary}
                        className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-semibold transition-colors"
                    >
                        <Save size={16} />
                        <span>{savingSummary ? "Saving..." : "Save Notes"}</span>
                    </button>
                </div>
                <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none resize-none text-gray-700"
                    placeholder="Document high-level therapeutic goals, critical breakthroughs, or long-term progress notes here. This persists across all sessions..."
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                />
            </div>

            {/* Session Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <FileText size={20} className="mr-2 text-upsi-navy" />
                        Session History
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-medium">Loading records...</div>
                ) : sortedGroupKeys.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <FolderOpen size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">Empty Folder</h3>
                        <p className="mt-2 text-sm text-gray-400 max-w-sm">No clinical documents have been logged yet. Use the "Start New Session" hub above to begin.</p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-4">
                            {sortedGroupKeys.map((sessId) => {
                                const sessForms = groupedSessions[sessId];
                                const sessDate = new Date(sessForms[0].createdAt instanceof Object && 'seconds' in sessForms[0].createdAt ? (sessForms[0].createdAt as any).seconds * 1000 : sessForms[0].createdAt as Date).toLocaleDateString();

                                return (
                                    <div key={sessId} className="relative pl-8">
                                        <div className="absolute w-4 h-4 bg-upsi-gold rounded-full -left-[9px] top-1 border-2 border-white shadow-sm"></div>
                                        <div>
                                            <h3 className="text-md justify-between flex font-bold text-gray-800 mb-3 bg-gray-50 p-2 rounded border border-gray-100">
                                                <span>Session: {sessId}</span>
                                                <span className="text-sm text-gray-500 font-normal">{sessDate}</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {sessForms.map(f => {
                                                    const mappedForm = availableForms.find(af => af.name.replace(/\s+/g, '').toLowerCase().includes(f.formType.replace('Form', '').toLowerCase()) || f.formType === af.id);
                                                    const Icon = mappedForm ? mappedForm.icon : FileText;
                                                    return (
                                                        <div key={f.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`p-2 rounded-md ${mappedForm ? mappedForm.bg : 'bg-gray-100'}`}>
                                                                    <Icon size={16} className={mappedForm ? mappedForm.color : 'text-gray-500'} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm text-gray-800">{f.formType} Data</div>
                                                                    <div className="text-xs text-gray-400">{f.duration} hrs</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    href={`/dashboard/forms/${f.formType.toLowerCase()}?clientId=${client?.id}&sessionId=${encodeURIComponent(f.sessionId)}&docId=${f.id}`}
                                                                    className="text-xs text-upsi-navy hover:underline font-semibold bg-blue-50 px-2 py-1 rounded flex items-center"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={async () => {
                                                                        const { generateSessionPDF } = await import("@/lib/pdf/generatePDF");
                                                                        const pdfBlob = await generateSessionPDF(f, client!);
                                                                        const url = URL.createObjectURL(pdfBlob);
                                                                        window.open(url);
                                                                    }}
                                                                    className="text-xs text-upsi-navy hover:underline font-semibold bg-gray-50 px-2 py-1 rounded">
                                                                    View PDF
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
