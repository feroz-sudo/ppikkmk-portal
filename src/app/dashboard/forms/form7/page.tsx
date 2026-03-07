"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, MessageSquare } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form7ConsultationReportPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    // React 19 Search Params Unwrapping
    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillClientId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Logistics Data
    const [consultantName, setConsultantName] = useState("");
    const [institution, setInstitution] = useState("");
    const [clientName, setClientName] = useState("");
    const [guardiansName, setGuardiansName] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [duration, setDuration] = useState("1.0");
    const [venue, setVenue] = useState("");
    const [attendanceType, setAttendanceType] = useState("");

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

                        setConsultantName(ld.consultantName);
                        setInstitution(ld.institution);
                        setClientName(ld.clientName);
                        setGuardiansName(ld.guardiansName);
                        setDateTime(ld.dateTime);
                        setDuration(ld.duration || "1.0");
                        setVenue(ld.venue);
                        setAttendanceType(ld.attendanceType);

                        setIssuesDiscussed(formData.issuesDiscussed);
                        setInterventionActions(formData.interventionActions);
                        setFollowUp(formData.followUp);

                        setReferralNeeded(formData.referral.referralNeeded);
                        setReferralSpecifics(formData.referral.referralSpecifics);

                        setTraineeSignature(formData.signatures.traineeSignature);
                        setSiteSupervisorSignature(formData.signatures.siteSupervisorSignature);
                        setAcademicSupervisorSignature(formData.signatures.academicSupervisorSignature);

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
                    }
                } catch (error) {
                    console.error("Failed to auto-load URL client", error);
                }
            }
        }
        fetchInitialData();
    }, [user, prefillClientId, docId]);

    // Narrative Fields
    const [issuesDiscussed, setIssuesDiscussed] = useState("");
    const [interventionActions, setInterventionActions] = useState("");
    const [followUp, setFollowUp] = useState("");

    // Referral
    const [referralNeeded, setReferralNeeded] = useState("");
    const [referralSpecifics, setReferralSpecifics] = useState("");

    // Signatures
    const [traineeSignature, setTraineeSignature] = useState("");
    const [siteSupervisorSignature, setSiteSupervisorSignature] = useState("");
    const [academicSupervisorSignature, setAcademicSupervisorSignature] = useState("");

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
                date: new Date(dateTime || Date.now()),
                duration: parseFloat(duration) || 0,
                formType: "Form7" as const,
                formData: {
                    logisticsData: {
                        consultantName,
                        institution,
                        clientName,
                        guardiansName,
                        dateTime,
                        venue,
                        attendanceType
                    },
                    issuesDiscussed,
                    interventionActions,
                    followUp,
                    referral: {
                        referralNeeded,
                        referralSpecifics
                    },
                    signatures: {
                        traineeSignature,
                        siteSupervisorSignature,
                        academicSupervisorSignature
                    }
                },
                createdAt: new Date()
            };
            // 1. Save to Firebase
            const { createdAt: _c7, ...firebaseSessionData } = sessionData;
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
                    alert("Consultation Report & PDF saved to Google Drive successfully!");
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
                alert("Consultation Report saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Consultation Report.");
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
                <div className="bg-neutral-900 px-8 py-6 border-b-4 border-neutral-800 flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                            <MessageSquare className="text-white" size={28} />
                            <span>Form 7: Consultation Report</span>
                        </h1>
                        <p className="text-neutral-400 mt-1">Formal record of client/guardian case consultation.</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-neutral-700">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white overflow-x-auto">
                    <FormHeader
                        title="Consultation Report"
                        refCode="Consultation_Report/KKMK_UPSI/07-2025"
                    />

                    {/* Counselor Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8 max-w-2xl">
                        <div className="flex items-center space-x-3">
                            <label className="font-bold text-gray-800 min-w-[80px] uppercase">Name</label>
                            <span className="font-bold text-gray-800">:</span>
                            <input required type="text" value={consultantName} onChange={e => setConsultantName(e.target.value)} className="flex-1 p-2 border-b border-gray-300 focus:border-upsi-navy outline-none bg-transparent" placeholder="Enter name" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <label className="font-bold text-gray-800 min-w-[100px] uppercase">Institution</label>
                            <span className="font-bold text-gray-800">:</span>
                            <input required type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="flex-1 p-2 border-b border-gray-300 focus:border-upsi-navy outline-none bg-transparent" placeholder="e.g. UPSI" />
                        </div>
                    </div>

                    {/* Demographic Information Section Group */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
                        <div className="bg-[#FFF8F0] px-4 py-2 border-b border-gray-300">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Client Information</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-y-4 gap-x-2 items-center">
                                <div className="font-bold text-gray-800 text-sm md:text-base uppercase">Client’s Name</div>
                                <div className="font-bold text-gray-800">:</div>
                                <div><input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} placeholder="Enter Client's Name" /></div>

                                <div className="font-bold text-gray-800 text-sm md:text-base uppercase">Guardian’s Name</div>
                                <div className="font-bold text-gray-800">:</div>
                                <div><input type="text" value={guardiansName} onChange={e => setGuardiansName(e.target.value)} className={inputClasses} placeholder="Enter Guardian's Name" /></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-800 uppercase block">Date & Time</label>
                                    <input required type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className={inputClasses} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-800 uppercase block">Duration (Hours)</label>
                                    <input required type="number" step="0.5" min="0.5" value={duration} onChange={e => setDuration(e.target.value)} className={inputClasses} placeholder="e.g. 1.0" />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="font-bold text-gray-800 uppercase block">Venue</label>
                                    <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} className={inputClasses} placeholder="Meeting location" />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <label className="font-bold text-gray-800 uppercase block mb-3">Attendance Type</label>
                                <div className="flex flex-wrap gap-8">
                                    {["Voluntary", "Referred", "Invited"].map((type) => (
                                        <label key={type} className="flex items-center cursor-pointer group">
                                            <input
                                                required
                                                type="radio"
                                                value={type}
                                                checked={attendanceType === type}
                                                onChange={e => setAttendanceType(e.target.value)}
                                                name="attendance"
                                                className="w-5 h-5 text-upsi-navy border-gray-300 focus:ring-upsi-navy cursor-pointer"
                                            />
                                            <span className="ml-3 text-gray-700 font-bold group-hover:text-upsi-navy transition-colors">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Narrative Sections */}
                    <div className="space-y-12">
                        {[
                            { label: "Issue (s) Discussed", value: issuesDiscussed, setter: setIssuesDiscussed, rows: 6 },
                            { label: "Intervention / Resolution Actions", value: interventionActions, setter: setInterventionActions, rows: 6 },
                            { label: "Follow-Up", value: followUp, setter: setFollowUp, rows: 5 }
                        ].map((field, idx) => (
                            <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-[#FFF8F0] px-4 py-2 border-b border-gray-300">
                                    <label className="text-lg font-bold text-gray-900 uppercase">
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

                    {/* Referral Section */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden mt-8">
                        <div className="bg-[#FFF8F0] px-4 py-2 border-b border-gray-300">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Referral</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-12">
                                <span className="font-bold text-gray-800 uppercase w-48">Referral Needed</span>
                                <div className="flex items-center space-x-8">
                                    <label className="flex items-center cursor-pointer group">
                                        <input required type="radio" value="Yes" checked={referralNeeded === "Yes"} onChange={e => setReferralNeeded(e.target.value)} name="referral" className="w-5 h-5 text-upsi-navy border-gray-300 focus:ring-upsi-navy cursor-pointer" />
                                        <span className="ml-3 text-gray-700 font-bold group-hover:text-upsi-navy transition-colors">Yes</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer group">
                                        <input required type="radio" value="No" checked={referralNeeded === "No"} onChange={e => setReferralNeeded(e.target.value)} name="referral" className="w-5 h-5 text-upsi-navy border-gray-300 focus:ring-upsi-navy cursor-pointer" />
                                        <span className="ml-3 text-gray-700 font-bold group-hover:text-upsi-navy transition-colors">No</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-bold text-gray-800 uppercase block underline underline-offset-4">Referral (If necessary, please specify):</label>
                                <input
                                    required={referralNeeded === "Yes"}
                                    type="text"
                                    value={referralSpecifics}
                                    onChange={e => setReferralSpecifics(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white"
                                    placeholder="Enter referral details..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signatures Table Section */}
                    <div className="pt-10 pb-4 mt-12 w-full">
                        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
                            <table className="w-full text-left bg-white min-w-[700px] border-collapse">
                                <thead className="bg-[#FFF8F0] text-gray-900 border-b border-gray-300">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-gray-300 text-center w-1/4">Action</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-gray-300 text-center w-1/2">Signature & Name</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center w-1/4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                    {[
                                        { label: "Trainee Counselor", value: traineeSignature, setter: setTraineeSignature, required: true },
                                        { label: "Site Supervisor", value: siteSupervisorSignature, setter: setSiteSupervisorSignature },
                                        { label: "Academic Supervisor", value: academicSupervisorSignature, setter: setAcademicSupervisorSignature }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-300 last:border-0">
                                            <td className="px-6 py-8 border-r border-gray-300 font-bold text-center align-middle uppercase text-sm">
                                                {row.label} Signature
                                            </td>
                                            <td className="px-6 py-8 border-r border-gray-300">
                                                <div className="flex flex-col items-center">
                                                    <div className="border-b border-gray-400 w-full mb-3 h-8"></div>
                                                    <div className="flex justify-center items-center w-full px-4">
                                                        <span className="text-gray-400 font-bold text-lg">(</span>
                                                        <input
                                                            required={row.required}
                                                            type="text"
                                                            value={row.value}
                                                            onChange={e => row.setter(e.target.value)}
                                                            className="bg-transparent outline-none flex-1 text-center font-bold text-gray-800 placeholder-gray-300 py-1 uppercase"
                                                            placeholder={`Name of ${row.label}`}
                                                        />
                                                        <span className="text-gray-400 font-bold text-lg">)</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center align-middle">
                                                <div className="border-b border-gray-300 w-32 mx-auto h-8 mb-2"></div>
                                                <span className="text-gray-400 text-xs">DD/MM/YYYY</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                formName="Consultation Report"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
function Form7ConsultationReportSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form7ConsultationReportPage {...props} />
        </Suspense>
    );
}

export default Form7ConsultationReportSuspenseWrapper;
