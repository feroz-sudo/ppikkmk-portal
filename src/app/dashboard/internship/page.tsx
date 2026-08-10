import React from 'react';
import Link from 'next/link';
import { FileText, LogIn, ArrowRight } from 'lucide-react';

export default function InternshipPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Internship Portal</h1>
        <p className="text-muted-foreground text-sm">
          Access internship forms, daily/weekly logs, and login activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Internship Forms Card */}
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Internship Forms</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage and submit internship specific evaluation forms, reflections, and log sheets.
            </p>
          </div>
          <Link
            href="/dashboard/internship/forms"
            className="inline-flex items-center justify-between font-medium text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 pt-4 border-t"
          >
            Go to Internship Forms
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Internship Log In Card */}
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Internship Log In</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Track and log attendance, sessions, and daily internship check-ins.
            </p>
          </div>
          <Link
            href="/dashboard/internship/log"
            className="inline-flex items-center justify-between font-medium text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 pt-4 border-t"
          >
            Go to Internship Log In
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
