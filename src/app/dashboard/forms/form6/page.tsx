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
        <div className="max-w-4xl mx-auto pb-12 print:pb-0">
            <div className="bg-white overflow-hidden">
                <div className="bg-white px-8 py-6 border-b-4 border-upsi-gold no-print">
                    <h1 className="text-2xl font-bold text-black flex items-center space-x-3">
                        <ShieldAlert className="text-upsi-gold" size={28} />
                        <span>Form 6: CRISIS INTERVENTION REPORT</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-0 sm:p-4 md:p-8 space-y-8 bg-white">
                    <FormHeader
                        title="CRISIS INTERVENTION REPORT"
                        refCode="Crisis_Intervention_Report/KKMK_UPSI/06-2025"
                    />

                    <div className="bg-white space-y-6">
                        <h2 className="text-xl font-bold text-black uppercase underline underline-offset-4 mb-4">DEMOGRAPHIC INFORMATION</h2>
                        <div className="grid grid-cols-1 md:grid-cols-[220px_auto_1fr] gap-x-2 gap-y-4 md:gap-y-6 items-start md:items-center">
                            <div className="font-bold text-black uppercase text-sm md:py-2">Client Name</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Age</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Date</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Designation</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" className={inputClasses} placeholder="Counsellor Trainee" />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Date of Report</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="date" className={inputClasses} />
                        </div>
                    </div>

                    {[
                        { label: "Description of Crisis", value: crisisDescription, setter: setCrisisDescription, rows: 5 },
                        { label: "Intervention Steps Taken", value: interventionSteps, setter: setInterventionSteps, rows: 6 },
                        { label: "Initial Outcome", value: outcome, setter: setOutcome, rows: 4 },
                        { label: "Follow-up Required", value: followUpRequired, setter: setFollowUpRequired, rows: 4 }
                    ].map((f, i) => (
                        <div key={i} className="space-y-2">
                            <label className="text-xl font-bold text-black uppercase underline underline-offset-4 block mb-2">{f.label}</label>
                            <textarea required rows={f.rows} value={f.value} onChange={e => f.setter(e.target.value)} className={textareaClasses} />
                        </div>
                    ))}

                    {/* Report By Section */}
                    <div className="pt-10 pb-4 mt-12 w-full">
                        <div className="mt-4 w-full">
                            <h3 className="text-black font-bold mb-8 uppercase text-sm">REPORT BY:</h3>
                            <div className="w-full max-w-md">
                                <div className="border-b-2 border-dotted border-black w-full mb-3 h-8"></div>
                                <div className="flex justify-between items-center w-full px-1 mb-8">
                                    <span className="text-black font-bold text-lg">(</span>
                                    <input
                                        required
                                        type="text"
                                        defaultValue={counsellorName}
                                        className="bg-transparent outline-none flex-1 text-center font-bold text-black placeholder-gray-400 py-1 uppercase text-sm"
                                        placeholder="Enter Full Name"
                                    />
                                    <span className="text-black font-bold text-lg">)</span>
                                </div>
                                <div className="text-black text-[11px] sm:text-xs space-y-1 font-bold">
                                    <p className="uppercase font-bold">CMCH Counselor Trainee</p>
                                    <p className="uppercase font-normal tracking-tight">Universiti Pendidikan Sultan Idris</p>
                                    <p className="uppercase font-normal tracking-tight">35900 Tanjong Malim, Perak</p>
                                </div>
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
