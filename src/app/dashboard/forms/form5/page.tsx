"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, Flag } from "lucide-react";
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

    // React 19 Search Params Unwrapping
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

    // Auto-Mount URL Parameters
    useEffect(() => {
        async function fetchInitialData() {
            if (!user) return;

            // If we have a docId, we are EDITING
            if (docId) {
                try {
                    const sessDoc = await getDoc(doc(db, "sessions", docId));
                    if (sessDoc.exists()) {
                        const sessData = sessDoc.data();
                        const formData = sessData.formData;
                        const pd = formData.personalData;

                        setClientName(pd.clientName);
                        const [eth, sx] = pd.ethnicGender.split(" / ");
                        setEthnic(eth);
                        setGender(sx);
                        setAge(pd.age);
                        setPosition(pd.position);
                        setDiagnosis(pd.diagnosis);

                        setSynopsis(formData.synopsis);
                        setEvaluationCurrentFunctioning(formData.evaluationCurrentFunctioning);
                        setJustificationTermination(formData.justificationTermination);
                        setSummaryProgress(formData.summaryProgress);
                        setClinicalEvaluation(formData.clinicalEvaluation);
                        setFollowUpPlan(formData.followUpPlan);
                        setCounsellorName(formData.counselorName || formData.counsellorName);

                        // Also fetch client to keep state consistent
                        const clientDoc = await getDoc(doc(db, "clients", sessData.clientId));
                        if (clientDoc.exists()) {
                            setSelectedClient({ id: clientDoc.id, ...clientDoc.data() } as Client);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load session for editing", error);
                }
                return;
            }

            // REGULAR PREFILL FOR NEW SESSION
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

    // Narrative Fields
    const [synopsis, setSynopsis] = useState("");
    const [evaluationCurrentFunctioning, setEvaluationCurrentFunctioning] = useState("");
    const [justificationTermination, setJustificationTermination] = useState("");
    const [summaryProgress, setSummaryProgress] = useState("");
    const [clinicalEvaluation, setClinicalEvaluation] = useState("");
    const [followUpPlan, setFollowUpPlan] = useState("");

    // Footer
    const [counsellorName, setCounsellorName] = useState("");

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
                formType: "Form5" as const,
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
            // 1. Save to Firebase
            const { createdAt: _c5, ...firebaseSessionData } = sessionData;
            let savedSessionId = docId;
            if (docId) {
                await updateSession(docId, firebaseSessionData);
            } else {
                const docRef = await addSession(firebaseSessionData);
                savedSessionId = docRef.id;
            }

            // 1.5 Sync with Logbook
            await syncSessionWithLog({
                ...firebaseSessionData,
                id: savedSessionId!,
                date: sessionData.date
            } as Session & { id: string });
            // 2. Generate and Upload PDF to 3-Layer Drive
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
                    alert("Termination Session & PDF saved to Google Drive successfully!");
                } catch (driveErr: any) {
                    if (driveErr.message === "UNAUTHORIZED_DRIVE_ACCESS") {
                        localStorage.removeItem("googleDriveToken");
                        alert("Google Drive session expired. Your report was saved to the database, but the PDF upload failed. Please log out and back in to re-authorize Google Drive.");
                    } else {
                        console.error("Drive upload failed:", driveErr);
                        alert(`⚠️ Report saved to Database successfully, but Google Drive Upload Failed. \n\nDrive Error: ${driveErr.message || driveErr}`);
                    }
                }
            } else {
                alert("Termination Session saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Termination Session.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white";
    const sectionClasses = "space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100";
    const labelClasses = "text-lg font-bold text-gray-800 border-b-2 border-upsi-red pb-1 inline-block mb-2";

    const renderTextarea = (label: string, stateValue: string, setter: (val: string) => void, rows: number = 6) => (
        <div className={sectionClasses}>
            <label className={labelClasses}>{label}</label>
            <textarea
                required
                rows={rows}
                value={stateValue}
                onChange={e => setter(e.target.value)}
                className={textareaClasses}
            />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden">
                <div className="bg-upsi-navy px-8 py-6 border-b-4 border-upsi-gold flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                            <Flag className="text-white" size={28} />
                            <span>Form 5: Termination Session</span>
                        </h1>
                        <p className="text-blue-100 mt-1">Official counselling termination and final clinical evaluation.</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-blue-800">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white overflow-x-auto">
                    <FormHeader
                        title="Termination of Counselling Session"
                        refCode="Termination_Session/KKMK_UPSI/05-2025"
                    />

                    {/* Demographic Information Section Group */}
                    <div className="bg-gray-50 p-6 xl:p-8 rounded-xl border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide underline underline-offset-4">DEMOGRAPHIC INFORMATION</h2>

                        <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-y-4 gap-x-2 items-center">

                            <div className="font-bold text-gray-800 text-sm md:text-base">Client Name</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} placeholder="Enter Client's Name" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Gender</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div className="flex space-x-2 items-center w-full">
                                <select required value={gender} onChange={e => setGender(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white w-full">
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Age</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} placeholder="e.g. 24" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Ethnic</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div className="flex space-x-2 items-center w-full">
                                <select required value={ethnic} onChange={e => setEthnic(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white w-full">
                                    <option value="" disabled>Select Ethnic</option>
                                    <option value="Malay">Malay</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Bumiputera - Sarawak">Bumiputera - Sarawak</option>
                                    <option value="Bumiputera - Sabah">Bumiputera - Sabah</option>
                                    <option value="Orang Asli">Orang Asli</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Position</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={position} onChange={e => setPosition(e.target.value)} className={inputClasses} placeholder="e.g. Undergraduate Student" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Diagnosis</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className={inputClasses} placeholder="e.g. Major Depressive Disorder" /></div>

                        </div>
                    </div>

                    {/* Narrative Sections */}
                    <div className="mt-8 space-y-12">
                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide underline underline-offset-8 decoration-2 mb-10 text-center">TERMINATION RECORD</h2>

                        <div className="space-y-8">
                            {[
                                { label: "Synopsis", value: synopsis, setter: setSynopsis, rows: 5 },
                                { label: "Evaluation of The Client's Current Functioning Level", value: evaluationCurrentFunctioning, setter: setEvaluationCurrentFunctioning, rows: 6 },
                                { label: "Justification for Termination", value: justificationTermination, setter: setJustificationTermination, rows: 6 },
                                { label: "Summary of Progress Towards Goals (Including final diagnostic impression)", value: summaryProgress, setter: setSummaryProgress, rows: 8 },
                                { label: "Clinical Evaluation", value: clinicalEvaluation, setter: setClinicalEvaluation, rows: 8 },
                                { label: "Follow Up Plan", value: followUpPlan, setter: setFollowUpPlan, rows: 6 }
                            ].map((field, idx) => (
                                <div key={idx} className="space-y-4">
                                    <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4 decoration-1">
                                        {field.label}
                                    </label>
                                    <textarea
                                        required
                                        rows={field.rows}
                                        value={field.value}
                                        onChange={e => field.setter(e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white shadow-sm"
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="pt-10 pb-4 mt-12 w-full">
                        <div className="mb-6 flex flex-col items-start max-w-sm">
                            <h3 className="text-gray-900 font-bold mb-4 uppercase underline underline-offset-4">Report by:</h3>
                            <div className="w-80">
                                <div className="border-b-2 border-dotted border-gray-400 w-full mb-3 h-8"></div>
                                <div className="flex justify-between items-center w-full px-1">
                                    <span className="text-gray-800 font-bold text-lg">(</span>
                                    <input
                                        required
                                        type="text"
                                        value={counsellorName}
                                        onChange={e => setCounsellorName(e.target.value)}
                                        className="bg-transparent outline-none flex-1 text-center font-bold text-gray-800 placeholder-gray-400 py-1"
                                        placeholder="Enter Full Name"
                                    />
                                    <span className="text-gray-800 font-bold text-lg">)</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-700 text-sm space-y-1 font-bold">
                            <p>CMCH Counselor Trainee</p>
                            <p className="font-normal">Universiti Pendidikan Sultan Idris</p>
                            <p className="font-normal">35900 Tanjong Malim, Perak</p>
                        </div>

                        <div className="mt-16 text-center w-full pt-4 border-t border-dashed border-gray-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                                Confidential Document (For Professional Use Only)
                            </p>
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
function Form5TerminationSessionSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form5TerminationSessionPage {...props} />
        </Suspense>
    );
}

export default Form5TerminationSessionSuspenseWrapper;
