import React from 'react';

interface ProgressBarProps {
    label: string;
    current: number;
    target: number;
    colorClass: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, target, colorClass }) => {
    const percentage = Math.min(100, Math.round((current / target) * 100));

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {current} / {target} <span className="opacity-50 tracking-normal ml-1">HRS</span>
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-xl h-2.5 overflow-hidden shadow-inner border border-slate-200">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${colorClass}`}
                    style={{ width: `${Math.max(0, percentage)}%` }}
                >
                    <div className="absolute inset-0 bg-white/10 w-full h-full transform skew-x-12 translate-x-4"></div>
                </div>
            </div>
            <div className="text-[9px] text-right mt-1 font-bold text-slate-500 uppercase tracking-widest">{percentage}% Complete</div>
        </div>
    );
};

export const GroupedProgress = ({
    title,
    totalCurrent,
    totalTarget,
    children
}: {
    title: string;
    totalCurrent: number;
    totalTarget: number;
    children: React.ReactNode;
}) => {
    const percentage = Math.min(100, Math.round((totalCurrent / totalTarget) * 100));

    return (
        <div className="glass shadow-premium rounded-[2.5rem] p-8 border border-white hover:border-upsi-gold/20 transition-all group">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-upsi-navy tracking-tight">{title}</h3>
                    <div className="text-[10px] text-upsi-gold font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Category Target</div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 leading-none">{totalCurrent}</span>
                    <span className="text-sm font-bold text-slate-400"> / {totalTarget} hrs</span>
                </div>
            </div>

            {/* Total Group Progress */}
            <div className="mb-10">
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-200">
                    <div
                        className="bg-upsi-gold h-full rounded-full shadow-[0_0_10px_rgba(249,179,20,0.3)] transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="text-[10px] font-black text-right text-upsi-navy uppercase tracking-widest">{percentage}% Category completion</div>
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};
