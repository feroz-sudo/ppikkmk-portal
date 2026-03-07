"use client";
import React from "react";

export default function DebugPage() {
    return (
        <div className="p-20 text-center">
            <h1 className="text-4xl font-bold text-green-600">SERVER IS SYNCED</h1>
            <p className="mt-4 text-gray-600 font-bold">If you see this, the development server is correctly picking up new files.</p>
            <p className="mt-2 text-sm text-gray-400 italic">Current Time: {new Date().toLocaleTimeString()}</p>
        </div>
    );
}
