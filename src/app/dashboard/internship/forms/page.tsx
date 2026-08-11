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
    title: "INDIVIDUAL COUNSELING RECORD LOG",
    pdfRef: "Individual_Counseling_Record_Log/CMHC_UPSI/Pindaan03-F2-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form3",
    code: "Form 3",
    title: "INFORMED CONSENT FORM FOR INDIVIDUAL COUNSELING",
    pdfRef: "Individual_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-F3-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form4",
    code: "Form 4",
    title: "CLIENT REGISTRATION FORM",
    pdfRef: "Client_Registration_Form/CMHC_UPSI/Pindaan02-04-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form5",
    code: "Form 5",
    title: "PSYCHOLOGICAL INTAKE REPORT",
    pdfRef: "Psychological_Intake_Report/CMHC_UPSI/Pindaan03_05_2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form6",
    code: "Form 6",
    title: "CASE CONCEPTUALIZATION",
    pdfRef: "Case_Conceptualization/CMHC_UPSI/Pindaan03-06-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form7",
    code: "Form 7",
    title: "CLINICAL TREATMENT PLAN",
    pdfRef: "Clinical_Treatment_Plan/CMHC_UPSI/Pindaan03-07-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form8",
    code: "Form 8",
    title: "CASE NOTES (SOAP FORMAT)",
    pdfRef: "Case_Notes/CMHC_UPSI/Pindaan03-08-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form9",
    code: "Form 9",
    title: "TERMINATION OF INDIVIDUAL COUNSELING SESSION",
    pdfRef: "Termination_Individual Counseling Session/CMHC_UPSI/Pindaan03-09-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form10",
    code: "Form 10",
    title: "GROUP COUNSELING HOURS LOG",
    pdfRef: "Group_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-10-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form11",
    code: "Form 11",
    title: "GROUP COUNSELING RECORD LOG",
    pdfRef: "Group_Counseling_Record_Log/CMHC_UPSI/Pindaan03-11-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form12",
    code: "Form 12",
    title: "INFORMED CONSENT FORM FOR GROUP COUNSELING",
    pdfRef: "Group_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-12-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form13",
    code: "Form 13",
    title: "GROUP COUNSELING REPORT",
    pdfRef: "Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form14",
    code: "Form 14",
    title: "TERMINATION SESSION FOR GROUP COUNSELING",
    pdfRef: "Group_Termination_Session/CMHC_UPSI/Pindaan03-14-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form15",
    code: "Form 15",
    title: "PSYCHOLOGICAL ASSESSMENT REPORT",
    pdfRef: "Psychological_Assessment_Report/CMHC_UPSI/Pindaan03_15-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form16",
    code: "Form 16",
    title: "CRISIS INTERVENTION REPORT",
    pdfRef: "Crisis_Intervention_Report/CMHC_UPSI/Pindaan03-16-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form17",
    code: "Form 17",
    title: "CONSULTATION REPORT",
    pdfRef: "Consultation_Report/CMHC_UPSI/Pindaan03-17-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form18",
    code: "Form 18",
    title: "PSYCHOLOGICAL FIRST AID / MHPSS REPORT",
    pdfRef: "PFA/MHPSS_Report/CMHC_UPSI/Pindaan03-18-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form19",
    code: "Form 19",
    title: "PSYCHOEDUCATION / COMMUNITY PROGRAM REPORT",
    pdfRef: "Psychoeducation/Community_Program/CMHC_UPSI/Pindaan03-19-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form20",
    code: "Form 20",
    title: "PROFESSIONAL DEVELOPMENT REPORT",
    pdfRef: "Professional_Development_Report/CMHC_UPSI/Pindaan03-20-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form21",
    code: "Form 21",
    title: "CONSULTATION HOURS LOG",
    pdfRef: "Consultation_Hours_Log/CMHC_UPSI/Pindaan03-21-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form22",
    code: "Form 22",
    title: "CRISIS INTERVENTION HOURS LOG",
    pdfRef: "Crisis Intervention_Hours_Log/CMHC_UPSI/Pindaan03-22-2026",
    status: "1:1 Exact Replica Complete"
  },
  {
    id: "form23",
    code: "Form 23",
    title: "PFA/MHPSS HOURS LOG",
    pdfRef: "PFA/MHPSS_Hours_Log/CMHC_UPSI/Pindaan03-23-2026",
    status: "1:1 Exact Replica Complete"
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
            CLINICAL FORMS
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
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Individual_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F1-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight">INDIVIDUAL COUNSELING HOURS LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
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
      ) : activeTab === "form2" ? (
        /* ===================================================================
            FORM 2: INDIVIDUAL COUNSELING RECORD LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Individual_Counseling_Record_Log/CMHC_UPSI/Pindaan03-F2-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight">INDIVIDUAL COUNSELING RECORD LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 4 Client Entry Blocks Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[11px] leading-tight text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-32">Client Name</th>
                  <th className="border border-black p-1.5">Component Information</th>
                  <th className="border border-black p-1.5" colSpan={9}>
                    Date & Time
                  </th>
                </tr>
                <tr className="bg-slate-50 border-b border-black font-bold text-center text-[10px]">
                  <th className="border border-black p-1" colSpan={2}></th>
                  <th className="border border-black p-1 w-12">S.1</th>
                  <th className="border border-black p-1 w-12">S.2</th>
                  <th className="border border-black p-1 w-12">S.3</th>
                  <th className="border border-black p-1 w-12">S.4</th>
                  <th className="border border-black p-1 w-12">S.5</th>
                  <th className="border border-black p-1 w-12">S.6</th>
                  <th className="border border-black p-1 w-12">S.7</th>
                  <th className="border border-black p-1 w-12">S.8</th>
                  <th className="border border-black p-1 w-12">S.9</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((clientNum) => (
                  <React.Fragment key={clientNum}>
                    {/* Row 1: Intake Session */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-2 font-bold align-top" rowSpan={6}>
                        <input
                          type="text"
                          placeholder={`Client Name #${clientNum}`}
                          className="w-full h-full bg-transparent border-0 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="border border-black p-1.5">
                        <span className="font-semibold">Intake Session</span>
                        <br />
                        <span className="text-[10px] text-slate-600">(History Taking & Assessment)</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                    {/* Row 2: Case Conceptualization */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span className="font-semibold">Case Conceptualization &</span>
                        <br />
                        <span className="font-semibold">Provisional Diagnosis</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                    {/* Row 3: Treatment Planning */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">Treatment Planning</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                    {/* Row 4: Application of Intervention */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">Application of Intervention</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                    {/* Row 5: Summary Progression */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span>Summary of the Client</span>
                        <br />
                        <span>Progression</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                    {/* Row 6: Termination */}
                    <tr className="border-b-2 border-black">
                      <td className="border border-black p-1.5">Termination</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
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
                <p>UPSI</p>
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
                <p>UPSI</p>
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 italic text-center pt-2">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form3" ? (
        /* ===================================================================
            FORM 3: INFORMED CONSENT FORM FOR INDIVIDUAL COUNSELING (1:1 REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 3 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Individual_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-F3-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  INFORMED CONSENT FORM FOR INDIVIDUAL COUNSELING
                </h2>
              </div>
            </div>

            {/* Fillable Intro Paragraph */}
            <div className="space-y-2 text-xs pt-2">
              <p className="leading-relaxed">
                I am a student currently undergoing an internship at{" "}
                <input type="text" placeholder="________________________________________________________" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-full sm:w-auto" />
                {" "}from{" "}
                <input type="text" placeholder="DD/MM/YYYY" className="border-b border-black w-28 text-center font-bold focus:outline-none bg-transparent" />
                {" "}to{" "}
                <input type="text" placeholder="DD/MM/YYYY" className="border-b border-black w-28 text-center font-bold focus:outline-none bg-transparent" />.
                During this period, I will be supervised by{" "}
                <input type="text" placeholder="Academic Supervisor Name" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-64" />
                {" "}(academic supervisor's name) and{" "}
                <input type="text" placeholder="Site Supervisor Name" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-64" />
                {" "}(site supervisor's name).
              </p>
            </div>

            {/* Section: CONFIDENTIALITY */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">CONFIDENTIALITY AND LIMITATIONS OF CONFIDENTIALITY</h3>
              <p>
                All discussions in the sessions are confidential. However, there are certain limitations to confidentiality that require me (the student) to report to the relevant authorities if:
              </p>
              <ul className="space-y-1 pl-4">
                <li>
                  <span className="font-bold">a) Risk of serious harm:</span> If there is a reasonable concern of imminent and serious risk of harm to you or others.
                </li>
                <li>
                  <span className="font-bold">b) Abuse/neglect:</span> Suspected abuse or neglect of a child, older person, or vulnerable individual where reporting is required.
                </li>
                <li>
                  <span className="font-bold">c) Court order/legal requirement:</span> If records are compelled by a valid court order or lawful authority.
                </li>
                <li>
                  <span className="font-bold">d) Medical emergency:</span> Information may be shared with relevant professionals to ensure safety.
                </li>
                <li>
                  <span className="font-bold">e) Professional supervision/consultation:</span> Your case may be discussed for professional consultation/supervision, with reasonable efforts to protect your identity.
                </li>
                <li>
                  <span className="font-bold">f) Client Rights:</span> You may request clarification on confidentiality at any point.
                </li>
              </ul>
            </div>

            {/* Section: SESSION DURATION */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">SESSION DURATION</h3>
              <p>
                Each individual counseling session will last between 45 to 60 minutes. However, the duration will depend on the client goals and progress and will be reviewed periodically.
              </p>
            </div>

            {/* Section: VIDEO/AUDIO RECORDING */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">VIDEO/AUDIO RECORDING</h3>
              <p>
                I will record counseling sessions for learning and teaching purposes. If at any time you feel uncomfortable, the recording can be stopped. These recordings will be shared with my academic supervisor and site supervisor. The recordings will not interfere with the training process, and they will only continue if both you and I are comfortable. All recordings and transcripts will be destroyed at the end of this course.
              </p>
            </div>

            {/* Section: CLIENT RESPONSIBILITIES AND RIGHTS */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">CLIENT RESPONSIBILITIES AND RIGHTS</h3>
              <ul className="space-y-1 pl-4">
                <li><span className="font-bold">a)</span> To cooperate and be honest during counseling sessions.</li>
                <li><span className="font-bold">b)</span> To make sincere and continuous effort to address the issues presented.</li>
                <li><span className="font-bold">c)</span> Participate in decisions regarding goals and approaches.</li>
                <li><span className="font-bold">d)</span> To inform the counselor in advance if you are unable to attend a scheduled counseling appointment. You also have the right to withdraw and/or request a referral to another counselor/psychology officer/clinical psychologist/counsellor trainee if you do not feel comfortable.</li>
                <li><span className="font-bold">e)</span> You have the right to be informed if information from your sessions has been recorded.</li>
              </ul>
            </div>

            {/* Section: Responsibilities of Psychology Officer */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold text-xs">Responsibilities of the Psychology Officer/Counselor/Counselor Trainee</h3>
              <p>
                In this counseling/assessment/psychological intervention, I act as a counselor/psychological officer/clinical psychologist/trainee counselor to assist you in managing the issues or concerns you wish to resolve, while respecting your dignity, values, and abilities. If you fail to attend the scheduled appointment <span className="font-bold">three (3) consecutive times</span>, I reserve the right to terminate the sessions. I will refer you to
              </p>
            </div>

            {/* Copyright Footer */}
            <div className="text-[9px] text-slate-500 italic text-center pt-4 border-t">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
            </div>
          </div>

          {/* PAGE 2 OF FORM 3 */}
          <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Individual_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-F3-2026
            </div>

            <p className="pt-2">
              another counselor/psychological officer/clinical psychologist—<span className="font-bold">with your prior consent</span>—if you present concerns that are beyond my competence. Further referral will be made when necessary, based on your clinical condition/issues.
            </p>

            {/* Section: PROFESSIONAL BOUNDARIES */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">PROFESSIONAL BOUNDARIES</h3>
              <ul className="space-y-1 pl-4">
                <li><span className="font-bold">a)</span> Counseling is a professional relationship. Dual relationship (e.g. close friendship, business relationship) are avoided to protect your wellbeing.</li>
                <li><span className="font-bold">b)</span> Gifts, social media contact, and non-professional contact may be declined to maintain ethical boundaries.</li>
                <li><span className="font-bold">c)</span> Any concerns about boundaries can be discussed openly.</li>
              </ul>
            </div>

            {/* Section: ACKNOWLEDGEMENT AND SIGNATURES */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">ACKNOWLEDGEMENT AND SIGNATURES</h3>
              <p>By signing below, I confirm that:</p>
              <ul className="space-y-1 pl-4">
                <li><span className="font-bold">a)</span> I have read and understood this informed consent.</li>
                <li><span className="font-bold">b)</span> I have had the opportunity to ask questions, and my questions have been answered.</li>
                <li><span className="font-bold">c)</span> I voluntarily agree to participate in individual counseling under the terms described.</li>
              </ul>
            </div>

            {/* Signatures Fillable Form Block */}
            <div className="space-y-4 pt-6 max-w-2xl font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-56">Client Signature</span>
                <span>:</span>
                <input type="text" placeholder="[ Digital Signature / Initials ]" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-56">Client Name</span>
                <span>:</span>
                <input type="text" placeholder="Full Client Name" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-56">IC Number</span>
                <span>:</span>
                <input type="text" placeholder="e.g. 981012-08-5432" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-56">Date</span>
                <span>:</span>
                <input type="text" placeholder="YYYY-MM-DD" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-56">CMHC Counselor Trainee Signature</span>
                  <span>:</span>
                  <input type="text" placeholder="[ Counselor Signature ]" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-56">CMHC Counselor Trainee Name</span>
                  <span>:</span>
                  <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-56">Date</span>
                  <span>:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-1" />
                </div>
              </div>
            </div>

            {/* Copyright Footer */}
            <div className="text-[9px] text-slate-500 italic text-center pt-8 border-t">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
            </div>
          </div>
        </div>
      ) : activeTab === "form4" ? (
        /* ===================================================================
            FORM 4: CLIENT REGISTRATION FORM (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Client_Registration_Form/CMHC_UPSI/Pindaan02-04-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                CLIENT REGISTRATION FORM
              </h2>
            </div>
          </div>

          {/* Section 1: CLIENT'S INFORMATION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-bold">
              <span>CLIENT'S INFORMATION: (Please include other relevant information)</span>
              <div className="flex items-center space-x-1">
                <span>Date of Referral:</span>
                <input type="text" placeholder="DD/MM/YYYY" className="border-b border-black w-32 text-center font-bold focus:outline-none bg-transparent" />
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center space-x-2">
                <span className="w-24 font-bold">Name:</span>
                <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-16 font-bold">D.O.B:</span>
                  <input type="text" placeholder="DD/MM/YYYY" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5 text-center" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-16 font-bold">I/C No:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-12 font-bold">Age:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5 text-center" />
                  <span className="font-bold ml-2">Sex:</span>
                  <label className="inline-flex items-center space-x-1 ml-1 cursor-pointer">
                    <input type="radio" name="sex" className="accent-black" />
                    <span>Male</span>
                  </label>
                  <label className="inline-flex items-center space-x-1 ml-1 cursor-pointer">
                    <input type="radio" name="sex" className="accent-black" />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                <span className="font-bold">Ethnicity:</span>
                {["Malay", "Chinese", "Indian"].map((eth) => (
                  <label key={eth} className="inline-flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="ethnicity" className="accent-black" />
                    <span>{eth}</span>
                  </label>
                ))}
                <div className="flex items-center space-x-1">
                  <label className="inline-flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="ethnicity" className="accent-black" />
                    <span>Others:</span>
                  </label>
                  <input type="text" className="border-b border-black w-32 focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>

                <span className="font-bold ml-4">Marital Status:</span>
                {["Single", "Married"].map((ms) => (
                  <label key={ms} className="inline-flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="maritalStatus" className="accent-black" />
                    <span>{ms}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-24 font-bold">Full Address:</span>
                  <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
                <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5 font-bold pl-26" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold">Telephone: (Home)</span>
                  <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">(Work):</span>
                  <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">(H/P):</span>
                  <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-28 font-bold">Email Address:</span>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>

              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <span className="w-48 font-bold">School/Office Address (if relevant):</span>
                  <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
                <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>
            </div>
          </div>

          <hr className="border-black border-t-2 my-4" />

          {/* Section 2: EMERGENCY CONTACT PERSON */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-xs">
              EMERGENCY CONTACT PERSON
            </h3>
            <p className="text-[11px] text-slate-700 italic">
              (Spouse/Parents/Guardian/Next of Kin Contact Information):
            </p>

            {[1, 2].map((personNum) => (
              <div key={personNum} className="space-y-2 pt-1 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <span className="font-bold">Please tick:</span>
                  {["Mother", "Father", "Spouse", "Siblings", "Cousins"].map((rel) => (
                    <label key={rel} className="inline-flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name={`emContact_${personNum}`} className="accent-black" />
                      <span>{rel}</span>
                    </label>
                  ))}
                  <div className="flex items-center space-x-1">
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name={`emContact_${personNum}`} className="accent-black" />
                      <span>Other:</span>
                    </label>
                    <input type="text" className="border-b border-black w-36 focus:outline-none bg-transparent p-0.5 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex items-center space-x-2">
                    <span className="w-16 font-bold">Name:</span>
                    <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-20 font-bold">Phone No:</span>
                    <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-16 font-bold">Address:</span>
                    <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                  </div>
                  <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
                </div>
              </div>
            ))}
          </div>

          <hr className="border-black border-t-2 my-4" />

          {/* Section 3: PREVIOUS/CURRENT CONTACT WITH MENTAL HEALTH SERVICES */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4 font-bold">
              <span>PREVIOUS/CURRENT CONTACT WITH MENTAL HEALTH SERVICES:</span>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="mentalHealthServices" className="accent-black" />
                <span>No</span>
              </label>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="mentalHealthServices" className="accent-black" />
                <span>Yes (Please specify):</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex items-center space-x-2">
                <span className="w-16 font-bold">Hospital:</span>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-12 font-bold">Year:</span>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold text-center" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-20 font-bold">Diagnosis:</span>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-20 font-bold">Medication:</span>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex items-center space-x-4 font-bold">
                <span>CURRENT MEDICATIONS TAKEN:</span>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="medicationsTaken" className="accent-black" />
                  <span>No</span>
                </label>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="medicationsTaken" className="accent-black" />
                  <span>Yes (Please list):</span>
                </label>
                <input type="text" className="flex-1 border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
              </div>
              <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5 font-bold" />
            </div>
          </div>

          <hr className="border-black border-t-2 my-4" />

          {/* Section 4: CRISIS SITUATION ASSESSMENT */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-xs">
              ARE YOU CURRENTLY EXPERIENCED ANY CRISIS SITUATION AS BELOW:
            </h3>

            <div className="space-y-2 font-semibold">
              {[
                { num: 1, text: "Are you having thoughts about ending your life?" },
                { num: 2, text: "Do you have a plan to end your life?" },
                { num: 3, text: "Have you attempted to harm yourself or others?" },
                { num: 4, text: "Do you feel like there is no way out of your current situation?" }
              ].map((item) => (
                <div key={item.num} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                  <span>{item.num}. {item.text}</span>
                  <div className="flex items-center space-x-4 shrink-0">
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name={`crisis_${item.num}`} className="accent-black" />
                      <span>No</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <label className="inline-flex items-center space-x-1 cursor-pointer">
                        <input type="radio" name={`crisis_${item.num}`} className="accent-black" />
                        <span>Yes (Please specify):</span>
                      </label>
                      <input type="text" className="border-b border-black w-36 focus:outline-none bg-transparent p-0.5 font-bold" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-black border-t-2 my-4" />

          {/* Section 5: DAILY FUNCTIONING SCALE (0 to 10) */}
          <div className="space-y-4 pt-1">
            <p className="font-bold text-xs">
              On a scale from 0 to 10, how much has your current situation affected your daily functioning?
            </p>
            <div className="flex items-center justify-between font-black text-sm px-4 pt-2">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
            <div className="flex items-center space-x-2 px-2">
              <input type="range" min="0" max="10" step="1" className="w-full accent-black cursor-pointer" />
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="text-[9px] text-slate-500 italic text-center pt-8 border-t my-4">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form5" ? (
        /* ===================================================================
            FORM 5: PSYCHOLOGICAL INTAKE REPORT (3-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 5 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychological_Intake_Report/CMHC_UPSI/Pindaan03_05_2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  PSYCHOLOGICAL INTAKE REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* PERSONAL DATA Block */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
                PERSONAL DATA:
              </h3>
              <div className="space-y-2 pt-1 font-bold">
                {[
                  { label: "Session Number", key: "sessionNo" },
                  { label: "Session Date & Time", key: "sessionDateTime" },
                  { label: "Client Full Name", key: "clientName" },
                  { label: "Ethnic/Sex", key: "ethnicSex" },
                  { label: "Date of Birth", key: "dob" },
                  { label: "Identification Card No", key: "icNo" },
                  { label: "Age", key: "age" },
                  { label: "Designation", key: "designation" },
                  { label: "Date of Report", key: "dateOfReport" }
                ].map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <span className="w-48">{field.label}</span>
                    <span>:</span>
                    <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: REASON FOR REFERRAL */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                REASON FOR REFFERAL
              </h3>
              <textarea rows={4} placeholder="Detail reason for referral..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: BEHAVIOUR OBSERVATION */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                BEHAVIOUR OBSERVATION
              </h3>
              <textarea rows={4} placeholder="Detail behaviour observation..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: HISTORY OF PRESENTING ISSUES */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                HISTORY OF PRESENTING ISSUES
              </h3>
              <textarea rows={4} placeholder="Detail history of presenting issues..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: PSYCHIATRIC HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                PSYCHIATRIC HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail psychiatric history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 5 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychological_Intake_Report/CMHC_UPSI/Pindaan03_05_2026
            </div>

            {/* Section: MEDICAL HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                MEDICAL HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail medical history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: FAMILY HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                FAMILY HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail family history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: DEVELOPMENTAL HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                DEVELOPMENTAL HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail developmental history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: SOCIAL HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                SOCIAL HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail social history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: SUBSTANCE USE HISTORY */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                SUBSTANCE USE HISTORY
              </h3>
              <textarea rows={4} placeholder="Detail substance use history..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: CURRENT SITUATION FUNCTIONING */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                CURRENT SITUATION FUNCTIONING
              </h3>
              <textarea rows={4} placeholder="Detail current situation functioning..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 3 OF FORM 5 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychological_Intake_Report/CMHC_UPSI/Pindaan03_05_2026
            </div>

            {/* Section: ASSESSMENT RESULT */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                ASSESSMENT RESULT
              </h3>
              <textarea rows={4} placeholder="Detail assessment results..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: CLINICAL JUDGEMENT */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                CLINICAL JUDGEMENT
              </h3>
              <textarea rows={4} placeholder="Detail clinical judgement..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: DIAGNOSTIC IMPRESSION / PROVISIONAL DIAGNOSTIC */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                DIAGNOSTIC IMPRESSION / PROVISIONAL DIAGNOSTIC
              </h3>
              <textarea rows={4} placeholder="Detail diagnostic impression and DSM-5 codes..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: GOALS OF THE SESSION */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                GOALS OF THE SESSION
              </h3>
              <textarea rows={4} placeholder="Detail goals of the session..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: TREATMENT PLANNING */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                TREATMENT PLANNING
              </h3>
              <textarea rows={4} placeholder="Detail treatment plan & interventions..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-6 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form6" ? (
        /* ===================================================================
            FORM 6: CASE CONCEPTUALIZATION (2-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 6 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Case_Conceptualization/CMHC_UPSI/Pindaan03-06-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  CASE CONCEPTUALIZATION
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Client Demographics Block */}
            <div className="space-y-2 pt-2">
              <div className="space-y-2 pt-1 font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-36">Client Full Name</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-36">Ethnic/Sex</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-36">Age</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-36">Diagnosis</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
              </div>
            </div>

            {/* Section 1: CASE CONCEPTUALIZATION / Client's Profile */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                CASE CONCEPTUALIZATION
              </h3>
              <p className="font-bold underline text-xs">Client's Profile</p>
              <textarea rows={4} placeholder="Detail client's profile..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 2: Presenting Problem */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Presenting Problem
              </h3>
              <textarea rows={4} placeholder="Detail presenting problem..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 3: Predisposing Factors */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Predisposing Factors
              </h3>
              <textarea rows={4} placeholder="Detail predisposing factors..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 4: Precipitating Factors */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Precipitating Factors
              </h3>
              <textarea rows={4} placeholder="Detail precipitating factors..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 5: Perpetuating Factors */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Perpetuating Factors
              </h3>
              <textarea rows={4} placeholder="Detail perpetuating factors..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 6 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Case_Conceptualization/CMHC_UPSI/Pindaan03-06-2026
            </div>

            {/* Section 6: Protective Factors */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Protective Factors
              </h3>
              <textarea rows={6} placeholder="Detail protective factors..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 7: Overall Summary */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Overall Summary
              </h3>
              <textarea rows={8} placeholder="Detail overall summary & case synthesis..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-8 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-8 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form7" ? (
        /* ===================================================================
            FORM 7: CLINICAL TREATMENT PLAN (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Clinical_Treatment_Plan/CMHC_UPSI/Pindaan03-07-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                CLINICAL TREATMENT PLAN
              </h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* Demographics & Theoretical Orientation Block */}
          <div className="space-y-2 pt-2 font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-44">Client Full Name</span>
              <span>:</span>
              <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-44">Ethnic/Sex</span>
              <span>:</span>
              <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-44">Age</span>
              <span>:</span>
              <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-44">Diagnosis</span>
              <span>:</span>
              <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <span className="w-44">Theoretical Orientation</span>
              <span>:</span>
              <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
          </div>

          {/* 3-Column Goal / Intervention Matrix Grid */}
          <div className="overflow-x-auto pt-4">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-2 w-1/3">Goal(s)</th>
                  <th className="border border-black p-2 w-1/3">Therapeutic Intervention</th>
                  <th className="border border-black p-2 w-1/3">Outcome Measures of Change</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((rowNum) => (
                  <tr key={rowNum} className="border-b border-black h-48 align-top">
                    <td className="border border-black p-2">
                      <textarea
                        rows={8}
                        placeholder={`Clinical Goal #${rowNum}...`}
                        className="w-full h-full bg-transparent border-0 focus:outline-none resize-none p-1"
                      />
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        rows={8}
                        placeholder={`Therapeutic Intervention #${rowNum}...`}
                        className="w-full h-full bg-transparent border-0 focus:outline-none resize-none p-1"
                      />
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        rows={8}
                        placeholder={`Outcome Measures of Change #${rowNum}...`}
                        className="w-full h-full bg-transparent border-0 focus:outline-none resize-none p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sign-off Trainee Block */}
          <div className="space-y-4 pt-8 text-xs font-bold border-t border-slate-300">
            <p>Report by:</p>
            <div className="w-72 border-b border-black pb-1">
              <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
            </div>
            <div className="text-[11px] leading-tight font-normal">
              <p className="font-bold">CMHC Counselor Trainee</p>
              <p>Universiti Pendidikan Sultan Idris</p>
              <p>35900 Tanjong Malim, Perak</p>
            </div>
          </div>

          {/* Footer Confidential Notice */}
          <div className="pt-8 border-t border-slate-300 text-center">
            <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
            <p className="text-[9px] text-slate-500 italic mt-0.5">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
            </p>
          </div>
        </div>
      ) : activeTab === "form8" ? (
        /* ===================================================================
            FORM 8: CASE NOTES - SOAP FORMAT (2-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 8 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Case_Notes/CMHC_UPSI/Pindaan03-08-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  CASE NOTES
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* PERSONAL DATA Block */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
                PERSONAL DATA:
              </h3>
              <div className="space-y-2 pt-1 font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-44">Session Number</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Session Date & Time</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Client Full Name</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Date of Report</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Diagnosis</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
              </div>
            </div>

            {/* Section: SUBJECTIVE (S) */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                SUBJECTIVE (S)
              </h3>
              <textarea rows={4} placeholder="Patient's personal experiences, feelings, concerns, chief complaint, and history of present illness..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: OBJECTIVE (O) */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                OBJECTIVE (O)
              </h3>
              <textarea rows={4} placeholder="Observable data, appearance, behavior, speech patterns, vital signs, and diagnostic findings..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: ASSESSMENT (A) */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                ASSESSMENT (A)
              </h3>
              <textarea rows={4} placeholder="Clinical evaluation of S & O, diagnosis, symptom severity, intervention effectiveness..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: PLAN (P) */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                PLAN (P)
              </h3>
              <textarea rows={4} placeholder="Next treatment steps, intervention changes, coping strategies, and referrals..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-6 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 8: GUIDING NOTES FOR WRITING SOAP NOTE */}
          <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Case_Notes/CMHC_UPSI/Pindaan03-08-2026
            </div>

            <div className="space-y-2 border-b border-black pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                GUIDING NOTES FOR WRITING SOAP NOTE
              </h2>
              <p className="font-bold text-slate-800 text-xs">The Four Parts of a SOAP Note</p>
            </div>

            {/* Part 1: Subjective */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-bold text-xs text-black">1. Subjective</h3>
              <p className="text-slate-800 leading-relaxed text-xs">
                The subjective component of a SOAP note focuses on the patient's personal experiences, feelings, and concerns. This section should include details about the patient's chief complaint, history of present illness, medical and family history, and any relevant social or environmental factors. When writing the subjective portion, it's essential to use the patient's words as much as possible to accurately convey their perspective.
              </p>
            </div>

            {/* Part 2: Objective */}
            <div className="space-y-1.5 pt-4">
              <h3 className="font-bold text-xs text-black">2. Objective</h3>
              <p className="text-slate-800 leading-relaxed text-xs">
                The objective section of a SOAP note records observable data and factual information about the patient. This can include vital signs, physical examination findings, laboratory results, and any additional diagnostic data. In the context of mental health treatment, the objective section may also include details about the patient's appearance, behavior, and speech patterns.
              </p>
            </div>

            {/* Part 3: Assessment */}
            <div className="space-y-1.5 pt-4">
              <h3 className="font-bold text-xs text-black">3. Assessment</h3>
              <p className="text-slate-800 leading-relaxed text-xs">
                The assessment portion of a SOAP note is where the healthcare provider evaluates the information gathered during the subjective and objective sections. This section may include a diagnosis, a summary of the patient's progress, and any potential risk factors or complications. In the case of anxiety and depression, the assessment might focus on the severity of symptoms, the effectiveness of current interventions, and any co-occurring conditions.
              </p>
            </div>

            {/* Part 4: Plan */}
            <div className="space-y-1.5 pt-4">
              <h3 className="font-bold text-xs text-black">4. Plan</h3>
              <p className="text-slate-800 leading-relaxed text-xs">
                The plan section outlines the next steps in the patient's treatment, including any changes to their current interventions or the addition of new therapies. For anxiety and depression, this might involve adjustments to medications, the introduction of new coping strategies, or referrals to additional support services.
              </p>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-12 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form9" ? (
        /* ===================================================================
            FORM 9: TERMINATION OF INDIVIDUAL COUNSELING SESSION (2-PAGE 1:1 REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 9 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Termination_Individual Counseling Session/CMHC_UPSI/Pindaan03-09-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  TERMINATION OF INDIVIDUAL COUNSELING SESSION
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Client Information Table Block */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  {[
                    { label: "Client Name", key: "name" },
                    { label: "Gender", key: "gender" },
                    { label: "Age", key: "age" },
                    { label: "Ethnic", key: "ethnic" },
                    { label: "Position", key: "position" },
                    { label: "Diagnosis", key: "diagnosis" }
                  ].map((field) => (
                    <tr key={field.key} className="border-b border-black">
                      <td className="border border-black p-2 font-bold w-44">{field.label}</td>
                      <td className="border border-black p-1">
                        <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section: Synopsis */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Synopsis
              </div>
              <textarea rows={5} placeholder="Brief clinical summary of case background..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Evaluation of The Client's Current Functioning Level */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Evaluation of The Client’s Current Functioning Level
              </div>
              <textarea rows={5} placeholder="Assessment of current cognitive, emotional, and behavioral functioning..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Justification for Termination */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Justification for Termination
              </div>
              <textarea rows={5} placeholder="Clinical justification for terminating individual counseling..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Summary of progress towards goals */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Summary of progress towards goals (including final diagnostic impression)
              </div>
              <textarea rows={5} placeholder="Summary of treatment goal progress and final diagnostic impression..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 9 */}
          <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Termination_Individual Counseling Session/CMHC_UPSI/Pindaan03-09-2026
            </div>

            {/* Section: Clinical Evaluation */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Clinical Evaluation
              </div>
              <textarea rows={8} placeholder="Overall clinical evaluation of treatment outcomes..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Follow Up Plan */}
            <div className="space-y-1.5 pt-4">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Follow Up Plan
              </div>
              <textarea rows={8} placeholder="Relapse prevention, maintenance plan, or referral details..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-12 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-12 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form10" ? (
        /* ===================================================================
            FORM 10: GROUP COUNSELING HOURS LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Group_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-10-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">GROUP COUNSELING HOURS LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 30-Row Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-10">Bil.</th>
                  <th className="border border-black p-1.5 w-24">Date</th>
                  <th className="border border-black p-1.5">Name of the Group</th>
                  <th className="border border-black p-1.5 w-32 leading-tight">
                    Number of Group<br />Members
                  </th>
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
      ) : activeTab === "form11" ? (
        /* ===================================================================
            FORM 11: GROUP COUNSELING RECORD LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Group_Counseling_Record_Log/CMHC_UPSI/Pindaan03-11-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">GROUP COUNSELING RECORD LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 4 Group Entry Blocks Table Grid (S.1 to S.10) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[11px] leading-tight text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-10">Bil</th>
                  <th className="border border-black p-1.5 w-32">Group Name/Code</th>
                  <th className="border border-black p-1.5 w-24 leading-tight">
                    Number of<br />Group<br />Members
                  </th>
                  <th className="border border-black p-1.5">Component Information</th>
                  <th className="border border-black p-1.5" colSpan={10}>
                    Date
                  </th>
                </tr>
                <tr className="bg-slate-50 border-b border-black font-bold text-center text-[10px]">
                  <th className="border border-black p-1" colSpan={4}></th>
                  <th className="border border-black p-1 w-10">S.1</th>
                  <th className="border border-black p-1 w-10">S.2</th>
                  <th className="border border-black p-1 w-10">S.3</th>
                  <th className="border border-black p-1 w-10">S.4</th>
                  <th className="border border-black p-1 w-10">S.5</th>
                  <th className="border border-black p-1 w-10">S.6</th>
                  <th className="border border-black p-1 w-10">S.7</th>
                  <th className="border border-black p-1 w-10">S.8</th>
                  <th className="border border-black p-1 w-10">S.9</th>
                  <th className="border border-black p-1 w-10">S.10</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((groupNum) => (
                  <React.Fragment key={groupNum}>
                    {/* Row 1: Rapport Building */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1 text-center font-bold align-top" rowSpan={6}>{groupNum}.</td>
                      <td className="border border-black p-1.5 font-bold align-top" rowSpan={6}>
                        <input
                          type="text"
                          placeholder={`Group Name #${groupNum}`}
                          className="w-full bg-transparent border-0 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="border border-black p-1 text-center align-top" rowSpan={6}>
                        <input
                          type="text"
                          placeholder="Qty"
                          className="w-full text-center bg-transparent border-0 focus:outline-none"
                        />
                      </td>
                      <td className="border border-black p-1.5">
                        <span>Rapport Building and early group information gathering</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: Group Initial Stage */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span>Group initial stage – Norming and Storming</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Mid Stage */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span>Mid Stage/Group Working Stage</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Intervention */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span>Intervention - Theoretical Approach/Technique Used</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: Monitoring member progression */}
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">
                        <span>Monitoring member progression</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: Closing stage */}
                    <tr className="border-b-2 border-black">
                      <td className="border border-black p-1.5">
                        <span>Closing stage / Termination</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <td key={s} className="border border-black p-0.5 text-center">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
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
                <p>UPSI</p>
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
                <p>UPSI</p>
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 italic text-center pt-2">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form12" ? (
        /* ===================================================================
            FORM 12: INFORMED CONSENT FORM FOR GROUP COUNSELING (2-PAGE 1:1 REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 12 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-12-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  INFORMED CONSENT FORM<br />FOR GROUP COUNSELING
                </h2>
              </div>
            </div>

            {/* Fillable Intro Paragraph */}
            <div className="space-y-2 text-xs pt-2">
              <p className="leading-relaxed">
                I am a student currently undergoing an internship at{" "}
                <input type="text" placeholder="________________________________________________________" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-full sm:w-auto" />
                {" "}from{" "}
                <input type="text" placeholder="DD/MM/YYYY" className="border-b border-black w-28 text-center font-bold focus:outline-none bg-transparent" />
                {" "}to{" "}
                <input type="text" placeholder="DD/MM/YYYY" className="border-b border-black w-28 text-center font-bold focus:outline-none bg-transparent" />.
                During this period, I will be supervised by{" "}
                <input type="text" placeholder="Academic Supervisor Name" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-64" />
                {" "}(academic supervisor's name) and{" "}
                <input type="text" placeholder="Site Supervisor Name" className="border-b border-black px-1 font-bold focus:outline-none bg-transparent w-64" />
                {" "}(site supervisor's name).
              </p>
            </div>

            {/* Section: CONFIDENTIALITY */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">CONFIDENTIALITY AND LIMITATIONS OF CONFIDENTIALITY</h3>
              <p>
                All discussions in the sessions are confidential. To guarantee the confidentiality, group members are also responsible for maintaining this confidentiality. However, there are certain limitations to confidentiality that require me (the student) to report to the relevant authorities if:
              </p>
              <ul className="space-y-1 pl-4">
                <li>
                  <span className="font-bold">a)</span> The information shared poses a risk to the client, such as self-harm, harm to others, or any dangerous behavior indicating a lack of self-control;
                </li>
                <li>
                  <span className="font-bold">b)</span> The client is involved in sexual or physical abuse of children, adults, the elderly, individuals with disabilities, or their partner;
                </li>
                <li>
                  <span className="font-bold">c)</span> In legal cases, information may be subpoenaed by the court.
                </li>
                <li>
                  <span className="font-bold">d)</span> For supervision or learning purposes, as a student, I may share session discussions with my professor without disclosing the client's identity.
                </li>
              </ul>
            </div>

            {/* Section: SESSION DURATION */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">SESSION DURATION</h3>
              <p>
                Each group session will last between 60 to 90 minutes. However, the duration may be shorter or longer depending on group discussions.
              </p>
            </div>

            {/* Section: VIDEO/AUDIO RECORDING */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">VIDEO/AUDIO RECORDING</h3>
              <p>
                I will record counseling sessions for learning and teaching purposes. If at any time you feel uncomfortable, the recording can be stopped. These recordings will be shared with my academic supervisor and site supervisor. The recordings will not interfere with the training process, and they will only continue if both you and I are comfortable. All recordings and transcripts will be destroyed at the end of this course.
              </p>
            </div>

            {/* Section: HOW GROUP COUNSELING IS CONDUCTED */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">HOW GROUP COUNSELING IS CONDUCTED</h3>
              <ul className="space-y-1 pl-4">
                <li><span className="font-bold">a)</span> The counsellor trainee and group members will collaborate to establish the group's goals, agreed upon by all members.</li>
                <li><span className="font-bold">b)</span> The counsellor trainee will not make decisions for group members but will act as a facilitator to encourage decision-making. The responsibility for any decisions made lies with the client and group members.</li>
                <li><span className="font-bold">c)</span> Each group member is responsible for discussing issues or challenges they feel comfortable sharing within the group and working together to find the best solutions.</li>
                <li><span className="font-bold">d)</span> Group members are responsible for their commitment, accountability, and active participation throughout the group sessions.</li>
              </ul>
            </div>

            {/* Section: RESPONSIBILITIES OF CLIENTS */}
            <div className="space-y-1 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-xs">RESPONSIBILITIES OF CLIENTS AND THE COUNSELOR-IN-TRAINING (STUDENT)</h3>
              <ul className="space-y-1 pl-4">
                <li><span className="font-bold">a)</span> During the sessions, the Counselor Trainee acts as a facilitator to help group members address their issues while respecting their dignity, values, and abilities.</li>
                <li><span className="font-bold">b)</span> Each selected group member shares similar goals and needs to work toward achieving the best possible</li>
              </ul>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="text-[9px] text-slate-500 italic">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 12 */}
          <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-12-2026
            </div>

            <div className="space-y-1 pl-4">
              <p><span className="font-bold">group outcome.</span></p>
              <p><span className="font-bold">c)</span> Group members have the right to give permission to the Counselor Trainee to record sessions for supervision or specific research purposes.</p>
              <p><span className="font-bold">d)</span> Group members have the right to review or listen to any recorded sessions.</p>
            </div>

            <p className="pt-2 font-semibold">
              I have read and understood all the information in this contract and agree not to dispute any actions taken by the Counselor Trainee if I violate this agreement.
            </p>

            {/* Section: INFORMED CONSENT FOR THE GROUP MEMBERS LISTED BELOW */}
            <div className="space-y-3 pt-4">
              <h3 className="font-bold uppercase tracking-wider text-xs">
                INFORMED CONSENT FOR THE GROUP MEMBERS LISTED BELOW:
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black font-bold text-center">
                      <th className="border border-black p-1.5 w-12">Bil.</th>
                      <th className="border border-black p-1.5">Full Name</th>
                      <th className="border border-black p-1.5 w-44">IC. Number</th>
                      <th className="border border-black p-1.5 w-44">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                      <tr key={num} className="border-b border-black h-8">
                        <td className="border border-black p-1 text-center font-bold">{num}.</td>
                        <td className="border border-black p-0.5">
                          <input type="text" className="w-full bg-transparent border-0 focus:outline-none px-1" />
                        </td>
                        <td className="border border-black p-0.5">
                          <input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" />
                        </td>
                        <td className="border border-black p-0.5">
                          <input type="text" placeholder="[ Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-[10px]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sign-off Counselor Trainee Block */}
            <div className="space-y-4 pt-6 max-w-xl font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-24">Signature:</span>
                <input type="text" placeholder="[ Trainee Signature ]" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
              <div className="text-[11px] leading-tight font-normal pt-2">
                <p className="border-b border-black w-72 pb-0.5 font-bold">( {traineeName} )</p>
                <p className="font-bold pt-1">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-8 border-t border-slate-300 text-center">
              <p className="text-[9px] text-slate-500 italic">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form13" ? (
        /* ===================================================================
            FORM 13: GROUP COUNSELING REPORT (4-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 13 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  GROUP COUNSELING REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Orange Header Table Block: Group Leader/Counselor */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>Group Leader/Counselor</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold w-32">Date</td>
                    <td className="border border-black p-1"><input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                    <td className="border border-black p-1.5 font-bold w-20 text-center">Time</td>
                    <td className="border border-black p-1"><input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold text-center" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Duration</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" placeholder="e.g. 90 mins" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Type of Group</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Number of Session</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Number of Clients Attending the Group</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold align-top">Name of Clients Attending The Group</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <div key={n} className="flex items-center space-x-1">
                            <span className="font-bold w-4">{n}.</span>
                            <input type="text" placeholder={`Member ${n}`} className="flex-1 border-b border-slate-300 bg-transparent focus:outline-none p-0.5" />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Issues Focused of the day</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-bold">Session Objectives</td>
                    <td className="border border-black p-1" colSpan={3}><input type="text" className="w-full bg-transparent border-0 focus:outline-none p-0.5 font-bold" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section: Background Information of Group Members */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Background Information of the Group Members /Observations Result
              </h3>
              <textarea rows={4} placeholder="Detail background info and observation results..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Group Initial Stage */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Group Initial Stage
              </h3>
              <textarea rows={4} placeholder="Detail norming and storming observations..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Mid-Stage/Group Working Stage */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Mid-Stage/Group Working Stage
              </h3>
              <textarea rows={4} placeholder="Detail working stage dynamics..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 13 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026
            </div>

            {/* Section: Theoretical Approach/Group Techniques Used */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Theoretical Approach/Group Techniques Used
              </h3>
              <textarea rows={4} placeholder="Detail theoretical approach and group techniques..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Diagnostic Impression/Intervention */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Diagnostic Impression/Intervention
              </h3>
              <textarea rows={4} placeholder="Detail diagnostic impressions and interventions..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Client Progress/Barriers */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Client Progress/Barriers (Internal/External Dynamics Supporting or Hindering Change)
              </h3>
              <textarea rows={4} placeholder="Detail client progress and internal/external barriers..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Treatment Planning */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Treatment Planning
              </h3>
              <textarea rows={4} placeholder="Detail treatment plan for future group sessions..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Termination/Closing Stage and Follow Up Actions */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Termination/Closing Stage and Follow Up Actions
              </h3>
              <textarea rows={4} placeholder="Detail closing stage and follow up actions..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Counselor's Comments/Reflections */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                Counselor’s Comments/Reflections
              </h3>
              <textarea rows={4} placeholder="Counselor's self-reflection on group process..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 3 OF FORM 13 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026
            </div>

            <div className="space-y-2 border-b border-black pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                Brief Individual Progress Report For Each Group Member
              </h2>
            </div>

            {/* Group Members 1 to 7 */}
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs w-32">Group Member {num}:</span>
                    <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                  </div>
                  <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5" />
                  <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5" />
                </div>
              ))}
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 4 OF FORM 13 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026
            </div>

            {/* Group Member 8 */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs w-32">Group Member 8:</span>
                <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
              <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5" />
              <input type="text" className="w-full border-b border-black focus:outline-none bg-transparent p-0.5" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-16 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-16 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form14" ? (
        /* ===================================================================
            FORM 14: TERMINATION SESSION FOR GROUP COUNSELING (2-PAGE 1:1 REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 14 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Termination_Session/CMHC_UPSI/Pindaan03-14-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  TERMINATION SESSION FOR GROUP COUNSELING
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Client Information Table Block */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-48">Group Code</td>
                    <td className="border border-black p-1">
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">
                      Name of the Group<br />Members
                    </td>
                    <td className="border border-black p-2">
                      <textarea rows={4} placeholder="List all group members..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">
                      Number of the<br />sessions and Date
                    </td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="e.g. 8 Sessions (2026-01-10 to 2026-03-15)" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">
                      Diagnosis / Primary<br />Concern
                    </td>
                    <td className="border border-black p-1">
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section: Synopsis */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Synopsis
              </div>
              <textarea rows={5} placeholder="Brief clinical summary of group counseling case..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Evaluation of Each Group Member's Current Functioning Level */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Evaluation of Each Group Member’s Current Functioning Level
              </div>
              <textarea rows={5} placeholder="Assessment of current cognitive, emotional, and behavioral functioning for each group member..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Justification for Termination */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Justification for Termination
              </div>
              <textarea rows={5} placeholder="Clinical justification for terminating group counseling..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 14 */}
          <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Group_Termination_Session/CMHC_UPSI/Pindaan03-14-2026
            </div>

            {/* Section: Summary of progress towards goals */}
            <div className="space-y-1.5 pt-2">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Summary of progress towards goals (including final diagnostic impression)
              </div>
              <textarea rows={7} placeholder="Summary of group goal achievements and final diagnostic impression..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Clinical Evaluation */}
            <div className="space-y-1.5 pt-4">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Clinical Evaluation
              </div>
              <textarea rows={7} placeholder="Overall clinical evaluation of group treatment outcomes..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section: Follow Up Plan */}
            <div className="space-y-1.5 pt-4">
              <div className="bg-[#fce5cd] border border-black p-1.5 font-bold text-xs">
                Follow Up Plan
              </div>
              <textarea rows={7} placeholder="Group relapse prevention, maintenance plan, or individual referral details..." className="w-full border border-black p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-10 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-10 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form15" ? (
        /* ===================================================================
            FORM 15: PSYCHOLOGICAL ASSESSMENT REPORT (2-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 15 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychological_Assessment_Report/CMHC_UPSI/Pindaan03_15-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  PSYCHOLOGICAL ASSESSMENT REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* PERSONAL DATA Block */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
                PERSONAL DATA:
              </h3>
              <div className="space-y-2 pt-1 font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-44">Client Full Name</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Ethnic/Sex</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Date of Birth</span>
                  <span>:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Identification Card No</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Age</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Designation</span>
                  <span>:</span>
                  <input type="text" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Date of Assessment</span>
                  <span>:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-44">Assessment Conducted By</span>
                  <span>:</span>
                  <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
                </div>
              </div>
            </div>

            {/* Section 1: REASON FOR REFERRAL */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                REASON FOR REFFERAL
              </h3>
              <textarea rows={4} placeholder="Detail referral sources and primary concerns..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 2: BEHAVIOUR OBSERVATION */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                BEHAVIOUR OBSERVATION
              </h3>
              <textarea rows={4} placeholder="Detail behavioral and mental status observations..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 3: PSYCHOLOGICAL TESTS ADMINISTERED */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                PSYCHOLOGICAL TESTS ADMINISTERED:
              </h3>
              <textarea rows={4} placeholder="List psychological test batteries administered..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>

          {/* PAGE 2 OF FORM 15 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychological_Assessment_Report/CMHC_UPSI/Pindaan03_15-2026
            </div>

            {/* Section 4: TEST RESULTS AND INTERPRETATION */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                TEST RESULTS AND INTERPRETATION
              </h3>
              <textarea rows={5} placeholder="Detail test scores, percentile ranks, and clinical interpretations..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 5: DIAGNOSTIC IMPRESSION */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                DIAGNOSTIC IMPRESSION
              </h3>
              <textarea rows={4} placeholder="Detail DSM-5 / ICD-11 diagnostic impressions..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 6: SUMMARY OF FINDINGS */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                SUMMARY OF FINDINGS <span className="font-normal text-[11px] uppercase">(Psychological Functioning Based On Assessment Results, Relationship Between Symptoms, Test Findings, and Real-Life Concerns, Strengths, Protective Factors, and Areas Needing Support)</span>
              </h3>
              <textarea rows={5} placeholder="Synthesize assessment findings, strengths, protective factors, and areas needing support..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 7: RECOMMENDATIONS/TREATMENT PLAN */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                RECOMMENDATIONS/TREATMENT PLAN
              </h3>
              <textarea rows={4} placeholder="Detail treatment recommendations and intervention planning..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Section 8: PROGNOSIS */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-0.5">
                PROGNOSIS
              </h3>
              <textarea rows={3} placeholder="Detail clinical prognosis..." className="w-full border border-slate-300 p-2 focus:outline-none resize-y text-xs font-normal" />
            </div>

            {/* Sign-off Trainee Block */}
            <div className="space-y-4 pt-6 text-xs font-bold border-t border-slate-300">
              <p>Report by:</p>
              <div className="w-72 border-b border-black pb-1">
                <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
              </div>
              <div className="text-[11px] leading-tight font-normal">
                <p className="font-bold">CMHC Counselor Trainee</p>
                <p>Universiti Pendidikan Sultan Idris</p>
                <p>35900 Tanjong Malim, Perak</p>
              </div>
            </div>

            {/* Footer Confidential Notice */}
            <div className="pt-4 border-t border-slate-300 text-center">
              <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "form16" ? (
        /* ===================================================================
            FORM 16: CRISIS INTERVENTION REPORT (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Crisis_Intervention_Report/CMHC_UPSI/Pindaan03-16-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-4 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                CRISIS INTERVENTION REPORT
              </h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* Table Block with Orange Headers */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <tbody>
                {/* Orange Banner Header 1 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold w-44">Client Name</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold w-44">Date</td>
                  <td className="border border-black p-1">
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                  <td className="border border-black p-2 font-bold w-20 text-center">Time</td>
                  <td className="border border-black p-1">
                    <input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1 text-center" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Gender</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Age</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Location</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Type of Crisis</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" placeholder="e.g. Suicidal ideation, Panic, Acute Trauma..." className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>

                {/* Orange Banner Header 2 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Crisis Description</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={4} placeholder="Detail nature and triggering circumstances of the crisis..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                {/* Orange Banner Header 3 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Crisis Intervention Provided</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={4} placeholder="Detail immediate clinical stabilization techniques, safety contracts, and de-escalation..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                {/* Orange Banner Header 4 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Need for Referral</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={3} placeholder="Detail emergency psychiatric or medical referrals required..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                {/* Orange Banner Header 5 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Follow-Up Plan (If Needed)</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={3} placeholder="Detail scheduled follow-up monitoring timeline..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sign-off Trainee Block */}
          <div className="space-y-4 pt-6 text-xs font-bold border-t border-slate-300">
            <p>Report by:</p>
            <div className="w-72 border-b border-black pb-1">
              <span>( </span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="w-4/5 border-0 focus:outline-none bg-transparent font-bold" /><span> )</span>
            </div>
            <div className="text-[11px] leading-tight font-normal">
              <p className="font-bold">CMHC Counselor Trainee</p>
              <p>Universiti Pendidikan Sultan Idris</p>
              <p>35900 Tanjong Malim, Perak</p>
            </div>
          </div>

          {/* Footer Confidential Notice */}
          <div className="pt-4 border-t border-slate-300 text-center">
            <p className="font-bold text-xs">Confidential Document (For Professional Use Only)</p>
            <p className="text-[9px] text-slate-500 italic mt-0.5">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </p>
          </div>
        </div>
      ) : activeTab === "form17" ? (
        /* ===================================================================
            FORM 17: CONSULTATION REPORT (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Consultation_Report/CMHC_UPSI/Pindaan03-17-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                CONSULTATION REPORT
              </h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* Name & Institution Metadata */}
          <div className="space-y-2 pt-1 font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-24">Name</span>
              <span>:</span>
              <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24">Institution</span>
              <span>:</span>
              <input type="text" placeholder="e.g. UPSI / Placement Site" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
            </div>
          </div>

          {/* Table Block with Orange Header Banners */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <tbody>
                {/* Orange Banner Header 1 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold w-44">Client’s Name</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold w-44">Guardian’s Name</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold w-44">Date</td>
                  <td className="border border-black p-1">
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                  <td className="border border-black p-2 font-bold w-20 text-center">Time</td>
                  <td className="border border-black p-1">
                    <input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1 text-center" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Venue</td>
                  <td className="border border-black p-1" colSpan={3}>
                    <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Attendance Type</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <div className="flex items-center space-x-8 font-bold">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                        <span>Voluntary</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                        <span>Referred</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                        <span>Invited</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Orange Banner Header 2 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Issue (s) Discussed</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={4} placeholder="Detail consultation issues discussed with parents/guardians/staff..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                {/* Orange Banner Header 3 */}
                <tr className="bg-[#fce5cd] border-b border-black font-bold">
                  <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Intervention / Resolution Actions</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={4} placeholder="Detail agreed interventions and resolution action items..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">Follow-Up</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={3} placeholder="Detail follow-up timeline and responsibilities..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Referral Needed</td>
                  <td className="border border-black p-2" colSpan={3}>
                    <div className="flex items-center space-x-8 font-bold">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                        <span>No</span>
                      </label>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold align-top">
                    Referral (If necessary, please specify):
                  </td>
                  <td className="border border-black p-2" colSpan={3}>
                    <textarea rows={2} placeholder="Specify referral details..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action / Signature / Date Endorsement Table Block */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-[#fce5cd] border-b border-black font-bold text-center">
                  <th className="border border-black p-2 w-1/3">Action</th>
                  <th className="border border-black p-2 w-1/3">Signature</th>
                  <th className="border border-black p-2 w-1/3">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Trainee Counselor’s Signature</td>
                  <td className="border border-black p-1 text-center font-bold">
                    <input type="text" placeholder="[ Trainee Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                  </td>
                  <td className="border border-black p-1 text-center">
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Site Supervisor’s Signature</td>
                  <td className="border border-black p-1 text-center font-bold">
                    <input type="text" placeholder="[ Site Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                  </td>
                  <td className="border border-black p-1 text-center">
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">Academic Supervisor’s Signature</td>
                  <td className="border border-black p-1 text-center font-bold">
                    <input type="text" placeholder="[ Academic Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                  </td>
                  <td className="border border-black p-1 text-center">
                    <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Copyright Notice */}
          <div className="text-[9px] text-slate-500 italic text-center pt-2">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form18" ? (
        /* ===================================================================
            FORM 18: PSYCHOLOGICAL FIRST AID / MHPSS REPORT (2-PAGE 1:1 REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 18 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              PFA/MHPSS_Report/CMHC_UPSI/Pindaan03-18-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  PSYCHOLOGICAL FIRST AID/<br />MENTAL HEALTH & PSYCHOSOCIAL SUPPORT REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Name & Institution Metadata */}
            <div className="space-y-2 pt-1 font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-24">Name</span>
                <span>:</span>
                <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-24">Institution</span>
                <span>:</span>
                <input type="text" placeholder="e.g. UPSI / Placement Site" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
            </div>

            {/* Table Block with Orange Header Banners */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  {/* Orange Banner Header 1 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44">Program / Session</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <div className="flex items-center space-x-12 font-bold">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>PFA</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>MHPSS</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44">Name of the Program/Session</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44">Date</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                    <td className="border border-black p-2 font-bold w-20 text-center">Time</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1 text-center" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Venue</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Number of Participants Involved</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Speaker / Provider</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Collaborator(s) (If any)</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Objectives of the Program / Session</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={3} placeholder="Detail objectives..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>

                  {/* Orange Banner Header 2 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Identified Issue(s)</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail identified psychological issues or trauma triggers..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>

                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Activities / Interventions Delivered</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail PFA/MHPSS activities and interventions delivered..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-2">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>

          {/* PAGE 2 OF FORM 18 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              PFA/MHPSS_Report/CMHC_UPSI/Pindaan03-18-2026
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  {/* Orange Banner Header 3 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44 align-top">Follow-Up (If needed)</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail follow-up plan or monitoring..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Referral Needed</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <div className="flex items-center space-x-8 font-bold">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>No</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">
                      Referral (If necessary, please specify):
                    </td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={3} placeholder="Specify referral details..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action / Signature / Date Endorsement Table Block */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <thead>
                  <tr className="bg-[#fce5cd] border-b border-black font-bold text-center">
                    <th className="border border-black p-2 w-1/3">Action</th>
                    <th className="border border-black p-2 w-1/3">Signature</th>
                    <th className="border border-black p-2 w-1/3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Trainee Counselor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Trainee Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Site Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Site Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Academic Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Academic Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-bold text-xs pt-2">
              **Attached Photos and/or Certificate as evidence.
            </p>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-8">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>
        </div>
      ) : activeTab === "form19" ? (
        /* ===================================================================
            FORM 19: PSYCHOEDUCATION / COMMUNITY PROGRAM REPORT (2-PAGE REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 19 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychoeducation/Community_Program/CMHC_UPSI/Pindaan03-19-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  PSYCHOEDUCATION/COMMUNITY PROGRAM REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Name & Institution Metadata */}
            <div className="space-y-2 pt-1 font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-24">Name</span>
                <span>:</span>
                <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-24">Institution</span>
                <span>:</span>
                <input type="text" placeholder="e.g. UPSI / Placement Site" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
            </div>

            {/* Table Block with Orange Header Banners */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  {/* Orange Banner Header 1 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44">Name of the Program/Activities</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44">Date</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                    <td className="border border-black p-2 font-bold w-20 text-center">Time</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1 text-center" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Venue</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Target Participants</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Number of Participants Involved</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Speaker / Provider</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Collaborator(s) (If any)</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Objectives of the Program / Session</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={3} placeholder="Detail objectives..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>

                  {/* Orange Banner Header 2 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Psychoeducation Activities</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail psychoeducation modules, community activities, and training topics..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>

                  {/* Orange Banner Header 3 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Evaluation/Feedback From the Participants</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail participant feedback, pre/post evaluation, and overall response..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-2">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>

          {/* PAGE 2 OF FORM 19 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Psychoeducation/Community_Program/CMHC_UPSI/Pindaan03-19-2026
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-44 align-top">Aspect Need to be Improved</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Detail program aspects requiring improvement or future adjustments..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Self-Reflection</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Counselor's professional self-reflection on facilitating the community program..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action / Signature / Date Endorsement Table Block */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <thead>
                  <tr className="bg-[#fce5cd] border-b border-black font-bold text-center">
                    <th className="border border-black p-2 w-1/3">Action</th>
                    <th className="border border-black p-2 w-1/3">Signature</th>
                    <th className="border border-black p-2 w-1/3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Trainee Counselor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Trainee Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Site Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Site Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Academic Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Academic Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-bold text-xs pt-2">
              **Attached Photos and/or Certificate as evidence.
            </p>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-8">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>
        </div>
      ) : activeTab === "form20" ? (
        /* ===================================================================
            FORM 20: PROFESSIONAL DEVELOPMENT REPORT (2-PAGE 1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-6 max-w-4xl mx-auto text-black">
          {/* PAGE 1 OF FORM 20 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Professional_Development_Report/CMHC_UPSI/Pindaan03-20-2026
            </div>

            {/* Logo & Center Title Block */}
            <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
              <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
              <div className="text-center font-bold">
                <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">
                  PROFESSIONAL DEVELOPMENT REPORT
                </h2>
                <p className="text-xs uppercase tracking-tight">INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING</p>
                <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
              </div>
            </div>

            {/* Name & Institution Metadata */}
            <div className="space-y-2 pt-1 font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-24">Name</span>
                <span>:</span>
                <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-24">Institution</span>
                <span>:</span>
                <input type="text" placeholder="e.g. UPSI / Placement Site" className="flex-1 border-b border-black font-bold focus:outline-none bg-transparent p-0.5" />
              </div>
            </div>

            {/* Table Block with Orange Header Banners */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <tbody>
                  {/* Orange Banner Header 1 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-48">Name of Conference/<br />Webinar/ Workshop</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold w-48">Date</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                    <td className="border border-black p-2 font-bold w-20 text-center">Time</td>
                    <td className="border border-black p-1">
                      <input type="text" placeholder="HH:MM" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1 text-center" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Venue</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Your Role</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <div className="flex items-center space-x-12 font-bold">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>Participant</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black text-emerald-700" />
                          <span>Presenter</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Number of Participants Involved</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Speaker / Provider (if you are the participants)</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Topic of Presentation/ Participated</td>
                    <td className="border border-black p-1" colSpan={3}>
                      <input type="text" className="w-full bg-transparent border-0 focus:outline-none font-bold p-1" />
                    </td>
                  </tr>

                  {/* Orange Banner Header 2 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Brief Content of the Presentation / You Have Learned</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={5} placeholder="Detail brief content of presentation or key learning points..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>

                  {/* Orange Banner Header 3 */}
                  <tr className="bg-[#fce5cd] border-b border-black font-bold">
                    <td className="border border-black p-1.5" colSpan={4}>&nbsp;</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold align-top">Self-Reflection</td>
                    <td className="border border-black p-2" colSpan={3}>
                      <textarea rows={4} placeholder="Counselor's professional self-reflection on workshop/conference learning..." className="w-full bg-transparent border-0 focus:outline-none resize-y text-xs font-normal" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-2">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>

          {/* PAGE 2 OF FORM 20 */}
          <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm text-xs leading-relaxed">
            {/* Header Metadata Code (Right Aligned Top) */}
            <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
              Professional_Development_Report/CMHC_UPSI/Pindaan03-20-2026
            </div>

            {/* Action / Signature / Date Endorsement Table Block */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <thead>
                  <tr className="bg-[#fce5cd] border-b border-black font-bold text-center">
                    <th className="border border-black p-2 w-1/3">Action</th>
                    <th className="border border-black p-2 w-1/3">Signature</th>
                    <th className="border border-black p-2 w-1/3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Trainee Counselor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Trainee Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Site Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Site Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-2 font-bold">Academic Supervisor’s Signature</td>
                    <td className="border border-black p-1 text-center font-bold">
                      <input type="text" placeholder="[ Academic Supervisor Signature ]" className="w-full text-center bg-transparent border-0 focus:outline-none text-xs" />
                    </td>
                    <td className="border border-black p-1 text-center">
                      <input type="text" placeholder="YYYY-MM-DD" className="w-full text-center bg-transparent border-0 focus:outline-none font-bold text-xs" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-bold text-xs pt-2">
              **Attached Photos and/or Certificate as evidence.
            </p>

            {/* Footer Copyright Notice */}
            <div className="text-[9px] text-slate-500 italic text-center pt-24">
              This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
            </div>
          </div>
        </div>
      ) : activeTab === "form21" ? (
        /* ===================================================================
            FORM 21: CONSULTATION HOURS LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Consultation_Hours_Log/CMHC_UPSI/Pindaan03-21-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">CONSULTATION HOURS LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 30-Row Consultation Log Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-12">Bil.</th>
                  <th className="border border-black p-1.5 w-28">Date</th>
                  <th className="border border-black p-1.5">Consultee Name</th>
                  <th className="border border-black p-1.5 w-44">Consultation Code</th>
                  <th className="border border-black p-1.5 w-24">Session</th>
                  <th className="border border-black p-1.5 w-24">Time</th>
                  <th className="border border-black p-1.5 w-24">Duration</th>
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
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form22" ? (
        /* ===================================================================
            FORM 22: CRISIS INTERVENTION HOURS LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            Crisis Intervention_Hours_Log/CMHC_UPSI/Pindaan03-22-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">CRISIS INTERVENTION HOURS LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 30-Row Crisis Intervention Log Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-12">Bil.</th>
                  <th className="border border-black p-1.5 w-28">Date</th>
                  <th className="border border-black p-1.5">Client Name</th>
                  <th className="border border-black p-1.5 w-44">Client Code</th>
                  <th className="border border-black p-1.5 w-24">Session</th>
                  <th className="border border-black p-1.5 w-24">Time</th>
                  <th className="border border-black p-1.5 w-24">Duration</th>
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
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
          </div>
        </div>
      ) : activeTab === "form23" ? (
        /* ===================================================================
            FORM 23: PFA/MHPSS HOURS LOG (1:1 VECTOR REPLICA)
           =================================================================== */
        <div className="space-y-4 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-5xl mx-auto text-black text-xs">
          {/* Header Metadata Code (Right Aligned Top) */}
          <div className="text-right text-[10px] italic font-serif text-slate-700 pb-2">
            PFA/MHPSS_Hours_Log/CMHC_UPSI/Pindaan03-23-2026
          </div>

          {/* Logo & Center Title Block */}
          <div className="relative flex items-center justify-center pb-4 mb-2 border-b border-black">
            <img src="/upsi-logo.png" alt="UPSI Emblem" className="absolute left-0 top-0 h-16 w-auto object-contain" />
            <div className="text-center font-bold space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight uppercase">PFA/MHPSS HOURS LOG</h2>
              <p className="text-xs uppercase tracking-tight">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
              <p className="text-xs uppercase font-black tracking-wider">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            </div>
          </div>

          {/* 30-Row PFA/MHPSS Log Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-1.5 w-12">Bil.</th>
                  <th className="border border-black p-1.5 w-28">Date</th>
                  <th className="border border-black p-1.5">PFA/MHPSS</th>
                  <th className="border border-black p-1.5">Venue</th>
                  <th className="border border-black p-1.5 w-32 leading-tight">
                    Number of<br />Participants
                  </th>
                  <th className="border border-black p-1.5 w-24">Time</th>
                  <th className="border border-black p-1.5 w-24">Duration</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <tr key={num} className="border-b border-black h-7">
                    <td className="border border-black p-1 text-center font-bold">{num}.</td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full bg-transparent border-0 focus:outline-none px-1" /></td>
                    <td className="border border-black p-0.5"><input type="text" className="w-full bg-transparent border-0 focus:outline-none px-1" /></td>
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
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner - Dr Pau Kee
          </div>
        </div>
      ) : (
        /* Placeholder for Form 24, etc. pending 1:1 PDF Upload */
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
