"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTraineeLogs, Log, deleteLogEntry } from "@/lib/firebase/db";
import {
    ClipboardList,
    FileDown,
    Trash2,
    CheckCircle2,
    Clock,
    Filter,
    ArrowUpDown,
    CheckSquare,
    MoreVertical,
    Plus,
    Edit2,
    User,
    Brain,
    Sigma,
    Calendar as CalendarIcon
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { LogbookForm } from "@/components/dashboard/LogbookForm";
import { ProfileSection } from "@/components/dashboard/logbook/ProfileSection";
import { ContractSection } from "@/components/dashboard/logbook/ContractSection";
import { ReflectionSection } from "@/components/dashboard/logbook/WeeklyReflection";
import { SummarySection } from "@/components/dashboard/logbook/SummarySection";

// Helper to group logs by week
const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
        label: `${monday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`
    };
};

export default function LogbookPage() {
    const { user, userProfile } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState<string>("All");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Log | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'harian' | 'profile' | 'kontrak' | 'refleksi' | 'rumusan'>('harian');
    const [importing, setImporting] = useState(false);

    const fetchLogs = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const fetchedLogs = await getTraineeLogs(user.uid);
                setLogs(fetchedLogs.sort((a, b) => {
                    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    const timeA = a.startTime || "00:00";
                    const timeB = b.startTime || "00:00";
                    return timeB.localeCompare(timeA);
                }));
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    const handleImportLogs = async () => {
        if (!user) return;
        if (!confirm("Are you sure you want to import all 88 register sessions into your logbook? Existing matching logs will be skipped to prevent duplicates.")) return;
        
        setImporting(true);
        try {
            const { addLogEntry } = await import("@/lib/firebase/db");
            
            const registerLogs = [
                // Individual Counselling (60 entries)
                { date: "2026-03-30", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-03-30", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-03-31", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-04-06", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-06", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-07", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-13", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-04-13", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-04-13", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-04-14", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-04-14", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-04-20", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-04-20", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-04-20", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-20", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-04-21", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-04-21", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-22", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/008/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-04-27", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-04-27", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-04-27", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-04-27", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-04-28", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-04-28", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-04-29", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/008/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-05-04", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-04", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-04", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-05-04", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-05-05", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/005/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-05", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-05-05", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/007/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-05-06", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/008/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-05-11", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/07 (Session 7)", location: "Bilik Kaunseling" },
                { date: "2026-05-11", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/07 (Session 7)", location: "Bilik Kaunseling" },
                { date: "2026-05-11", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-05-11", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-05-12", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-05-12", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/007/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-05-13", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/008/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-05-18", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/08 (Session 8)", location: "Bilik Kaunseling" },
                { date: "2026-05-18", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/08 (Session 8)", location: "Bilik Kaunseling" },
                { date: "2026-05-18", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/003/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-18", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-05-19", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-19", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/007/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-05-20", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/009/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-05-25", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/09 (Session 9)", location: "Bilik Kaunseling" },
                { date: "2026-05-25", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/09 (Session 9)", location: "Bilik Kaunseling" },
                { date: "2026-05-25", category: "Individual Counselling" as const, hours: 1.0, startTime: "15:00", endTime: "16:00", description: "Individual Counselling: PKIM20241001148/004/06 (Session 6)", location: "Bilik Kaunseling" },
                { date: "2026-05-26", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/006/07 (Session 7)", location: "Bilik Kaunseling" },
                { date: "2026-05-26", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/007/04 (Session 4)", location: "Bilik Kaunseling" },
                { date: "2026-06-02", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/007/05 (Session 5)", location: "Bilik Kaunseling" },
                { date: "2026-06-03", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/009/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-06-03", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/010/01 (Session 1)", location: "Bilik Kaunseling" },
                { date: "2026-06-08", category: "Individual Counselling" as const, hours: 1.0, startTime: "09:00", endTime: "10:00", description: "Individual Counselling: PKIM20241001148/001/10 (Session 10)", location: "Bilik Kaunseling" },
                { date: "2026-06-08", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/002/10 (Session 10)", location: "Bilik Kaunseling" },
                { date: "2026-06-10", category: "Individual Counselling" as const, hours: 1.0, startTime: "10:30", endTime: "11:30", description: "Individual Counselling: PKIM20241001148/009/03 (Session 3)", location: "Bilik Kaunseling" },
                { date: "2026-06-10", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/010/02 (Session 2)", location: "Bilik Kaunseling" },
                { date: "2026-06-24", category: "Individual Counselling" as const, hours: 1.0, startTime: "12:00", endTime: "13:00", description: "Individual Counselling: PKIM20241001148/010/03 (Session 3)", location: "Bilik Kaunseling" },
                
                // Group Counselling (28 entries)
                { date: "2026-03-16", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/01 (Session 1)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-17", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/01 (Session 1)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-18", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/01 (Session 1)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-19", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/01 (Session 1)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-24", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/02 (Session 2)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-25", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/02 (Session 2)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-26", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/02 (Session 2)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-30", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/02 (Session 2)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-03-31", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/03 (Session 3)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-01", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/03 (Session 3)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-02", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/03 (Session 3)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-06", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/03 (Session 3)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-07", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/04 (Session 4)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-08", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/04 (Session 4)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-09", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/04 (Session 4)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-13", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/04 (Session 4)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-14", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/05 (Session 5)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-15", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/05 (Session 5)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-16", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/05 (Session 5)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-20", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/05 (Session 5)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-21", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/06 (Session 6)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-22", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/06 (Session 6)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-23", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/06 (Session 6)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-27", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/06 (Session 6)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-28", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/002/07 (Session 7)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-29", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/003/07 (Session 7)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-04-30", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/004/07 (Session 7)", location: "Bilik Kaunseling Kelompok" },
                { date: "2026-05-04", category: "Group Counselling" as const, hours: 1.75, startTime: "20:00", endTime: "21:45", description: "Group Counselling: PKKM20241001148/001/07 (Session 7)", location: "Bilik Kaunseling Kelompok" }
            ];

            let addedCount = 0;
            for (const item of registerLogs) {
                const exists = logs.some(l => l.date === item.date && l.category === item.category && l.startTime === item.startTime);
                if (!exists) {
                    await addLogEntry({
                        traineeId: user.uid,
                        ...item
                    });
                    addedCount++;
                }
            }
            
            alert(`Import completed! Added ${addedCount} new log entries. Skipping ${registerLogs.length - addedCount} duplicates.`);
            fetchLogs();
        } catch (error: any) {
            console.error("Import failed:", error);
            alert(`Failed to import logs: ${error.message || "Unknown error"}`);
        } finally {
            setImporting(false);
        }
    };


    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id: string) => {
        if (!id) return;
        if (window.confirm("Are you sure you want to delete this log entry?")) {
            await deleteLogEntry(id);
            fetchLogs();
        }
    };

    // Grouping Logic
    const weeks = Array.from(new Set(logs.map(log => getWeekRange(log.date).label))).sort((a, b) => b.localeCompare(a));
    const filteredLogs = selectedWeek === "All" ? logs : logs.filter(log => getWeekRange(log.date).label === selectedWeek);
    const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);

    const tabs = [
        { id: 'harian', label: 'Log Harian', icon: <ClipboardList size={18} /> },
        { id: 'profile', label: 'Maklumat Diri', icon: <User size={18} /> },
        { id: 'kontrak', label: 'Kontrak (B)', icon: <CheckSquare size={18} /> },
        { id: 'refleksi', label: 'Refleksi Mingguan', icon: <Brain size={18} /> },
        { id: 'rumusan', label: 'Rumusan Jam', icon: <Sigma size={18} /> },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center uppercase">
                        <ClipboardList className="mr-3 text-upsi-navy" size={32} />
                        Buku Log Praktikum
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">UPSI Comprehensive Clinical Attendance Record</p>
                </div>
                <div className="flex items-center space-x-3">
                    {(userProfile?.matricNumber?.toLowerCase() === "m20241001148") && (
                        <button
                            onClick={handleImportLogs}
                            disabled={importing}
                            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover-lift disabled:opacity-50"
                        >
                            <FileDown size={18} />
                            <span className="text-xs uppercase tracking-widest">{importing ? 'Importing...' : 'Import Registers'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setSelectedLog(undefined);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-upsi-navy text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-upsi-navy/20 hover-lift"
                    >
                        <Plus size={18} />
                        <span className="text-xs uppercase tracking-widest">New Entry</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover-lift"
                    >
                        <FileDown size={18} />
                        <span className="text-xs uppercase tracking-widest">Global Print</span>
                    </button>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-2 no-print">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-upsi-navy text-white shadow-lg shadow-upsi-navy/20 active:scale-95' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm'}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'harian' && (
                <div className="space-y-6">
                    {/* Filter & Summary Bar */}
                    <div className="glass p-6 rounded-[2rem] shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white no-print">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
                                <Filter size={16} className="text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Week</span>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-upsi-navy cursor-pointer ml-2 outline-none"
                                >
                                    <option value="All">Full Semester</option>
                                    {weeks.map(week => <option key={week} value={week}>{week}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Entries</div>
                                <div className="text-2xl font-black text-slate-800 leading-none">{filteredLogs.length}</div>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{selectedWeek === 'All' ? 'Total' : 'Weekly'} Hours</div>
                                <div className="text-3xl font-black text-upsi-navy leading-none">
                                    {totalHours} <span className="text-sm">HRS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-100">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center no-print">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Daily Logs: {selectedWeek}</span>
                            <button onClick={() => window.print()} className="flex items-center space-x-2 text-upsi-navy hover:bg-white px-4 py-2 rounded-xl transition-all border border-transparent hover:border-upsi-navy/10 font-bold text-[10px] uppercase tracking-widest">
                                <FileDown size={14} />
                                <span>Print Current Table</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Masa</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Lokasi / Kategori</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[40%]">Catatan / Deskripsi</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Jam</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest px-6 py-12 italic">Loading Logs...</td></tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest px-6 py-12 italic">No logs found</td></tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group text-[11px]">
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-slate-800">{new Date(log.date).toLocaleDateString('en-MY', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(log.date).toLocaleDateString('en-MY', { weekday: 'short' })}</div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="text-slate-700 font-black tracking-tight">{log.startTime || '--:--'}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 whitespace-nowrap">to {log.endTime || '--:--'}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-upsi-navy uppercase truncate max-w-[120px]">{log.location || 'N/A'}</div>
                                                    <div className="mt-1">
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">{log.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                                                    {log.description}
                                                </td>
                                                <td className="px-6 py-5 text-center font-black text-upsi-navy bg-slate-50/30">
                                                    {log.hours}
                                                </td>
                                                <td className="px-6 py-5 text-center no-print border-l border-slate-50">
                                                    <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLog(log);
                                                                setIsFormOpen(true);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-upsi-navy hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(log.id!)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'kontrak' && <ContractSection />}
            {activeTab === 'refleksi' && <ReflectionSection />}
            {activeTab === 'rumusan' && <SummarySection logs={logs} />}

            <Disclaimer variant="full" className="mt-8 no-print" />

            {/* Logbook Form Modal */}
            {isFormOpen && (
                <LogbookForm
                    onLogAdded={fetchLogs}
                    initialData={selectedLog}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            <style jsx global>{`
                @media print {
                    .no-print, button, select { display: none !important; }
                    body { background: white !important; }
                    .glass { box-shadow: none !important; border: 1px solid #eee !important; background: white !important; }
                    table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt; }
                    th, td { border: 1px solid #ddd !important; padding: 10px !important; color: black !important; }
                    textarea { border: none !important; resize: none !important; }
                    h1, h2, h3 { color: black !important; }
                }
            `}</style>
        </div>
    );
}
