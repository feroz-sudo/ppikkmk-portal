"use client";

import { FileText, Download, ExternalLink, BookOpen, ChevronRight } from "lucide-react";

export default function GuidelinesPage() {
    const guidelines = [
        {
            title: "Practicum Guidelines",
            description: "Official guidelines for Clinical Mental Health Counselling Practicum (MT187).",
            url: "/documents/practicum-guidelines.pdf",
            icon: <BookOpen className="text-upsi-navy" size={24} />,
            color: "bg-upsi-navy/10",
        },
        {
            title: "Internship Guidelines",
            description: "Official guidelines for Clinical Mental Health Counselling Internship (MT187).",
            url: "/documents/internship-guidelines.pdf",
            icon: <BookOpen className="text-upsi-gold" size={24} />,
            color: "bg-upsi-gold/10",
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center md:text-left space-y-2">
                <h1 className="text-3xl font-bold text-upsi-navy tracking-tight">Clinical Guidelines</h1>
                <p className="text-gray-500">Access official documentation for your clinical practicum and internship requirements.</p>
            </div>

            {/* Grid for Guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {guidelines.map((guide, index) => (
                    <div key={index} className="flex flex-col space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 ${guide.color} rounded-xl`}>
                                    {guide.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-upsi-navy leading-tight">{guide.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1 max-w-xs">{guide.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <a
                                    href={guide.url}
                                    download
                                    className="p-2.5 bg-gray-50 hover:bg-upsi-navy/5 text-upsi-navy rounded-xl transition-all border border-gray-100"
                                    title="Download PDF"
                                >
                                    <Download size={20} />
                                </a>
                                <a
                                    href={guide.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 hover:bg-upsi-gold/10 text-upsi-gold rounded-xl transition-all border border-gray-100"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>

                        {/* PDF Preview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col group">
                            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Document Preview</span>
                                <div className="flex items-center text-xs text-upsi-navy font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Interactive Viewer</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-100">
                                <iframe
                                    src={`${guide.url}#toolbar=0`}
                                    className="w-full h-full border-none"
                                    title={guide.title}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Notice */}
            <div className="bg-upsi-navy rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-upsi-gold">Need Further Clarification?</h3>
                        <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
                            These guidelines are mandatory for all students enrolled in MT187. Ensure you have read and understood the documentation requirements before starting your sessions.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-upsi-gold text-upsi-navy font-bold rounded-xl shadow-lg hover:shadow-upsi-gold/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        Contact Coordinator
                    </button>
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-upsi-gold/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            </div>
        </div>
    );
}
