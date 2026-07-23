"use client";

import React from "react";
import { LampiranBTable } from "@/components/dashboard/rumusan/LampiranBTable";
import { Log } from "@/lib/firebase/db";

interface SummarySectionProps {
    logs: Log[];
}

export const SummarySection = ({ logs }: SummarySectionProps) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LampiranBTable />
        </div>
    );
};
