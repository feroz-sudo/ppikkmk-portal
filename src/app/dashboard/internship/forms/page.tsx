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
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { FormHeader } from '@/components/forms/FormHeader';

interface FormItem {
  id: string;
  code: string;
  refCode: string;
  name: string;
  category: 'clinical' | 'counseling' | 'group' | 'log' | 'report' | 'assessment';
  pdfPath: string;
  pages: number;
  description: string;
  fields: { label: string; placeholder: string; type?: string; options?: string[] }[];
}

const CLINICAL_FORMS: FormItem[] = [
  { 
    id: '1', 
    code: 'FORM 01', 
    refCode: 'Individual_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-F1-2026',
    name: 'INDIVIDUAL COUNSELING HOURS LOG', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2001_INDIVIDUAL%20COUNSELING%20HOURS%20LOG.pdf', 
    pages: 5,
    description: 'Official log sheet for tracking individual counseling hours, dates, client codes, and supervisor endorsements.',
    fields: [
      { label: 'Name of Counselor Trainee', placeholder: 'e.g. AHMAD FEROZ' },
      { label: 'Matric Number', placeholder: 'e.g. M20241001148' },
      { label: 'Internship Placement Site', placeholder: 'e.g. PPIKKMK Counseling Center' },
      { label: 'Client Code / Name', placeholder: 'e.g. CLI-001 / Client A' },
      { label: 'Session Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { label: 'Session Time & Duration (Hours)', placeholder: 'e.g. 10:00 AM - 11:00 AM (1.0 hr)' },
      { label: 'Initial / Sign Off Notes', placeholder: 'Trainee & supervisor initials' },
      { label: 'Site Supervisor Endorsement Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { label: 'Academic Supervisor Verification Date', placeholder: 'YYYY-MM-DD', type: 'date' },
    ]
  },
  { 
    id: '2', 
    code: 'FORM 02', 
    refCode: 'Individual_Counseling_Record_Log/CMHC_UPSI/Pindaan03-F2-2026',
    name: 'INDIVIDUAL COUNSELING RECORD LOG', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2002_INDIVIDUAL%20COUNSELING%20RECORD%20LOG.pdf', 
    pages: 20,
    description: 'Detailed individual client counseling session record log across multiple sessions (S1-S9+).',
    fields: [
      { label: 'Client Name / Code', placeholder: 'Client identifier' },
      { label: 'Session Number (S1 - S9)', placeholder: 'e.g. Session 01' },
      { label: 'Intake Date & Time', placeholder: 'Intake date' },
      { label: 'Presenting Problem / Diagnosis', placeholder: 'Primary clinical issues' },
      { label: 'Therapeutic Interventions', placeholder: 'CBT, SFBT, REBT techniques applied' },
      { label: 'Session Outcome & Progress', placeholder: 'Client progress summary' },
    ]
  },
  { 
    id: '3', 
    code: 'FORM 03', 
    refCode: 'Individual_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-F3-2026',
    name: 'INFORMED CONSENT FORM FOR INDIVIDUAL COUNSELING', 
    category: 'counseling', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2003_INDIVIDUAL%20COUNSELING%20INFORMED%20CONSENT.pdf', 
    pages: 2,
    description: 'Standard client informed consent form detailing confidentiality, rights, and supervisory framework.',
    fields: [
      { label: 'Client Full Name', placeholder: 'Client name as per MyKad' },
      { label: 'NRIC / Passport No.', placeholder: 'IC number' },
      { label: 'Internship Site Agency', placeholder: 'Agency name' },
      { label: 'Internship Period', placeholder: '3rd March 2026 to 20th February 2027' },
      { label: 'Academic Supervisor Name', placeholder: 'Dr. Pau Kee' },
      { label: 'Site Supervisor Name', placeholder: 'Site Supervisor' },
      { label: 'Emergency Contact Person & Phone', placeholder: 'Name & Phone number' },
      { label: 'Client Signature Date', placeholder: 'YYYY-MM-DD', type: 'date' },
    ]
  },
  { 
    id: '4', 
    code: 'FORM 04', 
    refCode: 'Client_Registration_Form/CMHC_UPSI/Pindaan02-04-2026',
    name: 'CLIENT REGISTRATION FORM', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2004_CLIENT%20REGISTRATION%20FORM.pdf', 
    pages: 1,
    description: 'Official client registration, demographics, emergency contact details, and referral information.',
    fields: [
      { label: 'Client Full Name', placeholder: 'Full Name' },
      { label: 'Date of Referral', placeholder: 'YYYY-MM-DD', type: 'date' },
      { label: 'Sex & Date of Birth', placeholder: 'Gender / DOB' },
      { label: 'Ethnicity & IC Number', placeholder: 'Malay/Chinese/Indian/Others & NRIC' },
      { label: 'Emergency Contact Person 1', placeholder: 'Name, Relation, Phone, Address' },
      { label: 'Emergency Contact Person 2', placeholder: 'Name, Relation, Phone, Address' },
      { label: 'Reason for Referral / Seeking Counseling', placeholder: 'Primary presenting concern' },
      { label: 'Current Mental Health Service History', placeholder: 'Prior hospital / clinic visits' },
      { label: 'Current Crisis Situation Rating (0 - 10)', placeholder: 'Self-harm risk / functioning impact rating' }
    ]
  },
  { 
    id: '5', 
    code: 'FORM 05', 
    refCode: 'Psychological_Intake_Report/CMHC_UPSI/Pindaan03_05_2026',
    name: 'PSYCHOLOGICAL INTAKE REPORT', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2005_PSYCHOLOGICAL%20INTAKE%20REPORT.pdf', 
    pages: 3,
    description: 'Comprehensive psychological intake examination, MSE, medical, social, and substance history.',
    fields: [
      { label: 'Session Number & Date', placeholder: 'Session #, Date & Time' },
      { label: 'Client Full Name & NRIC', placeholder: 'Client name, IC No, Age, Designation' },
      { label: 'Reason for Referral', placeholder: 'Detailed referral background' },
      { label: 'Behavior Observation & MSE', placeholder: 'Appearance, speech, mood, affect, thought process' },
      { label: 'History of Presenting Issues', placeholder: 'Onset, duration, severity of symptoms' },
      { label: 'Psychiatric & Medical History', placeholder: 'Prior treatments, hospitalizations, medications' },
      { label: 'Family & Social History', placeholder: 'Family dynamics, support system, relationships' },
      { label: 'Developmental & Substance History', placeholder: 'Milestones, alcohol/drug history' },
      { label: 'Current Situation Functioning', placeholder: 'Occupational, academic, interpersonal functioning' },
      { label: 'Assessment Result & Diagnostic Impression', placeholder: 'Provisional DSM-5 diagnosis' },
      { label: 'Goals of the Session & Treatment Planning', placeholder: 'Initial treatment roadmap' },
    ]
  },
  { 
    id: '6', 
    code: 'FORM 06', 
    refCode: 'Case_Conceptualization/CMHC_UPSI/Pindaan03-06-2026',
    name: 'CASE CONCEPTUALIZATION', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2006_CASE%20CONCEPTUALIZATION.pdf', 
    pages: 2,
    description: 'Clinical case formulation mapping 5Ps: Precipitating, Predisposing, Perpetuating, and Protective factors.',
    fields: [
      { label: 'Client Profile & Diagnosis', placeholder: 'Client Name, Ethnic/Sex, Age, Diagnosis' },
      { label: 'Presenting Problem', placeholder: 'Core problem definition' },
      { label: 'Predisposing Factors', placeholder: 'Biological, genetic, early childhood vulnerability' },
      { label: 'Precipitating Factors', placeholder: 'Recent triggers & stressors' },
      { label: 'Perpetuating Factors', placeholder: 'Maintaining factors, coping deficits' },
      { label: 'Protective Factors', placeholder: 'Strengths, resilience, social support' },
      { label: 'Theoretical Orientation Formulation', placeholder: 'CBT / REBT / Psychodynamic formulation' },
      { label: 'Overall Summary', placeholder: 'Clinical synthesis' },
    ]
  },
  { 
    id: '7', 
    code: 'FORM 07', 
    refCode: 'Clinical_Treatment_Plan/CMHC_UPSI/Pindaan03-07-2026',
    name: 'CLINICAL TREATMENT PLAN', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2007_TREATMENT%20PLANNING.pdf', 
    pages: 1,
    description: 'Structured clinical treatment planning table with short-term, long-term goals and interventions.',
    fields: [
      { label: 'Client Name & Theoretical Orientation', placeholder: 'Client details & therapeutic approach' },
      { label: 'Diagnosis', placeholder: 'Provisional / Axis diagnosis' },
      { label: 'Therapeutic Goal(s)', placeholder: 'Measurable goals' },
      { label: 'Therapeutic Interventions', placeholder: 'Action steps & techniques' },
      { label: 'Outcome Measures of Change', placeholder: 'Evaluation criteria & progress metrics' },
    ]
  },
  { 
    id: '8', 
    code: 'FORM 08', 
    refCode: 'Case_Notes/CMHC_UPSI/Pindaan03-08-2026',
    name: 'CASE NOTES (SOAP NOTE)', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2008_PROGRESSIVE%20NOTES.pdf', 
    pages: 2,
    description: 'Standardized SOAP case progress note template per counseling session.',
    fields: [
      { label: 'Session Number & Date', placeholder: 'Session #, Date & Time' },
      { label: 'Client Full Name & Diagnosis', placeholder: 'Client details & diagnosis' },
      { label: 'SUBJECTIVE (S)', placeholder: 'Client self-report, mood, chief complaints' },
      { label: 'OBJECTIVE (O)', placeholder: 'Counselor observation, MSE in session, interventions used' },
      { label: 'ASSESSMENT (A)', placeholder: 'Clinical analysis, progress towards goals, risk level' },
      { label: 'PLAN (P)', placeholder: 'Next session date, homework assignments, ongoing plan' },
    ]
  },
  { 
    id: '9', 
    code: 'FORM 09', 
    refCode: 'Termination_Individual Counseling Session/CMHC_UPSI/Pindaan03-09-2026',
    name: 'TERMINATION OF INDIVIDUAL COUNSELING SESSION', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2009_TERMINATION%20SESSION.pdf', 
    pages: 2,
    description: 'Summary of individual counseling termination, client evaluation, and relapse prevention plan.',
    fields: [
      { label: 'Client Demographics & Diagnosis', placeholder: 'Name, Gender, Age, Ethnic, Position, Diagnosis' },
      { label: 'Synopsis of Treatment', placeholder: 'Overview of therapeutic journey' },
      { label: 'Evaluation of Client Current Functioning', placeholder: 'Current status assessment' },
      { label: 'Clinical Evaluation & Goals Met', placeholder: 'Outcome of treatment goals' },
      { label: 'Follow Up Plan & Recommendations', placeholder: 'Relapse prevention & maintenance' },
    ]
  },
  { 
    id: '10', 
    code: 'FORM 10', 
    refCode: 'Group_Counseling_Hours_Log/CMHC_UPSI/Pindaan03-10-2026',
    name: 'LOG OF GROUP COUNSELING HOURS', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2010_LOG%20OF%20GROUP%20COUNSELING%20HOURS.pdf', 
    pages: 5,
    description: 'Hours tracking log sheet for group counseling sessions and member participation.',
    fields: [
      { label: 'Name of the Group', placeholder: 'e.g. Stress Relief & Support Group' },
      { label: 'Number of Group Members', placeholder: 'e.g. 8 participants' },
      { label: 'Session Date & Time Duration', placeholder: 'Date, start/end time, total hours' },
      { label: 'Trainee Initial & Supervisor Endorsement', placeholder: 'Sign-off details' },
    ]
  },
  { 
    id: '11', 
    code: 'FORM 11', 
    refCode: 'Group_Counseling_Record_Log/CMHC_UPSI/Pindaan03-11-2026',
    name: 'GROUP COUNSELING RECORD LOG', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2011_GROUP%20COUNSELING%20RECORD%20LOG.pdf', 
    pages: 20,
    description: '20-page comprehensive log of group counseling sessions, topics, and member dynamics.',
    fields: [
      { label: 'Group Name / Code', placeholder: 'Group identification code' },
      { label: 'Number of Members & Session No.', placeholder: 'Member count & session number' },
      { label: 'Group Process & Interventions', placeholder: 'Group stages, cohesion, dynamics' },
    ]
  },
  { 
    id: '12', 
    code: 'FORM 12', 
    refCode: 'Group_Counseling_Informed_Consent/CMHC_UPSI/Pindaan03-12-2026',
    name: 'INFORMED CONSENT FORM FOR GROUP COUNSELING', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2012_GROUP%20COUNSELING%20INFORMED%20CONSENT.pdf', 
    pages: 2,
    description: 'Group counseling informed consent covering group confidentiality and member rules.',
    fields: [
      { label: 'Participant Name', placeholder: 'Member full name' },
      { label: 'Internship Placement Site', placeholder: 'Agency name' },
      { label: 'Academic & Site Supervisor Names', placeholder: 'Supervisors' },
      { label: 'Group Rules & Confidentiality Consent', placeholder: 'Signed agreement date' },
    ]
  },
  { 
    id: '13', 
    code: 'FORM 13', 
    refCode: 'Group_Counseling_Report/CMHC_UPSI/Pindaan03-13-2026',
    name: 'GROUP COUNSELING REPORT', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2013_GROUP%20COUNSELING%20REPORT.pdf', 
    pages: 4,
    description: 'Comprehensive 4-page report summarizing group sessions, themes, and member evaluations.',
    fields: [
      { label: 'Group Leader / Counselor Name', placeholder: 'Trainee name' },
      { label: 'Group Objectives & Structure', placeholder: 'Main objectives' },
      { label: 'Session-by-Session Summary', placeholder: 'Summary of sessions' },
      { label: 'Individual Member Progress', placeholder: 'Evaluation of members' },
    ]
  },
  { 
    id: '14', 
    code: 'FORM 14', 
    refCode: 'Group_Termination_Session/CMHC_UPSI/Pindaan03-14-2026',
    name: 'TERMINATION SESSION FOR GROUP COUNSELING', 
    category: 'group', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2014_GROUP%20TERMINATION%20FORM.pdf', 
    pages: 2,
    description: 'Group counseling termination report and overall group outcome evaluation.',
    fields: [
      { label: 'Group Code & Name', placeholder: 'Group details' },
      { label: 'Termination Activities & Outcomes', placeholder: 'Group outcome' },
    ]
  },
  { 
    id: '15', 
    code: 'FORM 15', 
    refCode: 'Psychological_Assessment_Report/CMHC_UPSI/Pindaan03_15-2026',
    name: 'PSYCHOLOGICAL ASSESSMENT REPORT', 
    category: 'assessment', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2015_PSYCHOLOGICAL%20ASSESSMENT%20REPORT.pdf', 
    pages: 2,
    description: 'Standardized psychological test administration, raw scores, and clinical interpretation.',
    fields: [
      { label: 'Client Personal Data', placeholder: 'Client name, age, gender' },
      { label: 'Assessment Instrument Administered', placeholder: 'e.g. DASS-21, BAI, BDI-II' },
      { label: 'Raw Scores & Severity Percentiles', placeholder: 'Testing metrics' },
      { label: 'Clinical Interpretation & Recommendations', placeholder: 'Test interpretation' },
    ]
  },
  { 
    id: '16', 
    code: 'FORM 16', 
    refCode: 'Crisis_Intervention_Report/CMHC_UPSI/Pindaan03-16-2026',
    name: 'CRISIS INTERVENTION REPORT', 
    category: 'report', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2016_CRISIS%20INTERVENTION%20REPORT.pdf', 
    pages: 1,
    description: 'Immediate crisis intervention documentation, risk assessment, and safety planning.',
    fields: [
      { label: 'Crisis Nature & Risk Level', placeholder: 'Suicidal / Homicidal / Trauma crisis' },
      { label: 'Immediate Action & Safety Plan', placeholder: 'Intervention steps taken' },
      { label: 'Referrals & Emergency Contacts Notified', placeholder: 'Emergency contacts' },
    ]
  },
  { 
    id: '17', 
    code: 'FORM 17', 
    refCode: 'Consultation_Report/CMHC_UPSI/Pindaan03-17-2026',
    name: 'CONSULTATION REPORT', 
    category: 'report', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2017_CONSULTATION%20REPORT.pdf', 
    pages: 1,
    description: 'Clinical consultation report with medical professionals, guardians, or academic staff.',
    fields: [
      { label: 'Person / Agency Consulted', placeholder: 'Doctor / Psychiatrist / Teacher' },
      { label: 'Consultation Purpose & Outcome', placeholder: 'Consultation findings' },
    ]
  },
  { 
    id: '18', 
    code: 'FORM 18', 
    refCode: 'PFA/MHPSS_Report/CMHC_UPSI/Pindaan03-18-2026',
    name: 'PFA / MHPSS REPORT', 
    category: 'report', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2018_PFA_MHPSS%20REPORT.pdf', 
    pages: 2,
    description: 'Psychological First Aid (PFA) & Mental Health Support report during emergency events.',
    fields: [
      { label: 'Event Name & Location', placeholder: 'Crisis site details' },
      { label: 'PFA Core Actions Implemented', placeholder: 'Look, Listen, Link steps' },
    ]
  },
  { 
    id: '19', 
    code: 'FORM 19', 
    refCode: 'Psychoeducation/Community_Program/CMHC_UPSI/Pindaan03-19-2026',
    name: 'PSYCHOEDUCATION / COMMUNITY PROGRAM REPORT', 
    category: 'report', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2019_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20REPORT.pdf', 
    pages: 2,
    description: 'Report on outreach, community psychoeducation workshops, and mental health programs.',
    fields: [
      { label: 'Program Title & Date', placeholder: 'Workshop title' },
      { label: 'Target Audience & Participants', placeholder: 'Participant numbers' },
      { label: 'Program Content & Evaluation', placeholder: 'Summary of activities' },
    ]
  },
  { 
    id: '20', 
    code: 'FORM 20', 
    refCode: 'Professional_Development_Report/CMHC_UPSI/Pindaan03-20-2026',
    name: 'PROFESSIONAL DEVELOPMENT REPORT', 
    category: 'report', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2020_PROFESSIONAL%20DEVELOPMENT%20REPORT.pdf', 
    pages: 2,
    description: 'Documentation of attendance at professional counseling workshops, webinars, and training.',
    fields: [
      { label: 'Workshop / Training Title', placeholder: 'Event name' },
      { label: 'Organizer & Date Attended', placeholder: 'Organizer details' },
      { label: 'Key Learnings & Skill Acquisition', placeholder: 'Reflective learning' },
    ]
  },
  { 
    id: '21', 
    code: 'FORM 21', 
    refCode: 'Consultation_Hours_Log/CMHC_UPSI/Pindaan03-21-2026',
    name: 'CONSULTATION HOURS LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2021_CONSULTATION%20HOURS%20LOG.pdf', 
    pages: 2,
    description: 'Log sheet tracking professional consultation hours.',
    fields: [{ label: 'Consultation Date & Hours', placeholder: 'Log details' }] 
  },
  { 
    id: '22', 
    code: 'FORM 22', 
    refCode: 'Crisis Intervention_Hours_Log/CMHC_UPSI/Pindaan03-22-2026',
    name: 'CRISIS INTERVENTION HOURS LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2022_CRISIS%20INTERVENTION%20HOURS%20LOG.pdf', 
    pages: 2,
    description: 'Log sheet tracking crisis intervention hours.',
    fields: [{ label: 'Crisis Hours Logged', placeholder: 'Log details' }] 
  },
  { 
    id: '23', 
    code: 'FORM 23', 
    refCode: 'PFA/MHPSS_Hours_Log/CMHC_UPSI/Pindaan03-23-2026',
    name: 'PFA / MHPSS HOURS LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2023_PFA_MHPSS%20HOURS%20LOG.pdf', 
    pages: 2,
    description: 'Hours tracking log for PFA and MHPSS activities.',
    fields: [{ label: 'PFA Hours Logged', placeholder: 'Log details' }] 
  },
  { 
    id: '24', 
    code: 'FORM 24', 
    refCode: 'Pscyhoeducation and Community Program Log/CMHC_UPSI/Pindaan03-24-2026',
    name: 'PSYCHOEDUCATION & COMMUNITY PROGRAM LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2024_PSYCHOEDUCATION%20AND%20COMMUNITY%20PROGRAM%20HOURS%20LOG.pdf', 
    pages: 2,
    description: 'Log sheet tracking psychoeducation program hours.',
    fields: [{ label: 'Outreach Hours Logged', placeholder: 'Log details' }] 
  },
  { 
    id: '25', 
    code: 'FORM 25', 
    refCode: 'Professional Development Log/CMHC_UPSI/Pindaan03-25-2026',
    name: 'PROFESSIONAL DEVELOPMENT LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2025_PROFESSIONAL%20DEVELOPMENT%20HOURS%20LOG.pdf', 
    pages: 2,
    description: 'Log sheet tracking professional development workshop hours.',
    fields: [{ label: 'PD Hours Logged', placeholder: 'Log details' }] 
  },
  { 
    id: '26', 
    code: 'FORM 26', 
    refCode: 'Psychological Assessment Log/CMHC_UPSI/Pindaan03-26-2026',
    name: 'PSYCHOLOGICAL ASSESSMENT LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2026_PSYCHOLOGICAL%20ASSESSMENT%20LOG.pdf', 
    pages: 4,
    description: 'Log sheet tracking psychological assessment administration hours.',
    fields: [{ label: 'Assessment Testing Hours', placeholder: 'Log details' }] 
  },
  { 
    id: '27', 
    code: 'FORM 27', 
    refCode: 'Supervision Log/CMHC_UPSI/Pindaan03-27-2025',
    name: 'INTERNSHIP SUPERVISION LOG', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2027_INTERNSHIP%20SUPERVISION%20LOG.pdf', 
    pages: 2,
    description: 'Record of supervision meetings with Site & Academic Supervisors.',
    fields: [
      { label: 'Supervisee Name', placeholder: 'Trainee name' },
      { label: 'Supervision Start Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { label: 'Date & Supervision Hours', placeholder: 'Supervision notes & duration' },
    ] 
  },
  { 
    id: '28', 
    code: 'FORM 28', 
    refCode: 'Total_CMHC Internship_Hours/CMHC_UPSI/Pindaan03-28-2025',
    name: 'SUMMARY OF TOTAL CMHC INTERNSHIP HOURS', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2028_TOTAL%20CMHC%20INTENRSHIP%20HOURS.pdf', 
    pages: 2,
    description: 'Cumulative total summary of all direct, indirect, and supervision hours.',
    fields: [
      { label: 'Trainee Name & Matric No.', placeholder: 'Name & Matric' },
      { label: 'Academic Supervisor Name', placeholder: 'Dr. Pau Kee' },
      { label: 'Site Supervisor Name', placeholder: 'Supervisor name' },
      { label: 'Total Direct F2F Hours', placeholder: 'e.g. 400 hours' },
      { label: 'Total Indirect & Supervision Hours', placeholder: 'e.g. 600 hours' },
    ] 
  },
  { 
    id: '29', 
    code: 'FORM 29', 
    refCode: 'ClinicalCaseStudyFormat_CMHC_UPSI/Pindaan03-29-2026',
    name: 'CLINICAL CASE STUDY FORMAT', 
    category: 'clinical', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2029_CLINICAL%20CASE%20STUDY%20FORMAT.pdf', 
    pages: 3,
    description: 'Official clinical case study format for comprehensive case presentations.',
    fields: [
      { label: 'Case Study Title', placeholder: 'Title' },
      { label: 'Full Case Report & Formulation', placeholder: 'Detailed case study' },
    ] 
  },
  { 
    id: '30', 
    code: 'FORM 30', 
    refCode: 'Weekly_Total_Clinical_Hours/CMHC_UPSI/Pindaan03-30-2026',
    name: 'WEEKLY TOTAL CLINICAL HOURS', 
    category: 'log', 
    pdfPath: '/PDF%20CLINICAL%20FORMS_M262%202026/FORM%2030_WEEKLY%20TOTAL%20CLINICAL%20HOURS.pdf', 
    pages: 1,
    description: 'Weekly summary sheet compiling direct face-to-face and indirect clinical hours.',
    fields: [
      { label: 'Week Number', placeholder: 'e.g. Week 1' },
      { label: 'Weekly Total Direct Hours', placeholder: 'Hours sum' },
      { label: 'Weekly Total Indirect Hours', placeholder: 'Hours sum' },
    ] 
  },
];

export default function InternshipFormsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePdfForm, setActivePdfForm] = useState<FormItem | null>(null);
  const [activeFillForm, setActiveFillForm] = useState<FormItem | null>(null);
  const [formDataValues, setFormDataValues] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredForms = CLINICAL_FORMS.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <div className="flex items-center space-x-2 text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
            <span>Internship Portal</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">Clinical Forms</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Official UPSI Internship Clinical Forms</h1>
          <p className="text-xs text-muted-foreground">
            Complete set of 30 standardized forms for Clinical Mental Health Counseling (CMHC). View original PDF documents or fill online in <strong>Arial 9pt</strong>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/internship/log"
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Open Internship Logbook
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex items-start space-x-3">
        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-blue-900 dark:text-blue-300">CMHC UPSI Clinical Standard (Pindaan 2026)</span>
          <p className="text-muted-foreground">
            Click <strong>"View & Read Original PDF"</strong> to open the full official document viewer, or <strong>"Fill & Edit Form"</strong> to open the exact UPSI document replica.
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
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition whitespace-nowrap ${
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
                  {form.pages} {form.pages === 1 ? 'Page' : 'Pages'}
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
                onClick={() => setActivePdfForm(form)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>View & Read Original PDF</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveFillForm(form);
                    setFormDataValues({});
                  }}
                  className="inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground font-bold border py-1 rounded-md hover:bg-muted"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Fill Form
                </button>
                <a
                  href={form.pdfPath}
                  download
                  className="inline-flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL ORIGINAL PDF VIEWER MODAL */}
      {activePdfForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-card border rounded-2xl w-full max-w-5xl h-[92vh] shadow-2xl flex flex-col overflow-hidden relative">
            <div className="p-4 border-b flex items-center justify-between bg-muted/40">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                    {activePdfForm.code}
                  </span>
                  <h2 className="text-base font-bold">{activePdfForm.name}</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Original PDF Document ({activePdfForm.pages} {activePdfForm.pages === 1 ? 'Page' : 'Pages'})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={activePdfForm.pdfPath}
                  download
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border bg-background hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download PDF
                </a>
                <button
                  onClick={() => setActivePdfForm(null)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-900 p-2 overflow-hidden">
              <iframe
                src={`${activePdfForm.pdfPath}#toolbar=1`}
                className="w-full h-full rounded-lg border-0"
                title={activePdfForm.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL EXACT REPLICA FILLABLE FORM MODAL */}
      {activeFillForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[95vh] overflow-y-auto text-black internship-form-font print:p-0 print:border-none print:shadow-none">
            {/* Action Bar Header */}
            <div className="flex items-center justify-between border-b pb-4 no-print">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {activeFillForm.code} • Replica Mode
                </span>
                <h2 className="text-lg font-bold text-black mt-1">{activeFillForm.name}</h2>
                <p className="text-xs text-gray-500">Exact Replica of Original PDF • Font: Arial 9pt</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print A4
                </button>
                <button
                  onClick={() => setActiveFillForm(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 flex items-center space-x-2 text-xs font-bold no-print">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>Form saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Exact Header Replica */}
              <FormHeader 
                title={activeFillForm.name}
                refCode={activeFillForm.refCode}
                subTitle="INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING"
              />

              {/* Exact Replica Fields Container */}
              <div className="space-y-4 border border-black p-4 sm:p-6 bg-white">
                {activeFillForm.fields.map((field, idx) => (
                  <div key={idx} className="space-y-1 border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <label className="block text-xs font-bold text-black uppercase tracking-tight">
                      {field.label} :
                    </label>
                    {field.label.toLowerCase().includes('summary') || 
                     field.label.toLowerCase().includes('notes') || 
                     field.label.toLowerCase().includes('history') || 
                     field.label.toLowerCase().includes('plan') || 
                     field.label.toLowerCase().includes('impression') ||
                     field.label.toLowerCase().includes('subjective') ||
                     field.label.toLowerCase().includes('objective') ||
                     field.label.toLowerCase().includes('assessment') ||
                     field.label.toLowerCase().includes('observation') ||
                     field.label.toLowerCase().includes('formulation') ||
                     field.label.toLowerCase().includes('reason') ? (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={formDataValues[field.label] || ''}
                        onChange={(e) => setFormDataValues({ ...formDataValues, [field.label]: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-none bg-white text-black focus:border-black focus:outline-none"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={formDataValues[field.label] || ''}
                        onChange={(e) => setFormDataValues({ ...formDataValues, [field.label]: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-none bg-white text-black focus:border-black focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Signatures & Endorsement Footer Block */}
              <div className="pt-6 border-t border-black grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-8">
                  <p className="font-bold">Reported By:</p>
                  <div className="border-b border-black w-3/4 mx-auto"></div>
                  <div>
                    <p className="font-bold">( CMHC Counselor Trainee )</p>
                    <p className="text-[10px] text-gray-600">Universiti Pendidikan Sultan Idris</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <p className="font-bold">Endorsed By:</p>
                  <div className="border-b border-black w-3/4 mx-auto"></div>
                  <div>
                    <p className="font-bold">( Site Supervisor )</p>
                    <p className="text-[10px] text-gray-600">Placement Agency Site</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <p className="font-bold">Verified By:</p>
                  <div className="border-b border-black w-3/4 mx-auto"></div>
                  <div>
                    <p className="font-bold">( Academic Supervisor )</p>
                    <p className="text-[10px] text-gray-600">Universiti Pendidikan Sultan Idris</p>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-4 border-t no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print A4 Form
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveFillForm(null)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save & Store Entry
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
