"use client";

import { useState } from "react";
import { findTraineeByEmail, updateTraineeSupervisor } from "@/lib/firebase/db";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

interface ManageTraineesProps {
    supervisorId: string;
    onSuccess?: () => void;
}

export const ManageTrainees = ({ supervisorId, onSuccess }: ManageTraineesProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLinkTrainee = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) return;

        if (!trimmedEmail.endsWith("@siswa.upsi.edu.my")) {
            setError("Only official UPSI trainee emails (@siswa.upsi.edu.my) are allowed.");
            return;
        }

        setLoading(true);
        try {
            const trainee = await findTraineeByEmail(trimmedEmail);

            if (!trainee) {
                setError("No trainee found with this official UPSI email.");
                return;
            }

            if (trainee.assignedSupervisorId === supervisorId) {
                setError("This trainee is already assigned to you.");
                return;
            }

            if (trainee.assignedSupervisorId) {
                const proceed = window.confirm(
                    "This trainee is already assigned to another supervisor. Do you want to reassign them to yourself?"
                );
                if (!proceed) return;
            }

            await updateTraineeSupervisor(trainee.uid, supervisorId);
            setEmail("");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Link New Trainee</h3>

            <form onSubmit={handleLinkTrainee} className="space-y-4">
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trainee-id@siswa.upsi.edu.my"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-upsi-navy focus:ring-0 transition-all placeholder:text-slate-300"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
                        <AlertCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-4 bg-upsi-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-upsi-navy/30 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    {loading ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                        <UserPlus size={16} className="mr-2" />
                    )}
                    LINK TRAINEE
                </button>
            </form>
        </div>
    );
};
