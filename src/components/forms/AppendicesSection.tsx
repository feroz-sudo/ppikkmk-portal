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
        <div className="mt-8 border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="bg-[#FFF8F0] px-4 py-3 border-b border-gray-300 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center">
                    <ImageIcon className="mr-2 text-upsi-navy" size={20} />
                    APPENDICES
                </h2>
                <label className="bg-upsi-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center cursor-pointer transition-colors shadow-sm">
                    <Plus size={16} className="mr-1" />
                    ADD IMAGE
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAddImage}
                    />
                </label>
            </div>

            <div className="p-6 space-y-8">
                {images.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <ImageIcon className="mx-auto text-gray-300 mb-2" size={48} />
                        <p className="text-gray-500 font-medium">No images added yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Upload photos or certificates as evidence.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {images.map((img, idx) => (
                            <div key={img.id} className="group relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 pb-4 shadow-sm transition-shadow hover:shadow-md">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(img.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex flex-col items-center bg-white p-4">
                                    <div
                                        className="relative transition-all duration-300 ease-in-out border border-gray-100 rounded-lg shadow-inner overflow-hidden"
                                        style={{ width: `${img.widthPercent}%`, maxWidth: '100%' }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Appendix ${idx + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>

                                    <div className="w-full mt-6 space-y-4 px-4 max-w-2xl mx-auto">
                                        <div className="flex items-center space-x-4">
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
                                                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-upsi-navy"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Caption</label>
                                            <input
                                                type="text"
                                                value={img.caption}
                                                onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })}
                                                placeholder="Enter image caption..."
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-upsi-navy outline-none text-gray-700 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 italic text-gray-500 font-medium text-xs">
                    * Images will be automatically arranged in the generated PDF with their respective captions.
                </div>
            </div>
        </div>
    );
}
