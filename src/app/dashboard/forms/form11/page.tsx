"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, Users, Plus, Trash2 } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form11GroupCounsellingPage({ searchParams }: PageProps) {
    const { user, userProfile } = useAuth();
    const router = useRouter();

    // React 19 Search Params Unwrapping
    const unwrappedSearch = React.use(searchParams);
    const searchParamsHooks = useSearchParams();
    const prefillSessionId = unwrappedSearch.clientId as string | undefined;
    const docId = searchParamsHooks.get("docId") || (unwrappedSearch.docId as string | undefined);

    // Logistics Data
    const [counsellorName, setCounsellorName] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [duration, setDuration] = useState("");
    const [typeOfGroup, setTypeOfGroup] = useState("");
    const [numberOfSession, setNumberOfSession] = useState("1");
    const [numberOfClientsAttending, setNumberOfClientsAttending] = useState("");

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

                        setCounsellorName(ld.counselorName || ld.counsellorName);
                        setDateTime(ld.dateTime);
                        setDuration(ld.duration);
                        setTypeOfGroup(ld.typeOfGroup);
                        setNumberOfSession(ld.numberOfSession);
                        setNumberOfClientsAttending(ld.numberOfClientsAttending);

                        setGroupMembers(formData.groupMembers || [{ name: "", progress: "" }]);

                        const n = formData.narrative;
                        setIssuesFocused(n.issuesFocused);
                        setSessionObjectives(n.sessionObjectives);
                        setBackgroundInfo(n.backgroundInfo);
                        setGroupInitialStage(n.groupInitialStage);
                        setMidStageWorking(n.midStageWorking);
                        setTheoreticalApproach(n.theoreticalApproach);
                        setDiagnosticImpression(n.diagnosticImpression);
                        setClientProgressBarriers(n.clientProgressBarriers);
                        setTreatmentPlanning(n.treatmentPlanning);
                        setTerminationClosing(n.terminationClosing);
                        setCounsellorsComments(n.counselorsComments || n.counsellorsComments);

                        setTraineeSignature(formData.counselorNameSignature);
                    }
                } catch (error) {
                    console.error("Failed to load session for editing", error);
                }
                return;
            }

            if (prefillSessionId) {
                setNumberOfSession(prefillSessionId);
            }
        }
        fetchInitialData();
    }, [user, prefillSessionId, docId]);

    // Dynamic Group Members Array
    const [groupMembers, setGroupMembers] = useState([{ name: "", progress: "" }]);

    // Narrative Fields
    const [issuesFocused, setIssuesFocused] = useState("");
    const [sessionObjectives, setSessionObjectives] = useState("");
    const [backgroundInfo, setBackgroundInfo] = useState("");
    const [groupInitialStage, setGroupInitialStage] = useState("");
    const [midStageWorking, setMidStageWorking] = useState("");
    const [theoreticalApproach, setTheoreticalApproach] = useState("");
    const [diagnosticImpression, setDiagnosticImpression] = useState("");
    const [clientProgressBarriers, setClientProgressBarriers] = useState("");
    const [treatmentPlanning, setTreatmentPlanning] = useState("");
    const [terminationClosing, setTerminationClosing] = useState("");
    const [counsellorsComments, setCounsellorsComments] = useState("");
    const [followUp, setFollowUp] = useState("");

    // Footer
    const [traineeSignature, setTraineeSignature] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddMember = () => {
        if (groupMembers.length < 8) {
            setGroupMembers([...groupMembers, { name: "", progress: "" }]);
        } else {
            alert("Maximum of 8 group members allowed per form.");
        }
    };

    const handleUpdateMemberName = (index: number, newName: string) => {
        const updatedMembers = [...groupMembers];
        updatedMembers[index].name = newName;
        setGroupMembers(updatedMembers);
    };

    const handleUpdateMemberProgress = (index: number, newProgress: string) => {
        const updatedMembers = [...groupMembers];
        updatedMembers[index].progress = newProgress;
        setGroupMembers(updatedMembers);
    };

    const handleRemoveMember = (index: number) => {
        if (groupMembers.length > 1) {
            const updatedMembers = groupMembers.filter((_, i) => i !== index);
            setGroupMembers(updatedMembers);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const firstMemberName = groupMembers[0]?.name || "Group Session";

        const effectiveClientId = "GROUP-SESSION";
        const clientType = "KK"; // Default to KK for groups

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: `C${Date.now()}`,
                clientId: effectiveClientId,
                traineeId: user.uid,
                date: new Date(dateTime || Date.now()),
                duration: parseFloat(duration) || 0,
                formType: "Form11" as const,
                formData: {
                    logisticsData: {
                        counsellorName,
                        dateTime,
                        duration,
                        typeOfGroup,
                        numberOfSession,
                        numberOfClientsAttending
                    },
                    groupMembers,
                    narrative: {
                        issuesFocused,
                        sessionObjectives,
                        backgroundInfo,
                        groupInitialStage,
                        midStageWorking,
                        theoreticalApproach,
                        diagnosticImpression,
                        clientProgressBarriers,
                        treatmentPlanning,
                        terminationClosing,
                        counsellorsComments
                    },
                    counselorNameSignature: traineeSignature
                },
                createdAt: new Date()
            };
            // 1. Save to Firebase
            const { createdAt: _c11, ...firebaseSessionData } = sessionData;
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
                        clientType as any,
                        userProfile?.matricNumber || user.uid
                    );
                    // Mock a client object for PDF generator since it expects one
                    const mockClient = {
                        id: effectiveClientId,
                        clientId: "GROUP",
                        type: clientType,
                        demographics: { name: firstMemberName }
                    };
                    const pdfBlob = await generateSessionPDF(sessionData, mockClient as any, clinicalId);
                    await uploadToGoogleDrive(
                        driveToken,
                        pdfBlob,
                        clinicalId,
                        "GROUP",
                        sessionData.sessionId
                    );
                    alert("Group Counselling Report & PDF saved to Google Drive successfully!");
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
                alert("Group Counselling Report saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(`/dashboard`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Group Counselling Report.");
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
                            <Users className="text-upsi-gold" size={28} />
                            <span>Form 11: Group Counselling</span>
                        </h1>
                        <p className="text-blue-100 mt-1">Comprehensive group session dynamics and individual progress matrix.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10 bg-white overflow-x-auto">
                    <FormHeader
                        title="Group Counselling Report"
                        refCode="Group_Counselling_Report/KKMK_UPSI/11-2025"
                    />

                    {/* Logistics Data Section Group */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
                        <div className="bg-[#FFF8F0] px-4 py-2 border-b border-gray-300 flex items-center space-x-3">
                            <label className="font-bold text-gray-900 uppercase min-w-[180px]">Group Leader/Counsellor</label>
                            <span className="font-bold text-gray-900">:</span>
                            <input required type="text" value={counsellorName} onChange={e => setCounsellorName(e.target.value)} className="flex-1 p-1 bg-transparent border-none focus:ring-0 font-medium" placeholder="Enter name" />
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[120px]">Date</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="date" value={dateTime.split('T')[0]} onChange={e => setDateTime(e.target.value + 'T' + (dateTime.split('T')[1] || '00:00'))} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[120px]">Time</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="time" value={dateTime.split('T')[1] || ''} onChange={e => setDateTime((dateTime.split('T')[0] || '') + 'T' + e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[120px]">Duration</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="text" value={duration} onChange={e => setDuration(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" placeholder="e.g. 1.5 hours" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[120px]">Type of Group</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="text" value={typeOfGroup} onChange={e => setTypeOfGroup(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" placeholder="e.g. Support" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[120px]">Number of Session</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="number" value={numberOfSession} onChange={e => setNumberOfSession(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <label className="font-bold text-gray-800 uppercase text-sm min-w-[180px]">Clients Attending</label>
                                    <span className="font-bold text-gray-800">:</span>
                                    <input required type="number" min="1" max="8" value={numberOfClientsAttending} onChange={e => setNumberOfClientsAttending(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none focus:border-upsi-navy" />
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 border-l-4 border-upsi-gold pl-3">Name of Clients Attending The Group (1-8):</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 8 }).map((_, idx) => (
                                        <div key={idx} className="flex items-center space-x-3">
                                            <span className="text-gray-400 font-bold w-4">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                value={groupMembers[idx]?.name || ""}
                                                onChange={e => handleUpdateMemberName(idx, e.target.value)}
                                                className="flex-1 p-2 border-b border-dotted border-gray-200 outline-none focus:border-upsi-navy text-sm"
                                                placeholder={`Member ${idx + 1}`}
                                                required={idx < (parseInt(numberOfClientsAttending) || 0)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Narrative Sections */}
                    <div className="space-y-10">
                        {[
                            { label: "Issues Focused of the day", value: issuesFocused, setter: setIssuesFocused, rows: 4 },
                            { label: "Session Objectives", value: sessionObjectives, setter: setSessionObjectives, rows: 4 },
                            { label: "Background Information of the Group Members /Observations Result", value: backgroundInfo, setter: setBackgroundInfo, rows: 5 },
                            { label: "Group Initial Stage", value: groupInitialStage, setter: setGroupInitialStage, rows: 5 },
                            { label: "Mid-Stage/Group Working Stage", value: midStageWorking, setter: setMidStageWorking, rows: 6 },
                            { label: "Theoretical Approach/Group Techniques Used", value: theoreticalApproach, setter: setTheoreticalApproach, rows: 5 },
                            { label: "Diagnostic Impression/Intervention", value: diagnosticImpression, setter: setDiagnosticImpression, rows: 5 },
                            { label: "Client Progress/Barriers (Internal/External Dynamics Supporting or Hindering Change)", value: clientProgressBarriers, setter: setClientProgressBarriers, rows: 6 },
                            { label: "Treatment Planning", value: treatmentPlanning, setter: setTreatmentPlanning, rows: 5 },
                            { label: "Termination/Closing Stage and Follow Up Actions", value: terminationClosing, setter: setTerminationClosing, rows: 5 },
                            { label: "Counsellor’s Comments/Reflections", value: counsellorsComments, setter: setCounsellorsComments, rows: 5 }
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

                    {/* Individual Progress Matrix */}
                    <div className="mt-12">
                        <div className="bg-[#FFF8F0] px-4 py-2 border border-gray-300 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Brief Individual Progress Report For Each Group Member</h2>
                        </div>
                        <div className="border-x border-b border-gray-300 rounded-b-lg p-6 space-y-8">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="font-bold text-gray-800 uppercase text-sm bg-gray-50 p-2 border-l-4 border-upsi-navy flex items-center justify-between">
                                        <span>Group Member {idx + 1} {groupMembers[idx]?.name ? `(${groupMembers[idx].name})` : ""}</span>
                                    </h3>
                                    <textarea
                                        rows={3}
                                        value={groupMembers[idx]?.progress || ""}
                                        onChange={e => handleUpdateMemberProgress(idx, e.target.value)}
                                        className="w-full p-4 bg-transparent border-b border-dotted border-gray-300 focus:border-upsi-navy outline-none resize-none"
                                        placeholder={`Enter progress for member ${idx + 1}...`}
                                        required={idx < (parseInt(numberOfClientsAttending) || 0)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

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
                                        placeholder="Name of Counselling Trainee"
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
                formName="Group Counselling Report"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
function Form11GroupCounsellingSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form11GroupCounsellingPage {...props} />
        </Suspense>
    );
}

export default Form11GroupCounsellingSuspenseWrapper;
