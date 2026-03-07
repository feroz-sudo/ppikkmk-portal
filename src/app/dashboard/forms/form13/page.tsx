"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, BrainCircuit } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form13PsychologicalAssessmentPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    // React 19 Search Params Unwrapping
    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Personal Data
    const [clientFullName, setClientFullName] = useState("");
    const [ethnic, setEthnic] = useState("");
    const [sex, setSex] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [identificationCardNo, setIdentificationCardNo] = useState("");
    const [age, setAge] = useState("");
    const [designation, setDesignation] = useState("");
    const [dateOfAssessment, setDateOfAssessment] = useState("");
    const [duration, setDuration] = useState("1.0");
    const [assessmentConductedBy, setAssessmentConductedBy] = useState("");

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

                        setClientFullName(pd.clientFullName);
                        setEthnic(pd.ethnic);
                        setSex(pd.sex);
                        setDateOfBirth(pd.dateOfBirth);
                        setIdentificationCardNo(pd.identificationCardNo);
                        setAge(pd.age);
                        setDesignation(pd.designation);
                        setDateOfAssessment(pd.dateOfAssessment);
                        setDuration(pd.duration || "1.0");
                        setAssessmentConductedBy(pd.assessmentConductedBy);

                        const n = formData.narrative;
                        setReasonForReferral(n.reasonForReferral);
                        setBehaviourObservation(n.behaviourObservation);
                        setPsychologicalTestsAdministered(n.psychologicalTestsAdministered);
                        setTestResultsAndInterpretation(n.testResultsAndInterpretation);
                        setDiagnosticImpression(n.diagnosticImpression);
                        setSummaryOfFindings(n.summaryOfFindings);
                        setRecommendationsTreatmentPlan(n.recommendationsTreatmentPlan);
                        setPrognosis(n.prognosis);

                        setTraineeSignature(formData.counselorNameSignature);

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
                        setAge(match.demographics.age?.toString() || "");
                        setSex(match.demographics.gender || "");
                    }
                } catch (error) {
                    console.error("Failed to auto-load URL client", error);
                }
            }
        }
        fetchInitialData();
    }, [user, prefillClientId, docId]);

    // Narrative Fields
    const [reasonForReferral, setReasonForReferral] = useState("");
    const [behaviourObservation, setBehaviourObservation] = useState("");
    const [psychologicalTestsAdministered, setPsychologicalTestsAdministered] = useState("");
    const [testResultsAndInterpretation, setTestResultsAndInterpretation] = useState("");
    const [diagnosticImpression, setDiagnosticImpression] = useState("");
    const [summaryOfFindings, setSummaryOfFindings] = useState("");
    const [recommendationsTreatmentPlan, setRecommendationsTreatmentPlan] = useState("");
    const [prognosis, setPrognosis] = useState("");

    // Footer
    const [traineeSignature, setTraineeSignature] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const effectiveClient = selectedClient ?? ({
            id: `manual-${Date.now()}`,
            clientId: "000",
            type: "KI" as const,
            demographics: { name: clientFullName }
        } as Client);

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: `C${Date.now()}`,
                clientId: effectiveClient.id!,
                traineeId: user.uid,
                date: new Date(dateOfAssessment || Date.now()),
                duration: parseFloat(duration) || 0,
                formType: "Form13" as const,
                formData: {
                    personalData: {
                        clientFullName,
                        ethnic,
                        sex,
                        dateOfBirth,
                        identificationCardNo,
                        age,
                        designation,
                        dateOfAssessment,
                        assessmentConductedBy
                    },
                    narrative: {
                        reasonForReferral,
                        behaviourObservation,
                        psychologicalTestsAdministered,
                        testResultsAndInterpretation,
                        diagnosticImpression,
                        summaryOfFindings,
                        recommendationsTreatmentPlan,
                        prognosis
                    },
                    counselorNameSignature: traineeSignature
                },
                createdAt: new Date()
            };
            // 1. Save to Firebase
            const { createdAt: _c13, ...firebaseSessionData } = sessionData;
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
                    alert("Psychological Assessment Report & PDF saved to Google Drive successfully!");
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
                alert("Psychological Assessment Report saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Assessment Report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white leading-relaxed";
    const sectionClasses = "space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100";
    const labelClasses = "text-xl font-bold text-upsi-navy border-b-2 border-upsi-gold pb-2 uppercase tracking-wide inline-block mb-2 w-full";

    const renderTextarea = (label: string, stateValue: string, setter: (val: string) => void, rows: number = 8, sublabel?: string) => (
        <div className={sectionClasses}>
            <label className={labelClasses}>{label}</label>
            {sublabel && <p className="text-gray-600 font-medium italic mb-2 mt-[-8px] text-sm">{sublabel}</p>}
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
                            <BrainCircuit className="text-white" size={28} />
                            <span>Form 13: Psychological Assessment</span>
                        </h1>
                        <p className="text-blue-100 mt-1">Definitive clinical impression and assessment analysis instrument.</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-blue-800">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10 bg-white">
                    <FormHeader
                        title="Clinical Assessment Report"
                        refCode="Clinical_Assessment_Report/KKMK_UPSI/13-2025"
                    />

                    {/* 1. PERSONAL DATA Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 underline uppercase tracking-wide w-full mb-6">PERSONAL DATA</h2>
                        <div className="grid grid-cols-[200px_30px_1fr] md:grid-cols-[250px_30px_1fr] gap-y-4 items-center pl-4">

                            <div className="font-bold text-gray-800 text-sm md:text-base">Client Full Name</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={clientFullName} onChange={e => setClientFullName(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Enter full name" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Ethnic/Sex</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div className="flex space-x-2 items-center w-full">
                                <input required type="text" value={ethnic} onChange={e => setEthnic(e.target.value)} className="w-1/2 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Ethnic" />
                                <span className="text-gray-400">/</span>
                                <input required type="text" value={sex} onChange={e => setSex(e.target.value)} className="w-1/2 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Sex" />
                            </div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Date of Birth</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Identification Card No</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={identificationCardNo} onChange={e => setIdentificationCardNo(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="IC Number" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Age</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={age} onChange={e => setAge(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Age" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Designation</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Role/Year/Program" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Date of Assessment</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="date" value={dateOfAssessment} onChange={e => setDateOfAssessment(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Duration (Hours)</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="number" step="0.5" min="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="e.g. 1.0" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Assessment Conducted By</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={assessmentConductedBy} onChange={e => setAssessmentConductedBy(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none focus:border-upsi-navy text-gray-700" placeholder="Assessor Name" /></div>
                        </div>
                    </div>

                    {/* Narrative Assessment Matrix */}
                    {[
                        { label: "REASON FOR REFFERAL", value: reasonForReferral, setter: setReasonForReferral, rows: 4 },
                        { label: "BEHAVIOUR OBSERVATION", value: behaviourObservation, setter: setBehaviourObservation, rows: 5 },
                        { label: "PSYCHOLOGICAL TESTS ADMINISTERED", value: psychologicalTestsAdministered, setter: setPsychologicalTestsAdministered, rows: 5 },
                        { label: "TEST RESULTS AND INTERPRETATION", value: testResultsAndInterpretation, setter: setTestResultsAndInterpretation, rows: 8 },
                        { label: "DIAGNOSTIC IMPRESSION", value: diagnosticImpression, setter: setDiagnosticImpression, rows: 5 },
                        {
                            label: "SUMMARY OF FINDINGS",
                            value: summaryOfFindings,
                            setter: setSummaryOfFindings,
                            rows: 8,
                            sublabel: "(Psychological Functioning Based On Assessment Results, Relationship Between Symptoms, Test Findings, and Real-Life Concerns, Strengths, Protective Factors, and Areas Needing Support)"
                        },
                        { label: "RECOMMENDATIONS/TREATMENT PLAN", value: recommendationsTreatmentPlan, setter: setRecommendationsTreatmentPlan, rows: 6 },
                        { label: "PROGNOSIS", value: prognosis, setter: setPrognosis, rows: 4 }
                    ].map((field, idx) => (
                        <div key={idx} className="space-y-4 pt-4">
                            <h2 className="text-xl font-bold text-gray-900 underline uppercase tracking-wide">
                                {field.label}
                            </h2>
                            {field.sublabel && (
                                <p className="text-[11px] font-bold text-gray-600 italic -mt-2 leading-tight">
                                    {field.sublabel}
                                </p>
                            )}
                            <textarea
                                required
                                rows={field.rows}
                                value={field.value}
                                onChange={e => field.setter(e.target.value)}
                                className="w-full p-2 bg-transparent border-none focus:ring-0 outline-none text-gray-700 bg-white placeholder-gray-300 leading-relaxed"
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                        </div>
                    ))}

                    {/* Footer Section */}
                    <div className="pt-10 pb-4 border-t border-gray-300 mt-12 w-full">
                        <div className="mb-12 flex flex-col items-start max-w-sm">
                            <h3 className="text-gray-900 font-bold mb-12 uppercase">Report by:</h3>
                            <div className="w-80">
                                <div className="border-b border-gray-400 w-full mb-3 h-4"></div>
                                <div className="flex justify-between items-center w-full px-1">
                                    <span className="text-gray-400 font-bold text-lg">(</span>
                                    <input
                                        required
                                        type="text"
                                        value={traineeSignature}
                                        onChange={e => setTraineeSignature(e.target.value)}
                                        className="bg-transparent outline-none flex-1 text-center font-bold text-gray-800 placeholder-gray-300 py-1 uppercase"
                                        placeholder="Name of CMCH Counselor Trainee"
                                    />
                                    <span className="text-gray-400 font-bold text-lg">)</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-700 text-sm space-y-1 font-bold uppercase tracking-tight">
                            <p>CMCH Counselor Trainee</p>
                            <p className="font-normal text-gray-500">Universiti Pendidikan Sultan Idris</p>
                            <p className="font-normal text-gray-500">35900 Tanjong Malim, Perak</p>
                        </div>

                        <div className="mt-20 text-center w-full pt-4 border-t border-dashed border-gray-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                                Confidential Document (For Professional Use Only)
                            </p>
                        </div>
                    </div>
                </form>
            </div>
            <FormActionBar
                formName="Assessment Report"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
function Form13PsychologicalAssessmentSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form13PsychologicalAssessmentPage {...props} />
        </Suspense>
    );
}

export default Form13PsychologicalAssessmentSuspenseWrapper;
