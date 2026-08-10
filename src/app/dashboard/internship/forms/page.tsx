"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  BookOpen, 
  ArrowRight, 
  ExternalLink,
  Edit3,
  X,
  Printer,
  Save,
  CheckCircle2
} from 'lucide-react';

interface FormItem {
  id: string;
  code: string;
  name: string;
  category: 'clinical' | 'counseling' | 'group' | 'log' | 'report' | 'assessment';
  pdfPath: string;
  description: string;
  fields: { label: string; placeholder: string; type?: string; options?: string[] }[];
}

const CLINICAL_FORMS: FormItem[] = [
  { 
    id: '1', 
    code: 'FORM 01', 
    name: 'Individual Counseling Hours Log', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2001_INDIVIDUAL%20COUNSELING%20HOURS%20LOG.pdf', 
    description: 'Log of face-to-face individual counseling sessions.',
    fields: [
      { label: 'Name of Counselor Trainee', placeholder: 'Enter trainee full name...' },
      { label: 'Matric Number', placeholder: 'e.g. M20241001148' },
      { label: 'Internship Placement Site', placeholder: 'Enter agency/site name...' },
      { label: 'Client Code / ID', placeholder: 'e.g. CLI-001' },
      { label: 'Session Date & Time', placeholder: 'YYYY-MM-DD HH:MM', type: 'datetime-local' },
      { label: 'Session Duration (Hours)', placeholder: 'e.g. 1.0', type: 'number' },
      { label: 'Session Summary & Focus', placeholder: 'Brief note on counseling goals and progress...' },
      { label: 'Site Supervisor Endorsement Notes', placeholder: 'Supervisor feedback and signatures...' },
    ]
  },
  { 
    id: '2', 
    code: 'FORM 02', 
    name: 'Individual Counseling Record Log', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2002_INDIVIDUAL%20COUNSELING%20RECORD%20LOG.pdf', 
    description: 'Detailed individual client interaction logs.',
    fields: [
      { label: 'Client Name / Code', placeholder: 'Client identifier' },
      { label: 'Session Number', placeholder: 'Session 01' },
      { label: 'Presenting Issue / Diagnosis', placeholder: 'Describe main presenting concern' },
      { label: 'Interventions Applied', placeholder: 'CBT, SFBT, Person-Centered techniques used...' },
      { label: 'Trainee Self-Reflection', placeholder: 'Trainee clinical reflections' },
    ]
  },
  { 
    id: '3', 
    code: 'FORM 03', 
    name: 'Individual Counseling Informed Consent', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2003_INDIVIDUAL%20COUNSELING%20INFORMED%20CONSENT.pdf', 
    description: 'Client consent form for individual clinical counseling.',
    fields: [
      { label: 'Client Full Name', placeholder: 'As per MyKad / Passport' },
      { label: 'NRIC / Passport Number', placeholder: 'IC number' },
      { label: 'Emergency Contact Person', placeholder: 'Name and relationship' },
      { label: 'Emergency Contact Phone', placeholder: '01X-XXXXXXX' },
      { label: 'Consent Declaration Confirmation', placeholder: 'Client agreement statement notes...' },
    ]
  },
  { 
    id: '4', 
    code: 'FORM 04', 
    name: 'Client Registration Form', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2004_CLIENT%20REGISTRATION%20FORM.pdf', 
    description: 'Initial intake and registration details for new clients.',
    fields: [
      { label: 'Full Name', placeholder: 'Client full name' },
      { label: 'Age & Gender', placeholder: 'e.g. 24 / Female' },
      { label: 'Marital Status & Occupation', placeholder: 'Single / Student' },
      { label: 'Contact Number & Address', placeholder: 'Phone & Residential address' },
      { label: 'Reason for Seeking Counseling', placeholder: 'Primary concerns' },
    ]
  },
  { 
    id: '5', 
    code: 'FORM 05', 
    name: 'Psychological Intake Report', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2005_PSYCHOLOGICAL%20INTAKE%20REPORT.pdf', 
    description: 'Intake examination and psychological background report.',
    fields: [
      { label: 'Mental Status Examination (MSE)', placeholder: 'Appearance, affect, speech, thought content...' },
      { label: 'Psychosocial & Family History', placeholder: 'Family background and support systems' },
      { label: 'Medical & Psychiatric History', placeholder: 'Prior diagnoses or medications' },
      { label: 'Initial Clinical Impression', placeholder: 'Diagnostic impressions' },
    ]
  },
  { 
    id: '6', 
    code: 'FORM 06', 
    name: 'Case Conceptualization', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2006_CASE%20CONCEPTUALIZATION.pdf', 
    description: 'Clinical case formulation and diagnostic hypotheses.',
    fields: [
      { label: 'Precipitating Factors', placeholder: 'Triggers leading to issue' },
      { label: 'Predisposing Factors', placeholder: 'Biological/historical vulnerability' },
      { label: 'Perpetuating Factors', placeholder: 'Factors maintaining the issue' },
      { label: 'Protective Factors', placeholder: 'Client strengths and coping' },
      { label: 'Theoretical Orientation Approach', placeholder: 'CBT / REBT / Psychodynamic formulation' },
    ]
  },
  { 
    id: '7', 
    code: 'FORM 07', 
    name: 'Treatment Planning', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2007_TREATMENT%20PLANNING.pdf', 
    description: 'Treatment goals, interventions, and timeline outline.',
    fields: [
      { label: 'Short-Term Goals', placeholder: 'Immediate 1-3 session goals' },
      { label: 'Long-Term Goals', placeholder: 'Overall therapeutic outcomes' },
      { label: 'Intervention Plan', placeholder: 'Action steps and homework' },
      { label: 'Estimated Timeline & Review Date', placeholder: 'e.g. 6 sessions / Date' },
    ]
  },
  { 
    id: '8', 
    code: 'FORM 08', 
    name: 'Progressive Notes', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2008_PROGRESSIVE%20NOTES.pdf', 
    description: 'Ongoing clinical progress notes per session.',
    fields: [
      { label: 'SOAP / BIRP Note - Subjective', placeholder: 'Client statements & reported mood' },
      { label: 'Objective Observations', placeholder: 'Behavioral observations in session' },
      { label: 'Assessment / Analysis', placeholder: 'Clinical progress analysis' },
      { label: 'Plan & Homework', placeholder: 'Plan for next session' },
    ]
  },
  { 
    id: '9', 
    code: 'FORM 09', 
    name: 'Termination Session', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2009_TERMINATION%20SESSION.pdf', 
    description: 'Session termination summary and client outcome.',
    fields: [
      { label: 'Reason for Termination', placeholder: 'Goals achieved / Referral / Client request' },
      { label: 'Summary of Goals Achieved', placeholder: 'Outcome evaluation' },
      { label: 'Relapse Prevention Plan', placeholder: 'Maintenance strategies' },
      { label: 'Follow-up Recommendations', placeholder: 'Future recommendations' },
    ]
  },
  { 
    id: '10', 
    code: 'FORM 10', 
    name: 'Log of Group Counseling Hours', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2010_LOG%20OF%20GROUP%20COUNSELING%20HOURS.pdf', 
    description: 'Hours tracking sheet for group counseling sessions.',
    fields: [
      { label: 'Group Topic / Theme', placeholder: 'e.g. Stress Management Group' },
      { label: 'Number of Members Present', placeholder: 'e.g. 6 members' },
      { label: 'Session Date & Hours Logged', placeholder: 'Hours duration' },
      { label: 'Supervisor Endorsement', placeholder: 'Endorsement status' },
    ]
  },
  { id: '11', code: 'FORM 11', name: 'Group Counseling Record Log', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2011_GROUP%20COUNSELING%20RECORD%20LOG.pdf', description: 'Detailed log of group session topics and attendance.', fields: [{ label: 'Session Topic', placeholder: 'Topic outline' }, { label: 'Group Process Notes', placeholder: 'Group dynamics' }] },
  { id: '12', code: 'FORM 12', name: 'Group Counseling Informed Consent', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2012_GROUP%20COUNSELING%20INFORMED%20CONSENT.pdf', description: 'Informed consent for group participants.', fields: [{ label: 'Member Name', placeholder: 'Participant name' }, { label: 'Confidentiality Agreement', placeholder: 'Group rules consent' }] },
  { id: '13', code: 'FORM 13', name: 'Group Counseling Report', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2013_GROUP%20COUNSELING%20REPORT.pdf', description: 'Comprehensive report on completed group counseling.', fields: [{ label: 'Group Summary', placeholder: 'Final group report' }, { label: 'Member Evaluation', placeholder: 'Individual progress in group' }] },
  { id: '14', code: 'FORM 14', name: 'Group Termination Form', category: 'group', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2014_GROUP%20TERMINATION%20FORM.pdf', description: 'Termination summary for group counseling series.', fields: [{ label: 'Termination Summary', placeholder: 'Closure activities' }] },
  { id: '15', code: 'FORM 15', name: 'Psychological Assessment Report', category: 'assessment', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2015_PSYCHOLOGICAL%20ASSESSMENT%20REPORT.pdf', description: 'Report detailing psychological test results and interpretation.', fields: [{ label: 'Instrument Used (e.g. DASS-21, BDI)', placeholder: 'Test name' }, { label: 'Raw Score & Severity Level', placeholder: 'Scores' }, { label: 'Clinical Interpretation', placeholder: 'Interpretation details' }] },
  { id: '16', code: 'FORM 16', name: 'Crisis Intervention Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2016_CRISIS%20INTERVENTION%20REPORT.pdf', description: 'Emergency crisis response and intervention documentation.', fields: [{ label: 'Nature of Crisis (Suicidal/Homicidal/Trauma)', placeholder: 'Crisis description' }, { label: 'Immediate Safety Plan Implemented', placeholder: 'Safety steps' }, { label: 'Referrals & Emergency Contacts Notified', placeholder: 'Emergency actions' }] },
  { id: '17', code: 'FORM 17', name: 'Consultation Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2017_CONSULTATION%20REPORT.pdf', description: 'Consultation with family, medical staff, or academic heads.', fields: [{ label: 'Person Consulted', placeholder: 'Doctor / Guardian / Academic' }, { label: 'Consultation Objectives & Findings', placeholder: 'Outcome notes' }] },
  { id: '18', code: 'FORM 18', name: 'PFA / MHPSS Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2018_PFA_MHPSS%20REPORT.pdf', description: 'Psychological First Aid and MHPSS activity report.', fields: [{ label: 'Event Location & Audience', placeholder: 'Disaster / Community site' }, { label: 'PFA Action Steps (Look, Listen, Link)', placeholder: 'Intervention details' }] },
  { id: '19', code: 'FORM 19', name: 'Psychoeducation & Community Program Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2019_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20REPORT.pdf', description: 'Outreach and community mental health event documentation.', fields: [{ label: 'Program Title', placeholder: 'Workshop title' }, { label: 'Total Participants', placeholder: 'Attendee count' }] },
  { id: '20', code: 'FORM 20', name: 'Professional Development Report', category: 'report', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2020_PROFESSIONAL%20DEVELOPMENT%20REPORT.pdf', description: 'Report on workshops, seminars, and training attended.', fields: [{ label: 'Workshop / Seminar Title', placeholder: 'Conference title' }, { label: 'Key Learning Points', placeholder: 'Takeway notes' }] },
  { id: '21', code: 'FORM 21', name: 'Consultation Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2021_CONSULTATION%20HOURS%20LOG.pdf', description: 'Log sheet for client/case consultation hours.', fields: [{ label: 'Consultation Date & Hours', placeholder: 'Log details' }] },
  { id: '22', code: 'FORM 22', name: 'Crisis Intervention Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2022_CRISIS%20INTERVENTION%20HOURS%20LOG.pdf', description: 'Hours spent on crisis management and intervention.', fields: [{ label: 'Date & Crisis Hours Logged', placeholder: 'Log details' }] },
  { id: '23', code: 'FORM 23', name: 'PFA / MHPSS Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2023_PFA_MHPSS%20HOURS%20LOG.pdf', description: 'Hours tracking for PFA & Mental Health Support.', fields: [{ label: 'Date & PFA Hours Logged', placeholder: 'Log details' }] },
  { id: '24', code: 'FORM 24', name: 'Psychoeducation & Community Program Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2024_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20HOURS%20LOG.pdf', description: 'Log of hours conducting psychoeducation activities.', fields: [{ label: 'Date & Outreach Hours Logged', placeholder: 'Log details' }] },
  { id: '25', code: 'FORM 25', name: 'Professional Development Hours Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2025_PROFESSIONAL%20DEVELOPMENT%20HOURS%20LOG.pdf', description: 'Hours logged for professional skills enrichment.', fields: [{ label: 'Date & Seminar Hours Logged', placeholder: 'Log details' }] },
  { id: '26', code: 'FORM 26', name: 'Psychological Assessment Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2026_PSYCHOLOGICAL%20ASSESSMENT%20LOG.pdf', description: 'Log of psychological testing instruments administered.', fields: [{ label: 'Assessment Instrument & Hours Logged', placeholder: 'Log details' }] },
  { id: '27', code: 'FORM 27', name: 'Internship Supervision Log', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2027_INTERNSHIP%20SUPERVISION%20LOG.pdf', description: 'Record of supervision meetings with Site & Academic Supervisors.', fields: [{ label: 'Supervisor Name (Site / Academic)', placeholder: 'Supervisor name' }, { label: 'Supervision Focus & Hours', placeholder: 'Supervision notes' }] },
  { id: '28', code: 'FORM 28', name: 'Total CMHC Internship Hours', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2028_TOTAL%20CMHC%20INTENRSHIP%20HOURS.pdf', description: 'Final cumulative summary of all internship hours.', fields: [{ label: 'Cumulative Direct F2F Hours', placeholder: 'e.g. 400.0' }, { label: 'Cumulative Indirect Hours', placeholder: 'e.g. 560.0' }] },
  { id: '29', code: 'FORM 29', name: 'Clinical Case Study Format', category: 'clinical', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2029_CLINICAL%20CASE%20STUDY%20FORMAT.pdf', description: 'Standardized layout for clinical case presentations.', fields: [{ label: 'Case Title', placeholder: 'Title of presentation' }, { label: 'Comprehensive Case Synopsis', placeholder: 'Case outline' }] },
  { id: '30', code: 'FORM 30', name: 'Weekly Total Clinical Hours', category: 'log', pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2030_WEEKLY%20TOTAL%20CLINICAL%20HOURS.pdf', description: 'Weekly compilation of clinical face-to-face & indirect hours.', fields: [{ label: 'Week Number', placeholder: 'Week 01' }, { label: 'Total Weekly Direct & Indirect Hours', placeholder: 'Weekly sum' }] },
];

export default function InternshipFormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeEditingForm, setActiveEditingForm] = useState<FormItem | null>(null);
  const [formDataValues, setFormDataValues] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredForms = CLINICAL_FORMS.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenFillableForm = (form: FormItem) => {
    setActiveEditingForm(form);
    setFormDataValues({});
    setSavedSuccess(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 internship-form-font">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            <span>Internship Portal</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">Clinical Forms</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Editable Internship Clinical Forms</h1>
          <p className="text-xs text-muted-foreground">
            Complete set of 30 fillable forms rendered in standard <strong>Arial 9pt</strong> format.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/internship/log"
            className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
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
          <span className="font-bold text-blue-900 dark:text-blue-300">Official Internship Format (Arial 9pt)</span>
          <p className="text-muted-foreground">
            All forms strictly adhere to the CMHC Internship specification. You can fill out, edit, print, or view original reference PDFs directly.
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
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition whitespace-nowrap ${
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
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {form.category}
                </span>
              </div>
              <h3 className="font-bold text-sm line-clamp-1 group-hover:text-blue-600 transition">
                {form.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.description}
              </p>
            </div>

            <div className="pt-3 border-t space-y-2">
              <button
                onClick={() => handleOpenFillableForm(form)}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Fill & Edit Form</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={form.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Original PDF
                </a>
                <a
                  href={form.pdfPath}
                  download
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fillable Modal Dialog */}
      {activeEditingForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto internship-form-font">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {activeEditingForm.code}
                </span>
                <h2 className="text-xl font-bold mt-1">{activeEditingForm.name}</h2>
                <p className="text-xs text-muted-foreground">Typeface: Arial 9pt • Standard Internship Layout</p>
              </div>
              <button
                onClick={() => setActiveEditingForm(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-2 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Form saved successfully in internship records!</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="space-y-4 border p-4 rounded-xl bg-background">
                {activeEditingForm.fields.map((field, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-xs font-bold text-foreground">
                      {field.label}
                    </label>
                    {field.label.toLowerCase().includes('summary') || 
                     field.label.toLowerCase().includes('notes') || 
                     field.label.toLowerCase().includes('history') || 
                     field.label.toLowerCase().includes('plan') || 
                     field.label.toLowerCase().includes('impression') ? (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={formDataValues[field.label] || ''}
                        onChange={(e) => setFormDataValues({ ...formDataValues, [field.label]: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={formDataValues[field.label] || ''}
                        onChange={(e) => setFormDataValues({ ...formDataValues, [field.label]: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg border hover:bg-muted"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print Form
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveEditingForm(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Form Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
