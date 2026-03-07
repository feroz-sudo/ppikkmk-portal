"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, FileText } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Form2ProgressiveNotesPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    // React 19 Search Params Unwrapping
    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const prefillSessionId = unwrappedSearch.sessionId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Personal Data
    const [clientFullName, setClientFullName] = useState("");
    const [sessionNumber, setSessionNumber] = useState("01");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [dateOfReport, setDateOfReport] = useState(new Date().toISOString().split("T")[0]);
    const [diagnosis, setDiagnosis] = useState("");
    const [duration, setDuration] = useState("1.0");

    // Auto-Mount URL Parameters
    useEffect(() => {
        if (prefillSessionId) {
            setSessionNumber(prefillSessionId);
        }
    }, [prefillSessionId]);

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

                        setSessionNumber(sessData.sessionId);
                        const [sDate, sTime] = pd.sessionDateTime.split(" ");
                        setSessionDate(sDate);
                        setSessionTime(sTime);
                        setClientFullName(pd.clientFullName);
                        setDateOfReport(pd.dateOfReport);
                        setDiagnosis(pd.diagnosis);
                        setDuration(pd.duration || "1.0");

                        setSubjective(formData.subjective);
                        setObjective(formData.objective);
                        setAssessment(formData.assessment);
                        setPlan(formData.plan);
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
                        setClientFullName(match.demographics.name || "");
                    }
                } catch (error) {
                    console.error("Failed to auto-load URL client", error);
                }
            }
        }
        fetchInitialData();
    }, [user, prefillClientId, docId]);

    // SOAP Narrative Fields
    const [subjective, setSubjective] = useState("");
    const [objective, setObjective] = useState("");
    const [assessment, setAssessment] = useState("");
    const [plan, setPlan] = useState("");

    // Footer
    const [counsellorName, setCounsellorName] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const effectiveClient = selectedClient ?? ({
            id: `manual-${Date.now()}`,
            clientId: sessionNumber || "000",
            type: "KI" as const,
            demographics: { name: clientFullName }
        } as Client);

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: sessionNumber, // Overridden to use actual user input rather than timestamp
                clientId: effectiveClient.id!,
                traineeId: user.uid,
                date: new Date(`${sessionDate}T${sessionTime || "00:00"}`),
                duration: parseFloat(duration) || 1.0,
                formType: "Form2" as const,
                formData: {
                    personalData: {
                        sessionNumber,
                        sessionDateTime: `${sessionDate} ${sessionTime}`,
                        clientFullName,
                        dateOfReport,
                        diagnosis,
                        duration
                    },
                    subjective,
                    objective,
                    assessment,
                    plan,
                    counsellorName
                },
                createdAt: new Date()
            };

            // 1. Save to Firebase
            // Note: addSession expects Omit<Session, "createdAt"> but we need the full session object for the PDF
            // so we pass the constructed object minus createdAt to the db function, and use the full one for PDF
            // 1. Save to Firebase
            const { createdAt, ...firebaseSessionData } = sessionData;
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
                date: sessionData.date // Ensure we pass the Date object
            } as Session & { id: string });

            // 2. Generate and Upload PDF to 3-Layer Drive 
            // [TraineeID] / [ClientCode] / [SessionID]
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
                    alert("Progressive Notes & PDF saved to Google Drive successfully!");
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
                alert("Progressive Notes saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }

            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save to database.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white";
    const sectionClasses = "space-y-3 bg-white py-4";
    const labelClasses = "text-lg font-bold text-black border-b-2 border-black pb-1 inline-block mb-2";

    const renderTextarea = (label: string, stateValue: string, setter: (val: string) => void, rows: number = 8) => (
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
                <div className="bg-white px-8 py-6 border-b-4 border-upsi-gold flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-upsi-navy flex items-center space-x-3">
                            <FileText className="text-upsi-gold" size={28} />
                            <span>Form 2: PROGRESSIVE NOTES</span>
                        </h1>
                        <p className="text-slate-500 mt-1">S.O.A.P Format (Subjective, Objective, Assessment, Plan)</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-blue-800">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
                    <FormHeader
                        title="PROGRESSIVE NOTES"
                        refCode="Progressive_Notes/KKMK_UPSI/02-2025"
                    />

                    {/* Personal Data Section Group */}
                    <div className="bg-white p-6 xl:p-8 border-2 border-black space-y-6">
                        <h2 className="text-xl font-bold text-black uppercase tracking-wide">PERSONAL DATA</h2>

                        <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-y-4 gap-x-2 items-center">

                            <div className="font-bold text-black text-sm md:text-base uppercase">Session Number</div>
                            <div className="font-bold text-black">:</div>
                            <div><input required type="text" value={sessionNumber} onChange={e => setSessionNumber(e.target.value)} className={inputClasses} placeholder="e.g. 02" /></div>

                            <div className="font-bold text-black text-sm md:text-base uppercase">Session Date & Time</div>
                            <div className="font-bold text-black">:</div>
                            <div className="flex space-x-2">
                                <input required type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className={`${inputClasses} flex-1`} />
                                <input required type="time" value={sessionTime} onChange={e => setSessionTime(e.target.value)} className={`${inputClasses} flex-1`} />
                            </div>

                            <div className="font-bold text-black text-sm md:text-base uppercase">Duration (Hours)</div>
                            <div className="font-bold text-black">:</div>
                            <div><input required type="number" step="0.5" min="0.5" value={duration} onChange={e => setDuration(e.target.value)} className={inputClasses} placeholder="e.g. 1.0" /></div>

                            <div className="font-bold text-black text-sm md:text-base uppercase">Client Full Name</div>
                            <div className="font-bold text-black">:</div>
                            <div><input required type="text" value={clientFullName} onChange={e => setClientFullName(e.target.value)} className={inputClasses} placeholder="Enter Client's Actual Name" /></div>

                            <div className="font-bold text-black text-sm md:text-base uppercase">Date of Report</div>
                            <div className="font-bold text-black">:</div>
                            <div><input required type="date" value={dateOfReport} onChange={e => setDateOfReport(e.target.value)} className={inputClasses} /></div>

                            <div className="font-bold text-black text-sm md:text-base uppercase">Diagnosis</div>
                            <div className="font-bold text-black">:</div>
                            <div><input required type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className={inputClasses} placeholder="e.g. Major Depressive Disorder" /></div>

                        </div>
                    </div>

                    {/* SOAP Narrative Sections */}
                    <div className="space-y-3 bg-white p-2 border-none">
                        <label className="text-lg font-bold text-black uppercase border-b-2 border-black pb-1 inline-block mb-2">SUBJECTIVE (S)</label>
                        <textarea required rows={8} value={subjective} onChange={e => setSubjective(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">OBJECTIVE (O)</label>
                        <textarea required rows={8} value={objective} onChange={e => setObjective(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">ASSESSMENT (A)</label>
                        <textarea required rows={8} value={assessment} onChange={e => setAssessment(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">PLAN (P)</label>
                        <textarea required rows={8} value={plan} onChange={e => setPlan(e.target.value)} className={textareaClasses} />
                    </div>

                    {/* Footer Section */}
                    <div className="pt-10 pb-4 mt-12 w-full">
                        <div className="mb-6 flex flex-col items-start max-w-sm">
                            <h3 className="text-black font-bold mb-4 uppercase">Report by:</h3>
                            <div className="w-80">
                                <div className="border-b-2 border-dotted border-black w-full mb-3 h-8"></div>
                                <div className="flex justify-between items-center w-full px-1">
                                    <span className="text-black font-bold text-lg">(</span>
                                    <input
                                        required
                                        type="text"
                                        value={counsellorName}
                                        onChange={e => setCounsellorName(e.target.value)}
                                        className="bg-transparent outline-none flex-1 text-center font-bold text-black placeholder-gray-400 py-1 uppercase"
                                        placeholder="Enter Full Name"
                                    />
                                    <span className="text-black font-bold text-lg">)</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-700 text-sm space-y-1 font-bold">
                            <p>CMCH Counselor Trainee</p>
                            <p className="font-normal">Universiti Pendidikan Sultan Idris</p>
                            <p className="font-normal">35900 Tanjong Malim, Perak</p>
                            <p className="text-upsi-navy font-black mt-1 uppercase">WWW.PPIKKMK.COM</p>
                        </div>

                        <div className="mt-12 bg-white p-6 border-2 border-black text-sm text-black space-y-4">
                            <h4 className="font-bold text-black uppercase border-b-2 border-black pb-2">Guiding Notes for Writing SOAP Note</h4>
                            <p className="italic text-gray-500 mb-2">The Four Parts of a SOAP Note</p>
                            <div>
                                <p className="font-bold text-black uppercase">1. Subjective</p>
                                <p className="mt-1">The subjective component of a SOAP note focuses on the patient&apos;s personal experiences, feelings, and concerns. This section should include details about the patient&apos;s chief complaint, history of present illness, medical and family history, and any relevant social or environmental factors. When writing the subjective portion, it&apos;s essential to use the patient&apos;s words as much as possible to accurately convey their perspective.</p>
                            </div>
                            <div>
                                <p className="font-bold text-black uppercase">2. Objective</p>
                                <p className="mt-1">The objective section of a SOAP note records observable data and factual information about the patient. This can include vital signs, physical examination findings, laboratory results, and any additional diagnostic data. In the context of mental health treatment, the objective section may also include details about the patient&apos;s appearance, behavior, and speech patterns.</p>
                            </div>
                            <div>
                                <p className="font-bold text-black uppercase">3. Assessment</p>
                                <p className="mt-1">The assessment portion of a SOAP note is where the healthcare provider evaluates the information gathered during the subjective and objective sections. This section may include a diagnosis, a summary of the patient&apos;s progress, and any potential risk factors or complications. In the case of anxiety and depression, the assessment might focus on the severity of symptoms, the effectiveness of current interventions, and any co-occurring conditions.</p>
                            </div>
                            <div>
                                <p className="font-bold text-black uppercase">4. Plan</p>
                                <p className="mt-1">The plan section outlines the next steps in the patient&apos;s treatment, including any changes to their current interventions or the addition of new therapies. For anxiety and depression, this might involve adjustments to medications, the introduction of new coping strategies, or referrals to additional support services.</p>
                            </div>
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
                formName="Progressive Notes"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
