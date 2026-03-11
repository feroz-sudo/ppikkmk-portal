"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeClients, Client, deleteClient } from "@/lib/firebase/db";
import { buildClinicalId } from "@/lib/drive/saveToDrive";
import Link from "next/link";
import { PlusCircle, Search, Trash2 } from "lucide-react";

export default function KIClientListPage() {
    const { user, userProfile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchClients() {
        if (!user) return;
        try {
            const allClients = await getTraineeClients(user.uid);
            // Filter only KI clients
            setClients(allClients.filter(c => c.type === "KI"));
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchClients();
    }, [user]);

    const handleDelete = async (e: React.MouseEvent, clientId: string, clientName: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (window.confirm(`Are you sure to delete this client?`)) {
            try {
                await deleteClient(clientId);
                setClients(prev => prev.filter(c => c.id !== clientId));
            } catch (error) {
                console.error("Failed to delete client:", error);
                alert("Failed to delete client. Please try again.");
            }
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading clients...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-12" style={{ fontFamily: "Arial, sans-serif" }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-upsi-gold pl-3">
                        Kaunseling Individu (KI) Clients
                    </h1>
                    <p className="text-gray-500 mt-1 pl-4">Manage and view all your registered individual clients.</p>
                </div>
                <Link
                    href="/dashboard/clients/new?type=KI"
                    className="flex items-center space-x-2 bg-upsi-navy text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    <span>Add New Client</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {clients.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Search className="text-gray-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-700">No KI Clients Found</h3>
                        <p className="text-gray-500 mt-2 mb-6">You haven&apos;t registered any Kaunseling Individu (KI) clients yet. Use the Add New Client button above to register.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-upsi-navy text-white font-bold py-4 px-6 border-b border-blue-800 rounded-tl-xl text-sm" style={{ fontFamily: "Arial, sans-serif" }}>Client File ID</th>
                                    <th className="bg-upsi-navy text-white font-bold py-4 px-6 border-b border-blue-800 rounded-tr-xl text-sm text-right" style={{ fontFamily: "Arial, sans-serif" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <Link href={`/dashboard/clients/ki/${client.clientId}`} className="block w-full h-full">
                                                <div className="font-bold text-gray-900 group-hover:text-upsi-navy transition-colors text-lg">{client.demographics.name}</div>
                                                <div className="text-xs font-mono text-upsi-navy font-bold mt-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100 uppercase">
                                                    {buildClinicalId(userProfile?.programType ?? null, client.type, userProfile?.matricNumber || 'UNKNOWN')}/{client.clientId.padStart(3, '0')}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1.5 flex items-center">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                                                    Added {new Date(client.createdAt instanceof Object && 'seconds' in client.createdAt ? client.createdAt.seconds * 1000 : (client.createdAt as Date)).toLocaleDateString()}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={(e) => handleDelete(e, client.id!, client.demographics.name)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all relative z-10"
                                                title="Delete Client"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                <div className="text-upsi-navy mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-900">
                    <strong>Important:</strong> KI Clients are meant for individual counselling. Once you create a client, they&apos;ll become available in dropdowns throughout all clinical forms.
                </div>
            </div>
        </div>
    );
}
