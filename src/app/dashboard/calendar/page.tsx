"use client";

import { useState } from "react";
import { FileText, Download, ExternalLink, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

export default function AcademicCalendarPage() {
    const calendars = [
        {
            id: "2025-2026",
            title: "Semester 2 Sesi 2025/2026",
            subtitle: "Mac 2026",
            url: "/documents/academic-calendar-2025-2026.pdf",
            description: "Official academic calendar for Semester 2, Session 2025/2026."
        },
        {
            id: "2026-2027",
            title: "Semester 1 Sesi 2026/2027",
            subtitle: "Sept 2026",
            url: "/documents/academic-calendar-2026-2027.pdf",
            description: "Official academic calendar for Semester 1, Session 2026/2027."
        }
    ];

    const [activeCalendar, setActiveCalendar] = useState(calendars[0]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-upsi-gold/10 rounded-xl text-upsi-gold">
                        <CalendarIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-upsi-navy tracking-tight">Academic Calendar</h1>
                        <p className="text-gray-500 mt-1">Select a semester to view the official takwim.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Available Sessions</h3>
                    <div className="space-y-2">
                        {calendars.map((cal) => (
                            <button
                                key={cal.id}
                                onClick={() => setActiveCalendar(cal)}
                                className={`w-full flex flex-col text-left p-4 rounded-2xl transition-all border ${activeCalendar.id === cal.id
                                        ? "bg-upsi-navy text-white border-upsi-navy shadow-lg shadow-upsi-navy/10"
                                        : "bg-white text-upsi-navy border-gray-100 hover:border-upsi-gold hover:bg-gray-50"
                                    }`}
                            >
                                <span className={`text-sm font-bold ${activeCalendar.id === cal.id ? "text-upsi-gold" : "text-gray-400"}`}>
                                    {cal.subtitle}
                                </span>
                                <span className="font-bold leading-tight mt-1">{cal.title}</span>
                                {activeCalendar.id === cal.id && (
                                    <div className="mt-3 flex items-center text-xs font-semibold text-upsi-gold">
                                        <span>Currently Viewing</span>
                                        <ChevronRight size={14} className="ml-1" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6">
                        <h3 className="font-bold text-upsi-navy mb-2 text-sm">Download for Offline</h3>
                        <p className="text-xs text-blue-800 leading-relaxed mb-4">
                            Keep a copy on your device for quick reference.
                        </p>
                        <a
                            href={activeCalendar.url}
                            download
                            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-upsi-navy text-white rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
                        >
                            <Download size={16} />
                            <span>Download PDF</span>
                        </a>
                    </div>
                </div>

                {/* PDF Viewer Area */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[750px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                    <FileText size={18} className="text-upsi-gold" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-upsi-navy">{activeCalendar.title}</span>
                                    <span className="text-xs text-gray-500 block">PDF Document • Official</span>
                                </div>
                            </div>
                            <a
                                href={activeCalendar.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-xs font-bold text-upsi-navy hover:text-upsi-gold transition-colors"
                            >
                                <ExternalLink size={14} />
                                <span>FULL SCREEN</span>
                            </a>
                        </div>

                        <div className="flex-1 w-full bg-gray-100 relative">
                            <iframe
                                key={activeCalendar.id}
                                src={`${activeCalendar.url}#toolbar=0`}
                                className="w-full h-full border-none"
                                title={activeCalendar.title}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
