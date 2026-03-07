import React from "react";

interface SmartPillProps {
    label: string;
    textToAppend: string;
    onAppend: (text: string) => void;
    color?: "blue" | "red" | "green" | "yellow" | "gray";
}

export const SmartPill: React.FC<SmartPillProps> = ({
    label,
    textToAppend,
    onAppend,
    color = "blue"
}) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        red: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        gray: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
    };

    return (
        <button
            type="button"
            onClick={() => onAppend(textToAppend)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-colors mr-2 mb-2 ${colorClasses[color]} active:scale-95`}
            title={`Appends: "${textToAppend}"`}
        >
            + {label}
        </button>
    );
};

export const SmartShrubGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4 bg-white p-3 rounded-lg border border-black">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title} Macros</div>
        <div className="flex flex-wrap">
            {children}
        </div>
    </div>
);
