"use client";

import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Plus, 
  BarChart3,
  Edit3,
  Trash2,
  Save,
  Printer,
  X
} from 'lucide-react';
import Link from 'next/link';

// Internship details specific to M20241001148
const INTERNSHIP_PROFILE = {
  matricNo: "M20241001148",
  totalWeeks: 28,
  startDate: "2026-03-03", // 3rd March 2026
  endDate: "2027-02-20",   // 20th February 2027
  program: "Master of Counseling (Clinical Mental Health)",
  site: "PPIKKMK Clinical Mental Health Center",
};

interface DailyLogEntry {
  id: string;
  date: string;
  day: string;
  venue: string;
  startTime: string;
  endTime: string;
  activities: string;
  remarks: string;
  f2fIndivHours: number;
  f2fGroupHours: number;
  crisisHours: number;
  pfaHours: number;
  assessmentHours: number;
  psychoHours: number;
  consultationHours: number;
  caseStudyHours: number;
  adminHours: number;
  profDevHours: number;
}

export default function InternshipLogPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'attendance' | 'summary'>('overview');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isAddingLog, setIsAddingLog] = useState(false);

  // Daily log state for editing
  const [dailyEntries, setDailyEntries] = useState<Record<number, DailyLogEntry[]>>({});

  // New entry form state
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDay, setLogDay] = useState('Monday');
  const [venue, setVenue] = useState('PPIKKMK Center');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [activities, setActivities] = useState('');
  const [remarks, setRemarks] = useState('');
  const [f2fIndivHours, setF2fIndivHours] = useState('0');
  const [f2fGroupHours, setF2fGroupHours] = useState('0');
  const [adminHours, setAdminHours] = useState('0');

  // Generate 28 weeks array for M20241001148
  const weeks = Array.from({ length: 28 }, (_, i) => i + 1);

  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DailyLogEntry = {
      id: Date.now().toString(),
      date: logDate,
      day: logDay,
      venue,
      startTime,
      endTime,
      activities,
      remarks,
      f2fIndivHours: parseFloat(f2fIndivHours) || 0,
      f2fGroupHours: parseFloat(f2fGroupHours) || 0,
      crisisHours: 0,
      pfaHours: 0,
      assessmentHours: 0,
      psychoHours: 0,
      consultationHours: 0,
      caseStudyHours: 0,
      adminHours: parseFloat(adminHours) || 0,
      profDevHours: 0,
    };

    const currentWeekLogs = dailyEntries[selectedWeek] || [];
    setDailyEntries({
      ...dailyEntries,
      [selectedWeek]: [...currentWeekLogs, newEntry]
    });

    setIsAddingLog(false);
    setActivities('');
    setRemarks('');
  };

  const handleDeleteEntry = (weekNum: number, id: string) => {
    const updated = (dailyEntries[weekNum] || []).filter(e => e.id !== id);
    setDailyEntries({ ...dailyEntries, [weekNum]: updated });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 internship-form-font">
      {/* Top Banner Header */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Internship Log In
            </span>
            <span>•</span>
            <span>Clinical Mental Health</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CMHC Internship Editable Logbook & Attendance</h1>
          <p className="text-xs text-muted-foreground">
            Official 28-Week Clinical Logbook for Matric <span className="font-bold text-foreground">{INTERNSHIP_PROFILE.matricNo}</span> (Font: Arial 9pt)
          </p>
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-4 border-l pl-0 md:pl-6 border-border">
          <div className="text-right hidden sm:block text-xs space-y-0.5">
            <p className="font-bold text-foreground">{INTERNSHIP_PROFILE.program}</p>
            <p className="text-muted-foreground">{INTERNSHIP_PROFILE.startDate} to {INTERNSHIP_PROFILE.endDate}</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              28 Weeks Duration
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b">
        {[
          { id: 'overview', label: '28-Week Overview', icon: Calendar },
          { id: 'daily', label: 'Daily Activity Log', icon: FileText },
          { id: 'attendance', label: 'Attendance Record', icon: Clock },
          { id: 'summary', label: 'Hours Summary', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 -mb-px transition ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 28-Week Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground">Total Duration</span>
              <p className="text-2xl font-bold text-emerald-600">28 Weeks</p>
              <p className="text-[11px] text-muted-foreground">3 March 2026 – 20 Feb 2027</p>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground">Direct F2F Target</span>
              <p className="text-2xl font-bold text-blue-600">400 Hours</p>
              <p className="text-[11px] text-muted-foreground">Individual & Group Counseling</p>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground">Indirect Target</span>
              <p className="text-2xl font-bold text-indigo-600">560 Hours</p>
              <p className="text-[11px] text-muted-foreground">Assessment, Admin, PFA & Workshops</p>
            </div>

            <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
              <span className="text-xs text-muted-foreground">Supervision Target</span>
              <p className="text-2xl font-bold text-purple-600">40 Hours</p>
              <p className="text-[11px] text-muted-foreground">Site & Academic Supervision</p>
            </div>
          </div>

          {/* Week Selector Grid */}
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h2 className="text-sm font-bold">Select Week to View / Entry Daily Logs (28 Weeks)</h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {weeks.map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setSelectedWeek(w);
                    setActiveTab('daily');
                  }}
                  className={`p-3 rounded-lg border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    selectedWeek === w
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-xs font-bold">Week</span>
                  <span className="text-lg">{w}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Log */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
            <div>
              <h2 className="text-lg font-bold">DAILY LOG (WEEK {selectedWeek})</h2>
              <p className="text-xs text-muted-foreground">Original UPSI CMHC Format • Arial 9pt</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-muted-foreground">Week:</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-background"
                >
                  {weeks.map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsAddingLog(true)}
                className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Daily Entry
              </button>
            </div>
          </div>

          {/* Daily Entries Table */}
          <div className="border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/60 border-b">
                <tr>
                  <th className="p-3 font-bold">Date & Day</th>
                  <th className="p-3 font-bold">Venue & Time</th>
                  <th className="p-3 font-bold">Internship Activities</th>
                  <th className="p-3 font-bold">Hours Summary</th>
                  <th className="p-3 font-bold">Remarks</th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(dailyEntries[selectedWeek] || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No daily log entries recorded yet for Week {selectedWeek}. Click "Add Daily Entry" above to fill out your logbook.
                    </td>
                  </tr>
                ) : (
                  dailyEntries[selectedWeek].map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20">
                      <td className="p-3 font-bold">
                        <div>{entry.date}</div>
                        <div className="text-muted-foreground font-normal">{entry.day}</div>
                      </td>
                      <td className="p-3">
                        <div>{entry.venue}</div>
                        <div className="text-muted-foreground">{entry.startTime} - {entry.endTime}</div>
                      </td>
                      <td className="p-3 max-w-xs">{entry.activities}</td>
                      <td className="p-3">
                        <div className="text-[10px] space-y-0.5">
                          {entry.f2fIndivHours > 0 && <div>Indiv: {entry.f2fIndivHours}h</div>}
                          {entry.f2fGroupHours > 0 && <div>Group: {entry.f2fGroupHours}h</div>}
                          {entry.adminHours > 0 && <div>Admin: {entry.adminHours}h</div>}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{entry.remarks || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteEntry(selectedWeek, entry.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Record */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-lg font-bold">ATTENDANCE RECORD (28 WEEKS)</h2>
            <p className="text-xs text-muted-foreground">
              Official Attendance Record • Matric M20241001148 • 3 March 2026 to 20 Feb 2027
            </p>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-3 font-bold">Week</th>
                  <th className="p-3 font-bold">Date Day Time Check In & Out</th>
                  <th className="p-3 font-bold">Endorsed By Site Supervisor</th>
                  <th className="p-3 font-bold">Verified by University Academic Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {weeks.map((w) => (
                  <tr key={w} className="hover:bg-muted/20">
                    <td className="p-3 font-bold">Week {w}</td>
                    <td className="p-3 text-muted-foreground">Check-in / Check-out editable timesheet</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Pending Endorsement
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Pending Verification
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Summary */}
      {activeTab === 'summary' && (
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <h2 className="text-lg font-bold">SUMMARY OF TOTAL CMHC INTERNSHIP HOURS</h2>
          <p className="text-xs text-muted-foreground">
            Cumulative total of clinical direct face-to-face, indirect, supervision, and professional development hours across 28 weeks.
          </p>
        </div>
      )}

      {/* Add Log Modal */}
      {isAddingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base">Add Daily Log Entry (Week {selectedWeek})</h3>
              <button onClick={() => setIsAddingLog(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddDailyLog} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-2 border rounded-md text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Day</label>
                  <select
                    value={logDay}
                    onChange={(e) => setLogDay(e.target.value)}
                    className="w-full p-2 border rounded-md text-xs bg-background"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-background"
                  placeholder="Venue location"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md text-xs bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Internship Activities</label>
                <textarea
                  rows={3}
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-background"
                  placeholder="Describe internship activities performed..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">F2F Individual Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={f2fIndivHours}
                    onChange={(e) => setF2fIndivHours(e.target.value)}
                    className="w-full p-1.5 border rounded-md text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">F2F Group Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={f2fGroupHours}
                    onChange={(e) => setF2fGroupHours(e.target.value)}
                    className="w-full p-1.5 border rounded-md text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Admin / Log Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={adminHours}
                    onChange={(e) => setAdminHours(e.target.value)}
                    className="w-full p-1.5 border rounded-md text-xs bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="px-3 py-1.5 text-xs font-bold border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
