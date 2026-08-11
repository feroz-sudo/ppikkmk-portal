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
      ) : (
        /* Placeholder for Form 4, Form 5, etc. pending 1:1 PDF Upload */
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
