"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppendicesSection, AppendixImage } from "@/components/forms/AppendicesSection";
import { HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form8PFAMHPSSReportPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    // React 19 Search Params Unwrapping
    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    // Logistics Data
    const [counselorName, setCounselorName] = useState("");
    const [institution, setInstitution] = useState("");
    const [programSessionType, setProgramSessionType] = useState("");
    const [programName, setProgramName] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [duration, setDuration] = useState("1.0");
    const [venue, setVenue] = useState("");
    const [participantsCount, setParticipantsCount] = useState("");
    const [speakerProvider, setSpeakerProvider] = useState("");
    const [collaborators, setCollaborators] = useState("");
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
                        const ld = formData.logisticsData;

                        setCounselorName(ld.counselorName);
                        setInstitution(ld.institution);
                        setProgramSessionType(ld.programSessionType);
                        setProgramName(ld.programName);
                        setDateTime(ld.dateTime);
                        setDuration(ld.duration || "1.0");
                        setVenue(ld.venue);
                        setParticipantsCount(ld.participantsCount);
                        setSpeakerProvider(ld.speakerProvider);
                        setCollaborators(ld.collaborators);

                        setObjectives(formData.narrative.objectives);
                        setIdentifiedIssues(formData.narrative.identifiedIssues);
                        setActivitiesInterventions(formData.narrative.activitiesInterventions);
                        setFollowUp(formData.narrative.followUp);

                        setReferralNeeded(formData.referral.referralNeeded);
                        setReferralSpecifics(formData.referral.referralSpecifics);

                        setAppendices(formData.appendices || []);

                        setTraineeSignature(formData.signatures.traineeSignature);
                        setSiteSupervisorSignature(formData.signatures.siteSupervisorSignature);
                        setAcademicSupervisorSignature(formData.signatures.academicSupervisorSignature);
                    }
                } catch (error) {
                    console.error("Failed to load session for editing", error);
                }
                return;
            }
        }
        fetchInitialData();
    }, [user, docId]);

    // Narrative Fields
    const [objectives, setObjectives] = useState("");
    const [identifiedIssues, setIdentifiedIssues] = useState("");
    const [activitiesInterventions, setActivitiesInterventions] = useState("");
    const [followUp, setFollowUp] = useState("");

    // Referral
    const [referralNeeded, setReferralNeeded] = useState("");
    const [referralSpecifics, setReferralSpecifics] = useState("");

    // Appendices (Replaces evidenceLink)
    const [appendices, setAppendices] = useState<AppendixImage[]>([]);

    // Signatures
    const [traineeSignature, setTraineeSignature] = useState("");
    const [siteSupervisorSignature, setSiteSupervisorSignature] = useState("");
    const [academicSupervisorSignature, setAcademicSupervisorSignature] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const effectiveClient = ({
            id: `manual-${Date.now()}`,
            clientId: "PROGRAM",
            type: "KI" as const,
            demographics: { name: programName || "Program Report" }
        } as Client);

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: `C${Date.now()}`,
                clientId: effectiveClient.id!,
                traineeId: user.uid,
                date: new Date(dateTime || Date.now()),
                duration: parseFloat(duration) || 0,
                formType: "Form8" as const,
                formData: {
                    logisticsData: {
                        counselorName,
                        institution,
                        programSessionType,
                        programName,
                        dateTime,
                        venue,
                        participantsCount,
                        speakerProvider,
                        collaborators
                    },
                    narrative: {
                        objectives,
                        identifiedIssues,
                        activitiesInterventions,
                        followUp
                    },
                    referral: {
                        referralNeeded,
                        referralSpecifics
                    },
                    appendices,
                    signatures: {
                        traineeSignature,
                        siteSupervisorSignature,
                        academicSupervisorSignature
                    }
                },
                createdAt: new Date()
            };
            // 1. Save to Firebase
            const { createdAt: _c8, ...firebaseSessionData } = sessionData;
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
                    alert("PFA/MHPSS Report & PDF saved to Google Drive successfully!");
                } catch (driveError: any) {
                    if (driveError.message === "UNAUTHORIZED_DRIVE_ACCESS") {
                        localStorage.removeItem("googleDriveToken");
                        alert("Google Drive session expired. Your report was saved to the database, but the PDF upload failed. Please log out and back in to re-authorize Google Drive.");
                    } else {
                        console.error("Drive upload failed:", driveError);
                        alert("Report saved to database, but Google Drive PDF upload failed: " + driveError.message);
                    }
                }
            } else {
                alert("PFA/MHPSS Report saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(effectiveClient.clientId === "PROGRAM" ? "/dashboard/programs" : `/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save PFA/MHPSS Report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white";
    const sectionClasses = "space-y-3 bg-white py-4";
    const labelClasses = "text-xl font-bold text-black uppercase underline underline-offset-4 block mb-2";

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
        <div className="max-w-4xl mx-auto pb-12 print:pb-0">
            <div className="bg-white overflow-hidden">
                <div className="bg-white px-8 py-6 border-b-4 border-upsi-gold flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-upsi-navy flex items-center space-x-3">
                            <HeartPulse className="text-upsi-gold" size={28} />
                            <span>Form 8: PFA MHPSS REPORT</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Mental Health & Psychosocial Support documentation.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-0 sm:p-4 md:p-8 space-y-8 bg-white">
                    <FormHeader
                        title="PFA MHPSS REPORT"
                        refCode="PFA/MHPSS_Report/KKMK_UPSI/08-2025"
                    />

                    {/* Counselor Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8 max-w-2xl">
                        <div className="flex items-center space-x-3">
                            <label className="font-bold text-black min-w-[80px] uppercase text-sm">Name</label>
                            <span className="font-bold text-black">:</span>
                            <input required type="text" value={counselorName} onChange={e => setCounselorName(e.target.value)} className="flex-1 p-2 border-b border-gray-300 focus:border-black outline-none bg-transparent text-black" placeholder="Enter name" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <label className="font-bold text-black min-w-[100px] uppercase text-sm">Institution</label>
                            <span className="font-bold text-black">:</span>
                            <input required type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="flex-1 p-2 border-b border-gray-300 focus:border-black outline-none bg-transparent text-black" placeholder="e.g. UPSI" />
                        </div>
                    </div>

                    {/* Logistics Data Section Group */}
                    <div className="bg-white mb-8">
                        <div className="bg-white px-4 py-2 border-b-2 border-black">
                            <h2 className="text-lg font-bold text-black uppercase tracking-wide">Program / Session Information</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-12 mb-6 border-b border-gray-100 pb-4">
                                <span className="font-bold text-gray-800 uppercase w-48">Program / Session</span>
                                <div className="flex items-center space-x-12">
                                    {["PFA", "MHPSS"].map((type) => (
                                        <label key={type} className="flex items-center cursor-pointer group">
                                            <input
                                                required
                                                type="radio"
                                                value={type}
                                                checked={programSessionType === type}
                                                onChange={e => setProgramSessionType(e.target.value)}
                                                name="programType"
                                                className="w-5 h-5 text-black border-gray-300 focus:ring-black cursor-pointer"
                                            />
                                            <span className="ml-3 text-black font-bold group-hover:text-black transition-colors">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-[220px_auto_1fr] gap-y-6 gap-x-2 items-center">
                                <div className="font-bold text-black text-sm md:text-base uppercase leading-tight">Name of the Program/Session</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="text" value={programName} onChange={e => setProgramName(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="Enter program name" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase">Date & Time</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase">Duration (Hours)</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="number" step="0.5" min="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="e.g. 1.0" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase">Venue</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="Activity location" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase leading-tight">Number of Participants Involved</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="number" min="0" value={participantsCount} onChange={e => setParticipantsCount(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="Participants count" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase">Speaker / Provider</div>
                                <div className="font-bold text-black">:</div>
                                <div><input required type="text" value={speakerProvider} onChange={e => setSpeakerProvider(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="Who delivered the program?" /></div>

                                <div className="font-bold text-black text-sm md:text-base uppercase">Collaborator(s) (If any)</div>
                                <div className="font-bold text-black">:</div>
                                <div><input type="text" value={collaborators} onChange={e => setCollaborators(e.target.value)} className="w-full p-2 border-b border-black outline-none text-black bg-white" placeholder="Optional collaborators" /></div>
                            </div>
                        </div>
                    </div>

                    {/* Narrative Sections */}
                    <div className="space-y-12">
                        {[
                            { label: "Objectives of the Program / Session", value: objectives, setter: setObjectives, rows: 5 },
                            { label: "Identified Issue (s)", value: identifiedIssues, setter: setIdentifiedIssues, rows: 5 },
                            { label: "Activities / Interventions Delivered", value: activitiesInterventions, setter: setActivitiesInterventions, rows: 6 }
                        ].map((field, idx) => (
                            <div key={idx} className="bg-white border-none py-4">
                                <div className="bg-white px-4 py-2 border-b-2 border-black">
                                    <label className={labelClasses}>
                                        {field.label}
                                    </label>
                                </div>
                                <div className="p-1">
                                    <textarea
                                        required
                                        rows={field.rows}
                                        value={field.value}
                                        onChange={e => field.setter(e.target.value)}
                                        className="w-full p-4 border-none focus:ring-0 outline-none text-gray-700 bg-white placeholder-gray-300"
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Plan Section */}
                    <div className="bg-white border-none mt-8">
                        <div className="bg-white py-2 border-none">
                            <h2 className={labelClasses}>Action Plan</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="font-bold text-black uppercase block underline underline-offset-4">Follow-Up (If needed):</label>
                                <textarea
                                    rows={4}
                                    value={followUp}
                                    onChange={e => setFollowUp(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white"
                                    placeholder="Enter follow-up details..."
                                />
                            </div>

                            <div className="flex items-center space-x-12 border-t border-gray-100 pt-6">
                                <span className="font-bold text-black uppercase w-48">Referral Needed</span>
                                <div className="flex items-center space-x-8">
                                    {["Yes", "No"].map((opt) => (
                                        <label key={opt} className="flex items-center cursor-pointer group">
                                            <input required type="radio" value={opt} checked={referralNeeded === opt} onChange={e => setReferralNeeded(e.target.value)} name="referral" className="w-5 h-5 text-black border-gray-300 focus:ring-black cursor-pointer" />
                                            <span className="ml-3 text-black font-bold group-hover:text-black transition-colors">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-black uppercase block underline underline-offset-4">Referral (If necessary, please specify):</label>
                                <input
                                    required={referralNeeded === "Yes"}
                                    type="text"
                                    value={referralSpecifics}
                                    onChange={e => setReferralSpecifics(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white"
                                    placeholder="Enter referral details..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signatures Table Section */}
                    <div className="pt-10 pb-4 mt-12 w-full">
                        <div className="overflow-x-auto border-none shadow-none">
                            <table className="w-full text-left bg-white min-w-[700px] border-collapse">
                                <thead className="bg-[#FFFFFF] text-black border-b border-black">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-black text-center w-1/4">Action</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-black text-center w-1/2">Signature & Name</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center w-1/4 text-black">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                    {[
                                        { label: "Trainee Counselor", value: traineeSignature, setter: setTraineeSignature, required: true },
                                        { label: "Site Supervisor", value: siteSupervisorSignature, setter: setSiteSupervisorSignature },
                                        { label: "Academic Supervisor", value: academicSupervisorSignature, setter: setAcademicSupervisorSignature }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-black last:border-0">
                                            <td className="px-6 py-8 border-r border-black font-bold text-center align-middle uppercase text-sm text-black">
                                                {row.label} Signature
                                            </td>
                                            <td className="px-6 py-8 border-r border-black">
                                                <div className="flex flex-col items-center">
                                                    <div className="border-b-2 border-dotted border-black w-full mb-3 h-8"></div>
                                                    <div className="flex justify-center items-center w-full px-4">
                                                        <span className="text-black font-bold text-lg">(</span>
                                                        <input
                                                            required={row.required}
                                                            type="text"
                                                            value={row.value}
                                                            onChange={e => row.setter(e.target.value)}
                                                            className="bg-transparent outline-none flex-1 text-center font-bold text-black placeholder-gray-400 py-1 uppercase"
                                                            placeholder={`Name of ${row.label}`}
                                                        />
                                                        <span className="text-black font-bold text-lg">)</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center align-middle">
                                                <div className="border-b border-black w-32 mx-auto h-8 mb-2"></div>
                                                <span className="text-black text-xs font-bold uppercase">DD/MM/YYYY</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Appendices Section (New Image Upload Feature) */}
                        <AppendicesSection
                            images={appendices}
                            onChange={setAppendices}
                        />


                        <div className="mt-16 text-center w-full pt-4 border-t border-dashed border-gray-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                                Confidential Document (For Professional Use Only)
                            </p>
                        </div>
                    </div>
                </form>
            </div>
            <FormActionBar
                formName="Program Report"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
function Form8PFAMHPSSReportSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form8PFAMHPSSReportPage {...props} />
        </Suspense>
    );
}

export default Form8PFAMHPSSReportSuspenseWrapper;
