"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-upsi-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <button 
                        onClick={onCancel}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        No, Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
