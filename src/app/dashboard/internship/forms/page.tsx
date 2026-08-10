"use client";

import React, { useState } from "react";
import { FileText, Plus, Search, Filter, CheckCircle2, Award, Clock } from "lucide-react";
import Link from "next/link";

interface ClinicalForm {
  code: string;
  title: string;
  category: "General" | "Intake & Assessment" | "Log & Hours" | "Evaluation & Supervision";
  description: string;
  status: "Available" | "In Progress" | "Completed";
  href?: string;
}

const CLINICAL_FORMS: ClinicalForm[] = [
  {
    code: "FORM 01",
    title: "INDIVIDUAL COUNSELING HOURS LOG",
    category: "Log & Hours",
    description: "Official 30-row individual counseling hours log (Individual_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F1-2026).",
    status: "Available",
    href: "/dashboard/internship/log?section=individual_hours"
  },
  {
    code: "FORM 02",
    title: "GROUP COUNSELING HOURS LOG",
    category: "Log & Hours",
    description: "Official group counseling hours log and clinical supervision tracking.",
    status: "Available",
    href: "/dashboard/internship/log?section=log"
  },
  {
    code: "FORM 03",
    title: "CLIENT REGISTRATION & CLINICAL INTAKE FORM",
    category: "Intake & Assessment",
    description: "Full clinical intake, MSE assessment, and demographic registration.",
    status: "Available",
    href: "/dashboard/forms/form1"
  },
  {
    code: "FORM 04",
    title: "INFORMED CONSENT & CONFIDENTIALITY AGREEMENT",
    category: "General",
    description: "Standardized client informed consent, limits of confidentiality & terms.",
    status: "Available",
    href: "/dashboard/forms/form2"
  },
  {
    code: "FORM 05",
    title: "INDIVIDUAL COUNSELING CASE CONCEPTUALIZATION & TREATMENT PLAN",
    category: "Intake & Assessment",
    description: "Clinical diagnostic formulation, DSM-5-TR codes, and treatment goals.",
    status: "Available",
    href: "/dashboard/forms/form3"
  },
  {
    code: "FORM 06",
    title: "CLINICAL PROGRESS NOTES (SOAP FORMAT)",
    category: "Intake & Assessment",
    description: "Structured Subjective, Objective, Assessment, Plan progress notes.",
    status: "Available",
    href: "/dashboard/forms/form4"
  },
  {
    code: "FORM 07",
    title: "CRISIS INTERVENTION & RISK ASSESSMENT REPORT",
    category: "Intake & Assessment",
    description: "Suicide/self-harm risk evaluation, safety planning & immediate intervention.",
    status: "Available",
    href: "/dashboard/forms/form5"
  },
  {
    code: "FORM 08",
    title: "MENTAL HEALTH PSYCHOSOCIAL SUPPORT (MHPSS) ACTIVITY REPORT",
    category: "General",
    description: "PFA and community psychosocial support activity reporting.",
    status: "Available",
    href: "/dashboard/forms/form6"
  },
  {
    code: "FORM 09",
    title: "PSYCHOEDUCATION & COMMUNITY OUTREACH LOG",
    category: "General",
    description: "Community outreach programs, psychoeducation workshops & consultations.",
    status: "Available",
    href: "/dashboard/forms/form7"
  },
  {
    code: "FORM 10",
    title: "CLINICAL SUPERVISION SESSION RECORD",
    category: "Evaluation & Supervision",
    description: "Individual, triadic, and group supervision feedback & hours verification.",
    status: "Available",
    href: "/dashboard/forms/form8"
  },
  {
    code: "FORM 11",
    title: "CLINICAL CASE STUDY WRITING & PRESENTATION EVALUATION",
    category: "Evaluation & Supervision",
    description: "Evaluation form for formal clinical case study writing and presentation.",
    status: "Available",
    href: "/dashboard/forms/form11"
  },
  {
    code: "FORM 12",
    title: "SITE SUPERVISOR INTERNSHIP EVALUATION FORM",
    category: "Evaluation & Supervision",
    description: "End-of-term evaluation by field/site supervisor.",
    status: "Available",
    href: "/dashboard/forms/form13"
  }
];

export default function InternshipClinicalFormsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredForms = CLINICAL_FORMS.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 antialiased text-slate-900">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          <span>UPSI CMHC Internship</span>
          <span>•</span>
          <span className="text-emerald-700 font-black">Clinical Forms Library</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          CLINICAL FORMS & HOURS LOGS
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Access all official fillable 1:1 clinical forms, intake assessments, supervision evaluations, and hours logs.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms by title or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          {["All", "Log & Hours", "Intake & Assessment", "General", "Evaluation & Supervision"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                selectedCategory === cat 
                  ? "bg-emerald-700 text-white shadow-sm" 
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form) => (
          <div key={form.code} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {form.code}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {form.category}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {form.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {form.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                1:1 Exact Replica
              </span>

              <Link
                href={form.href || "#"}
                className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
              >
                Open Form
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
