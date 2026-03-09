"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, AlertTriangle } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form5TerminationSessionPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Personal Data
    const [clientName, setClientName] = useState("");
    const [ethnic, setEthnic] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [position, setPosition] = useState("");
    const [diagnosis, setDiagnosis] = useState("");

    // Narrative Fields
    const [synopsis, setSynopsis] = useState("");
    const [evaluationCurrentFunctioning, setEvaluationCurrentFunctioning] = useState("");
    const [justificationTermination, setJustificationTermination] = useState("");
    const [summaryProgress, setSummaryProgress] = useState("");
    const [clinicalEvaluation, setClinicalEvaluation] = useState("");
    const [followUpPlan, setFollowUpPlan] = useState("");
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
                        const pd = formData.personalData || {};
                        setClientName(pd.clientName || "");
                        const [eth, sx] = (pd.ethnicGender || " / ").split(" / ");
                        setEthnic(eth || "");
                        setGender(sx || "");
                        setAge(pd.age || "");
                        setPosition(pd.position || "");
                        setDiagnosis(pd.diagnosis || "");
                        setSynopsis(formData.synopsis || "");
                        setEvaluationCurrentFunctioning(formData.evaluationCurrentFunctioning || "");
                        setJustificationTermination(formData.justificationTermination || "");
                        setSummaryProgress(formData.summaryProgress || "");
                        setClinicalEvaluation(formData.clinicalEvaluation || "");
                        setFollowUpPlan(formData.followUpPlan || "");
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
                        setGender(match.demographics.gender || "");
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
                date: new Date(),
                duration: 0,
                formType: "Form5" as const, // Official Form 5 is Termination
                formData: {
                    personalData: {
                        clientName,
                        ethnicGender: `${ethnic} / ${gender}`,
                        age,
                        position,
                        diagnosis
                    },
                    synopsis,
                    evaluationCurrentFunctioning,
                    justificationTermination,
                    summaryProgress,
                    clinicalEvaluation,
                    followUpPlan,
                    counsellorName
                },
                createdAt: new Date()
            };
            const { createdAt: _c5, ...firebaseSessionData } = sessionData;
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
                    alert("Termination Report & PDF saved successfully!");
                } catch (driveErr: any) {
                    alert(`⚠️ Report saved to Database, but Google Drive Upload Failed.`);
                }
            } else {
                alert("Termination Report saved to database!");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Termination Report.");
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
                        <AlertTriangle className="text-upsi-gold" size={28} />
                        <span>Form 5: TERMINATION SESSION</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-0 sm:p-4 md:p-8 space-y-8 bg-white">
                    <FormHeader
                        title="TERMINATION SESSION"
                        refCode="Termination_Session/KKMK_UPSI/05-2025"
                    />

                    <div className="bg-white space-y-6">
                        <h2 className="text-xl font-bold text-black uppercase underline underline-offset-4 mb-4">DEMOGRAPHIC INFORMATION</h2>
                        <div className="grid grid-cols-1 md:grid-cols-[220px_auto_1fr] gap-x-2 gap-y-4 md:gap-y-6 items-start md:items-center">
                            <div className="font-bold text-black uppercase text-sm md:py-2">Client Name</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Gender</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <select value={gender} onChange={e => setGender(e.target.value)} className={`${inputClasses} text-sm`}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            <div className="font-bold text-black uppercase text-sm md:py-2">Age</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Designation</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="text" value={position} onChange={e => setPosition(e.target.value)} className={inputClasses} placeholder="Counsellor Trainee" />

                            <div className="font-bold text-black uppercase text-sm md:py-2">Date of Report</div>
                            <div className="hidden md:block font-bold text-black text-center">:</div>
                            <input required type="date" className={inputClasses} />
                        </div>
                    </div>

                    <div className="space-y-12">
                        {[
                            { label: "Synopsis", value: synopsis, setter: setSynopsis, rows: 5 },
                            { label: "Evaluation of The Client's Current Functioning Level", value: evaluationCurrentFunctioning, setter: setEvaluationCurrentFunctioning, rows: 6 },
                            { label: "Justification for Termination", value: justificationTermination, setter: setJustificationTermination, rows: 6 },
                            { label: "Summary of Progress Towards Goals", value: summaryProgress, setter: setSummaryProgress, rows: 8 },
                            { label: "Clinical Evaluation", value: clinicalEvaluation, setter: setClinicalEvaluation, rows: 8 },
                            { label: "Follow Up Plan", value: followUpPlan, setter: setFollowUpPlan, rows: 6 }
                        ].map((f, i) => (
                            <div key={i} className="space-y-4">
                                <label className="text-xl font-bold text-black uppercase underline underline-offset-4 block mb-2">{f.label}</label>
                                <textarea required rows={f.rows} value={f.value} onChange={e => f.setter(e.target.value)} className={textareaClasses} />
                            </div>
                        ))}
                    </div>

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
                formName="Termination Session"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}

function Form5TerminationSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form5TerminationSessionPage {...props} />
        </Suspense>
    );
}

export default Form5TerminationSuspenseWrapper;
