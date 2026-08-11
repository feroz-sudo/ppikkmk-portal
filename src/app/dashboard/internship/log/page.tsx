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
  Award,
  Upload,
  Camera,
  X
} from 'lucide-react';

interface DailyLogEntry {
  id: string;
  lokasi: string;
  masa: string;
  aktiviti: string;
  catatan: string;
}

export default function InternshipLogbookPage() {
  const [activeSection, setActiveSection] = useState<'cover' | 'personal_info' | 'contract' | 'agreement' | 'components' | 'individual_hours' | 'attendance' | 'log' | 'refleksi' | 'rumusan'>('cover');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Cover & Personal Info State
  const [traineeName, setTraineeName] = useState('AHMAD FEROZ BIN ABDUL SAMAD');
  const [matricNo, setMatricNo] = useState('M20241001148');
  const [placementSite, setPlacementSite] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        {/* Navigation Tabs (Full Document Structure) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSection('cover')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'cover' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>1. Cover</span>
          </button>
          <button
            onClick={() => setActiveSection('personal_info')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'personal_info' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>2. Personal Info</span>
          </button>
          <button
            onClick={() => setActiveSection('contract')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'contract' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>3. Supervisory Contract</span>
          </button>
          <button
            onClick={() => setActiveSection('agreement')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'agreement' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>4. Agreement</span>
          </button>
          <button
            onClick={() => setActiveSection('components')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'components' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>5. Components (504h)</span>
          </button>
          <button
            onClick={() => setActiveSection('individual_hours')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'individual_hours' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>6. Individual Hours Log</span>
          </button>
          <button
            onClick={() => setActiveSection('attendance')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'attendance' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>7. Attendance Log</span>
          </button>
          <button
            onClick={() => setActiveSection('log')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'log' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>7. Daily Log</span>
          </button>
          <button
            onClick={() => setActiveSection('refleksi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'refleksi' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>8. Self Reflection</span>
          </button>
          <button
            onClick={() => setActiveSection('rumusan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeSection === 'rumusan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>9. Weekly Hours Summary</span>
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
          2. CMHC COUNSELOR TRAINEE PERSONAL INFORMATION (PAGE 4 REPLICA)
         =================================================================== */}
      {activeSection === 'personal_info' && (
        <div className="space-y-6 bg-white p-8 sm:p-12 border border-black shadow-sm max-w-4xl mx-auto text-black">
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-48 border-2 border-black border-dashed rounded-md bg-slate-50 flex flex-col items-center justify-center overflow-hidden group hover:border-emerald-600 transition">
              {passportPhoto ? (
                <>
                  <img
                    src={passportPhoto}
                    alt="Trainee Passport Photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPassportPhoto(null)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition no-print shadow-md"
                    title="Remove Photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-2 text-center w-full h-full no-print">
                  <Camera className="h-6 w-6 text-slate-500 mb-1 group-hover:text-emerald-700 transition" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-emerald-800">
                    Upload Passport Photo
                  </span>
                  <span className="text-[8px] text-slate-400 mt-0.5">JPG / PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Print View Fallback if no photo uploaded */}
              {!passportPhoto && (
                <div className="hidden print:flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold text-center">
                  Passport Photo Box
                </div>
              )}
            </div>
          </div>

          <h2 className="text-center text-base sm:text-lg font-black uppercase border-b-2 border-black pb-2">
            CMHC COUNSELOR TRAINEE PERSONAL INFORMATION
          </h2>

          <div className="space-y-4 text-xs font-bold pt-4">
            <div className="flex items-center space-x-2"><span className="w-48">Name</span><span>:</span><input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Matric Number</span><span>:</span><input type="text" value={matricNo} onChange={e => setMatricNo(e.target.value)} className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Identification Number</span><span>:</span><input type="text" placeholder="e.g. 981012-08-5432" className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-start space-x-2"><span className="w-48 pt-1">Permanent Address</span><span className="pt-1">:</span><textarea rows={3} placeholder="Full address..." className="flex-1 border border-slate-300 p-1 focus:outline-none resize-none" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Phone Number</span><span>:</span><input type="text" placeholder="e.g. +60123456789" className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Email Address</span><span>:</span><input type="text" placeholder="e.g. trainee@siswa.upsi.edu.my" className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Internship Placement</span><span>:</span><input type="text" value={placementSite} onChange={e => setPlacementSite(e.target.value)} className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
            <div className="flex items-start space-x-2"><span className="w-48 pt-1">Internship Site Address</span><span className="pt-1">:</span><textarea rows={3} placeholder="Site address..." className="flex-1 border border-slate-300 p-1 focus:outline-none resize-none" /></div>
            <div className="flex items-center space-x-2"><span className="w-48">Emergency Contact Number</span><span>:</span><input type="text" placeholder="Emergency contact phone..." className="flex-1 border-b border-black focus:outline-none p-1 font-bold" /></div>
          </div>
        </div>
      )}

      {/* ===================================================================
          3. SUPERVISORY CONTRACT (PAGES 5-7 REPLICA)
         =================================================================== */}
      {activeSection === 'contract' && (
        <div className="space-y-6 bg-white p-8 sm:p-12 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          <div className="flex flex-col items-center text-center space-y-1 border-b-2 border-black pb-4">
            <img src="/upsi-logo.png" alt="UPSI Logo" className="h-16 w-auto object-contain" />
            <p className="font-bold text-sm">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
            <p className="text-[10px] text-red-600 font-bold uppercase">SULTAN IDRIS EDUCATION UNIVERSITY</p>
          </div>

          <h2 className="text-center text-sm font-black uppercase tracking-wide pt-2">
            CLINICAL MENTAL HEALTH COUNSELING INTERNSHIP CONTRACT
          </h2>

          <p className="pt-2">
            This contract serves as a verification and description of the counseling supervision provided by <input type="text" placeholder="(Supervisor Name)" className="border-b border-black px-1 font-bold focus:outline-none w-48" /> ("Supervisor") to <input type="text" value={traineeName} onChange={e => setTraineeName(e.target.value)} className="border-b border-black px-1 font-bold focus:outline-none w-48" /> ("Supervisee"), Clinical Mental Health Counseling intern student enrolled at Universiti Pendidikan Sultan Idris.
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="font-black uppercase text-xs">PURPOSE, GOALS AND OBJECTIVES</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Monitor and ensure welfare of clients seen by supervisee.</li>
              <li>Promote development of supervisee's professional counselor identity and competence.</li>
              <li>Fulfil academic requirement for supervisee's internship.</li>
              <li>Fulfil requirements in preparation for supervisee's pursuit counselor licensure (when applicable).</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-black uppercase text-xs">CONTEXT OF SERVICE</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Two (2) clock hour of group supervision bi-weekly through online.</li>
              <li>Two (2) supervision will be conducted face-to-face at internship site and one (1) online supervision for the purpose of internship assessment.</li>
              <li>Supervision will resolve around counseling conducted with students seen at the internship site.</li>
            </ul>
          </div>

          <div className="pt-8 border-t border-black grid grid-cols-2 gap-8 font-bold">
            <div className="space-y-10">
              <div className="border-b border-black w-full"></div>
              <div><p>(Supervisee Signature)</p><p className="font-normal mt-1">Date: _____________</p></div>
            </div>
            <div className="space-y-10">
              <div className="border-b border-black w-full"></div>
              <div><p>(Site Supervisor Signature)</p><p className="font-normal mt-1">Date: _____________</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          4. TRAINEE INTERNSHIP AGREEMENT (PAGE 8 REPLICA)
         =================================================================== */}
      {activeSection === 'agreement' && (
        <div className="space-y-6 bg-white p-8 sm:p-12 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs leading-relaxed">
          <h2 className="text-center text-sm font-black uppercase border-b-2 border-black pb-3">
            CMHC COUNSELOR TRAINEE INTERNSHIP AGREEMENT
          </h2>

          <div className="space-y-4 pt-4">
            <p>I acknowledge that I have read and understood the Code of Ethics of the Malaysian Board of Counselors and will practice counseling in accordance with the established standards. Any ethical violations or unethical behavior committed by me will result in termination and failure of the practicum. Documentation regarding any ethical violations will be recorded as part of the counseling internship record.</p>
            <p>I understand that I must also comply with the professional ethical code at my practicum site.</p>
            <p>I agree to abide by the administrative policies, regulations, standards, and practices of my practicum site and will ensure professional behaviour at all times.</p>
            <p>I understand that my responsibilities include updating my academic supervisor and site supervisor on the progress of my internship.</p>
            <p>I understand that I will not receive a passing grade in the practicum if I do not demonstrate satisfactory counseling skills, knowledge, and competency or if I fail to complete the required coursework and assignments.</p>
          </div>

          <div className="space-y-4 pt-8 border-t border-black font-bold">
            <div className="flex items-center space-x-2"><span className="w-60">CMHC Trainee Counselor Signature :</span><input type="text" placeholder="_______________________" className="border-b border-black focus:outline-none p-1" /></div>
            <div className="flex items-center space-x-2"><span className="w-60">CMHC Trainee Counselor Name :</span><span className="font-black">{traineeName}</span></div>
            <div className="flex items-center space-x-2"><span className="w-60">Matric Number :</span><span className="font-black">{matricNo}</span></div>
            <div className="flex items-center space-x-2"><span className="w-60">Date :</span><input type="text" placeholder="DD-MM-YYYY" className="border-b border-black focus:outline-none p-1" /></div>
          </div>
        </div>
      )}

      {/* ===================================================================
          6. ATTENDANCE LOG (PAGES 20-24 REPLICA)
         =================================================================== */}
      {activeSection === 'attendance' && (
        <div className="space-y-6 bg-white p-6 sm:p-10 border border-black shadow-sm max-w-4xl mx-auto text-black text-xs">
          <div className="text-center font-bold border-b-2 border-black pb-3 space-y-1">
            <h2 className="text-base font-black uppercase">ATTENDANCE RECORD</h2>
            <p className="text-xs uppercase">INTERNSHIP FOR CLINICAL MENTAL HEALTH COUNSELING</p>
            <p className="text-xs uppercase">UNIVERSITI PENDIDIKAN SULTAN IDRIS</p>
          </div>

          <div className="space-y-2 font-bold border border-black p-3">
            <div className="flex"><span className="w-48">Student's Name</span><span>: {traineeName}</span></div>
            <div className="flex"><span className="w-48">Matric Number</span><span>: {matricNo}</span></div>
            <div className="flex"><span className="w-48">Internship Site</span><span>: {placementSite || 'PPIKKMK Counseling Center'}</span></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-center font-bold">
                  <th className="border border-black p-2 w-16">Week</th>
                  <th className="border border-black p-2 w-24">Date</th>
                  <th className="border border-black p-2 w-20">Day</th>
                  <th className="border border-black p-2">Time Check In & Out</th>
                  <th className="border border-black p-2 w-32">Endorsed By Site Supervisor</th>
                  <th className="border border-black p-2 w-36">Verified By Academic Supervisor</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 28 }, (_, i) => i + 1).map(wk => (
                  <tr key={wk} className="border-b border-black h-10">
                    <td className="border border-black p-1 text-center font-bold">Week {wk}</td>
                    <td className="border border-black p-1"><input type="text" placeholder="" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-1"><input type="text" placeholder="" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-1"><input type="text" placeholder="" className="w-full text-center bg-transparent border-0 focus:outline-none" /></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          INDIVIDUAL COUNSELING HOURS LOG (F1 2026 REPLICA)
         =================================================================== */}
      {activeSection === 'individual_hours' && (
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
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="DD-MM-YYYY" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
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
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="DD-MM-YYYY" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
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
                <div className="flex items-center space-x-1 mt-2"><span>Date:</span><input type="text" placeholder="DD-MM-YYYY" className="border-b border-black w-24 focus:outline-none bg-transparent font-bold" /></div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 italic text-center pt-2">
            This clinical form is protected by copyright. You are not permitted to modify, reproduce, distribute, or reuse any part of this form without prior written permission from the form owner. - Dr Pau Kee
          </div>
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
          {/* Header Title & Aligned Date/Day Inputs */}
          <div className="space-y-4">
            <h2 className="text-center text-base sm:text-lg font-black uppercase tracking-wide">
              DAILY LOG (WEEK {selectedWeek})
            </h2>
            <div className="flex items-end justify-between text-xs font-bold pt-2 px-1">
              <div className="flex items-center space-x-2 w-1/2">
                <span className="w-14 uppercase tracking-wider">DATE :</span>
                <input
                  type="text"
                  placeholder=""
                  value={tarikhHari}
                  onChange={(e) => setTarikhHari(e.target.value)}
                  className="flex-1 border-b-2 border-black font-bold focus:outline-none pb-0.5 bg-transparent text-xs"
                />
              </div>
              <div className="flex items-center space-x-2 w-1/3 justify-end">
                <span className="w-12 uppercase tracking-wider text-right">DAY :</span>
                <input
                  type="text"
                  placeholder=""
                  className="w-36 border-b-2 border-black font-bold focus:outline-none pb-0.5 bg-transparent text-xs text-center"
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

          {/* Table 2: SUMMARY OF DAILY INTERNSHIP HOURS (EXACT 1:1 PDF REPLICA) */}
          <div className="border border-black pt-2">
            <div className="font-black text-center pb-2 uppercase text-xs tracking-wider">
              SUMMARY OF DAILY INTERNSHIP HOURS
            </div>

            <table className="w-full border-collapse border border-black text-[11px] leading-tight">
              <thead>
                {/* Top Green Headers */}
                <tr className="bg-[#a2d182] text-black font-bold text-center border-b border-black">
                  <th className="border border-black p-1.5" colSpan={2}>
                    Face-to-Face Clinical Services (F2F)
                  </th>
                  <th className="border border-black p-1.5" colSpan={2}>
                    Professional Activities Related to Clinical Works
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="bg-[#c2e2aa] text-black font-bold text-center border-b border-black">
                  <th className="border border-black p-1 text-left pl-3">Clinical Counseling Session</th>
                  <th className="border border-black p-1 w-16">Hours</th>
                  <th className="border border-black p-1 text-left pl-3">Clinical Related Works</th>
                  <th className="border border-black p-1 w-16">Hours</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {/* Row 1: Individual Counseling & Crisis Intervention */}
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">1. Individual CMH Counseling</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input
                      type="number"
                      step="0.5"
                      placeholder=""
                      value={jamIndividu}
                      onChange={(e) => setJamIndividu(e.target.value)}
                      className="w-full p-1 text-center font-bold focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-2">1. Crisis Intervention</td>
                  <td className="border border-black p-1 text-center align-middle">
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

                {/* Row 2: Group Counseling & PFA/MPHSS */}
                <tr className="border-b border-black">
                  <td className="border border-black p-2 font-bold">2. Group CMH Counseling</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input
                      type="number"
                      step="0.5"
                      placeholder=""
                      value={jamKelompok}
                      onChange={(e) => setJamKelompok(e.target.value)}
                      className="w-full p-1 text-center font-bold focus:outline-none bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-2">2. PFA/MPHSS</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                {/* Row 3: Mandatory bullets & Psychological Assessment */}
                <tr className="border-b border-black">
                  <td className="border border-black p-2" rowSpan={6}>
                    <div className="space-y-1 text-[10px]">
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
                  </td>
                  <td className="border border-black p-1" rowSpan={6}></td>
                  <td className="border border-black p-2">3. Psychological Assessment</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                {/* Row 4: Psychoeducation */}
                <tr className="border-b border-black">
                  <td className="border border-black p-2">4. Psychoeducation/Community Actitivities</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                {/* Row 5: Family Consultation */}
                <tr className="border-b border-black">
                  <td className="border border-black p-2">5. Family/Parents/Guardian Consultation</td>
                  <td className="border border-black p-1 text-center align-middle">
                    <input type="number" step="0.5" className="w-full p-1 text-center font-bold focus:outline-none bg-transparent" />
                  </td>
                </tr>

                {/* Row 6: Clinical Case Study */}
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

                {/* Row 7: Management and Administration */}
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

                {/* Row 8: Professional Development */}
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
                placeholder="DD-MM-YYYY"
                value={tarikhDari}
                onChange={(e) => setTarikhDari(e.target.value)}
                className="w-24 p-0.5 border-b border-black text-center focus:outline-none"
              />
              <span>to</span>
              <input
                type="text"
                placeholder="DD-MM-YYYY"
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
                  <input type="text" placeholder="DD-MM-YYYY" className="border-b border-black w-32 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="border-b border-black w-3/4"></div>
              <div>
                <p className="font-black">Academic Supervisor Signature</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>Date:</span>
                  <input type="text" placeholder="DD-MM-YYYY" className="border-b border-black w-32 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
