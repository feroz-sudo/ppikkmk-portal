"use client";

import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  BookOpen, 
  Plus, 
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  ClipboardList
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

export default function InternshipLogPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'attendance' | 'summary'>('overview');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Generate 28 weeks array for M20241001148
  const weeks = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Internship Log In
            </span>
            <span>•</span>
            <span>Clinical Mental Health</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CMHC Internship Logbook & Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Official 28-Week Clinical Logbook for Matric <span className="font-semibold text-foreground">{INTERNSHIP_PROFILE.matricNo}</span>
          </p>
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-4 border-l pl-0 md:pl-6 border-border">
          <div className="text-right hidden sm:block text-xs space-y-0.5">
            <p className="font-medium text-foreground">{INTERNSHIP_PROFILE.program}</p>
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
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
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
            <h2 className="text-base font-semibold">Select Week to View / Entry Daily Logs</h2>
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
                  <span className="text-xs font-semibold">Week</span>
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
              <h2 className="text-lg font-bold">Daily Log — Week {selectedWeek}</h2>
              <p className="text-xs text-muted-foreground">Record daily activities, client counseling hours, and clinical work.</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-muted-foreground">Select Week:</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-background"
              >
                {weeks.map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Table Mock */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 bg-muted/40 border-b flex justify-between items-center">
              <span className="font-semibold text-sm">Activities Breakdown (Mon – Fri)</span>
              <button className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Daily Entry
              </button>
            </div>
            <div className="p-6 text-center text-sm text-muted-foreground">
              No entries logged yet for Week {selectedWeek}. Click "Add Daily Entry" to submit your daily clinical activities and hours.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Record */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-lg font-bold">Attendance Record (28 Weeks)</h2>
            <p className="text-xs text-muted-foreground">
              Verifiable check-in & check-out logs endorsed by Site Supervisor and Verified by University Academic Supervisor.
            </p>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-3 font-semibold">Week</th>
                  <th className="p-3 font-semibold">Date Range</th>
                  <th className="p-3 font-semibold">Time Check In & Out</th>
                  <th className="p-3 font-semibold">Endorsed By Site Supervisor</th>
                  <th className="p-3 font-semibold">Verified by Academic Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {weeks.slice(0, 5).map((w) => (
                  <tr key={w} className="hover:bg-muted/20">
                    <td className="p-3 font-bold">Week {w}</td>
                    <td className="p-3 text-muted-foreground">Date range for W{w}</td>
                    <td className="p-3 text-muted-foreground">08:00 - 17:00</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Pending Endorsement
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
          <h2 className="text-lg font-bold">Summary of Total CMHC Internship Hours</h2>
          <p className="text-xs text-muted-foreground">
            Cumulative total of clinical direct face-to-face, indirect, supervision, and professional development hours across 28 weeks.
          </p>
        </div>
      )}
    </div>
  );
}
