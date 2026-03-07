"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientPrefill } from "@/components/forms/ClientPrefill";
import { Save, Target, Plus, Trash2 } from "lucide-react";
import { FormActionBar } from "@/components/forms/FormActionBar";
import { addSession, updateSession, syncSessionWithLog, Client, db, Session } from "@/lib/firebase/db";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormHeader } from "@/components/forms/FormHeader";
import { Suspense } from "react";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function Form4TreatmentPlanPage({ searchParams }: PageProps) {
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
    const [age, setAge] = useState("");
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

                        setClientFullName(pd.clientFullName);
                        const [eth, sx] = pd.ethnicSex.split(" / ");
                        setEthnic(eth);
                        setSex(sx);
                        setAge(pd.age);
                        setDiagnosis(pd.diagnosis);

                        setTreatmentPlans(formData.treatmentPlans);
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

    // Dynamic Treatment Plan Rows
    const [treatmentPlans, setTreatmentPlans] = useState([
        { goal: "", intervention: "", outcome: "" }
    ]);

    // Footer
    const [counsellorName, setCounsellorName] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddRow = () => {
        setTreatmentPlans([...treatmentPlans, { goal: "", intervention: "", outcome: "" }]);
    };

    const handleUpdateRow = (index: number, field: keyof typeof treatmentPlans[0], value: string) => {
        const updatedPlans = [...treatmentPlans];
        updatedPlans[index][field] = value;
        setTreatmentPlans(updatedPlans);
    };

    const handleRemoveRow = (index: number) => {
        if (treatmentPlans.length > 1) {
            const updatedPlans = treatmentPlans.filter((_, i) => i !== index);
            setTreatmentPlans(updatedPlans);
        }
    };

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
                date: new Date(),
                duration: 0,
                formType: "Form4" as const,
                formData: {
                    personalData: {
                        clientFullName,
                        ethnicSex: `${ethnic} / ${sex}`,
                        age,
                        diagnosis
                    },
                    treatmentPlans,
                    counsellorName
                },
                createdAt: new Date()
            };
            // 1. Save to Firebase
            const { createdAt: _c4, ...firebaseSessionData } = sessionData;
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
                    alert("Treatment Plan & PDF saved to Google Drive successfully!");
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
                alert("Treatment Plan saved to database! (PDF Skipped: No Google Drive authorization. Please log out and log back in to grant permission).");
            }
            router.push(`/dashboard/clients/${effectiveClient.type.toLowerCase()}/${effectiveClient.clientId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save Treatment Plan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-gray-700 bg-white placeholder-gray-400";
    const textareaClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-gray-700 bg-white text-sm";

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden">
                <div className="bg-upsi-navy px-8 py-6 border-b-4 border-upsi-gold flex justify-between items-center flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                            <Target className="text-white" size={28} />
                            <span>Form 4: Treatment Planning</span>
                        </h1>
                        <p className="text-blue-100 mt-1">Clinical Treatment Plan structure and outcome measures.</p>
                    </div>
                    {!prefillClientId && (
                        <div className="bg-white p-2 rounded-lg shadow-inner border border-blue-800">
                            <ClientPrefill onSelectClient={setSelectedClient} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white overflow-x-auto">
                    <FormHeader
                        title="Clinical Treatment Plan"
                        refCode="Clinical_Treatment_Plan/KKMK_UPSI/04-2025"
                    />

                    {/* Demographic Information Section Group */}
                    <div className="bg-gray-50 p-6 xl:p-8 rounded-xl border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-black uppercase tracking-wide underline underline-offset-4">DEMOGRAPHIC INFORMATION</h2>

                        <div className="grid grid-cols-[180px_auto_1fr] md:grid-cols-[240px_auto_1fr] gap-y-4 gap-x-2 items-center">

                            <div className="font-bold text-gray-800 text-sm md:text-base">Client Full Name</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={clientFullName} onChange={e => setClientFullName(e.target.value)} className={inputClasses} placeholder="Enter Client's Actual Name" /></div>

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

                            <div className="font-bold text-gray-800 text-sm md:text-base">Age</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} placeholder="e.g. 24" /></div>

                            <div className="font-bold text-gray-800 text-sm md:text-base">Diagnosis</div>
                            <div className="font-bold text-gray-800">:</div>
                            <div><input required type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className={inputClasses} placeholder="e.g. Generalized Anxiety Disorder" /></div>

                        </div>
                    </div>

                    {/* Dynamic Treatment Plan Table */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide underline underline-offset-8 decoration-2 mb-10 text-center">CLINICAL TREATMENT PLAN</h2>

                        <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm min-w-[700px]">
                            <div className="grid grid-cols-12 bg-white text-gray-900 border-b border-gray-300 font-bold">
                                <div className="col-span-3 p-4 border-r border-gray-300 uppercase underline underline-offset-4">Goal(s)</div>
                                <div className="col-span-5 p-4 border-r border-gray-300 uppercase underline underline-offset-4">Therapeutic Intervention</div>
                                <div className="col-span-3 p-4 border-r border-gray-300 uppercase underline underline-offset-4">Outcome Measures of Change</div>
                                <div className="col-span-1 p-4 text-center no-print text-[10px] uppercase text-gray-400 italic">Actions</div>
                            </div>

                            <div className="bg-white flex flex-col">
                                {treatmentPlans.map((plan, index) => (
                                    <div key={index} className="grid grid-cols-12 bg-white border-b border-gray-200 items-stretch last:border-b-0">
                                        <div className="col-span-3 border-r border-gray-200 p-2">
                                            <textarea
                                                required
                                                rows={6}
                                                value={plan.goal}
                                                onChange={e => handleUpdateRow(index, "goal", e.target.value)}
                                                className="w-full p-2 outline-none text-gray-700 bg-transparent text-sm resize-none"
                                                placeholder="State clinical goal..."
                                            />
                                        </div>
                                        <div className="col-span-5 border-r border-gray-200 p-2">
                                            <textarea
                                                required
                                                rows={6}
                                                value={plan.intervention}
                                                onChange={e => handleUpdateRow(index, "intervention", e.target.value)}
                                                className="w-full p-2 outline-none text-gray-700 bg-transparent text-sm resize-none"
                                                placeholder="Describe treatment approach..."
                                            />
                                        </div>
                                        <div className="col-span-3 border-r border-gray-200 p-2">
                                            <textarea
                                                required
                                                rows={6}
                                                value={plan.outcome}
                                                onChange={e => handleUpdateRow(index, "outcome", e.target.value)}
                                                className="w-full p-2 outline-none text-gray-700 bg-transparent text-sm resize-none"
                                                placeholder="Define success metrics..."
                                            />
                                        </div>
                                        <div className="col-span-1 flex items-center justify-center p-2 no-print">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRow(index)}
                                                disabled={treatmentPlans.length === 1}
                                                className="p-3 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Remove Goal"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 p-4 border-t border-gray-300 no-print">
                                <button
                                    type="button"
                                    onClick={handleAddRow}
                                    className="flex items-center space-x-2 text-upsi-navy font-bold px-4 py-2 hover:bg-blue-100 rounded-lg transition-colors border border-gray-200"
                                >
                                    <Plus size={18} />
                                    <span>Add New Goal Row</span>
                                </button>
                            </div>
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
                formName="Treatment Plan"
                isSubmitting={isSubmitting}
                onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
            />
        </div>
    );
}
function Form4TreatmentPlanSuspenseWrapper(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-lg font-bold text-gray-500">Loading Form...</div>}>
            <Form4TreatmentPlanPage {...props} />
        </Suspense>
    );
}

export default Form4TreatmentPlanSuspenseWrapper;
