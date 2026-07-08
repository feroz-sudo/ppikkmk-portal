"use client";

import React, { useState } from "react";
import { Sparkles, X, Check } from "lucide-react";

interface AIPastePanelProps {
    visible: boolean;
}

export function AIPastePanel({ visible }: AIPastePanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [msg, setMsg] = useState("");

    if (!visible) return null;

    const convertTo24Hour = (timeStr: string) => {
        timeStr = timeStr.trim().toUpperCase();
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
        if (!match) return timeStr;
        
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const ampm = match[3];
        
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    const handleAutofill = () => {
        if (!text.trim()) {
            setStatus("error");
            setMsg("Sila tampalkan nota terlebih dahulu.");
            return;
        }

        try {
            // Extract Date
            let extractedDate = "";
            const dateRegexes = [
                /\b\d{4}-\d{2}-\d{2}\b/, // YYYY-MM-DD
                /\b\d{2}\/\d{2}\/\d{4}\b/, // DD/MM/YYYY
                /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i // DD MMM YYYY
            ];
            for (const regex of dateRegexes) {
                const match = text.match(regex);
                if (match) {
                    extractedDate = match[0];
                    break;
                }
            }

            // Extract Time Range
            let extractedStartTime = "";
            let extractedEndTime = "";
            const timeRangeRegex = /\b(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]+\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\b/i;
            const timeMatch = text.match(timeRangeRegex);
            if (timeMatch) {
                extractedStartTime = timeMatch[1];
                extractedEndTime = timeMatch[2];
            }

            // Extract Client ID
            let extractedClientId = "";
            const clientRegex = /\b(PK[IK]M\d{11}\/\d{3}\/\d{2})\b/i;
            const clientMatch = text.match(clientRegex);
            if (clientMatch) {
                extractedClientId = clientMatch[1];
            }

            // Extract Session No
            let extractedSession = "";
            const sessionRegex = /\b(?:Session|Sesi)\s+(\d+)\b/i;
            const sessionMatch = text.match(sessionRegex);
            if (sessionMatch) {
                extractedSession = sessionMatch[1];
            }

            // Extract Location
            let extractedLocation = "";
            const locations = [
                "Bilik Kaunseling Kelompok",
                "Bilik Kaunseling",
                "Klinik UPSI",
                "UPSI",
                "Bhepa",
                "Pusat Sejahtera"
            ];
            for (const loc of locations) {
                if (new RegExp(loc, "i").test(text)) {
                    extractedLocation = loc;
                    break;
                }
            }

            // Query Form Fields
            const inputs = Array.from(document.querySelectorAll("input, textarea, select")) as HTMLInputElement[];
            let filledCount = 0;

            inputs.forEach((input) => {
                const id = (input.id || "").toLowerCase();
                const name = (input.name || "").toLowerCase();
                const placeholder = (input.placeholder || "").toLowerCase();

                let labelText = "";
                if (input.id) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) labelText = label.textContent?.toLowerCase() || "";
                }

                const isMatch = (keys: string[]) => {
                    return keys.some(
                        (k) =>
                            id.includes(k) ||
                            name.includes(k) ||
                            placeholder.includes(k) ||
                            labelText.includes(k)
                    );
                };

                // Date field
                if (input.type === "date" || isMatch(["date", "tarikh"])) {
                    if (extractedDate) {
                        let formatted = extractedDate;
                        if (extractedDate.includes("/")) {
                            const parts = extractedDate.split("/");
                            formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        } else if (/[a-zA-Z]/.test(extractedDate)) {
                            const d = new Date(extractedDate);
                            if (!isNaN(d.getTime())) {
                                const y = d.getFullYear();
                                const m = (d.getMonth() + 1).toString().padStart(2, "0");
                                const day = d.getDate().toString().padStart(2, "0");
                                formatted = `${y}-${m}-${day}`;
                            }
                        }
                        input.value = formatted;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        filledCount++;
                    }
                }

                // Start Time
                if (isMatch(["starttime", "mula", "start_time", "time_start"])) {
                    if (extractedStartTime) {
                        input.value = convertTo24Hour(extractedStartTime);
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        filledCount++;
                    }
                }

                // End Time
                if (isMatch(["endtime", "tamat", "end_time", "time_end"])) {
                    if (extractedEndTime) {
                        input.value = convertTo24Hour(extractedEndTime);
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        filledCount++;
                    }
                }

                // Client Selector
                if (isMatch(["client", "klien", "clientid", "no_fail"])) {
                    if (extractedClientId) {
                        input.value = extractedClientId;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        filledCount++;
                    }
                }

                // Session No
                if (isMatch(["session", "sesi", "bil_sesi"])) {
                    if (extractedSession) {
                        input.value = extractedSession;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        filledCount++;
                    }
                }

                // Location
                if (isMatch(["location", "lokasi"])) {
                    if (extractedLocation) {
                        input.value = extractedLocation;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        filledCount++;
                    }
                }

                // Description textareas
                if (
                    input.tagName === "TEXTAREA" &&
                    !isMatch(["location", "date", "time", "client", "sesi", "session"])
                ) {
                    let desc = text;
                    const descRegex = /(?:Description|Catatan|Notes|Aktiviti):\s*([\s\S]+)/i;
                    const descMatch = text.match(descRegex);
                    if (descMatch) {
                        desc = descMatch[1].trim();
                    }
                    input.value = desc;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    filledCount++;
                }
            });

            setStatus("success");
            setMsg(`Autofill selesai! Mengisi ${filledCount} ruangan borang.`);
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error: any) {
            setStatus("error");
            setMsg("Gagal mengisi borang: " + error.message);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] no-print">
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all animate-bounce"
                    title="AI Paste Autofill"
                >
                    <Sparkles size={20} className="text-upsi-gold" />
                    <span className="text-xs font-black uppercase tracking-wider pr-1">Autofill</span>
                </button>
            )}

            {/* Autofill Slide-Out Panel */}
            {isOpen && (
                <div className="bg-white w-96 rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col space-y-4 transition-all scale-100 origin-bottom-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="text-violet-600 animate-pulse" size={18} />
                            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider">AI Paste Panel</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight">
                        Tampalkan nota kes, rekod register, atau huraian sesi di bawah. Sistem akan mengekstrak Tarikh, Masa, Klien, Lokasi, Sesi, dan Catatan untuk mengisi borang semasa secara automatik.
                    </p>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Contoh: PKIM20241001148/001/01 pada 30 Mar 2026 jam 9:00 AM - 10:00 AM di Bilik Kaunseling bagi Sesi 1. Klien meluahkan kegusaran..."
                        rows={6}
                        className="w-full border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all resize-none bg-slate-50/50"
                    />

                    {status !== "idle" && (
                        <div
                            className={`p-3 rounded-xl text-xs font-bold ${
                                status === "success"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                        >
                            {status === "success" ? (
                                <div className="flex items-center space-x-2">
                                    <Check size={14} />
                                    <span>{msg}</span>
                                </div>
                            ) : (
                                <span>{msg}</span>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleAutofill}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 text-center flex items-center justify-center space-x-2"
                        >
                            <Sparkles size={14} />
                            <span>Autofill Borang</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setText("")}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
