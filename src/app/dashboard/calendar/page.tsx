"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

const CALENDARS = [
    {
        id: "m252-briefing",
        title: "Taklimat Praktikum M252",
        subtitle: "M252 (Briefing)",
        url: "/documents/m252-taklimat.pdf",
        description: "Taklimat Praktikum dan Internship untuk Sesi M252."
    },
    {
        id: "2025-2026",
        title: "Semester 2 Sesi 2025/2026",
        subtitle: "M252 (Current)",
        url: "/documents/academic-calendar-2025-2026.pdf",
        description: "Official academic calendar for Semester 2, Session 2025/2026."
    },
    {
        id: "2026-2027",
        title: "Semester 1 Sesi 2026/2027",
        subtitle: "M261",
        url: "/documents/academic-calendar-2026-2027.pdf",
        description: "Official academic calendar for Semester 1, Session 2026/2027."
    }
];

export default function AcademicCalendarPage() {
    const [mounted, setMounted] = useState(false);
    const [activeId, setActiveId] = useState(CALENDARS[0].id);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const activeCal = CALENDARS.find(c => c.id === activeId) || CALENDARS[0];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 font-[Arial,sans-serif]">
            {/* Professional Header */}
            <div className="bg-upsi-navy text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden glass-dark">
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter flex items-center space-x-4 mb-4">
                        <CalendarIcon className="text-upsi-gold" size={48} />
                        <span>Academic Calendar</span>
                    </h1>
                    <p className="text-blue-100/80 text-xl font-medium max-w-2xl leading-relaxed">
                        Official UPSI Takwim and briefing documents for the current clinical sessions.
                    </p>
                </div>
            </div>

            {/* Session Selector - Horizontal for best visibility */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 border-l-4 border-upsi-gold pl-4 uppercase tracking-[0.3em]">Available Takwim Sessions</h3>
                <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar scroll-smooth bg-white rounded-[2rem] shadow-premium border border-slate-100">
                    {CALENDARS.map((cal) => (
                        <button
                            key={cal.id}
                            onClick={() => setActiveId(cal.id)}
                            className={`flex flex-col min-w-[200px] p-6 rounded-2xl transition-all border-2 text-left ${activeId === cal.id
                                ? "bg-upsi-navy border-upsi-navy text-white shadow-xl scale-[1.02]"
                                : "bg-white border-slate-50 text-slate-600 hover:border-upsi-gold/30 hover:bg-slate-50"
                                }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${activeId === cal.id ? "text-upsi-gold" : "text-slate-400"}`}>
                                {cal.subtitle}
                            </span>
                            <span className="font-bold mt-2 truncate max-w-full">{cal.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Document Viewer Area */}
            <div className="space-y-6">
                <div className="bg-white rounded-[3.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col min-h-[850px]">
                    {/* Viewer Header */}
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-5">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <FileText size={24} className="text-upsi-gold" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-upsi-navy tracking-tight">{activeCal.title}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">PDF Document • Official Record</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href={activeCal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-6 py-3 bg-white text-upsi-navy rounded-full text-xs font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
                            >
                                <ExternalLink size={14} />
                                <span>Full Screen</span>
                            </a>
                            <a
                                href={activeCal.url}
                                download
                                className="flex items-center space-x-2 px-6 py-3 bg-upsi-gold text-upsi-navy rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:brightness-105 transition-all"
                            >
                                <Download size={14} />
                                <span>Download</span>
                            </a>
                        </div>
                    </div>

                    {/* PDF Content */}
                    <div className="flex-1 w-full bg-white relative">
                        <iframe
                            key={activeCal.id}
                            src={activeCal.url}
                            className="w-full h-[1200px] border-none"
                            title={activeCal.title}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
