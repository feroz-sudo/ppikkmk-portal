import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MessageSquare, Save } from "lucide-react";

interface SupervisorCommentsProps {
    sessionId: string;
    initialComments?: string;
}

export const SupervisorComments: React.FC<SupervisorCommentsProps> = ({ sessionId, initialComments = "" }) => {
    const { userRole } = useAuth();
    const [comments, setComments] = useState(initialComments);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Trainees can only see the comments, not edit them
    if (userRole !== "supervisor") {
        if (!comments) return null;
        return (
            <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-upsi-navy mb-2 flex items-center space-x-2">
                    <MessageSquare size={16} />
                    <span>Supervisor&apos;s Feedback</span>
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{comments}</p>
            </div>
        );
    }

    // Supervisor Edit View
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const sessionRef = doc(db, "sessions", sessionId);
            await updateDoc(sessionRef, {
                supervisorComments: comments
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save comments", error);
            alert("Failed to save supervisor comments.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-8 bg-white p-6 rounded-xl border-2 border-upsi-gold shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-upsi-gold"></div>

            <div className="flex justify-between items-center mb-4 pl-4">
                <h3 className="text-lg font-bold text-upsi-navy flex items-center space-x-2">
                    <MessageSquare size={20} className="text-upsi-gold" />
                    <span>Supervisor&apos;s Clinical Feedback</span>
                </h3>
                {saved && <span className="text-green-600 text-sm font-bold flex items-center"><Save size={14} className="mr-1" /> Saved</span>}
            </div>

            <div className="pl-4">
                <textarea
                    rows={5}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter clinical supervision feedback, notes on ethics, or guidance here..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-gold focus:border-upsi-gold outline-none text-gray-800 bg-yellow-50/30"
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-upsi-navy text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Comments"}
                    </button>
                </div>
            </div>
        </div>
    );
};
