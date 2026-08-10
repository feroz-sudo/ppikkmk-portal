"use client";

import React, { useState } from 'react';
import { 
  ClipboardList, 
  BrainCircuit, 
  Calculator, 
  Save, 
  Printer, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Plus,
  Trash2,
  BookOpen,
  Award
} from 'lucide-react';

interface DailyLogEntry {
  id: string;
  lokasi: string;
  masa: string;
  aktiviti: string;
  catatan: string;
}

export default function InternshipLogbookPage() {
  const [activeSection, setActiveSection] = useState<'cover' | 'contract' | 'components' | 'log' | 'refleksi' | 'rumusan'>('cover');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Cover Page State
  const [traineeName, setTraineeName] = useState('AHMAD FEROZ BIN ABDUL SAMAD');
  const [matricNo, setMatricNo] = useState('M20241001148');
  const [placementSite, setPlacementSite] = useState('');

  // Page 1: Daily Log Header
  const [tarikhHari, setTarikhHari] = useState('');
  const [logEntries, setLogEntries] = useState<DailyLogEntry[]>([
    { id: '1', lokasi: '', masa: '', aktiviti: '', catatan: '' }
  ]);

  // Page 1: Daily Hours Summary Inputs
  const [jamIndividu, setJamIndividu] = useState<string>('');
  const [jamKelompok, setJamKelompok] = useState<string>('');
  const [jamAktivitiIntervensi, setJamAktivitiIntervensi] = useState<string>('');
  const [jamPengurusan, setJamPengurusan] = useState<string>('');
  const [jamPerkembangan, setJamPerkembangan] = useState<string>('');
  const [jamPenyeliaan, setJamPenyeliaan] = useState<string>('');

  // Page 2 & 3: Self Reflection Inputs
  const [refleksiIndividu, setRefleksiIndividu] = useState('');
  const [refleksiKelompok, setRefleksiKelompok] = useState('');
  const [refleksiAktiviti, setRefleksiAktiviti] = useState('');
  const [refleksiPengurusan, setRefleksiPengurusan] = useState('');
  const [refleksiPerkembangan, setRefleksiPerkembangan] = useState('');
  const [refleksiPenyeliaan, setRefleksiPenyeliaan] = useState('');

  // Page 4: Weekly Hours Summary Inputs
  const [tarikhDari, setTarikhDari] = useState('');
  const [tarikhKe, setTarikhKe] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<Record<string, Record<string, string>>>({
    a: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    b: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    c: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    d: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    e: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    f: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    g: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    h: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
    i: { isnin: '', selasa: '', rabu: '', khamis: '', jumaat: '', sabtu: '', ahad: '' },
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const sumF2F = (Number(jamIndividu) || 0) + (Number(jamKelompok) || 0);
  const sumProf = (Number(jamAktivitiIntervensi) || 0) + (Number(jamPengurusan) || 0) + (Number(jamPerkembangan) || 0) + (Number(jamPenyeliaan) || 0);

  const addLogRow = () => {
    setLogEntries([...logEntries, { id: Date.now().toString(), lokasi: '', masa: '', aktiviti: '', catatan: '' }]);
  };

  const removeLogRow = (id: string) => {
    if (logEntries.length > 1) {
      setLogEntries(logEntries.filter(row => row.id !== id));
    }
  };

  const handleWeeklyHourChange = (rowKey: string, dayKey: string, val: string) => {
    setWeeklyHours(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [dayKey]: val
      }
    }));
  };

  const calcRowTotal = (rowKey: string) => {
    const row = weeklyHours[rowKey] || {};
    return Object.values(row).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  const calcDayTotal = (dayKey: string) => {
    return Object.keys(weeklyHours).reduce((acc, rKey) => acc + (Number(weeklyHours[rKey]?.[dayKey]) || 0), 0);
  };

  const calcGrandTotal = () => {
    return Object.keys(weeklyHours).reduce((acc, rKey) => acc + calcRowTotal(rKey), 0);
  };

  const handleSaveLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 internship-form-font text-black antialiased">
      {/* Top Banner Control Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 no-print">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <span>UPSI CMHC Internship</span>
            <span>•</span>
            <span className="text-emerald-700 font-black">28-Week Clinical Logbook</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            CMHC INTERNSHIP LOG BOOK
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 transition"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Log A4
          </button>
          <button
            onClick={handleSaveLogbook}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-md"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Logbook
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 flex items-center space-x-2 text-xs font-bold no-print">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>Week {selectedWeek} Logbook entry saved successfully!</span>
        </div>
      )}

      {/* Navigation Bar for Logbook Sections */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print">
        {/* Navigation Tabs (English Labels) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSection('cover')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'cover' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Cover Page</span>
          </button>
          <button
            onClick={() => setActiveSection('components')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'components' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Component & Hours</span>
          </button>
          <button
            onClick={() => setActiveSection('log')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'log' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>1. Daily Log</span>
          </button>
          <button
            onClick={() => setActiveSection('refleksi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'refleksi' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>2. Self Reflection</span>
          </button>
          <button
            onClick={() => setActiveSection('rumusan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'rumusan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>3. Weekly Hours Summary</span>
          </button>
        </div>

        {/* Week Stepper for Weekly sections */}
        {(activeSection === 'log' || activeSection === 'refleksi' || activeSection === 'rumusan') && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              disabled={selectedWeek <= 1}
              onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-black uppercase text-slate-800">
                Week {selectedWeek} / 28
              </span>
            </div>
            <button
              disabled={selectedWeek >= 28}
              onClick={() => setSelectedWeek(prev => Math.min(28, prev + 1))}
              className="p-1.5 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================
          EXACT VECTOR REPLICA: CMHC INTERNSHIP LOG BOOK COVER (PAGE 1)
         =================================================================== */}
      {activeSection === 'cover' && (
        <div className="relative bg-white border border-slate-300 p-8 sm:p-12 shadow-md max-w-4xl mx-auto overflow-hidden">
          {/* Top Diagonal Accent Graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 transform rotate-45 translate-x-24 -translate-y-24 pointer-events-none opacity-90" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-yellow-400 transform rotate-45 translate-x-20 -translate-y-28 pointer-events-none opacity-80" />

          {/* Logo & Institution Header */}
          <div className="flex flex-col items-center text-center space-y-2 pt-4">
            <div className="flex items-center justify-center space-x-3">
              <img src="/upsi-logo.png" alt="UPSI Logo" className="h-20 sm:h-24 w-auto object-contain" />
            </div>
            <div className="text-center font-serif text-upsi-navy font-bold text-sm tracking-wide">
              UNIVERSITI PENDIDIKAN SULTAN IDRIS
            </div>
            <div className="text-center text-[10px] text-red-600 font-bold uppercase tracking-wider">
              SULTAN IDRIS EDUCATION UNIVERSITY
            </div>
          </div>

          {/* Main Title Group */}
          <div className="text-center space-y-3 my-12">
            <h1 className="text-3xl sm:text-5xl font-black text-emerald-800 tracking-tight uppercase leading-none">
              CMHC INTERNSHIP<br />LOG BOOK
            </h1>
            <div className="w-3/4 mx-auto border-b-2 border-emerald-800 my-4" />
            <h2 className="text-lg sm:text-2xl font-black text-emerald-800 tracking-tight uppercase">
              MASTER OF COUNSELING<br />(CLINICAL MENTAL HEALTH)
            </h2>
          </div>

          {/* Trainee Details Inputs */}
          <div className="max-w-xl mx-auto space-y-6 my-10 text-xs sm:text-sm font-black">
            <div className="flex items-center space-x-2 border-b-2 border-slate-800 pb-1">
              <span className="w-36 text-slate-900 uppercase">NAME:</span>
              <input
                type="text"
                value={traineeName}
                onChange={(e) => setTraineeName(e.target.value)}
                className="flex-1 bg-transparent font-black text-slate-900 focus:outline-none uppercase"
              />
            </div>
            <div className="flex items-center space-x-2 border-b-2 border-slate-800 pb-1">
              <span className="w-36 text-slate-900 uppercase">MATRIC NO.:</span>
              <input
                type="text"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                className="flex-1 bg-transparent font-black text-slate-900 focus:outline-none uppercase"
              />
            </div>
            <div className="flex items-center space-x-2 border-b-2 border-slate-800 pb-1">
              <span className="w-36 text-slate-900 uppercase">PLACEMENT SITE:</span>
              <input
                type="text"
                placeholder="e.g. PPIKKMK Counseling Center"
                value={placementSite}
                onChange={(e) => setPlacementSite(e.target.value)}
                className="flex-1 bg-transparent font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Bottom Footer Details */}
          <div className="text-center pt-8 space-y-1 text-xs font-bold text-slate-800">
            <p>Universiti Pendidikan Sultan Idris</p>
            <p>Tanjung Malim, Perak</p>
            <p className="font-black">2026</p>
            <p className="text-[11px] text-slate-600">(Pindaan 02)</p>
          </div>

          {/* Bottom Diagonal Decorative Accent */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-700 via-teal-600 to-cyan-700 transform rotate-45 -translate-x-24 translate-y-24 pointer-events-none opacity-90" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-yellow-400 transform rotate-45 -translate-x-20 translate-y-28 pointer-events-none opacity-80" />
        </div>
      )}

      {/* ===================================================================
          EXACT VECTOR REPLICA: CLINICAL HOURS & SUPERVISION COMPONENTS
         =================================================================== */}
      {activeSection === 'components' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm max-w-4xl mx-auto">
          <div className="text-center border-b-2 border-black pb-3">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              SUPERVISION & CLINICAL HOURS COMPONENTS
            </h2>
            <p className="text-xs text-slate-600">Total Requirement: 504 Hours • Master of Counseling (CMHC)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-emerald-700 text-white font-bold text-center border-b border-black">
                  <th className="border border-black p-2 text-left">Supervision Components</th>
                  <th className="border border-black p-2 w-32">Clinical Hours</th>
                  <th className="border border-black p-2 w-28">Percentage (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {/* 1. Face to Face */}
                <tr className="bg-yellow-100 font-bold border-b border-black">
                  <td className="border border-black p-2">1. Face-to-Face Clinical Hours</td>
                  <td className="border border-black p-2 text-center">192-200 hours</td>
                  <td className="border border-black p-2 text-center">40</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-4">
                    i. Individual Counseling (CMHC) : <span className="font-bold">132 - 140 hours</span> (25%)<br />
                    ii. Group Counseling (CMHC) : <span className="font-bold">60 - 65 hours</span> (15%)<br />
                    <div className="mt-2 text-[10px] text-slate-700 italic">
                      (Focus on mental disorders, psychological disorder, addiction, grief, suicide attempt, self-harm behavior, crisis, trauma, and other disorders that required clinical attention)
                    </div>
                    <div className="mt-2 text-[10px] text-slate-900 font-bold">
                      ** Mandatory for all types of counseling sessions to have:
                      <ul className="list-disc pl-4 font-normal text-slate-800">
                        <li>Clinical Intake Interview</li>
                        <li>Mental State Examination (MSE)</li>
                        <li>Psychological Assessment</li>
                        <li>Informant(s) interview (if needed)</li>
                        <li>Case formulation/ Case Conceptualization (For each individual client)</li>
                        <li>Clinical Treatment Plan (For each individual client)</li>
                      </ul>
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center font-bold align-top">
                    132 -140 hrs<br />60 - 65 hrs
                  </td>
                  <td className="border border-black p-2 text-center font-bold align-top">
                    25<br />15
                  </td>
                </tr>

                {/* 2. Professional Activities */}
                <tr className="bg-emerald-300 font-bold border-b border-black">
                  <td className="border border-black p-2">2. Professional Activities Related to Clinical Works</td>
                  <td className="border border-black p-2 text-center">140 hours</td>
                  <td className="border border-black p-2 text-center">25</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-4 space-y-1">
                    <p>i. Crisis Intervention (15 hrs / 3%)</p>
                    <p>ii. PFA / Mental Health Psychosocial Support (MHPSS) (40 hrs / 6%)</p>
                    <p>iii. Psychological Assessment Activities (30 hrs / 6%)</p>
                    <p>iv. Psychoeducation/Community Activities (30 hrs / 6%)</p>
                    <p>v. Family/Parents/Guardian Consultation (25 hrs / 4%)</p>
                  </td>
                  <td className="border border-black p-2 text-center align-top space-y-1">
                    <p>15</p><p>40</p><p>30</p><p>30</p><p>25</p>
                  </td>
                  <td className="border border-black p-2 text-center align-top space-y-1 font-bold">
                    <p>3</p><p>6</p><p>6</p><p>6</p><p>4</p>
                  </td>
                </tr>

                {/* 3. Clinical Case Study */}
                <tr className="bg-yellow-100 font-bold border-b border-black">
                  <td className="border border-black p-2">3. Clinical Case Study</td>
                  <td className="border border-black p-2 text-center">10 hours</td>
                  <td className="border border-black p-2 text-center">10</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-4">
                    i. Clinical Case Writing (10 hours)<br />
                    ii. Clinical Case Presentation
                  </td>
                  <td className="border border-black p-2 text-center font-bold">10 hours</td>
                  <td className="border border-black p-2 text-center font-bold">10</td>
                </tr>

                {/* 4. Management and Admin */}
                <tr className="bg-emerald-300 font-bold border-b border-black">
                  <td className="border border-black p-2">4. Management and Administration</td>
                  <td className="border border-black p-2 text-center">146 -150 hours</td>
                  <td className="border border-black p-2 text-center">15</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-4">
                    i. Record, and Logbook Management<br />
                    ii. Clinical Report Writing<br />
                    iii. Reflection<br />
                    iv. Clinical Supervision
                  </td>
                  <td className="border border-black p-2 text-center"></td>
                  <td className="border border-black p-2 text-center"></td>
                </tr>

                {/* 5. Professional Development */}
                <tr className="bg-yellow-100 font-bold border-b border-black">
                  <td className="border border-black p-2">5. Professional Development</td>
                  <td className="border border-black p-2 text-center">20 hours</td>
                  <td className="border border-black p-2 text-center">5</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 pl-4">
                    i. Presenter in Professional Conferences related to Mental Health<br />
                    ii. Physically or virtually participated in webinar or conferences related to mental health
                  </td>
                  <td className="border border-black p-2 text-center"></td>
                  <td className="border border-black p-2 text-center"></td>
                </tr>

                {/* 6. Professional Identity */}
                <tr className="bg-yellow-200 font-bold border-b border-black">
                  <td className="border border-black p-2">6. Professional Identity</td>
                  <td className="border border-black p-2 text-center">-</td>
                  <td className="border border-black p-2 text-center">5</td>
                </tr>

                {/* TOTAL */}
                <tr className="bg-emerald-800 text-white font-black border-t-2 border-black text-sm">
                  <td className="border border-black p-2 text-right">TOTAL</td>
                  <td className="border border-black p-2 text-center">504</td>
                  <td className="border border-black p-2 text-center">100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          PAGE 1: DAILY LOG (EXACT 1:1 PDF REPLICA)
         =================================================================== */}
      {activeSection === 'log' && (
        <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl print:max-w-none print:w-full print:p-0 print:border-none mx-auto text-black">
          {/* Header Title */}
          <div className="text-center font-bold space-y-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
              DAILY LOG (WEEK {selectedWeek})
            </h2>
            <div className="flex items-center justify-between text-xs font-bold pt-2">
              <div className="flex items-center space-x-2 w-1/2">
                <span>DATE :</span>
                <input
                  type="text"
                  placeholder="_____________________"
                  value={tarikhHari}
                  onChange={(e) => setTarikhHari(e.target.value)}
                  className="p-1 text-xs border-b border-black font-bold focus:outline-none w-full bg-transparent"
                />
              </div>
              <div className="flex items-center space-x-2 w-1/3 justify-end">
                <span>DAY :</span>
                <input
                  type="text"
                  placeholder="________________"
                  className="p-1 text-xs border-b border-black font-bold focus:outline-none w-full bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table 1: Log Activity Grid (Venue, Time, Internship Activities, Remarks) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-300 border-b border-black text-center font-bold text-black">
                  <th className="border border-black p-2 w-1/5">Venue</th>
                  <th className="border border-black p-2 w-1/6">Time</th>
                  <th className="border border-black p-2 w-2/5">Internship Activities</th>
                  <th className="border border-black p-2 w-1/5">Remarks</th>
                  <th className="border border-black p-1 w-10 no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {logEntries.map((entry, idx) => (
                  <tr key={entry.id} className="border-b border-black h-12">
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        placeholder=""
                        value={entry.lokasi}
                        onChange={(e) => {
                          const updated = [...logEntries];
                          updated[idx].lokasi = e.target.value;
                          setLogEntries(updated);
                        }}
                        className="w-full p-1 bg-transparent border-0 focus:outline-none"
                      />
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        placeholder=""
                        value={entry.masa}
                        onChange={(e) => {
                          const updated = [...logEntries];
                          updated[idx].masa = e.target.value;
                          setLogEntries(updated);
                        }}
                        className="w-full p-1 bg-transparent border-0 focus:outline-none text-center"
                      />
                    </td>
                    <td className="border border-black p-1">
                      <textarea
                        rows={2}
                        placeholder=""
                        value={entry.aktiviti}
                        onChange={(e) => {
                          const updated = [...logEntries];
                          updated[idx].aktiviti = e.target.value;
                          setLogEntries(updated);
                        }}
                        className="w-full p-1 bg-transparent border-0 focus:outline-none resize-none"
                      />
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        placeholder=""
                        value={entry.catatan}
                        onChange={(e) => {
                          const updated = [...logEntries];
                          updated[idx].catatan = e.target.value;
                          setLogEntries(updated);
                        }}
                        className="w-full p-1 bg-transparent border-0 focus:outline-none"
                      />
                    </td>
                    <td className="border border-black p-1 text-center no-print">
                      <button
                        type="button"
                        onClick={() => removeLogRow(entry.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 no-print">
              <button
                type="button"
                onClick={addLogRow}
                className="inline-flex items-center text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Activity Row
              </button>
            </div>
          </div>

          {/* Table 2: SUMMARY OF DAILY INTERNSHIP HOURS (EXACT PDF LAYOUT) */}
          <div className="border border-black pt-2">
            <div className="font-black text-center pb-2 uppercase text-xs">
              SUMMARY OF DAILY INTERNSHIP HOURS
            </div>

            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                {/* Top Green Headers */}
                <tr className="bg-[#a2d182] text-black font-bold text-center border-b border-black">
                  <th className="border border-black p-2 w-1/2" colSpan={2}>
                    Face-to-Face Clinical Services (F2F)
                  </th>
                  <th className="border border-black p-2 w-1/2" colSpan={2}>
                    Professional Activities Related to Clinical Works
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="bg-[#c2e2aa] text-black font-bold text-center border-b border-black">
                  <th className="border border-black p-1">Clinical Counseling Session</th>
                  <th className="border border-black p-1 w-16">Hours</th>
                  <th className="border border-black p-1">Clinical Related Works</th>
                  <th className="border border-black p-1 w-16">Hours</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-black">
                  {/* Left Side: F2F */}
                  <td className="border border-black p-2" colSpan={2} rowSpan={10}>
                    <div className="space-y-4">
                      <div>
                        <div className="font-bold">1. Individual CMH Counseling</div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder=""
                          value={jamIndividu}
                          onChange={(e) => setJamIndividu(e.target.value)}
                          className="w-full mt-1 p-1 border border-black text-center font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="font-bold">2. Group CMH Counseling</div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder=""
                          value={jamKelompok}
                          onChange={(e) => setJamKelompok(e.target.value)}
                          className="w-full mt-1 p-1 border border-black text-center font-bold focus:outline-none"
                        />
                      </div>

                      <div className="text-[10px] space-y-1">
                        <p className="font-bold">** Mandatory for all types of counseling sessions to have:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                          <li>Clinical Intake Interview</li>
                          <li>Mental State Examination (MSE)</li>
                          <li>Psychological Assessment</li>
                          <li>Informant(s) interview (if needed)</li>
                          <li>Case formulation/ Case Conceptualization (For each individual client)</li>
                          <li>Clinical Treatment Plan (For each individual client)</li>
                        </ul>
                      </div>
                    </div>
                  </td>

                  {/* Right Side: Itemized Professional Activities */}
                  <td className="border border-black p-2">1. Crisis Intervention</td>
                  <td className="border border-black p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      placeholder=""
                      value={jamAktivitiIntervensi}
                      onChange={(e) => setJamAktivitiIntervensi(e.target.value)}
                      className="w-full p-1 text-center font-bold focus:outline-none bg-transparent"
                    />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">2. PFA/MPHSS</td>
                  <td className="border border-black p-1 text-center">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">3. Psychological Assessment</td>
                  <td className="border border-black p-1 text-center">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">4. Psychoeducation/Community Activities</td>
                  <td className="border border-black p-1 text-center">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">5. Family/Parents/Guardian Consultation</td>
                  <td className="border border-black p-1 text-center">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">
                    <div className="font-bold">Clinical Case Study</div>
                    <ul className="pl-4 text-[10px] space-y-0.5">
                      <li>▪ Clinical Case Study Writing</li>
                      <li>▪ Presentation of Clinical Case</li>
                    </ul>
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">
                    <div className="font-bold">Management and Administration</div>
                    <ul className="pl-4 text-[10px] space-y-0.5">
                      <li>▪ Record and Logbook Management</li>
                      <li>▪ Clinical Report Writing</li>
                      <li>▪ Reflection</li>
                      <li>▪ Clinical Supervision</li>
                    </ul>
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input
                      type="number"
                      step="0.5"
                      placeholder=""
                      value={jamPengurusan}
                      onChange={(e) => setJamPengurusan(e.target.value)}
                      className="w-full p-1 text-center font-bold focus:outline-none bg-transparent"
                    />
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="border border-black p-2">
                    <div className="font-bold">Professional Development</div>
                    <ul className="pl-4 text-[10px] space-y-0.5">
                      <li>▪ Presenter/Participant in professional conferences related CMHC workshops</li>
                      <li>▪ Attend physical or virtual webinar related to mental health</li>
                    </ul>
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input
                      type="number"
                      step="0.5"
                      placeholder=""
                      value={jamPerkembangan}
                      onChange={(e) => setJamPerkembangan(e.target.value)}
                      className="w-full p-1 text-center font-bold focus:outline-none bg-transparent"
                    />
                  </td>
                </tr>

                {/* Total Row */}
                <tr className="font-black border-t-2 border-black bg-slate-100">
                  <td className="border border-black p-2">TOTAL HOUR</td>
                  <td className="border border-black p-2 text-center">{sumF2F.toFixed(1)}</td>
                  <td className="border border-black p-2">TOTAL HOURS</td>
                  <td className="border border-black p-2 text-center">{sumProf.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          PAGE 2 & 3: SELF REFLECTION (ENGLISH TRANSLATED)
         =================================================================== */}
      {activeSection === 'refleksi' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm">
          <div className="border-b-2 border-black pb-2">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              SELF REFLECTION (WEEK {selectedWeek})
            </h2>
          </div>

          <div className="space-y-5 text-xs">
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                1. Individual Counseling / Therapy <span className="font-normal text-slate-600">(strengths, weaknesses, ways to overcome, etc.)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write reflection on individual counseling..."
                value={refleksiIndividu}
                onChange={(e) => setRefleksiIndividu(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                2. Group Counseling / Therapy <span className="font-normal text-slate-600">(strengths, weaknesses, ways to overcome, etc.)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write reflection on group counseling..."
                value={refleksiKelompok}
                onChange={(e) => setRefleksiKelompok(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                3. Activities / Interventions <span className="font-normal text-slate-600">(strengths, weaknesses, ways to overcome, etc.)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write reflection on crisis interventions & PFA activities..."
                value={refleksiAktiviti}
                onChange={(e) => setRefleksiAktiviti(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                4. Management & Administration <span className="font-normal text-slate-600">(strengths, weaknesses, ways to overcome, etc.)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write reflection on management, record keeping & case conceptualization..."
                value={refleksiPengurusan}
                onChange={(e) => setRefleksiPengurusan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                5. Professional Development <span className="font-normal text-slate-600">(strengths, weaknesses, ways to overcome, etc.)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write reflection on professional learning & workshops..."
                value={refleksiPerkembangan}
                onChange={(e) => setRefleksiPerkembangan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                6. Supervision <span className="font-normal text-slate-600">(supervision experience by Academic and/or Site Supervisor)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write experience & feedback received during supervision..."
                value={refleksiPenyeliaan}
                onChange={(e) => setRefleksiPenyeliaan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          PAGE 4: WEEKLY HOURS SUMMARY (ENGLISH TRANSLATED)
         =================================================================== */}
      {activeSection === 'rumusan' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-black pb-2 gap-2">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              WEEKLY HOURS SUMMARY (WEEK {selectedWeek})
            </h2>
            <div className="flex items-center space-x-2 text-xs font-bold">
              <span>Week : From</span>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={tarikhDari}
                onChange={(e) => setTarikhDari(e.target.value)}
                className="w-24 p-0.5 border-b border-black text-center focus:outline-none"
              />
              <span>to</span>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={tarikhKe}
                onChange={(e) => setTarikhKe(e.target.value)}
                className="w-24 p-0.5 border-b border-black text-center focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-2 text-left w-1/3">Activity</th>
                  <th className="border border-black p-1 w-12">Mon</th>
                  <th className="border border-black p-1 w-12">Tue</th>
                  <th className="border border-black p-1 w-12">Wed</th>
                  <th className="border border-black p-1 w-12">Thu</th>
                  <th className="border border-black p-1 w-12">Fri</th>
                  <th className="border border-black p-1 w-12">Sat</th>
                  <th className="border border-black p-1 w-12">Sun</th>
                  <th className="border border-black p-2 w-16 bg-slate-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'a', label: 'a. Individual Counseling' },
                  { key: 'b', label: 'b. Group Counseling' },
                  { key: 'c', label: 'c. Crisis Intervention' },
                  { key: 'd', label: 'd. Psychological First Aid (PFA) / Mental Health Psychosocial Support (MHPSS)' },
                  { key: 'e', label: 'e. Psychoeducation / Community Activities' },
                  { key: 'f', label: 'f. Psychological Assessment: Admin, Analysis, Interpretation' },
                  { key: 'g', label: 'g. Management and Administration' },
                  { key: 'h', label: 'h. Professional Development' },
                  { key: 'i', label: 'i. Supervision' },
                ].map(row => (
                  <tr key={row.key} className="border-b border-black">
                    <td className="border border-black p-2 font-bold">{row.label}</td>
                    {['isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad'].map(day => (
                      <td key={day} className="border border-black p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={weeklyHours[row.key]?.[day] || ''}
                          onChange={(e) => handleWeeklyHourChange(row.key, day, e.target.value)}
                          className="w-full text-center border-0 focus:outline-none font-bold bg-transparent"
                        />
                      </td>
                    ))}
                    <td className="border border-black p-2 text-center font-black bg-slate-100">
                      {calcRowTotal(row.key).toFixed(1)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-slate-200 border-t-2 border-black font-black text-center">
                  <td className="border border-black p-2 text-left">Weekly Total Hours</td>
                  {['isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad'].map(day => (
                    <td key={day} className="border border-black p-1">
                      {calcDayTotal(day).toFixed(1)}
                    </td>
                  ))}
                  <td className="border border-black p-2 text-center text-sm font-black bg-emerald-700 text-white">
                    {calcGrandTotal().toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t border-black grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-12">
              <div className="border-b border-black w-3/4"></div>
              <div>
                <p className="font-black">Trainee Counselor Signature</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>Date:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-32 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="border-b border-black w-3/4"></div>
              <div>
                <p className="font-black">Academic Supervisor Signature</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>Date:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-32 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
