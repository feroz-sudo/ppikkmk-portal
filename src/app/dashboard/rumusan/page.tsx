"use client";

import React from "react";
import { LampiranBTable } from "@/components/dashboard/rumusan/LampiranBTable";

export default function RumusanPage() {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <LampiranBTable />
        </div>
    );
}
