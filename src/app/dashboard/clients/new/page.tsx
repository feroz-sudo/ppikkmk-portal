"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addClient, Client } from "@/lib/firebase/db";
import { useRouter, useSearchParams } from "next/navigation";
import {
    UserPlus,
    Users,
    ArrowLeft,
    Save,
    CheckCircle2,
    Info,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

function ClientRegistrationContent() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial type from URL or default to KI
    const initialType = (searchParams.get("type") as "KI" | "KK") || "KI";

    const [type, setType] = useState<"KI" | "KK">(initialType);
    const [clientNumber, setClientNumber] = useState("");
    const [clientName, setClientName] = useState("");

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);
    const [filingPath, setFilingPath] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived values
    const typePrefix = userProfile?.programType === "internship" ? "I" : "P";
    const matricNumber = userProfile?.matricNumber || "";
    // Normalize matric number
    const formattedMatric = matricNumber.toUpperCase();

    const clinicalId = `${typePrefix}${type.toUpperCase()}-${formattedMatric}`;
    const paddedNumber = clientNumber.padStart(3, '0');
    const folderPath = `${clinicalId}/${paddedNumber}/`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!clientNumber || !clientName) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const clientData: Omit<Client, "createdAt"> = {
                clientId: paddedNumber,
                type: type,
                traineeId: user.uid,
                demographics: {
                    name: clientName,
                },
                status: "Active"
            };

            await addClient(clientData);

            setFilingPath(folderPath);
            setIsSuccess(true);

            // Auto-redirect after 3 seconds or user can click
            setTimeout(() => {
                router.push(`/dashboard/clients/${type.toLowerCase()}/${paddedNumber}`);
            }, 3500);

        } catch (error) {
            console.error("Failed to register client:", error);
            alert("Failed to register client. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle2 size={48} className="text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-8">The client has been registered and initialized in the system.</p>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8 text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Filing & Drive Path</p>
                        <code className="text-lg font-mono text-upsi-navy font-bold block break-all">
                            {filingPath}
                        </code>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => router.push(`/dashboard/clients/${type.toLowerCase()}/${paddedNumber}`)}
                            className="bg-upsi-navy text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-900 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>Go to Client Folder</span>
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="text-gray-500 font-medium hover:text-gray-700 transition-colors"
                        >
                            Register another client
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-upsi-navy transition-colors font-medium"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-gray-900">Client Registration</h1>
                    <p className="text-gray-500 mt-1">Initialize a new client file in the registry.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selector Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700 flex items-center">
                            <Info size={18} className="mr-2 text-upsi-gold" />
                            Counselling Type
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType("KI")}
                                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${type === "KI"
                                    ? "border-upsi-navy bg-blue-50 text-upsi-navy ring-4 ring-blue-50"
                                    : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                                    }`}
                            >
                                <UserPlus size={32} className="mb-2" />
                                <span className="font-bold">Kaunseling Individu (KI)</span>
                                <span className="text-xs opacity-70">Individual Counselling</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("KK")}
                                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${type === "KK"
                                    ? "border-upsi-navy bg-blue-50 text-upsi-navy ring-4 ring-blue-50"
                                    : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                                    }`}
                            >
                                <Users size={32} className="mb-2" />
                                <span className="font-bold">Kaunseling Kelompok (KK)</span>
                                <span className="text-xs opacity-70">Group Counselling</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Fields Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client/Group Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">
                                {type === "KI" ? "Client Number" : "Group Number"}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={3}
                                    placeholder="e.g. 001"
                                    value={clientNumber}
                                    onChange={(e) => setClientNumber(e.target.value.replace(/[^0-9]/g, ""))}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-upsi-navy outline-none transition-all font-mono text-xl tracking-widest text-upsi-navy font-bold"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                    3 Digits Max
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic">This will be padded with zeros automatically (e.g. 1 → 001)</p>
                        </div>

                        {/* Client/Group Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">
                                {type === "KI" ? "Client Full Name" : "Group Name / Identifier"}
                            </label>
                            <input
                                type="text"
                                placeholder={type === "KI" ? "e.g. Ahmad bin Ali" : "e.g. Group SPM 2024"}
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-upsi-navy outline-none transition-all text-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Smart Filing Preview */}
                    <div className="bg-upsi-navy/[0.03] rounded-2xl p-6 border border-upsi-navy/10">
                        <div className="flex items-center space-x-2 mb-4 text-upsi-grey">
                            <div className="w-8 h-8 rounded-full bg-upsi-gold flex items-center justify-center text-white">
                                <Info size={16} />
                            </div>
                            <h4 className="font-bold">Smart Registry Identifier</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Trainee Context:</span>
                                <span className="font-semibold text-gray-700 uppercase">{userProfile?.programType || "Practicum"} Traineee</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Clinical Prefix:</span>
                                <span className="font-bold text-upsi-navy">{typePrefix}{type}</span>
                            </div>
                            <div className="pt-4 border-t border-dashed border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Final Filing Path (Automation Preview)</p>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 font-mono text-lg text-upsi-navy font-bold break-all">
                                    {folderPath}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto flex items-center justify-center space-x-3 bg-upsi-navy text-white font-bold py-5 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={24} />
                                <span className="text-xl">Register & Initialize Folder</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ClientRegistrationPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading registration form...</div>}>
            <ClientRegistrationContent />
        </Suspense>
    );
}
