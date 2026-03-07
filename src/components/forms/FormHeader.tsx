import React from "react";

interface FormHeaderProps {
    title: string;
    refCode: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, refCode }) => {
    return (
        <div className="form-header relative pb-6 border-b-2 border-gray-300 mb-8 w-full print:border-gray-400">
            {/* Top-Right Identifier (Absolute) */}
            <div className="absolute top-0 right-0 text-[10px] md:text-[11px] font-medium text-gray-500 italic text-right leading-tight whitespace-nowrap z-10 print:text-black">
                {refCode}
            </div>

            {/* Main Header Content - Using Flex for better Print conversion support */}
            <div className="flex items-center justify-between w-full pt-4 gap-4 px-2">
                {/* Left: UPSI Logo */}
                <div className="flex-shrink-0">
                    <img
                        src="/upsi-logo.png"
                        alt="UPSI Logo"
                        className="form-header-logo h-16 md:h-24 w-auto object-contain print:h-20"
                    />
                </div>

                {/* Center: Title Group - Centered flexibly */}
                <div className="flex-grow text-center">
                    <h2 className="text-lg md:text-2xl font-black text-black tracking-wide uppercase leading-tight mb-2">
                        {title}
                    </h2>
                    <div className="flex flex-col items-center">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-800 uppercase tracking-[0.2em] mb-1">
                            Praktikum & Internship
                        </h3>
                        <h3 className="text-xs md:text-base font-bold text-black uppercase tracking-tight">
                            Kaunseling (Kesihatan Mental Klinikal)
                        </h3>
                        <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-tight">
                            Universiti Pendidikan Sultan Idris
                        </h3>
                        <h3 className="text-[10px] md:text-xs font-black text-upsi-navy mt-1 tracking-widest">
                            WWW.PPIKKMK.COM
                        </h3>
                    </div>
                </div>

                {/* Right: Balance Spacer (Matches logo width roughly) */}
                <div className="w-16 md:w-24 flex-shrink-0 hidden md:block print:block"></div>
            </div>
        </div>
    );
};
