"use client";

import React from "react";
import { Save, Printer } from "lucide-react";

interface FormActionBarProps {
    formName: string;
    isSubmitting: boolean;
    onSave: () => void;
}

export const FormActionBar: React.FC<FormActionBarProps> = ({ formName, isSubmitting, onSave }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="form-action-bar fixed bottom-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-center md:justify-end gap-3 pointer-events-none sm:bg-transparent bg-white/80 backdrop-blur-md border-t border-slate-200 md:border-none">
            {/* Print Button */}
            <button
                type="button"
                onClick={handlePrint}
                className="pointer-events-auto no-print flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-4 md:py-3 md:px-5 rounded-xl shadow-lg hover:bg-slate-50 transition-all text-sm md:text-base"
            >
                <Printer size={18} />
                <span>Print</span>
            </button>

            {/* Save Button */}
            <button
                type="button"
                onClick={onSave}
                disabled={isSubmitting}
                className="pointer-events-auto no-print flex-1 md:flex-none flex items-center justify-center space-x-2 bg-upsi-navy text-white font-bold py-2.5 px-6 md:py-3 md:px-6 rounded-xl shadow-lg hover:bg-blue-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
            >
                <Save size={18} />
                <span className="hidden sm:inline no-black">{isSubmitting ? "Saving..." : `Save ${formName}`}</span>
                <span className="sm:hidden no-black">{isSubmitting ? "Saving..." : "Save"}</span>
            </button>
        </div>
    );
};
