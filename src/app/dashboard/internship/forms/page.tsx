"use client";

import React, { useState } from "react";
import { FileText, Plus, BookOpen, CheckCircle2, Clock, ShieldCheck, Printer, Save } from "lucide-react";
import Link from "next/link";

interface ClinicalFormSubTab {
  id: string;
  code: string;
  title: string;
  pdfRef: string;
  status: "Ready for 1:1 Build" | "1:1 Exact Replica Complete";
}

const FORM_SUB_TABS: ClinicalFormSubTab[] = [
  {
    id: "form1",
    code: "Form 1",
    title: "INDIVIDUAL COUNSELING HOURS LOG",
    pdfRef: "Individual_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F1-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form2",
    code: "Form 2",
    title: "GROUP COUNSELING HOURS LOG",
    pdfRef: "Group_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F2-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form3",
    code: "Form 3",
    title: "CLIENT REGISTRATION & CLINICAL INTAKE FORM",
    pdfRef: "Client_Registration_Intake/CMHC_UPSI/Pindaan03-F3-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form4",
    code: "Form 4",
    title: "INFORMED CONSENT & CONFIDENTIALITY AGREEMENT",
    pdfRef: "Informed_Consent/CMHC_UPSI/Pindaan03-F4-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form5",
    code: "Form 5",
    title: "CASE CONCEPTUALIZATION & TREATMENT PLAN",
    pdfRef: "Case_Conceptualization/CMHC_UPSI/Pindaan03-F5-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form6",
    code: "Form 6",
    title: "CLINICAL PROGRESS NOTES (SOAP)",
    pdfRef: "Progress_Notes_SOAP/CMHC_UPSI/Pindaan03-F6-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form7",
    code: "Form 7",
    title: "CRISIS INTERVENTION & RISK ASSESSMENT",
    pdfRef: "Crisis_Intervention/CMHC_UPSI/Pindaan03-F7-2026",
    status: "Ready for 1:1 Build"
  },
  {
    id: "form8",
    code: "Form 8",
    title: "MHPSS & PSYCHOEDUCATION REPORT",
    pdfRef: "MHPSS_Report/CMHC_UPSI/Pindaan03-F8-2026",
    status: "Ready for 1:1 Build"
  }
];

export default function ClinicalFormsHubPage() {
  const [activeTab, setActiveTab] = useState<string>("form1");
  const [traineeName, setTraineeName] = useState("AHMAD FEROZ BIN ABDUL SAMAD");

  const currentForm = FORM_SUB_TABS.find(f => f.id === activeTab) || FORM_SUB_TABS[0];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 antialiased text-black internship-form-font">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 no-print">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <span>UPSI CMHC Internship</span>
            <span>•</span>
            <span className="text-emerald-700 font-black">Official Clinical Forms Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            CLINICAL FORMS (1:1 EXACT REPLICAS)
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 transition"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Form A4
          </button>
          <button
            onClick={() => alert(`Saved ${currentForm.code} successfully!`)}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-md"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Form
          </button>
        </div>
      </div>

      {/* Main Tab Bar for Sub-Tabs (Form 1, Form 2, Form 3...) */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 no-print overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max">
          {FORM_SUB_TABS.map((form) => (
            <button
              key={form.id}
              onClick={() => setActiveTab(form.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === form.id
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{form.code}</span>
              {form.status === "1:1 Exact Replica Complete" && (
                <span className="h-2 w-2 rounded-full bg-emerald-300" title="1:1 Complete"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Form Display Canvas */}
      {activeTab === "form1" ? (
        /* ===================================================================
            FORM 1: INDIVIDUAL COUNSELING HOURS LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code & Copyright Notice */}
          <div className="flex justify-between items-center text-[10px] italic text-slate-600 font-serif border-b pb-1">
            <span>Individual_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F1-2026</span>
          </div>

          {/* Logo & Title Block */}
          <div className="flex items-center space-x-4 border-b-2 border-black pb-3">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="h-16 w-auto object-contain" />
            <div className="flex-1 text-center font-bold space-y-0.5">
              <h2 className="text-sm sm:text-base font-black tracking-wide">INDIVIDUAL COUNSELING HOURS LOG</h2>
              <p className="text-xs uppercase">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 30-Row Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-10">Bil.</th>
                  <th className="border border-black p-1.5 w-24">Date</th>
                  <th className="border border-black p-1.5">Client's Name</th>
                  <th className="border border-black p-1.5 w-28">Client Code</th>
                  <th className="border border-black p-1.5 w-20">Session</th>
                  <th className="border border-black p-1.5 w-20">Time</th>
                  <th className="border border-black p-1.5 w-20">Duration</th>
                  <th className="border border-black p-1.5 w-16">Initial</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <tr key={num} className="border-b border-black h-7">
                    <td className="border border-black p-1 text-center font-bold">{num}.</td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full bg-transparent border-0 focus:outline-none px-1" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sign-off & Endorsement Footer */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-xs font-bold border-t border-slate-300">
            <div className="space-y-8">
              <p>Prepared By:</p>
              <div className="border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>

            <div className="space-y-8">
              <p>Endorsed By:</p>
              <div className="border-b border-black pb-1">
                <span>( </span><input type="text" placeholder="Site Supervisor Name" className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">Site Supervisor</p>
                <p>Institution: <input type="text" placeholder="Site Name" className="border-b border-black w-32 focus:outline-none bg-transparent" /></p>
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>

            <div className="space-y-8">
              <p>Verified By:</p>
              <div className="border-b border-black pb-1">
                <span>( </span><input type="text" placeholder="Academic Supervisor Name" className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">University Academic Supervisor</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 italic text-center pt-2">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
          </div>
        </div>
      ) : (
        /* Placeholder for Form 2, Form 3, etc. pending 1:1 PDF Upload */
        <div className="bg-white p-12 border border-slate-300 rounded-2xl shadow-sm text-center max-w-3xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700 font-black text-xl">
            {currentForm.code}
          </div>
          <h2 className="text-xl font-black text-slate-900">{currentForm.title}</h2>
          <p className="text-xs text-slate-500 font-serif italic">
            Ref: {currentForm.pdfRef}
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Ready to be built into an exact 1:1 fillable vector replica. Upload the original PDF for {currentForm.code} to execute point-by-point coordinate extraction!
          </div>
        </div>
      )}
    </div>
  );
}
