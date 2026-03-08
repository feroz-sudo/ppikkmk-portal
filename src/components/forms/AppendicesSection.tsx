"use client";

import React from "react";
import { Image as ImageIcon, X, Plus, MoveHorizontal } from "lucide-react";

export interface AppendixImage {
    id: string;
    url: string; // Base64 or Blob URL
    caption: string;
    widthPercent: number; // 20-100
}

interface AppendicesSectionProps {
    images: AppendixImage[];
    onChange: (images: AppendixImage[]) => void;
}

export function AppendicesSection({ images, onChange }: AppendicesSectionProps) {
    const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage: AppendixImage = {
                    id: Math.random().toString(36).substr(2, 9),
                    url: reader.result as string,
                    caption: "",
                    widthPercent: 100,
                };
                onChange([...images, newImage]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = "";
    };

    const handleRemoveImage = (id: string) => {
        onChange(images.filter((img) => img.id !== id));
    };

    const handleUpdateImage = (id: string, updates: Partial<AppendixImage>) => {
        onChange(
            images.map((img) => (img.id === id ? { ...img, ...updates } : img))
        );
    };

    return (
        <div className="mt-12 bg-white">
            <h2 className="text-xl font-bold text-black uppercase underline underline-offset-4 flex items-center">
                <ImageIcon className="mr-3 text-black" size={24} />
                APPENDICES
            </h2>
            <label className="bg-[#0000FF] hover:bg-blue-700 !text-white px-6 py-3 rounded-lg text-sm font-black flex items-center cursor-pointer transition-all shadow-md active:scale-95 no-print gap-2">
                <Plus size={20} color="white" />
                <span className="!text-white">ADD IMAGES / EVIDENCE</span>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddImage}
                />
            </label>
            <div className="py-6 space-y-8">
                {images.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 no-print">
                        <ImageIcon className="mx-auto text-gray-300 mb-2" size={48} />
                        <p className="text-gray-500 font-medium">No images added yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Upload photos or certificates as evidence.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {images.map((img, idx) => (
                            <div key={img.id} className="group relative border border-gray-200 rounded-xl overflow-hidden bg-white pb-6 shadow-sm print:border-none print:shadow-none print:pb-0">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(img.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg hover:bg-red-600 no-print"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex flex-col items-center p-4 print:p-0">
                                    <div
                                        className="relative transition-all duration-300 ease-in-out border border-gray-100 rounded-lg shadow-inner overflow-hidden print:border-none print:shadow-none"
                                        style={{ width: `${img.widthPercent}%`, maxWidth: '100%' }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Appendix ${idx + 1}`}
                                            className="w-full h-auto object-contain block"
                                        />
                                    </div>

                                    <div className="w-full mt-6 space-y-4 px-4 max-w-2xl mx-auto print:mt-4 print:px-0">
                                        <div className="flex items-center space-x-4 no-print">
                                            <div className="flex-shrink-0 text-gray-400">
                                                <MoveHorizontal size={20} />
                                            </div>
                                            <div className="flex-grow flex items-center space-x-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase min-w-[60px]">Width: {img.widthPercent}%</span>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="100"
                                                    step="5"
                                                    value={img.widthPercent}
                                                    onChange={(e) => handleUpdateImage(img.id, { widthPercent: parseInt(e.target.value) })}
                                                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-black uppercase ml-1 print:text-[11px]">Caption</label>
                                            <input
                                                type="text"
                                                value={img.caption}
                                                onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })}
                                                placeholder="Enter image caption..."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white no-print"
                                            />
                                            {/* Print-only caption display */}
                                            <p className="hidden print:block text-sm font-bold text-center italic border-b border-gray-100 pb-2">
                                                {img.caption || "No caption provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 italic text-gray-500 font-medium text-xs no-print">
                    * Images will be automatically arranged in the generated PDF with their respective captions.
                </div>
            </div>
        </div>
    );
}
