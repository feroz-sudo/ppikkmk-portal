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
        <div className="form-action-bar fixed bottom-0 right-0 z-50 p-4 md:p-6 flex items-center space-x-3 pointer-events-none">
            {/* Print Button */}
            <button
                type="button"
                onClick={handlePrint}
                className="pointer-events-auto no-print flex items-center space-x-2 bg-white border border-black text-black font-bold py-3 px-5 rounded-xl shadow-lg hover:bg-white hover:border-black transition-all focus:ring-4 focus:ring-black"
            >
                <Printer size={18} />
                <span>Print</span>
            </button>

            {/* Save Button */}
            <button
                type="button"
                onClick={onSave}
                disabled={isSubmitting}
                className="pointer-events-auto no-print flex items-center space-x-2 bg-upsi-navy text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-900 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <Save size={18} />
                <span>{isSubmitting ? "Saving..." : `Save ${formName}`}</span>
            </button>
        </div>
    );
};
