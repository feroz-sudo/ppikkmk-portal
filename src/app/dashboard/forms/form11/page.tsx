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

    const searchParamsHooks = useSearchParams();
    const prefillClientId = searchParamsHooks.get("clientId") || undefined;
    const prefillSessionId = searchParamsHooks.get("sessionId") || undefined;
    const docId = searchParamsHooks.get("docId") || undefined;

    const [selectedClient, setSelectedClient] = useState<any>(null);

    // Logistics Data
    const [counsellorName, setCounsellorName] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [duration, setDuration] = useState("");
    const [typeOfGroup, setTypeOfGroup] = useState("");
    const [numberOfSession, setNumberOfSession] = useState("1");
    const [numberOfClientsAttending, setNumberOfClientsAttending] = useState("");

    // Auto-Mount URL Parameters
    useEffect(() => {
        if (prefillSessionId) {
            setNumberOfSession(prefillSessionId);
        }
    }, [prefillSessionId]);

    useEffect(() => {
        async function fetchInitialData() {
            if (!user) return;

            // Load client details if prefillClientId exists
            if (prefillClientId) {
                try {
                    const clientDoc = await getDoc(doc(db, "clients", prefillClientId));
                    if (clientDoc.exists()) {
                        setSelectedClient({ id: clientDoc.id, ...clientDoc.data() });
                    }
                } catch (error) {
                    console.error("Failed to load client details", error);
                }
            }

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

                        const loadedMembers = formData.groupMembers || [];
                        const paddedMembers = Array.from({ length: 8 }, (_, idx) => loadedMembers[idx] || { name: "", progress: "" });
                        setGroupMembers(paddedMembers);

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
        }
        fetchInitialData();
    }, [user, prefillClientId, docId]);

    // Dynamic Group Members Array (always exactly 8 elements to prevent out-of-bounds state crashes)
    const [groupMembers, setGroupMembers] = useState(Array.from({ length: 8 }, () => ({ name: "", progress: "" })));

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

    useEffect(() => {
        const nameToUse = userProfile?.name || user?.displayName || "";
        if (nameToUse) {
            setCounsellorName(prev => prev || nameToUse);
            setTraineeSignature(prev => prev || nameToUse);
        }
    }, [user, userProfile]);

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
        while (updatedMembers.length <= index) {
            updatedMembers.push({ name: "", progress: "" });
        }
        if (!updatedMembers[index]) {
            updatedMembers[index] = { name: "", progress: "" };
        }
        updatedMembers[index].name = newName;
        setGroupMembers(updatedMembers);
    };

    const handleUpdateMemberProgress = (index: number, newProgress: string) => {
        const updatedMembers = [...groupMembers];
        while (updatedMembers.length <= index) {
            updatedMembers.push({ name: "", progress: "" });
        }
        if (!updatedMembers[index]) {
            updatedMembers[index] = { name: "", progress: "" };
        }
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

        const effectiveClientId = selectedClient?.id || prefillClientId || "GROUP-SESSION";
        const clientType = "KK"; // Default to KK for groups

        setIsSubmitting(true);
        try {
            const sessionData = {
                sessionId: `C${Date.now()}`,
                clientId: effectiveClientId,
                traineeId: user.uid,
                date: (() => {
                    let safeDate = new Date();
                    if (dateTime) {
                        const parsed = new Date(dateTime);
                        if (!isNaN(parsed.getTime())) safeDate = parsed;
                    }
                    return safeDate;
                })(),
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
                    const mockClient = {
                        id: effectiveClientId,
                        clientId: selectedClient?.clientId || "GROUP",
                        type: clientType,
                        demographics: { name: selectedClient?.demographics?.name || firstMemberName }
                    };
                    const pdfBlob = await generateSessionPDF(sessionData, mockClient as any, clinicalId);
                    await uploadToGoogleDrive(
                        driveToken,
                        pdfBlob,
                        clinicalId,
                        selectedClient?.clientId || "GROUP",
                        sessionData.sessionId
                    );
                } catch (driveErr: any) {
                    if (driveErr.message === "UNAUTHORIZED_DRIVE_ACCESS") {
                        localStorage.removeItem("googleDriveToken");
                    }
                    console.error("Drive upload failed:", driveErr);
                }
            }
            router.push(`/dashboard`);
        } catch (error: any) {
            console.error(error);
            alert(`Failed to save Group Counselling Report: ${error.message || "Unknown error"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white";
    const sectionClasses = "space-y-3 bg-white py-4";
    const labelClasses = "text-lg font-bold text-black border-b-2 border-black pb-1 inline-block mb-2";

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
            <div className="bg-white">
                <div className="bg-white px-8 py-6 border-b-4 border-upsi-gold flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-upsi-navy flex items-center space-x-3">
                            <Users className="text-upsi-gold" size={28} />
                            <span>FORM 11: GROUP COUNSELING REPORT</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Comprehensive group session dynamics and individual progress matrix.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-0 sm:p-4 md:p-8 space-y-8 bg-white overflow-x-auto">
                    <FormHeader
                        title="GROUP COUNSELING REPORT"
                        refCode="Group_Counseling_Report/CMHC_UPSI/11-2025"
                        subTitle="PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING"
                        subSubTitle="UNIVERSITI PENDIDIKAN SULTAN IDRIS"
                    />

                    {/* PRINT-ONLY ORIGINAL LAYOUT TABLE & SECTIONS */}
                    <div className="hidden print:block w-full text-black">
                        <table className="w-full border-collapse border border-black text-black text-[11px] font-sans">
                            <tbody>
                                <tr>
                                    <td className="border border-black bg-[#fce5cd] p-2 font-bold w-[25%]">Group Leader/Counselor</td>
                                    <td className="border border-black p-2 font-bold uppercase" colSpan={5}>{counsellorName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold w-[25%]">Date</td>
                                    <td className="border border-black p-2 w-[25%]">{dateTime.split('T')[0]}</td>
                                    <td className="border border-black p-2 font-bold w-[10%]">Time</td>
                                    <td className="border border-black p-2 w-[15%]">{dateTime.split('T')[1]}</td>
                                    <td className="border border-black p-2 font-bold w-[10%]">Duration</td>
                                    <td className="border border-black p-2 w-[15%]">{duration}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Type of Group</td>
                                    <td className="border border-black p-2" colSpan={5}>{typeOfGroup}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Number of Session</td>
                                    <td className="border border-black p-2" colSpan={5}>{numberOfSession}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Number of Clients Attending the Group</td>
                                    <td className="border border-black p-2" colSpan={5}>{numberOfClientsAttending}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Name of Clients Attending The Group</td>
                                    <td className="border border-black p-2" colSpan={5}>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                            {Array.from({ length: 8 }).map((_, idx) => (
                                                <div key={idx} className="flex">
                                                    <span className="w-6 font-bold">{idx + 1}.</span>
                                                    <span className="uppercase">{groupMembers[idx]?.name || ""}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Issues Focused of the day</td>
                                    <td className="border border-black p-2 whitespace-pre-wrap" colSpan={5}>{issuesFocused || "N/A"}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">Session Objectives</td>
                                    <td className="border border-black p-2 whitespace-pre-wrap" colSpan={5}>{sessionObjectives || "N/A"}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Plain text styled narratives */}
                        <div className="space-y-8 mt-8">
                            {[
                                { label: "Background Information of the Group Members /Observations Result", value: backgroundInfo },
                                { label: "Group Initial Stage", value: groupInitialStage },
                                { label: "Mid-Stage/Group Working Stage", value: midStageWorking },
                                { label: "Theoretical Approach/Group Techniques Used", value: theoreticalApproach },
                                { label: "Diagnostic Impression/Intervention", value: diagnosticImpression },
                                { label: "Client Progress/Barriers (Internal/External Dynamics Supporting or Hindering Change)", value: clientProgressBarriers },
                                { label: "Treatment Planning", value: treatmentPlanning },
                                { label: "Termination/Closing Stage and Follow Up Actions", value: terminationClosing },
                                { label: "Counselor's Comments/Reflections", value: counsellorsComments }
                            ].map((sec, idx) => (
                                <div key={idx} className="space-y-2 break-inside-avoid">
                                    <h3 className="font-bold text-black text-xs uppercase">{sec.label}</h3>
                                    <p className="text-black text-[11px] whitespace-pre-wrap leading-relaxed min-h-[40px] pl-1">
                                        {sec.value || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Brief Individual Progress Report */}
                        <div className="page-break-before mt-8">
                            <h3 className="font-bold text-black text-xs uppercase mb-4">Brief Individual Progress Report For Each Group Member</h3>
                            <div className="space-y-6">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div key={idx} className="space-y-2 break-inside-avoid">
                                        <p className="font-bold text-black text-[11px]">
                                            Group Member {idx + 1}: {groupMembers[idx]?.name ? `(${groupMembers[idx].name.toUpperCase()})` : ""}
                                        </p>
                                        <p className="text-black text-[11px] border-b border-gray-300 pb-2 whitespace-pre-wrap min-h-[30px] pl-1">
                                            {groupMembers[idx]?.progress || "N/A"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Signature section */}
                        <div className="mt-12 w-full break-inside-avoid">
                            <p className="text-black font-bold text-xs">Report by:</p>
                            <div className="w-full max-w-[280px] mt-12">
                                <div className="border-b border-black w-full mb-2"></div>
                                <p className="font-bold text-black uppercase text-center text-xs mb-4">
                                    ( {traineeSignature || "Enter Full Name"} )
                                </p>
                                <div className="text-black text-[10px] font-bold space-y-0.5 leading-tight">
                                    <p className="uppercase">CMCH Counselor Trainee</p>
                                    <p className="uppercase font-normal">Universiti Pendidikan Sultan Idris</p>
                                    <p className="uppercase font-normal">35900 Tanjong Malim, Perak</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE FORM CONTAINER (HIDDEN DURING PRINT) */}
                    <div className="print:hidden space-y-8">
                        {/* Logistics Data Section Group */}
                        <div className="bg-white mb-8 border-2 border-black">
                            <div className="bg-white px-4 py-3 border-b-2 border-black flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <label className="font-bold text-black uppercase text-sm sm:text-base sm:min-w-[200px]">Group Leader/Counsellor</label>
                                <span className="hidden sm:inline font-bold text-black">:</span>
                                <input required type="text" value={counsellorName} onChange={e => setCounsellorName(e.target.value)} className="flex-1 p-1 bg-transparent border-none focus:ring-0 font-medium text-black border-b sm:border-none border-gray-200" placeholder="Enter name" />
                            </div>

                            <div className="p-4 sm:p-6 lg:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[120px]">Date</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="date" value={dateTime.split('T')[0]} onChange={e => setDateTime(e.target.value + 'T' + (dateTime.split('T')[1] || '00:00'))} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[120px]">Time</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="time" value={dateTime.split('T')[1] || ''} onChange={e => setDateTime((dateTime.split('T')[0] || '') + 'T' + e.target.value)} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[120px]">Duration</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="text" value={duration} onChange={e => setDuration(e.target.value)} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm" placeholder="e.g. 1.5 hours" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[120px]">Type of Group</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="text" value={typeOfGroup} onChange={e => setTypeOfGroup(e.target.value)} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm" placeholder="e.g. Support" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[120px]">Number of Session</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="number" value={numberOfSession} onChange={e => setNumberOfSession(e.target.value)} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                        <label className="font-bold text-gray-800 uppercase text-xs sm:text-sm sm:min-w-[150px]">Clients Attending</label>
                                        <span className="hidden sm:inline font-bold text-gray-800">:</span>
                                        <input required type="number" min="1" max="8" value={numberOfClientsAttending} onChange={e => setNumberOfClientsAttending(e.target.value)} className="flex-1 p-2 border-b border-black outline-none bg-white font-bold text-sm text-center sm:text-left" />
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <h3 className="text-sm font-bold text-black uppercase mb-6 border-l-4 border-black pl-3 leading-tight">Name of Clients Attending The Group (1-8):</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {Array.from({ length: 8 }).map((_, idx) => (
                                            <div key={idx} className="flex items-center space-x-3 group">
                                                <span className="text-gray-400 font-bold w-4 text-xs">{idx + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={groupMembers[idx]?.name || ""}
                                                    onChange={e => handleUpdateMemberName(idx, e.target.value)}
                                                    className="flex-1 p-2 border-b border-gray-200 group-focus-within:border-black outline-none bg-white text-sm font-bold uppercase transition-colors"
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
                                <div key={idx} className="bg-white shadow-none">
                                    <div className="bg-white px-4 py-2 border-b-2 border-black">
                                        <label className="text-lg font-bold text-black uppercase">
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
                            <div className="bg-white px-4 py-2 border-2 border-black">
                                <h2 className="text-xl font-bold text-black uppercase tracking-wide">Brief Individual Progress Report For Each Group Member</h2>
                            </div>
                            <div className="p-0 space-y-8">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <h3 className="font-bold text-black uppercase text-sm bg-white p-2 border-l-4 border-black flex items-center justify-between">
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
                            <div className="mt-4 w-full">
                                <h3 className="text-black font-bold mb-8 uppercase text-sm">REPORT BY:</h3>
                                <div className="w-full max-w-md">
                                    <div className="border-b-2 border-dotted border-black w-full mb-3 h-8"></div>
                                    <div className="flex justify-between items-center w-full px-1 mb-8">
                                        <span className="text-black font-bold text-lg">(</span>
                                        <input
                                            required
                                            type="text"
                                            value={traineeSignature}
                                            onChange={e => setTraineeSignature(e.target.value)}
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

                            <div className="mt-20 text-center w-full pt-4 border-t border-dashed border-gray-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                                    Confidential Document (For Professional Use Only)
                                </p>
                            </div>
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
