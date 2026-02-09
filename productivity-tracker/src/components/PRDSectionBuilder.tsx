import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SectionSchema {
    id: string;
    title: string;
    subtitle: string;
    type: 'prd-generated';
    fields: FieldSchema[];
    layout: 'form' | 'cards' | 'table' | 'tracker';
    displayType: string;
    img?: string;
}

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
    calculation?: string;
}

const PRDSectionBuilder: React.FC = () => {
    const navigate = useNavigate();
    const [prdText, setPrdText] = useState('');
    const [prdFile, setPrdFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [generatedSchema, setGeneratedSchema] = useState<SectionSchema | null>(null);
    const [error, setError] = useState('');

    // Mock AI analyzer - In production, this would call an LLM API
    const analyzePRD = async (content: string): Promise<SectionSchema> => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2500));

        const lowerContent = content.toLowerCase();

        // Smart detection based on keywords
        let fields: FieldSchema[] = [];
        let title = 'Custom Section';
        let subtitle = 'PRD Generated';
        let layout: 'form' | 'cards' | 'table' | 'tracker' = 'form';
        let displayType = 'general';

        // Calorie Calculator detection
        if (lowerContent.includes('calorie') || lowerContent.includes('nutrition')) {
            title = 'Calorie Calculator';
            subtitle = 'Track your nutrition';
            layout = 'form';
            displayType = 'calculator';
            fields = [
                { id: 'age', name: 'age', label: 'Age', type: 'number', required: true, min: 10, max: 120 },
                { id: 'weight', name: 'weight', label: 'Weight', type: 'number', required: true, unit: 'kg' },
                { id: 'height', name: 'height', label: 'Height', type: 'number', required: true, unit: 'cm' },
                { id: 'gender', name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
                {
                    id: 'activity', name: 'activity', label: 'Activity Level', type: 'select',
                    options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'], required: true
                },
                {
                    id: 'goal', name: 'goal', label: 'Goal', type: 'select',
                    options: ['Lose Weight', 'Maintain Weight', 'Gain Muscle'], required: true
                }
            ];
        }
        // Foot/Step Tracker detection
        else if (lowerContent.includes('foot') || lowerContent.includes('step') || lowerContent.includes('walk')) {
            title = 'Step Tracker';
            subtitle = 'Monitor your daily steps';
            layout = 'tracker';
            displayType = 'tracker';
            fields = [
                { id: 'steps', name: 'steps', label: 'Steps Today', type: 'number', required: true },
                { id: 'goal', name: 'goal', label: 'Daily Goal', type: 'number', required: true },
                { id: 'distance', name: 'distance', label: 'Distance', type: 'number', unit: 'km' },
                { id: 'calories', name: 'calories', label: 'Calories Burned', type: 'number', unit: 'kcal' }
            ];
        }
        // Budget/Finance tracker
        else if (lowerContent.includes('budget') || lowerContent.includes('expense') || lowerContent.includes('finance')) {
            title = 'Budget Tracker';
            subtitle = 'Manage your finances';
            layout = 'table';
            displayType = 'finance';
            fields = [
                {
                    id: 'category', name: 'category', label: 'Category', type: 'select',
                    options: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Other'], required: true
                },
                { id: 'amount', name: 'amount', label: 'Amount', type: 'number', required: true, unit: '$' },
                { id: 'date', name: 'date', label: 'Date', type: 'date', required: true },
                { id: 'description', name: 'description', label: 'Description', type: 'text' }
            ];
        }
        // Habit Tracker
        else if (lowerContent.includes('habit') || lowerContent.includes('routine') || lowerContent.includes('daily')) {
            title = 'Habit Tracker';
            subtitle = 'Build better habits';
            layout = 'cards';
            displayType = 'habits';
            fields = [
                { id: 'habit', name: 'habit', label: 'Habit Name', type: 'text', required: true },
                {
                    id: 'frequency', name: 'frequency', label: 'Frequency', type: 'select',
                    options: ['Daily', 'Weekly', 'Monthly'], required: true
                },
                { id: 'completed', name: 'completed', label: 'Completed Today', type: 'checkbox' },
                { id: 'streak', name: 'streak', label: 'Current Streak', type: 'number', unit: 'days' }
            ];
        }
        // Water Intake
        else if (lowerContent.includes('water') || lowerContent.includes('hydration')) {
            title = 'Water Tracker';
            subtitle = 'Stay hydrated';
            layout = 'tracker';
            displayType = 'water';
            fields = [
                { id: 'intake', name: 'intake', label: 'Water Intake', type: 'number', required: true, unit: 'ml' },
                { id: 'goal', name: 'goal', label: 'Daily Goal', type: 'number', required: true, unit: 'ml' },
                { id: 'timestamp', name: 'timestamp', label: 'Time', type: 'date' }
            ];
        }
        // Sleep Tracker
        else if (lowerContent.includes('sleep') || lowerContent.includes('rest')) {
            title = 'Sleep Tracker';
            subtitle = 'Monitor your sleep';
            layout = 'tracker';
            displayType = 'sleep';
            fields = [
                { id: 'bedtime', name: 'bedtime', label: 'Bedtime', type: 'date', required: true },
                { id: 'waketime', name: 'waketime', label: 'Wake Time', type: 'date', required: true },
                { id: 'quality', name: 'quality', label: 'Sleep Quality', type: 'slider', min: 1, max: 10 },
                { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea' }
            ];
        }
        // Mood Tracker
        else if (lowerContent.includes('mood') || lowerContent.includes('emotion') || lowerContent.includes('feeling')) {
            title = 'Mood Tracker';
            subtitle = 'Track your emotions';
            layout = 'cards';
            displayType = 'mood';
            fields = [
                {
                    id: 'mood', name: 'mood', label: 'Current Mood', type: 'select',
                    options: ['😊 Happy', '😐 Neutral', '😢 Sad', '😠 Angry', '😰 Anxious', '😴 Tired'], required: true
                },
                { id: 'energy', name: 'energy', label: 'Energy Level', type: 'slider', min: 1, max: 10 },
                { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea' },
                { id: 'timestamp', name: 'timestamp', label: 'Time', type: 'date' }
            ];
        }
        // Reading Tracker
        else if (lowerContent.includes('read') || lowerContent.includes('book') || lowerContent.includes('library')) {
            title = 'Reading Tracker';
            subtitle = 'Track your reading progress';
            layout = 'table';
            displayType = 'reading';
            fields = [
                { id: 'book', name: 'book', label: 'Book Title', type: 'text', required: true },
                { id: 'author', name: 'author', label: 'Author', type: 'text' },
                { id: 'progress', name: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100 },
                { id: 'status', name: 'status', label: 'Status', type: 'select', options: ['Reading', 'Completed', 'Want to Read'] }
            ];
        }
        // Workout Plan
        else if (lowerContent.includes('exercise') || lowerContent.includes('gym') || lowerContent.includes('workout')) {
            title = 'Workout Tracker';
            subtitle = 'Track your training';
            layout = 'tracker';
            displayType = 'tracker';
            fields = [
                { id: 'exercise', name: 'exercise', label: 'Exercise', type: 'text', required: true },
                { id: 'sets', name: 'sets', label: 'Sets', type: 'number' },
                { id: 'reps', name: 'reps', label: 'Reps', type: 'number' },
                { id: 'weight', name: 'weight', label: 'Weight (kg)', type: 'number' }
            ];
        }
        // Generic fallback
        else {
            title = 'Custom Tracker';
            subtitle = 'Custom section from PRD';
            layout = 'form';
            displayType = 'custom';
            fields = [
                { id: 'field1', name: 'field1', label: 'Field 1', type: 'text', required: true },
                { id: 'field2', name: 'field2', label: 'Field 2', type: 'number' },
                { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea' }
            ];
        }

        const imageMapping: Record<string, string> = {
            calculator: '/images/section-calculator.png',
            tracker: '/images/section-steps.png',
            finance: '/images/section-freelancing.png',
            habits: '/images/section-branding.png',
            water: '/images/section-water.png',
            sleep: '/images/section-ai.png',
            mood: '/images/section-looksmaxing.png',
            reading: '/images/section-journal.png',
            custom: '/images/section-ai.png'
        };

        return {
            id: uuidv4(),
            title,
            subtitle,
            type: 'prd-generated',
            fields,
            layout,
            displayType,
            img: imageMapping[displayType] || '/images/section-ai.png'
        };
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPrdFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setPrdText(content);
            };
            reader.readAsText(file);
        }
    };

    const handleAnalyze = async () => {
        if (!prdText.trim()) {
            setError('Please enter or upload a PRD first');
            return;
        }

        setError('');
        setIsAnalyzing(true);
        setAnalysisComplete(false);

        try {
            const schema = await analyzePRD(prdText);
            setGeneratedSchema(schema);
            setAnalysisComplete(true);
        } catch (err) {
            setError('Failed to analyze PRD. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (!generatedSchema) return;

        // Save to localStorage
        const existingData = localStorage.getItem('customCategories');
        const customCategories = existingData ? JSON.parse(existingData) : [];

        const newCategory = {
            ...generatedSchema,
            img: generatedSchema.img || '/images/section-ai.png',
            workouts: [],
            items: [],
            entries: [] // For storing user data
        };

        const updatedCategories = [...customCategories, newCategory];
        localStorage.setItem('customCategories', JSON.stringify(updatedCategories));

        // Notify dashboard
        window.dispatchEvent(new Event('routinesUpdated'));
        navigate('/dashboard');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 to-white overflow-x-hidden font-sans">
            {/* Header */}
            <header className="flex items-center bg-white/80 backdrop-blur-md p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="text-indigo-600 text-base font-bold leading-normal tracking-[0.015em] cursor-pointer"
                >
                    Cancel
                </button>
                <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    Build from PRD
                </h2>
                <div className="w-12"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">AI-Powered Builder</h3>
                            <p className="text-sm text-white/80 font-medium">Transform your ideas into custom sections</p>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/90">
                        Upload your Product Requirements Document (PRD) or describe your needs, and our AI will automatically
                        generate a custom section with the right fields, layout, and functionality.
                    </p>
                </div>

                {/* PRD Input */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <label className="block mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Your PRD</span>
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                                <Upload className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Upload File</span>
                                <input type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <textarea
                            value={prdText}
                            onChange={(e) => setPrdText(e.target.value)}
                            placeholder="Describe your custom section... 

Example: 'I need a calorie calculator that tracks daily nutrition intake, calculates BMR based on age, weight, height, and activity level, and suggests meal plans for weight loss or muscle gain.'

or

'Create a sleep tracker to monitor my bedtime, wake time, sleep quality, and sleep duration with weekly analytics.'"
                            className="w-full h-64 p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 resize-none text-sm leading-relaxed"
                        />
                    </label>
                    {prdFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">{prdFile.name}</span>
                        </div>
                    )}
                </div>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !prdText.trim()}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader className="w-6 h-6 animate-spin" />
                            Analyzing PRD...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            Analyze & Generate
                        </>
                    )}
                </button>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-red-700">{error}</span>
                    </div>
                )}

                {/* Generated Schema Preview */}
                {analysisComplete && generatedSchema && (
                    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-green-200 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <h3 className="text-xl font-black text-gray-900">Section Generated Successfully!</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Section Title</p>
                                <p className="text-2xl font-black text-gray-900">{generatedSchema.title}</p>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                                <p className="text-base text-gray-700">{generatedSchema.subtitle}</p>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Layout Style</p>
                                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold capitalize">
                                    {generatedSchema.layout}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Fields ({generatedSchema.fields.length})</p>
                                <div className="grid gap-3">
                                    {generatedSchema.fields.map((field) => (
                                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{field.label}</p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {field.type} {field.required && '• Required'}
                                                    {field.unit && ` • Unit: ${field.unit}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                            <CheckCircle className="w-6 h-6" />
                            Save to Dashboard
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PRDSectionBuilder;
