"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/db";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Printer, Upload, User, FileText, CheckSquare, Loader2 } from "lucide-react";
import { generateCounselorProfilePDF } from "@/lib/pdf/generatePDF";

export default function CounselorProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"maklumat" | "kontrak" | "perjanjian">("maklumat");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form Data State
    const [photo, setPhoto] = useState("");
    const [name, setName] = useState("");
    const [matricNo, setMatricNo] = useState("");
    const [icNo, setIcNo] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [practicumSite, setPracticumSite] = useState("");
    const [practicumSiteAddress, setPracticumSiteAddress] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    // Contract Info State
    const [internshipSite, setInternshipSite] = useState("");
    const [semester, setSemester] = useState("");
    const [preceptorName, setPreceptorName] = useState("");
    const [preceptorPhone, setPreceptorPhone] = useState("");
    const [preceptorEmail, setPreceptorEmail] = useState("");
    const [acadSupervisorName, setAcadSupervisorName] = useState("");
    const [acadSupervisorPhone, setAcadSupervisorPhone] = useState("");
    const [acadSupervisorEmail, setAcadSupervisorEmail] = useState("");
    const [coordinatorName, setCoordinatorName] = useState("");
    const [coordinatorEmail, setCoordinatorEmail] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Signatures
    const [traineeSignature, setTraineeSignature] = useState("");
    const [siteSupervisorSignature, setSiteSupervisorSignature] = useState("");
    const [academicSupervisorSignature, setAcademicSupervisorSignature] = useState("");
    const [contractDate, setContractDate] = useState("");
    const [agreementDate, setAgreementDate] = useState("");

    // Fetch initial data
    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            try {
                const docRef = doc(db, "counselorProfiles", `counselor_${user.uid}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPhoto(data.photoUrl || "");
                    
                    const pi = data.personalInfo || {};
                    setName(pi.name || "");
                    setMatricNo(pi.matricNumber || "");
                    setIcNo(pi.icNumber || "");
                    setAddress(pi.address || "");
                    setPhone(pi.phone || "");
                    setEmail(pi.email || "");
                    setPracticumSite(pi.practicumSite || "");
                    setPracticumSiteAddress(pi.practicumSiteAddress || "");
                    setEmergencyContact(pi.emergencyContact || "");

                    const ci = data.contractInfo || {};
                    setInternshipSite(ci.internshipSite || "");
                    setSemester(ci.semester || "");
                    setPreceptorName(ci.localPreceptorName || "");
                    setPreceptorPhone(ci.localPreceptorPhone || "");
                    setPreceptorEmail(ci.localPreceptorEmail || "");
                    setAcadSupervisorName(ci.academicSupervisorName || "");
                    setAcadSupervisorPhone(ci.academicSupervisorPhone || "");
                    setAcadSupervisorEmail(ci.academicSupervisorEmail || "");
                    setCoordinatorName(ci.coordinatorName || "");
                    setCoordinatorEmail(ci.coordinatorEmail || "");
                    setStartDate(ci.startDate || "");
                    setEndDate(ci.endDate || "");

                    const sig = data.signatures || {};
                    setTraineeSignature(sig.traineeSignature || "");
                    setSiteSupervisorSignature(sig.siteSupervisorSignature || "");
                    setAcademicSupervisorSignature(sig.academicSupervisorSignature || "");
                    setContractDate(sig.contractDate || "");
                    setAgreementDate(sig.agreementDate || "");
                }
            } catch (error) {
                console.error("Failed to load counselor profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [user]);

    // Handle Photo Upload (Convert to Base64)
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Save Profile to Firestore
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, "counselorProfiles", `counselor_${user.uid}`);
            await setDoc(docRef, {
                traineeId: user.uid,
                photoUrl: photo,
                personalInfo: {
                    name,
                    matricNumber: matricNo,
                    icNumber: icNo,
                    address,
                    phone,
                    email,
                    practicumSite,
                    practicumSiteAddress,
                    emergencyContact
                },
                contractInfo: {
                    internshipSite,
                    semester,
                    localPreceptorName: preceptorName,
                    localPreceptorPhone: preceptorPhone,
                    localPreceptorEmail: preceptorEmail,
                    academicSupervisorName: acadSupervisorName,
                    academicSupervisorPhone: acadSupervisorPhone,
                    academicSupervisorEmail: acadSupervisorEmail,
                    coordinatorName,
                    coordinatorEmail,
                    startDate,
                    endDate
                },
                signatures: {
                    traineeSignature,
                    siteSupervisorSignature,
                    academicSupervisorSignature,
                    contractDate,
                    agreementDate
                },
                updatedAt: new Date()
            });
            alert("Maklumat berjaya disimpan!");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Gagal menyimpan maklumat.");
        } finally {
            setIsSaving(false);
        }
    };

    // Print to PDF
    const handlePrint = async () => {
        const profileData = {
            photoUrl: photo,
            personalInfo: {
                name,
                matricNumber: matricNo,
                icNumber: icNo,
                address,
                phone,
                email,
                practicumSite,
                practicumSiteAddress,
                emergencyContact
            },
            contractInfo: {
                internshipSite,
                semester,
                localPreceptorName: preceptorName,
                localPreceptorPhone: preceptorPhone,
                localPreceptorEmail: preceptorEmail,
                academicSupervisorName: acadSupervisorName,
                academicSupervisorPhone: acadSupervisorPhone,
                academicSupervisorEmail: acadSupervisorEmail,
                coordinatorName,
                coordinatorEmail,
                startDate,
                endDate
            },
            signatures: {
                traineeSignature,
                siteSupervisorSignature,
                academicSupervisorSignature,
                contractDate,
                agreementDate
            }
        };

        try {
            const pdfBlob = await generateCounselorProfilePDF(profileData);
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, "_blank");
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Gagal menjana PDF.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-upsi-navy" size={40} />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            {/* Header Action Bar */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Profil & Kontrak Kaunselor Pelatih</h1>
                    <p className="text-sm text-slate-500">Urus maklumat diri, kontrak praktikum, dan perjanjian latihan.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>Simpan</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 rounded-lg bg-upsi-navy px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-95 transition-colors"
                    >
                        <Printer size={16} />
                        <span>Cetak PDF</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("maklumat")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "maklumat" ? "border-upsi-navy text-upsi-navy" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                    <User size={16} />
                    <span>Maklumat Diri</span>
                </button>
                <button
                    onClick={() => setActiveTab("kontrak")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "kontrak" ? "border-upsi-navy text-upsi-navy" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                    <FileText size={16} />
                    <span>Kontrak Praktikum</span>
                </button>
                <button
                    onClick={() => setActiveTab("perjanjian")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "perjanjian" ? "border-upsi-navy text-upsi-navy" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                    <CheckSquare size={16} />
                    <span>Perjanjian</span>
                </button>
            </div>

            {/* Tab Panels */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {activeTab === "maklumat" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-800">Maklumat Diri Kaunselor Pelatih</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            {/* Passport Photo Upload */}
                            <div className="flex flex-col items-center gap-3 md:col-span-1">
                                <label className="text-sm font-semibold text-slate-600">Gambar Passport</label>
                                <div className="relative flex h-44 w-36 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                                    {photo ? (
                                        <img src={photo} alt="Passport preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-center p-3 text-slate-400">
                                            <Upload className="mx-auto mb-2" size={24} />
                                            <span className="text-[10px]">Muat Naik Gambar</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 text-center">Format JPEG/PNG</span>
                            </div>

                            {/* Demographics Form fields */}
                            <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Nama Penuh</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Nama Penuh Kaunselor Pelatih"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">No. Matriks</label>
                                    <input
                                        type="text"
                                        value={matricNo}
                                        onChange={(e) => setMatricNo(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="M202XXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">No. Kad Pengenalan</label>
                                    <input
                                        type="text"
                                        value={icNo}
                                        onChange={(e) => setIcNo(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="000000-00-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">No. Telefon</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="+601XXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">E-mel</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Alamat Tetap</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none h-20 resize-none"
                                        placeholder="Alamat Tetap Rumah"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tempat Praktikum</label>
                                    <input
                                        type="text"
                                        value={practicumSite}
                                        onChange={(e) => setPracticumSite(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Pusat Kaunseling UPSI / Hospital / Sekolah"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Alamat Tempat Praktikum</label>
                                    <textarea
                                        value={practicumSiteAddress}
                                        onChange={(e) => setPracticumSiteAddress(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none h-20 resize-none"
                                        placeholder="Alamat Penuh Tapak Penempatan Praktikum"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Hubungan Kecemasan (Nama & No. Telefon)</label>
                                    <input
                                        type="text"
                                        value={emergencyContact}
                                        onChange={(e) => setEmergencyContact(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Contoh: Ibu (Fatimah - 0123456789)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "kontrak" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-800">Kontrak Praktikum Kaunseling Kesihatan Mental Klinikal</h2>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Tapak Internship / Praktikum</label>
                                <input
                                    type="text"
                                    value={internshipSite}
                                    onChange={(e) => setInternshipSite(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                    placeholder="Contoh: Universiti Sains Malaysia"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Semester / Tahun</label>
                                <input
                                    type="text"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                    placeholder="Semester 2 Sesi 2025/2026"
                                />
                            </div>

                            {/* Section: Penyelia Lapangan */}
                            <div className="border-t border-slate-100 pt-4 md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Maklumat Penyelia Lapangan / Local Preceptor</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Nama Penyelia</label>
                                        <input
                                            type="text"
                                            value={preceptorName}
                                            onChange={(e) => setPreceptorName(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">No. Telefon</label>
                                        <input
                                            type="text"
                                            value={preceptorPhone}
                                            onChange={(e) => setPreceptorPhone(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">E-mel</label>
                                        <input
                                            type="email"
                                            value={preceptorEmail}
                                            onChange={(e) => setPreceptorEmail(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Penyelia Akademik */}
                            <div className="border-t border-slate-100 pt-4 md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Maklumat Penyelia Akademik (Pensyarah UPSI)</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Nama Pensyarah</label>
                                        <input
                                            type="text"
                                            value={acadSupervisorName}
                                            onChange={(e) => setAcadSupervisorName(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">No. Telefon</label>
                                        <input
                                            type="text"
                                            value={acadSupervisorPhone}
                                            onChange={(e) => setAcadSupervisorPhone(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">E-mel</label>
                                        <input
                                            type="email"
                                            value={acadSupervisorEmail}
                                            onChange={(e) => setAcadSupervisorEmail(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Penyelaras Praktikum */}
                            <div className="border-t border-slate-100 pt-4 md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Maklumat Penyelaras Praktikum</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Nama Penyelaras</label>
                                        <input
                                            type="text"
                                            value={coordinatorName}
                                            onChange={(e) => setCoordinatorName(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                            placeholder="DR. MAZITA AHMAD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">E-mel Penyelaras</label>
                                        <input
                                            type="email"
                                            value={coordinatorEmail}
                                            onChange={(e) => setCoordinatorEmail(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contract Dates */}
                            <div className="border-t border-slate-100 pt-4 md:col-span-2">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Tempoh Kontrak Perjanjian</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tarikh Mula</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tarikh Tamat</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-upsi-navy focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "perjanjian" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-800">Perjanjian Praktikum Kaunselor Pelatih</h2>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 space-y-4">
                            <p><strong>Saya mengaku bahawa:</strong></p>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>Saya telah membaca dan memahami Kod Etika Lembaga Kaunselor Malaysia dan akan mempraktikkan kaunseling seiring dengan standard yang telah ditetapkan.</li>
                                <li>Sebarang perlanggaran etika atau tingkah laku tidak beretika yang dilakukan oleh saya akan mengakibatkan penamatan dan kegagalan praktikum.</li>
                                <li>Dokumentasi berkaitan perlanggaran etika ini akan menjadi sebahagian daripada rekod praktikum kaunseling.</li>
                                <li>Saya faham bahawa saya juga perlu mematuhi kod etika profesion di tempat saya melaksanakan praktikum.</li>
                                <li>Saya bersetuju untuk mematuhi polisi pentadbiran, peraturan, standard dan amalan di tempat praktikum dan akan memastikan saya bertingkah laku secara profesional.</li>
                                <li>Saya faham tanggungjawab saya termasuk memaklumkan perkembangan praktikum kepada pensyarah penyelia dan pegawai di penempatan praktikum.</li>
                                <li>Saya faham tidak akan diberi gred lulus dalam praktikum jika saya tidak mempamerkan kemahiran kaunseling, pengetahuan, dan kecekapan yang memuaskan atau / dan jika saya tidak melengkapkan kursus dan tugasan yang diperlukan.</li>
                            </ul>
                        </div>

                        {/* Signatures & Dates */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-700 mb-4">Pengesahan & Tandatangan</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tandatangan Kaunselor Pelatih (Nama)</label>
                                    <input
                                        type="text"
                                        value={traineeSignature}
                                        onChange={(e) => setTraineeSignature(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Nama Penuh"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tarikh Kontrak / Perjanjian Ditandatangani</label>
                                    <input
                                        type="date"
                                        value={contractDate}
                                        onChange={(e) => setContractDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tandatangan Penyelia Lapangan (Nama)</label>
                                    <input
                                        type="text"
                                        value={siteSupervisorSignature}
                                        onChange={(e) => setSiteSupervisorSignature(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Nama Penyelia Tapak"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tandatangan Penyelia Akademik (Nama)</label>
                                    <input
                                        type="text"
                                        value={academicSupervisorSignature}
                                        onChange={(e) => setAcademicSupervisorSignature(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-upsi-navy focus:outline-none"
                                        placeholder="Nama Pensyarah UPSI"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
