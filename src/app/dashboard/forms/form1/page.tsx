"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, ClipboardList, AlertCircle } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";

// Extract the inner form to use useSearchParams safely
function Form1IntakeContent() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const prefillClientId = searchParams.get("clientId") || undefined;
    const prefillSessionId = searchParams.get("sessionId") || undefined;
    const docId = searchParams.get("docId") || undefined;

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [debugMsg, setDebugMsg] = useState<string>("Initializing...");

    // Personal Data
    const [clientFullName, setClientFullName] = useState("");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [sessionNumber, setSessionNumber] = useState("01");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [ethnic, setEthnic] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [icNumber, setIcNumber] = useState("");
    const [designation, setDesignation] = useState("");
    const [dateOfReport, setDateOfReport] = useState(new Date().toISOString().split("T")[0]);

    // Auto-Mount URL Parameters & Load for Editing
    useEffect(() => {
        if (prefillSessionId) {
            setSessionNumber(prefillSessionId);
        }
    }, [prefillSessionId]);

    useEffect(() => {
        async function fetchInitialData() {
            if (!user) {
                setDebugMsg("Waiting for authentication state...");
                return;
            }

            // If we have a docId, we are EDITING
            if (docId) {
                setDebugMsg(`Editing session ${docId}...`);
                try {
                    const sessDoc = await getDoc(doc(db, "sessions", docId));
                    if (sessDoc.exists()) {
                        const sessData = sessDoc.data();
                        const formData = sessData.formData;
                        const pd = formData.personalData;

                        setSessionNumber(sessData.sessionId);
                        setClientFullName(pd.clientFullName);
                        const [sDate, sTime] = pd.sessionDateTime.split(" ");
                        setSessionDate(sDate);
                        setSessionTime(sTime);

                        const [eth, sx] = pd.ethnicSex.split(" / ");
                        setEthnic(eth);
                        setSex(sx);

                        setAge(pd.age);
                        setDateOfBirth(pd.dateOfBirth);
                        setIcNumber(pd.icNumber);
                        setDesignation(pd.designation);
                        setDateOfReport(pd.dateOfReport);

                        setReasonForReferral(formData.reasonForReferral);
                        setBehaviourObservation(formData.behaviourObservation);
                        setHistoryOfPresentingIssues(formData.historyOfPresentingIssues);
                        setPsychiatricHistory(formData.psychiatricHistory);
                        setMedicalHistory(formData.medicalHistory);
                        setFamilyHistory(formData.familyHistory);
                        setDevelopmentalHistory(formData.developmentalHistory);
                        setSocialHistory(formData.socialHistory);
                        setSubstanceUseHistory(formData.substanceUseHistory);
                        setCurrentSituationFunctioning(formData.currentSituationFunctioning);
                        setAssessmentResult(formData.assessmentResult);
                        setClinicalJudgement(formData.clinicalJudgement);
                        setDiagnosticImpression(formData.diagnosticImpression);
                        setGoalsOfSession(formData.GoalsOfSession);
                        setTreatmentPlanning(formData.treatmentPlanning);
                        setCounselorName(formData.counselorName);

                        // Also fetch client to keep state consistent
                        const clientDoc = await getDoc(doc(db, "clients", sessData.clientId));
                        if (clientDoc.exists()) {
                            setSelectedClient({ id: clientDoc.id, ...clientDoc.data() } as Client);
                        }

                        setDebugMsg("Session data loaded for editing.");
                    }
                } catch (error: any) {
                    console.error("Failed to load session for editing", error);
                    setDebugMsg(`Error loading session: ${error.message}`);
                }
                return;
            }

            // REGULAR PREFILL FOR NEW SESSION
            setDebugMsg(`Client ID in URL: ${prefillClientId || 'None'}`);
            if (prefillClientId && !selectedClient) {
                setDebugMsg(`Fetching client ${prefillClientId}...`);
                try {
                    const clientDoc = await getDoc(doc(db, "clients", prefillClientId));
                    if (clientDoc.exists()) {
                        const match = { id: clientDoc.id, ...clientDoc.data() } as Client;
                        setSelectedClient(match);
                        setClientFullName(match.demographics.name || "");
                        setAge(match.demographics.age?.toString() || "");
                        setSex(match.demographics.gender || "");
                        setDebugMsg(`Client ${match.demographics.name} loaded successfully.`);
                    } else {
                        setDebugMsg(`Client document does not exist in Firestore!`);
                    }
                } catch (error: any) {
                    console.error("Failed to auto-load URL client", error);
                    setDebugMsg(`Error loading client: ${error.message}`);
                }
            } else if (!prefillClientId) {
                setDebugMsg("No Client ID provided in URL. Please select manually.");
            }
        }
        fetchInitialData();
    }, [prefillClientId, docId, user]);

    // Narrative Fields
    const [reasonForReferral, setReasonForReferral] = useState("");
    const [behaviourObservation, setBehaviourObservation] = useState("");
    const [historyOfPresentingIssues, setHistoryOfPresentingIssues] = useState("");
    const [psychiatricHistory, setPsychiatricHistory] = useState("");
    const [medicalHistory, setMedicalHistory] = useState("");
    const [familyHistory, setFamilyHistory] = useState("");
    const [developmentalHistory, setDevelopmentalHistory] = useState("");
    const [socialHistory, setSocialHistory] = useState("");
    const [substanceUseHistory, setSubstanceUseHistory] = useState("");
    const [currentSituationFunctioning, setCurrentSituationFunctioning] = useState("");
    const [assessmentResult, setAssessmentResult] = useState("");
    const [clinicalJudgement, setClinicalJudgement] = useState("");
    const [diagnosticImpression, setDiagnosticImpression] = useState("");
    const [goalsOfSession, setGoalsOfSession] = useState("");
    const [treatmentPlanning, setTreatmentPlanning] = useState("");
    const [counselorName, setCounselorName] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Build a synthetic client if none was pre-selected
        const effectiveClient = selectedClient ?? ({
            id: `manual-${Date.now()}`,
            clientId: sessionNumber || "000",
            type: "KI" as const,
            demographics: { name: clientFullName, age: Number(age) || 0, gender: sex }
        } as Client);

        setIsSubmitting(true);
        try {
            let safeDate = new Date();
            const parsed = new Date(`${sessionDate}T${sessionTime || "00:00"}`);
            if (!isNaN(parsed.getTime())) safeDate = parsed;

            const sessionData = {
                sessionId: sessionNumber,
                clientId: effectiveClient.id!,
                traineeId: user.uid,
                date: safeDate,
                duration: 1.5,
                formType: "Form1" as const,
                formData: {
                    personalData: {
                        sessionNumber,
                        sessionDateTime: `${sessionDate} ${sessionTime}`,
                        clientFullName: clientFullName,
                        ethnicSex: `${ethnic} / ${sex}`,
                        dateOfBirth,
                        icNumber,
                        age: age,
                        designation,
                        dateOfReport
                    },
                    reasonForReferral,
                    behaviourObservation,
                    historyOfPresentingIssues,
                    psychiatricHistory,
                    medicalHistory,
                    familyHistory,
                    developmentalHistory,
                    socialHistory,
                    substanceUseHistory,
                    currentSituationFunctioning,
                    assessmentResult,
                    clinicalJudgement,
                    diagnosticImpression,
                    GoalsOfSession: goalsOfSession, // Note: The UI label uses this, we map it safely
                    treatmentPlanning,
                    counselorName
                },
                createdAt: new Date()
            };

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
                date: sessionData.date
            } as Session & { id: string });

            // 2. Generate and Upload PDF to 3-Layer Drive 
            try {
                const driveToken = localStorage.getItem("googleDriveToken");
                if (driveToken) {
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
                    alert("Intake Report & PDF saved to Google Drive successfully!");
                } else {
                    alert("Intake Report saved to database! (PDF Skipped: No Google Drive authorization. Please log out and back in to grant permission).");
                }
            } catch (driveErr: any) {
                if (driveErr.message === "UNAUTHORIZED_DRIVE_ACCESS") {
                    localStorage.removeItem("googleDriveToken");
                    alert("Google Drive session expired. Your report was saved to the database, but the PDF upload failed. Please log out and back in to re-authorize Google Drive.");
                } else {
                    console.error("Drive upload failed:", driveErr);
                    alert(`⚠️ Report saved to Database successfully, but Google Drive Upload Failed. \n\nDrive Error: ${driveErr.message || driveErr}`);
                }
            }

            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error: any) {
            console.error("Form Submission Error:", error);
            alert(`Failed to save to database: ${error.message || "Unknown error occurred."}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700";
    const sectionClasses = "space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100";
    const labelClasses = "text-lg font-bold text-black border-b-2 border-black pb-1 inline-block mb-2";

    const renderTextarea = (label: string, stateValue: string, setter: (val: string) => void, rows: number = 4) => (
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-neutral-900 px-8 py-6 border-b-4 border-neutral-800 flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                            <ClipboardList className="text-white" size={28} />
                            <span>Form 1: Psychological Intake Report</span>
                        </h1>
                        <p className="text-neutral-400 mt-1">First session report mapping directly to official clinical counselling requirements.</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-neutral-700">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <FormHeader
                        title="Psychological Intake Report"
                        refCode="Psychological_Intake_Report/KKMK_UPSI/01-2025"
                    />

                    {/* Personal Data Section Group */}
                    <div className="bg-gray-50 p-6 xl:p-8 rounded-xl border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide underline underline-offset-4">PERSONAL DATA</h2>

                        <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-y-4 gap-x-2 items-center">

                            {/* Session Number */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Session Number</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={sessionNumber} onChange={e => setSessionNumber(e.target.value)} className={inputClasses} placeholder="e.g. 01" /></div>

                            {/* Session Date & Time */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Session Date & Time</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div className="flex space-x-2">
                                <input required type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className={`${inputClasses} flex-1`} />
                                <input required type="time" value={sessionTime} onChange={e => setSessionTime(e.target.value)} className={`${inputClasses} flex-1`} />
                            </div>

                            {/* Client Full Name */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Client Full Name</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={clientFullName} onChange={e => setClientFullName(e.target.value)} className={inputClasses} placeholder="Enter Client's Actual Name" /></div>

                            {/* Ethnic/Sex */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Ethnic/Sex</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div className="flex space-x-2 items-center w-full">
                                <select required value={ethnic} onChange={e => setEthnic(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white w-2/3">
                                    <option value="" disabled>Select Ethnic</option>
                                    <option value="Malay">Malay</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Bumiputera - Sarawak">Bumiputera - Sarawak</option>
                                    <option value="Bumiputera - Sabah">Bumiputera - Sabah</option>
                                    <option value="Orang Asli">Orang Asli</option>
                                    <option value="Others">Others</option>
                                </select>
                                <span className="text-gray-400">/</span>
                                <select required value={sex} onChange={e => setSex(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white w-1/3 text-center">
                                    <option value="" disabled>Select Sex</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Date of Birth */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Date of Birth</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputClasses} /></div>

                            {/* Identification Card No */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Identification Card No</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={icNumber} onChange={e => setIcNumber(e.target.value)} className={inputClasses} placeholder="XXXXXX-XX-XXXX" /></div>

                            {/* Age */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Age</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} placeholder="e.g. 24" /></div>

                            {/* Designation */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Designation</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={designation} onChange={e => setDesignation(e.target.value)} className={inputClasses} placeholder="e.g. Student, Staff" /></div>

                            {/* Date of Report */}
                            <div className="font-bold text-gray-800 text-sm md:text-base">Date of Report</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="date" value={dateOfReport} onChange={e => setDateOfReport(e.target.value)} className={inputClasses} /></div>

                        </div>
                    </div>

                    {/* Standard Narrative Iterations */}
                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">REASON FOR REFFERAL</label>
                        <textarea required rows={4} value={reasonForReferral} onChange={e => setReasonForReferral(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">BEHAVIOUR OBSERVATION</label>
                        <textarea required rows={4} value={behaviourObservation} onChange={e => setBehaviourObservation(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">HISTORY OF PRESENTING ISSUES</label>
                        <textarea required rows={4} value={historyOfPresentingIssues} onChange={e => setHistoryOfPresentingIssues(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">PSYCHIATRIC HISTORY</label>
                        <textarea required rows={4} value={psychiatricHistory} onChange={e => setPsychiatricHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">MEDICAL HISTORY</label>
                        <textarea required rows={4} value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">FAMILY HISTORY</label>
                        <textarea required rows={4} value={familyHistory} onChange={e => setFamilyHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">DEVELOPMENTAL HISTORY</label>
                        <textarea required rows={4} value={developmentalHistory} onChange={e => setDevelopmentalHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">SOCIAL HISTORY</label>
                        <textarea required rows={4} value={socialHistory} onChange={e => setSocialHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">SUBSTANCE USE HISTORY</label>
                        <textarea required rows={4} value={substanceUseHistory} onChange={e => setSubstanceUseHistory(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">CURRENT SITUATION FUNCTIONING</label>
                        <textarea required rows={4} value={currentSituationFunctioning} onChange={e => setCurrentSituationFunctioning(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">ASSESSMENT RESULT</label>
                        <textarea required rows={4} value={assessmentResult} onChange={e => setAssessmentResult(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">CLINICAL JUDGEMENT</label>
                        <textarea required rows={4} value={clinicalJudgement} onChange={e => setClinicalJudgement(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">DIAGNOSTIC IMPRESSION / PROVISIONAL DIAGNOSTIC</label>
                        <textarea required rows={4} value={diagnosticImpression} onChange={e => setDiagnosticImpression(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">GOALS OF THE SESSION</label>
                        <textarea required rows={4} value={goalsOfSession} onChange={e => setGoalsOfSession(e.target.value)} className={textareaClasses} />
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded-xl border border-transparent">
                        <label className="text-lg font-bold text-gray-900 uppercase underline underline-offset-4">TREATMENT PLANNING</label>
                        <textarea required rows={4} value={treatmentPlanning} onChange={e => setTreatmentPlanning(e.target.value)} className={textareaClasses} />
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
                                        value={counselorName}
                                        onChange={e => setCounselorName(e.target.value)}
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
                formName="Intake Report"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}

export default function Form1IntakePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form1IntakeContent />
        </Suspense>
    );
}
