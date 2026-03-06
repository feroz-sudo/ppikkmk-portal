import React from "react";

interface FormHeaderProps {
    title: string;
    refCode: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, refCode }) => {
    return (
        <div className="relative pb-6 border-b-2 border-gray-300 mb-8 w-full">
            {/* Top-Right Identifier (Absolute) */}
            <div className="absolute top-0 right-0 text-[10px] md:text-[11px] font-medium text-gray-500 italic text-right leading-tight max-w-[200px] z-10 no-print">
                {refCode}
            </div>

            {/* Main Header Content - 3 Column Grid for Precise Centering */}
            <div className="grid grid-cols-[1fr_2fr_1fr] items-center w-full pt-4 gap-4">
                {/* Left: UPSI Logo */}
                <div className="flex items-center justify-start">
                    <img src="/upsi-logo.png" alt="UPSI Logo" className="h-16 md:h-24 w-auto object-contain" />
                </div>

                {/* Center: Title Group */}
                <div className="text-center">
                    <h2 className="text-lg md:text-2xl font-black text-gray-900 tracking-wide uppercase leading-tight mb-2">
                        {title}
                    </h2>
                    <div className="flex flex-col items-center">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">
                            Praktikum & Internship
                        </h3>
                        <h3 className="text-xs md:text-base font-bold text-upsi-navy uppercase tracking-tight">
                            Kaunseling (Kesihatan Mental Klinikal)
                        </h3>
                        <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight opacity-70">
                            Universiti Pendidikan Sultan Idris
                        </h3>
                    </div>
                </div>

                {/* Right: Empty Balancing Space */}
                <div className="flex justify-end pr-2 md:pr-4">
                    {/* Placeholder for visual balance */}
                </div>
            </div>
        </div>
    );
};
