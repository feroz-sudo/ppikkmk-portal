"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  Clock,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { FormHeader } from '@/components/forms/FormHeader';

interface DailyLogEntry {
  id: string;
  lokasi: string;
  masa: string;
  aktiviti: string;
  catatan: string;
}

export default function InternshipLogbookPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState<'log' | 'refleksi' | 'rumusan'>('log');

  // Page 1: Daily Log Header
  const [tarikhHari, setTarikhHari] = useState('');
  const [logEntries, setLogEntries] = useState<DailyLogEntry[]>([
    { id: '1', lokasi: '', masa: '', aktiviti: '', catatan: '' }
  ]);

  // Page 1: Rumusan Jam Harian Inputs
  const [jamIndividu, setJamIndividu] = useState<string>('');
  const [jamKelompok, setJamKelompok] = useState<string>('');
  const [jamAktivitiIntervensi, setJamAktivitiIntervensi] = useState<string>('');
  const [jamPengurusan, setJamPengurusan] = useState<string>('');
  const [jamPerkembangan, setJamPerkembangan] = useState<string>('');
  const [jamPenyeliaan, setJamPenyeliaan] = useState<string>('');

  // Page 2 & 3: Refleksi Kendiri Inputs
  const [refleksiIndividu, setRefleksiIndividu] = useState('');
  const [refleksiKelompok, setRefleksiKelompok] = useState('');
  const [refleksiAktiviti, setRefleksiAktiviti] = useState('');
  const [refleksiPengurusan, setRefleksiPengurusan] = useState('');
  const [refleksiPerkembangan, setRefleksiPerkembangan] = useState('');
  const [refleksiPenyeliaan, setRefleksiPenyeliaan] = useState('');

  // Page 4: Rumusan Jam Mingguan Inputs
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

  // Helper calculation for daily F2F & Professional activity sums
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6 internship-form-font text-black">
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 no-print">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <span>Internship Portal</span>
            <span>•</span>
            <span className="text-upsi-navy font-black">28-Week Clinical Logbook</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Log Harian, Refleksi Kendiri & Rumusan Jam Mingguan
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Exact Replica of Official UPSI Clinical Logbook • Font: <strong>Arial 9pt</strong> • Margins: <strong>A4 Printable</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 transition"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Cetak Log A4
          </button>
          <button
            onClick={handleSaveLogbook}
            className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg bg-upsi-navy hover:bg-blue-900 text-white transition shadow-md"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Simpan Logbook
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 flex items-center space-x-2 text-xs font-bold no-print">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>Rekod Logbook Minggu {selectedWeek} berjaya disimpan!</span>
        </div>
      )}

      {/* Week Selector Bar & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print">
        {/* Week Stepper */}
        <div className="flex items-center space-x-2">
          <button
            disabled={selectedWeek <= 1}
            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-upsi-navy" />
            <span className="text-xs font-black uppercase text-slate-800">
              Minggu {selectedWeek} / 28
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

        {/* Section Tabs */}
        <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('log')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 ${
              selectedTab === 'log' ? 'bg-upsi-navy text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>1. Log Harian</span>
          </button>
          <button
            onClick={() => setSelectedTab('refleksi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 ${
              selectedTab === 'refleksi' ? 'bg-upsi-navy text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>2. Refleksi Kendiri</span>
          </button>
          <button
            onClick={() => setSelectedTab('rumusan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1.5 ${
              selectedTab === 'rumusan' ? 'bg-upsi-navy text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>3. Rumusan Jam</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          PAGE 1: LOG HARIAN (EXACT REPLICA OF ORIGINAL PDF PAGE 1)
         =================================================================== */}
      {(selectedTab === 'log' || typeof window !== 'undefined') && (
        <div className={`space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm ${selectedTab !== 'log' ? 'hidden print:block' : ''}`}>
          {/* Header Title */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              LOG HARIAN (M{selectedWeek})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-black uppercase">Tarikh / Hari :</span>
              <input
                type="text"
                placeholder="e.g. 03/03/2026 (ISNIN)"
                value={tarikhHari}
                onChange={(e) => setTarikhHari(e.target.value)}
                className="p-1 text-xs border-b border-black font-bold focus:outline-none w-48 bg-transparent"
              />
            </div>
          </div>

          {/* Table 1: Log Activity Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-2 w-1/5">Lokasi</th>
                  <th className="border border-black p-2 w-1/6">Masa</th>
                  <th className="border border-black p-2 w-2/5">Aktiviti Praktikum</th>
                  <th className="border border-black p-2 w-1/5">Catatan</th>
                  <th className="border border-black p-1 w-10 no-print">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {logEntries.map((entry, idx) => (
                  <tr key={entry.id} className="border-b border-black">
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        placeholder="e.g. Bilik Sesi 1"
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
                        placeholder="e.g. 09:00 AM - 10:00 AM"
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
                        placeholder="Butiran aktiviti harian..."
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
                        placeholder="Catatan / rujukan"
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
                Tambah Baris Aktiviti
              </button>
            </div>
          </div>

          {/* Table 2: Rumusan Jam Harian Aktiviti Praktikum (EXACT 2-COLUMN SPLIT) */}
          <div className="border border-black">
            <div className="bg-slate-100 font-black text-center border-b border-black py-1.5 uppercase text-xs">
              RUMUSAN JAM HARIAN AKTIVITI PRAKTIKUM
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 text-xs">
              {/* LEFT COLUMN: Perkhidmatan Bersemuka (F2F) */}
              <div className="border-r border-black p-3 space-y-3">
                <div className="font-bold border-b border-black pb-1 uppercase">
                  Perkhidmatan Bersemuka (F2F)
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black text-left font-bold">
                      <th className="py-1">Sesi Kaunseling KMK</th>
                      <th className="py-1 text-right w-16">Jam</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr>
                      <td className="py-1.5">
                        <span className="font-bold">1. Kaunseling Individu KMK</span>
                        <div className="text-[10px] text-slate-600 italic">
                          *Temubual Pengambilan / Temubual Klinikal<br />
                          *Penilaian / saringan status mental<br />
                          *Wajib dalam semua jenis sesi kaunseling
                        </div>
                      </td>
                      <td className="align-top py-1.5">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="0.0"
                          value={jamIndividu}
                          onChange={(e) => setJamIndividu(e.target.value)}
                          className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                        />
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1.5 font-bold">
                        2. Kaunseling Kelompok KMK
                      </td>
                      <td className="align-top py-1.5">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="0.0"
                          value={jamKelompok}
                          onChange={(e) => setJamKelompok(e.target.value)}
                          className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex items-center justify-between border-t border-black pt-2 font-black text-xs">
                  <span>JUMLAH JAM (F2F) :</span>
                  <span className="px-3 py-1 bg-slate-100 border border-black">{sumF2F.toFixed(1)} HRS</span>
                </div>
              </div>

              {/* RIGHT COLUMN: Aktiviti Profesional Kaunselor KMK */}
              <div className="p-3 space-y-3">
                <div className="font-bold border-b border-black pb-1 uppercase">
                  Aktiviti Profesional Kaunselor KMK
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold">1. Aktiviti / Intervensi</span>
                      <ul className="text-[10px] text-slate-700 pl-3 list-disc">
                        <li>i. Intervensi Krisis</li>
                        <li>ii. PFA / MHPSS</li>
                        <li>iii. Pengujian: Tadbir, Analisis, Interpretasi</li>
                        <li>iv. Aktiviti Psikopendidikan / Komuniti (Outreach/Rujukan/Konsultasi)</li>
                      </ul>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={jamAktivitiIntervensi}
                      onChange={(e) => setJamAktivitiIntervensi(e.target.value)}
                      className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-slate-200 pt-2">
                    <div>
                      <span className="font-bold">2. Pengurusan dan Pentadbiran</span>
                      <p className="text-[10px] text-slate-600">Pengurusan rekod, konseptualisasi kes, laporan refleksi</p>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={jamPengurusan}
                      onChange={(e) => setJamPengurusan(e.target.value)}
                      className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-slate-200 pt-2">
                    <div>
                      <span className="font-bold">3. Perkembangan Profesional</span>
                      <p className="text-[10px] text-slate-600">Pembentang / peserta konferens & literatur profesional</p>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={jamPerkembangan}
                      onChange={(e) => setJamPerkembangan(e.target.value)}
                      className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-slate-200 pt-2">
                    <div>
                      <span className="font-bold">4. Penyeliaan</span>
                      <p className="text-[10px] text-slate-600">Individu / Triadik / Kumpulan</p>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={jamPenyeliaan}
                      onChange={(e) => setJamPenyeliaan(e.target.value)}
                      className="w-16 p-1 border border-black text-center font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black pt-2 font-black text-xs">
                  <span>JUMLAH JAM (PROFESIONAL) :</span>
                  <span className="px-3 py-1 bg-slate-100 border border-black">{sumProf.toFixed(1)} HRS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          PAGE 2 & 3: REFLEKSI KENDIRI (EXACT REPLICA OF ORIGINAL PDF PAGE 2 & 3)
         =================================================================== */}
      {(selectedTab === 'refleksi' || typeof window !== 'undefined') && (
        <div className={`space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm ${selectedTab !== 'refleksi' ? 'hidden print:block' : ''}`}>
          <div className="border-b-2 border-black pb-2">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              REFLEKSI KENDIRI (MINGGU {selectedWeek})
            </h2>
          </div>

          <div className="space-y-5 text-xs">
            {/* Section 1 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                1. Kaunseling / Terapi Individu <span className="font-normal text-slate-600">(kekuatan, kelemahan dan cara mengatasi, dan lain-lain)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan refleksi kaunseling individu..."
                value={refleksiIndividu}
                onChange={(e) => setRefleksiIndividu(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            {/* Section 2 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                2. Kaunseling / Terapi Kelompok <span className="font-normal text-slate-600">(kekuatan, kelemahan dan cara mengatasi, dan lain-lain)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan refleksi kaunseling kelompok..."
                value={refleksiKelompok}
                onChange={(e) => setRefleksiKelompok(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            {/* Section 3 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                3. Aktiviti / Intervensi <span className="font-normal text-slate-600">(kekuatan, kelemahan dan cara mengatasi, dan lain-lain)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan refleksi aktiviti & intervensi krisis/PFA..."
                value={refleksiAktiviti}
                onChange={(e) => setRefleksiAktiviti(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            {/* Section 4 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                4. Pengurusan & Pentadbiran <span className="font-normal text-slate-600">(kekuatan, kelemahan dan cara mengatasi, dan lain-lain)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan refleksi pengurusan pentadbiran & rekod..."
                value={refleksiPengurusan}
                onChange={(e) => setRefleksiPengurusan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            {/* Section 5 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                5. Perkembangan Profesional <span className="font-normal text-slate-600">(kekuatan, kelemahan dan cara mengatasi, dan lain-lain)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan refleksi perkembangan profesional..."
                value={refleksiPerkembangan}
                onChange={(e) => setRefleksiPerkembangan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>

            {/* Section 6 */}
            <div className="space-y-1 border border-black p-3">
              <label className="font-bold block uppercase">
                6. Penyeliaan <span className="font-normal text-slate-600">(pengalaman diselia oleh Penyelia Akademik dan / atau Lapangan)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan pengalaman & maklum balas penyeliaan..."
                value={refleksiPenyeliaan}
                onChange={(e) => setRefleksiPenyeliaan(e.target.value)}
                className="w-full p-2 border border-slate-300 focus:border-black focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          PAGE 4: RUMUSAN JAM MINGGUAN (EXACT REPLICA OF ORIGINAL PDF PAGE 4)
         =================================================================== */}
      {(selectedTab === 'rumusan' || typeof window !== 'undefined') && (
        <div className={`space-y-6 bg-white p-6 sm:p-8 border border-black shadow-sm ${selectedTab !== 'rumusan' ? 'hidden print:block' : ''}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-black pb-2 gap-2">
            <h2 className="text-base sm:text-lg font-black uppercase text-black">
              RUMUSAN JAM MINGGUAN (M{selectedWeek})
            </h2>
            <div className="flex items-center space-x-2 text-xs font-bold">
              <span>Minggu : Dari</span>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={tarikhDari}
                onChange={(e) => setTarikhDari(e.target.value)}
                className="w-24 p-0.5 border-b border-black text-center focus:outline-none"
              />
              <span>ke</span>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={tarikhKe}
                onChange={(e) => setTarikhKe(e.target.value)}
                className="w-24 p-0.5 border-b border-black text-center focus:outline-none"
              />
            </div>
          </div>

          {/* Table Grid: Days & Activities */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-2 text-left w-1/3">Aktiviti</th>
                  <th className="border border-black p-1 w-12">Isnin</th>
                  <th className="border border-black p-1 w-12">Selasa</th>
                  <th className="border border-black p-1 w-12">Rabu</th>
                  <th className="border border-black p-1 w-12">Khamis</th>
                  <th className="border border-black p-1 w-12">Jumaat</th>
                  <th className="border border-black p-1 w-12">Sabtu</th>
                  <th className="border border-black p-1 w-12">Ahad</th>
                  <th className="border border-black p-2 w-16 bg-slate-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'a', label: 'a. Kaunseling Individu' },
                  { key: 'b', label: 'b. Kaunseling Kelompok' },
                  { key: 'c', label: 'c. Intervensi Krisis' },
                  { key: 'd', label: 'd. Psychological First Aid (PFA) / Mental Health Psychosocial Support (MHPSS)' },
                  { key: 'e', label: 'e. Aktiviti Psikopendidikan / Komuniti' },
                  { key: 'f', label: 'f. Pengujian: Tadbir, Analisis, Interpretasi' },
                  { key: 'g', label: 'g. Pengurusan dan Pentadbiran' },
                  { key: 'h', label: 'h. Perkembangan Profesional' },
                  { key: 'i', label: 'i. Penyeliaan' },
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

                {/* Summary Row */}
                <tr className="bg-slate-200 border-t-2 border-black font-black text-center">
                  <td className="border border-black p-2 text-left">Jumlah Jam Minggu</td>
                  {['isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad'].map(day => (
                    <td key={day} className="border border-black p-1">
                      {calcDayTotal(day).toFixed(1)}
                    </td>
                  ))}
                  <td className="border border-black p-2 text-center text-sm font-black bg-upsi-gold text-upsi-navy">
                    {calcGrandTotal().toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Endorsement Signature Block */}
          <div className="pt-8 border-t border-black grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-12">
              <div className="border-b border-black w-3/4"></div>
              <div>
                <p className="font-black">Tandatangan Kaunselor Pelatih</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>Tarikh:</span>
                  <input type="text" placeholder="YYYY-MM-DD" className="border-b border-black w-32 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="border-b border-black w-3/4"></div>
              <div>
                <p className="font-black">Tandatangan Penyelia Akademik</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>Tarikh:</span>
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
