"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface FormItem {
  id: string;
  code: string;
  name: string;
  category: 'clinical' | 'counseling' | 'group' | 'log' | 'report' | 'assessment';
  pdfPath: string;
  description: string;
}

const CLINICAL_FORMS: FormItem[] = [
  { id: '1', code: 'FORM 01', name: 'Individual Counseling Hours Log', category: 'counseling', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2001_INDIVIDUAL%20COUNSELING%20HOURS%20LOG.pdf', description: 'Log of face-to-face individual counseling sessions.' },
  { id: '2', code: 'FORM 02', name: 'Individual Counseling Record Log', category: 'counseling', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2002_INDIVIDUAL%20COUNSELING%20RECORD%20LOG.pdf', description: 'Detailed individual client interaction logs.' },
  { id: '3', code: 'FORM 03', name: 'Individual Counseling Informed Consent', category: 'counseling', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2003_INDIVIDUAL%20COUNSELING%20INFORMED%20CONSENT.pdf', description: 'Client consent form for individual clinical counseling.' },
  { id: '4', code: 'FORM 04', name: 'Client Registration Form', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2004_CLIENT%20REGISTRATION%20FORM.pdf', description: 'Initial intake and registration details for new clients.' },
  { id: '5', code: 'FORM 05', name: 'Psychological Intake Report', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2005_PSYCHOLOGICAL%20INTAKE%20REPORT.pdf', description: 'Intake examination and psychological background report.' },
  { id: '6', code: 'FORM 06', name: 'Case Conceptualization', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2006_CASE%20CONCEPTUALIZATION.pdf', description: 'Clinical case formulation and diagnostic hypotheses.' },
  { id: '7', code: 'FORM 07', name: 'Treatment Planning', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2007_TREATMENT%20PLANNING.pdf', description: 'Treatment goals, interventions, and timeline outline.' },
  { id: '8', code: 'FORM 08', name: 'Progressive Notes', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2008_PROGRESSIVE%20NOTES.pdf', description: 'Ongoing clinical progress notes per session.' },
  { id: '9', code: 'FORM 09', name: 'Termination Session', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2009_TERMINATION%20SESSION.pdf', description: 'Session termination summary and client outcome.' },
  { id: '10', code: 'FORM 10', name: 'Log of Group Counseling Hours', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2010_LOG%20OF%20GROUP%20COUNSELING%20HOURS.pdf', description: 'Hours tracking sheet for group counseling sessions.' },
  { id: '11', code: 'FORM 11', name: 'Group Counseling Record Log', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2011_GROUP%20COUNSELING%20RECORD%20LOG.pdf', description: 'Detailed log of group session topics and attendance.' },
  { id: '12', code: 'FORM 12', name: 'Group Counseling Informed Consent', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2012_GROUP%20COUNSELING%20INFORMED%20CONSENT.pdf', description: 'Informed consent for group participants.' },
  { id: '13', code: 'FORM 13', name: 'Group Counseling Report', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2013_GROUP%20COUNSELING%20REPORT.pdf', description: 'Comprehensive report on completed group counseling.' },
  { id: '14', code: 'FORM 14', name: 'Group Termination Form', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2014_GROUP%20TERMINATION%20FORM.pdf', description: 'Termination summary for group counseling series.' },
  { id: '15', code: 'FORM 15', name: 'Psychological Assessment Report', category: 'assessment', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2015_PSYCHOLOGICAL%20ASSESSMENT%20REPORT.pdf', description: 'Report detailing psychological test results and interpretation.' },
  { id: '16', code: 'FORM 16', name: 'Crisis Intervention Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2016_CRISIS%20INTERVENTION%20REPORT.pdf', description: 'Emergency crisis response and intervention documentation.' },
  { id: '17', code: 'FORM 17', name: 'Consultation Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2017_CONSULTATION%20REPORT.pdf', description: 'Consultation with family, medical staff, or academic heads.' },
  { id: '18', code: 'FORM 18', name: 'PFA / MHPSS Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2018_PFA_MHPSS%20REPORT.pdf', description: 'Psychological First Aid and MHPSS activity report.' },
  { id: '19', code: 'FORM 19', name: 'Psychoeducation & Community Program Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2019_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20REPORT.pdf', description: 'Outreach and community mental health event documentation.' },
  { id: '20', code: 'FORM 20', name: 'Professional Development Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2020_PROFESSIONAL%20DEVELOPMENT%20REPORT.pdf', description: 'Report on workshops, seminars, and training attended.' },
  { id: '21', code: 'FORM 21', name: 'Consultation Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2021_CONSULTATION%20HOURS%20LOG.pdf', description: 'Log sheet for client/case consultation hours.' },
  { id: '22', code: 'FORM 22', name: 'Crisis Intervention Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2022_CRISIS%20INTERVENTION%20HOURS%20LOG.pdf', description: 'Hours spent on crisis management and intervention.' },
  { id: '23', code: 'FORM 23', name: 'PFA / MHPSS Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2023_PFA_MHPSS%20HOURS%20LOG.pdf', description: 'Hours tracking for PFA & Mental Health Support.' },
  { id: '24', code: 'FORM 24', name: 'Psychoeducation & Community Program Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2024_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20HOURS%20LOG.pdf', description: 'Log of hours conducting psychoeducation activities.' },
  { id: '25', code: 'FORM 25', name: 'Professional Development Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2025_PROFESSIONAL%20DEVELOPMENT%20HOURS%20LOG.pdf', description: 'Hours logged for professional skills enrichment.' },
  { id: '26', code: 'FORM 26', name: 'Psychological Assessment Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2026_PSYCHOLOGICAL%20ASSESSMENT%20LOG.pdf', description: 'Log of psychological testing instruments administered.' },
  { id: '27', code: 'FORM 27', name: 'Internship Supervision Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2027_INTERNSHIP%20SUPERVISION%20LOG.pdf', description: 'Record of supervision meetings with Site & Academic Supervisors.' },
  { id: '28', code: 'FORM 28', name: 'Total CMHC Internship Hours', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2028_TOTAL%20CMHC%20INTENRSHIP%20HOURS.pdf', description: 'Final cumulative summary of all internship hours.' },
  { id: '29', code: 'FORM 29', name: 'Clinical Case Study Format', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2029_CLINICAL%20CASE%20STUDY%20FORMAT.pdf', description: 'Standardized layout for clinical case presentations.' },
  { id: '30', code: 'FORM 30', name: 'Weekly Total Clinical Hours', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2030_WEEKLY%20TOTAL%20CLINICAL%20HOURS.pdf', description: 'Weekly compilation of clinical face-to-face & indirect hours.' },
];

export default function InternshipFormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredForms = CLINICAL_FORMS.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            <span>Internship Portal</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">Clinical Forms</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Official Internship Forms</h1>
          <p className="text-sm text-muted-foreground">
            Complete set of 30 standardized clinical forms for Clinical Mental Health Counseling (CMHC) Internship.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/internship/log"
            className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Open Internship Log In
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex items-start space-x-3">
        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-blue-900 dark:text-blue-300">CMHC UPSI Clinical Standard (Pindaan 2026)</span>
          <p className="text-muted-foreground">
            These form templates mirror the original UPSI CMHC Internship specification. All clinical activities, counseling hours, logs, and reports submitted through the portal adhere directly to these 30 standard form formats.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search form number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground ml-1" />
          {[
            { id: 'all', label: 'All Forms' },
            { id: 'counseling', label: 'Counseling' },
            { id: 'clinical', label: 'Clinical' },
            { id: 'group', label: 'Group' },
            { id: 'report', label: 'Reports' },
            { id: 'log', label: 'Hours Log' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="p-4 rounded-xl border bg-card hover:shadow-md transition flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {form.code}
                </span>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  {form.category}
                </span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-blue-600 transition">
                {form.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.description}
              </p>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <a
                href={form.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View PDF Reference
              </a>
              <a
                href={form.pdfPath}
                download
                className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
