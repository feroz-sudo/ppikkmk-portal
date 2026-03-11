"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeClients, Client } from "@/lib/firebase/db";
import { buildClinicalId } from "@/lib/drive/saveToDrive";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

export default function KKClientListPage() {
    const { user, userProfile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchClients() {
            if (!user) return;
            try {
                const allClients = await getTraineeClients(user.uid);
                // Filter only KK clients
                setClients(allClients.filter(c => c.type === "KK"));
            } catch (error) {
                console.error("Failed to fetch clients:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchClients();
    }, [user]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading clients...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-12" style={{ fontFamily: "Arial, sans-serif" }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-upsi-gold pl-3">
                        Kaunseling Kelompok (KK) Clients
                    </h1>
                    <p className="text-gray-500 mt-1 pl-4">Manage and view all your registered group clients.</p>
                </div>
                <Link
                    href="/dashboard/clients/new?type=KK"
                    className="flex items-center space-x-2 bg-upsi-navy text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    <span>Add New Group</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {clients.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Search className="text-gray-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-700">No KK Clients Found</h3>
                        <p className="text-gray-500 mt-2 mb-6">You haven&apos;t registered any Kaunseling Kelompok (KK) clients yet. Use the Add New Group button above to register via Form 11.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-upsi-navy text-white font-bold py-4 px-6 border-b border-blue-800 rounded-tl-xl rounded-tr-xl text-sm" style={{ fontFamily: "Arial, sans-serif" }}>Group File ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <td className="py-4 px-6">
                                            <Link href={`/dashboard/clients/kk/${client.clientId}`} className="block w-full h-full">
                                                <div className="font-bold text-gray-900 group-hover:text-upsi-navy transition-colors text-lg">{client.demographics.name}</div>
                                                <div className="text-xs font-mono text-upsi-navy font-bold mt-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100 uppercase">
                                                    {buildClinicalId(userProfile?.programType ?? null, client.type, userProfile?.matricNumber || 'UNKNOWN')}-C{client.clientId.padStart(3, '0')}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1.5 flex items-center">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                                                    Added {new Date(client.createdAt instanceof Object && 'seconds' in client.createdAt ? client.createdAt.seconds * 1000 : (client.createdAt as Date)).toLocaleDateString()}
                                                </div>
                                            </Link>
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
                    <strong>Important:</strong> KK Clients are meant for group counselling. Once you create a group, it will be available in dropdowns specifically mapped as a Kaunseling Kelompok.
                </div>
            </div>
        </div>
    );
}
