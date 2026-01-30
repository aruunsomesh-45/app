import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AddCategory: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleSave = () => {
        if (!title.trim()) return;

        const newCategory = {
            id: uuidv4(),
            title,
            subtitle: subtitle || 'Custom Routine',
            img: image,
            workouts: [] // Initialize with empty workouts
        };

        // Save to LocalStorage
        const existingData = localStorage.getItem('customCategories');
        const customCategories = existingData ? JSON.parse(existingData) : [];
        const updatedCategories = [...customCategories, newCategory];
        localStorage.setItem('customCategories', JSON.stringify(updatedCategories));

        // Update selection
        const existingSelection = localStorage.getItem('selectedWorkoutCategories');
        const selectedIds = existingSelection ? JSON.parse(existingSelection) : [];
        if (!selectedIds.includes(newCategory.id)) {
            localStorage.setItem('selectedWorkoutCategories', JSON.stringify([...selectedIds, newCategory.id]));
        }

        // Notify other components
        window.dispatchEvent(new Event('routinesUpdated'));
        navigate('/dashboard');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-white overflow-x-hidden font-sans">
            {/* Header */}
            <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10">
                <div className="flex w-12 items-center justify-start">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#61896f] text-base font-bold leading-normal tracking-[0.015em] shrink-0 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    Create New Routine
                </h2>
                <div className="w-12"></div> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* Image Upload */}
                <div className="flex p-6">
                    <div className="flex w-full flex-col gap-6 items-center">
                        <div className="flex gap-4 flex-col items-center">
                            <label className="relative group cursor-pointer">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <div className={`border-2 border-dashed border-[#dbe6df] aspect-square rounded-xl min-h-40 w-40 flex flex-col items-center justify-center gap-2 transition-colors hover:bg-[#2bee6c]/10 ${image ? 'p-0 overflow-hidden border-none' : 'bg-[#f6f8f6]'}`}>
                                    {image ? (
                                        <img src={image} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <>
                                            <Camera className="w-9 h-9 text-[#61896f]" />
                                            <span className="text-xs font-semibold text-[#61896f]">Add Photo</span>
                                        </>
                                    )}
                                </div>
                            </label>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-[#111813] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                                    Upload Routine Cover
                                </p>
                                <p className="text-[#61896f] text-base font-normal leading-normal text-center mt-1">
                                    Pick an image that motivates you
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Fields - Matching Hybrid Training Design */}
                <div className="px-6 space-y-8 pt-4">
                    {/* Routine Title / Heading */}
                    <div className="flex flex-col w-full">
                        <label className="flex flex-col flex-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] pb-1 px-1">Heading</p>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Morning Mobility"
                                className="w-full bg-transparent border-0 border-b border-gray-100 focus:border-[#2bee6c] focus:ring-0 px-1 py-2 text-2xl font-black text-[#111813] placeholder-gray-200 transition-colors"
                            />
                        </label>
                    </div>

                    {/* Subtitle / Subheading */}
                    <div className="flex flex-col w-full">
                        <label className="flex flex-col flex-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em] pb-2 px-1">Subheading</p>
                            <textarea
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="e.g., 15 mins to start your day"
                                className="w-full bg-gray-50 rounded-2xl border-0 focus:ring-1 focus:ring-[#2bee6c]/50 px-4 py-4 text-base text-[#111813] resize-none placeholder-gray-400 leading-relaxed min-h-[120px]"
                            />
                        </label>
                    </div>
                </div>

                <div className="px-4 py-8">
                    <button
                        onClick={handleSave}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-[#2bee6c] text-[#102216] text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#2bee6c]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span className="truncate">Add to Homepage</span>
                    </button>
                    <div className="h-10"></div>
                </div>
            </main>
        </div>
    );
};

export default AddCategory;
