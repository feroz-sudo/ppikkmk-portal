// Note: The ClientPrefill logic will now automatically detect `sessionId` from search parameters when used in specific Form wrappers. Let's make sure forms look for `sessionId` and lock it. 
// We will export a hook to help Forms fetch `sessionId` and `clientId` gracefully.
import { useSearchParams } from 'next/navigation';

export const usePrefillData = () => {
    const searchParams = useSearchParams();
    return {
        prefillClientId: searchParams.get('clientId'),
        prefillSessionId: searchParams.get('sessionId'),
        manifestStr: searchParams.get('manifest')
    }
}
// Keeping the standard ClientPrefill logic entirely intact below...
import React, { useState } from "react";
import { DownloadCloud, Search } from "lucide-react";
import { getTraineeClients, Client } from "@/lib/firebase/db";
import { useAuth } from "@/contexts/AuthContext";

interface ClientPrefillProps {
    onSelectClient: (client: Client) => void;
}

export const ClientPrefill: React.FC<ClientPrefillProps> = ({ onSelectClient }) => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setIsOpen(true);
        if (clients.length === 0 && user) {
            setLoading(true);
            try {
                const fetched = await getTraineeClients(user.uid);
                setClients(fetched);
            } catch (error) {
                console.error("Failed to load clients", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={handleOpen}
                className="flex items-center space-x-2 bg-white border border-black text-black font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-sm"
            >
                <DownloadCloud size={16} />
                <span>Assign to Client</span>
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 w-80 bg-white border border-black shadow-xl rounded-xl z-50 overflow-hidden">
                    <div className="bg-white px-4 py-3 border-b border-black flex justify-between items-center text-sm font-bold text-black uppercase">
                        <span>Select a Client</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">&times;</button>
                    </div>

                    <div className="p-2">
                        <div className="relative mb-2">
                            <Search className="absolute left-2 top-2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full text-sm pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:border-upsi-navy outline-none"
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {loading ? (
                                <div className="text-xs text-gray-500 text-center py-4">Loading...</div>
                            ) : clients.length === 0 ? (
                                <div className="text-xs text-gray-500 text-center py-4">No clients found.</div>
                            ) : (
                                clients.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            onSelectClient(c);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded transition-colors"
                                    >
                                        <div className="font-semibold text-gray-800">{c.demographics.name}</div>
                                        <div className="text-xs text-gray-500">{c.type}{c.clientId}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
