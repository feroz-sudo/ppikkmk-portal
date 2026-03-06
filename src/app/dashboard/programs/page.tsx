"use client";

import Link from "next/link";
import { HeartPulse, ArrowRight } from "lucide-react";

const programs = [
    {
        id: "form8",
        name: "Form 8: PFA / MHPSS Report",
        description: "Psychological First Aid & Mental Health Psychosocial Support — for community programs and disaster/crisis intervention events.",
        icon: HeartPulse,
        color: "text-pink-600",
        bg: "bg-pink-50",
        border: "border-pink-200",
        badge: "PFA / MHPSS",
        badgeColor: "bg-pink-100 text-pink-700",
    },
];

export default function ProgramsEventsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-50 border border-pink-200 rounded-xl flex items-center justify-center">
                        <HeartPulse className="text-pink-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Programs &amp; Events</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Clinical forms for community programs, outreach events, and psychosocial support activities.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.map((program) => {
                    const Icon = program.icon;
                    return (
                        <Link
                            key={program.id}
                            href={`/dashboard/forms/${program.id}`}
                            className={`group bg-white rounded-xl border ${program.border} shadow-sm hover:shadow-md transition-all p-6 flex flex-col space-y-4`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 ${program.bg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={program.color} size={24} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${program.badgeColor}`}>
                                    {program.badge}
                                </span>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg group-hover:text-upsi-navy transition-colors">
                                    {program.name}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    {program.description}
                                </p>
                            </div>
                            <div className={`flex items-center space-x-1 text-sm font-semibold ${program.color} mt-auto`}>
                                <span>Open Form</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <strong>Note:</strong> Programs &amp; Events forms are independent of client session records. They are filed under your trainee Clinical ID directly in Google Drive.
            </div>
        </div>
    );
}
