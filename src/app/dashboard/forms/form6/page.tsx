"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, ShieldAlert } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form6CrisisInterventionPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Personal Data
    const [clientName, setClientName] = useState("");
    const [age, setAge] = useState("");
    const [date, setDate] = useState("");

    // Clinical Fields
    const [crisisDescription, setCrisisDescription] = useState("");
    const [interventionSteps, setInterventionSteps] = useState("");
    const [outcome, setOutcome] = useState("");
    const [followUpRequired, setFollowUpRequired] = useState("");
    const [counsellorName, setCounsellorName] = useState("");

    useEffect(() => {
        async function fetchInitialData() {
            if (!user) return;
            if (docId) {
                try {
                    const sessDoc = await getDoc(doc(db, "sessions", docId));
                    if (sessDoc.exists()) {
                        const sessData = sessDoc.data();
                        const formData = sessData.formData;
                        setClientName(formData.clientName || "");
                        setAge(formData.age || "");
                        setDate(formData.date || "");
                        setCrisisDescription(formData.crisisDescription || "");
                        setInterventionSteps(formData.interventionSteps || "");
                        setOutcome(formData.outcome || "");
                        setFollowUpRequired(formData.followUpRequired || "");
                        setCounsellorName(formData.counselorName || formData.counsellorName || "");

                        const clientDoc = await getDoc(doc(db, "clients", sessData.clientId));
                        if (clientDoc.exists()) {
                            setSelectedClient({ id: clientDoc.id, ...clientDoc.data() } as Client);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load session", error);
                }
                return;
            }

            if (prefillClientId && !selectedClient) {
                try {
                    const clientDoc = await getDoc(doc(db, "clients", prefillClientId));
                    if (clientDoc.exists()) {
                        const match = { id: clientDoc.id, ...clientDoc.data() } as Client;
                        setSelectedClient(match);
                        setClientName(match.demographics.name || "");
                        setAge(match.demographics.age?.toString() || "");
                    }
                } catch (error) {
                    console.error("Failed to auto-load URL client", error);
                }
            }
        }
        fetchInitialData();
    }, [user, prefillClientId, docId]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const effectiveClient = selectedClient ?? ({
            id: `manual-${Date.now()}`,
            clientId: "000",
            type: "KI" as const,
            demographics: { name: clientName }
        } as Client);

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: `C${Date.now()}`,
                clientId: effectiveClient.id!,
                traineeId: user.uid,
                date: new Date(date || Date.now()),
                duration: 0,
                formType: "Form6" as const, // Official Form 6 is Crisis Intervention
                formData: {
                    clientName,
                    age,
                    date,
                    crisisDescription,
                    interventionSteps,
                    outcome,
                    followUpRequired,
                    counsellorName
                },
                createdAt: new Date()
            };

            const { createdAt: _c6, ...firebaseSessionData } = sessionData;
            let savedSessionId = docId;
            if (docId) {
                await updateSession(docId, firebaseSessionData);
            } else {
                const docRef = await addSession(firebaseSessionData);
                savedSessionId = docRef.id;
            }

            await syncSessionWithLog({
                ...firebaseSessionData,
                id: savedSessionId!,
                date: sessionData.date
            } as Session & { id: string });

            const driveToken = localStorage.getItem("googleDriveToken");
            if (driveToken) {
                try {
                    const { generateSessionPDF } = await import("@/lib/pdf/generatePDF");
                    const { buildClinicalId, uploadToGoogleDrive } = await import("@/lib/drive/saveToDrive");
                    const clinicalId = buildClinicalId(
                        userProfile?.programType ?? null,
                        effectiveClient.type,
                        userProfile?.matricNumber || user.uid
                    );
                    const pdfBlob = await generateSessionPDF(sessionData, effectiveClient, clinicalId);
                    await uploadToGoogleDrive(
                        driveToken,
                        pdfBlob,
                        clinicalId,
                        effectiveClient.clientId,
                        sessionData.sessionId
                    );
                    alert("Crisis Report saved to Google Drive successfully!");
                } catch (driveErr: any) {
                    alert(`⚠️ Report saved to Database, but Google Drive Upload Failed.`);
                }
            } else {
                alert("Crisis Report saved to database!");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Crisis Report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white";

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-white px-8 py-6 border-b-4 border-upsi-gold no-print">
                    <h1 className="text-2xl font-bold text-black flex items-center space-x-3">
                        <ShieldAlert className="text-upsi-gold" size={28} />
                        <span>Form 6: CRISIS INTERVENTION REPORT</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white overflow-x-auto">
                    <FormHeader
                        title="CRISIS INTERVENTION REPORT"
                        refCode="Crisis_Intervention_Report/KKMK_UPSI/06-2025"
                    />

                    <div className="bg-white p-6 border-2 border-black space-y-6">
                        <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-4 items-center">
                            <div className="font-bold text-black uppercase">Client Name</div><div className="font-bold">:</div>
                            <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase">Age</div><div className="font-bold">:</div>
                            <input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase">Date</div><div className="font-bold">:</div>
                            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    {[
                        { label: "Description of Crisis", value: crisisDescription, setter: setCrisisDescription, rows: 5 },
                        { label: "Intervention Steps Taken", value: interventionSteps, setter: setInterventionSteps, rows: 6 },
                        { label: "Initial Outcome", value: outcome, setter: setOutcome, rows: 4 },
                        { label: "Follow-up Required", value: followUpRequired, setter: setFollowUpRequired, rows: 4 }
                    ].map((f, i) => (
                        <div key={i} className="space-y-2">
                            <label className="text-lg font-bold text-black uppercase border-b-2 border-black pb-1 inline-block">{f.label}</label>
                            <textarea required rows={f.rows} value={f.value} onChange={e => f.setter(e.target.value)} className={textareaClasses} />
                        </div>
                    ))}

                    <div className="pt-10">
                        <div className="mb-6 flex flex-col items-start max-w-sm">
                            <h3 className="text-black font-bold mb-4 uppercase text-sm">Report by:</h3>
                            <div className="w-80 border-b-2 border-dotted border-black">
                                <input required type="text" value={counsellorName} onChange={e => setCounsellorName(e.target.value)} className="w-full bg-transparent outline-none text-center font-bold text-black py-1 uppercase" placeholder="Enter Full Name" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <FormActionBar
                formName="Crisis Intervention"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}

function Form6CrisisSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form6CrisisInterventionPage {...props} />
        </Suspense>
    );
}

export default Form6CrisisSuspenseWrapper;
