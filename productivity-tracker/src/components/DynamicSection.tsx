import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, TrendingUp, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FieldSchema {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'slider';
    required?: boolean;
    options?: string[];
    min?: number;
    max?: number;
    unit?: string;
}

interface SectionData {
    id: string;
    title: string;
    subtitle: string;
    type: 'prd-generated';
    fields: FieldSchema[];
    layout: 'form' | 'cards' | 'table' | 'tracker';
    displayType: string;
    entries: Record<string, any>[];
}

const DynamicSection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [section, setSection] = useState<SectionData | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [calculations, setCalculations] = useState<Record<string, any>>({});

    useEffect(() => {
        loadSection();
    }, [id]);

    const loadSection = () => {
        const customData = localStorage.getItem('customCategories');
        if (customData) {
            const categories = JSON.parse(customData);
            const found = categories.find((cat: any) => cat.id === id);
            if (found) {
                setSection(found);
                if (!found.entries) {
                    found.entries = [];
                }
            }
        }
    };

    const handleInputChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));

        // Auto-calculate for calorie calculator
        if (section?.displayType === 'calculator') {
            calculateCalories({ ...formData, [fieldName]: value });
        }
    };

    const calculateCalories = (data: Record<string, any>) => {
        if (data.age && data.weight && data.height && data.gender) {
            // Mifflin-St Jeor Equation
            let bmr = 0;
            if (data.gender === 'Male') {
                bmr = 10 * parseFloat(data.weight) + 6.25 * parseFloat(data.height) - 5 * parseFloat(data.age) + 5;
            } else {
                bmr = 10 * parseFloat(data.weight) + 6.25 * parseFloat(data.height) - 5 * parseFloat(data.age) - 161;
            }

            // Activity multipliers
            const activityMultipliers: Record<string, number> = {
                'Sedentary': 1.2,
                'Lightly Active': 1.375,
                'Moderately Active': 1.55,
                'Very Active': 1.725,
                'Extremely Active': 1.9
            };

            const tdee = bmr * (activityMultipliers[data.activity] || 1.2);

            // Adjust for goals
            let targetCalories = tdee;
            if (data.goal === 'Lose Weight') {
                targetCalories = tdee - 500;
            } else if (data.goal === 'Gain Muscle') {
                targetCalories = tdee + 300;
            }

            setCalculations({
                bmr: Math.round(bmr),
                tdee: Math.round(tdee),
                targetCalories: Math.round(targetCalories),
                protein: Math.round(data.weight * 2.2),
                carbs: Math.round(targetCalories * 0.4 / 4),
                fats: Math.round(targetCalories * 0.3 / 9)
            });
        }
    };

    const handleSaveEntry = () => {
        if (!section) return;

        const newEntry = {
            id: Date.now().toString(),
            ...formData,
            timestamp: new Date().toISOString(),
            ...(section.displayType === 'calculator' ? calculations : {})
        };

        const updatedSection = {
            ...section,
            entries: [...(section.entries || []), newEntry]
        };

        // Update localStorage
        const customData = localStorage.getItem('customCategories');
        if (customData) {
            const categories = JSON.parse(customData);
            const updatedCategories = categories.map((cat: any) =>
                cat.id === id ? updatedSection : cat
            );
            localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
        }

        setSection(updatedSection);
        setFormData({});
        setIsAdding(false);
        setCalculations({});

        // Notify dashboard
        window.dispatchEvent(new Event('routinesUpdated'));
    };

    const deleteEntry = (entryId: string) => {
        if (!section) return;

        const updatedSection = {
            ...section,
            entries: section.entries.filter(e => e.id !== entryId)
        };

        const customData = localStorage.getItem('customCategories');
        if (customData) {
            const categories = JSON.parse(customData);
            const updatedCategories = categories.map((cat: any) =>
                cat.id === id ? updatedSection : cat
            );
            localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
        }

        setSection(updatedSection);

        // Notify dashboard
        window.dispatchEvent(new Event('routinesUpdated'));
    };

    const renderField = (field: FieldSchema) => {
        const value = formData[field.name] || '';

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.label}
                        min={field.min}
                        max={field.max}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-base"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.label}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 resize-none h-24 text-base"
                    />
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-base"
                    >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-base font-medium text-gray-700">{field.label}</span>
                    </label>
                );
            case 'slider':
                return (
                    <div>
                        <input
                            type="range"
                            min={field.min || 0}
                            max={field.max || 100}
                            value={value || field.min || 0}
                            onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>{field.min || 0}</span>
                            <span className="font-bold text-indigo-600">{value || field.min || 0}</span>
                            <span>{field.max || 100}</span>
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <input
                        type="datetime-local"
                        value={value}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-base"
                    />
                );
            default:
                return null;
        }
    };

    if (!section) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading section...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">Back</span>
                        </button>
                        <div className="text-center">
                            <h1 className="text-xl font-black text-gray-900">{section.title}</h1>
                            <p className="text-sm text-gray-500">{section.subtitle}</p>
                        </div>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Add New Entry */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Entry
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 space-y-4"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4">New Entry</h3>
                        {section.fields.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                    {field.unit && <span className="text-gray-400 font-normal"> ({field.unit})</span>}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}

                        {/* Calorie Calculator Results */}
                        {section.displayType === 'calculator' && calculations.bmr && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 space-y-3 mt-6">
                                <h4 className="font-bold text-indigo-900 text-lg">Your Results</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4">
                                        <p className="text-xs text-gray-500 font-bold uppercase">BMR</p>
                                        <p className="text-2xl font-black text-gray-900">{calculations.bmr}</p>
                                        <p className="text-xs text-gray-500">kcal/day</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4">
                                        <p className="text-xs text-gray-500 font-bold uppercase">TDEE</p>
                                        <p className="text-2xl font-black text-gray-900">{calculations.tdee}</p>
                                        <p className="text-xs text-gray-500">kcal/day</p>
                                    </div>
                                    <div className="col-span-2 bg-white rounded-xl p-4">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Target Calories</p>
                                        <p className="text-3xl font-black text-indigo-600">{calculations.targetCalories}</p>
                                        <p className="text-xs text-gray-500">kcal/day for your goal</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3">
                                        <p className="text-xs text-gray-500 font-bold">Protein</p>
                                        <p className="text-lg font-black text-gray-900">{calculations.protein}g</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3">
                                        <p className="text-xs text-gray-500 font-bold">Carbs</p>
                                        <p className="text-lg font-black text-gray-900">{calculations.carbs}g</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setFormData({});
                                    setCalculations({});
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEntry}
                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                <Save className="w-5 h-5" />
                                Save
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Entries List */}
                {section.entries && section.entries.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">History</h3>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                                {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
                            </span>
                        </div>
                        {section.entries.slice().reverse().map((entry) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(entry.timestamp).toLocaleDateString()} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid gap-2">
                                    {section.displayType === 'reading' && (entry as any).book && (
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-14 bg-amber-50 rounded border-r-4 border-amber-200 flex items-center justify-center text-amber-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{(entry as any).book}</p>
                                                <p className="text-[10px] text-gray-500 italic">{(entry as any).author}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-500"
                                                            style={{ width: `${(entry as any).progress || 0}% ` }}
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-400">{(entry as any).progress}%</span>
                                                </div>
                                            </div>
                                            {(entry as any).status === 'Completed' && (
                                                <div className="p-1 bg-green-50 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {section.displayType !== 'reading' && section.fields.map(field => (
                                        entry[field.name] !== undefined && entry[field.name] !== '' && (
                                            <div key={field.id} className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">{field.label}:</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {field.type === 'checkbox'
                                                        ? (entry[field.name] ? '✓ Yes' : '✗ No')
                                                        : entry[field.name]}
                                                    {field.unit && ` ${field.unit} `}
                                                </span>
                                            </div>
                                        )
                                    ))}
                                    {entry.targetCalories && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold">Target</p>
                                                    <p className="text-base font-black text-indigo-600">{entry.targetCalories}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold">Protein</p>
                                                    <p className="text-base font-black text-gray-900">{entry.protein}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold">Carbs</p>
                                                    <p className="text-base font-black text-gray-900">{entry.carbs}g</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {section.entries && section.entries.length === 0 && !isAdding && (
                    <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No entries yet. Add your first one!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DynamicSection;
