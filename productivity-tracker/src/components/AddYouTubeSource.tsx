import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Youtube,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Loader2,
    MessageSquare,
    ShieldAlert,
    Save,
} from 'lucide-react';
import youtubeService from '../services/youtubeService';
import { saveYouTubeVideo } from '../services/notionService';

import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkUrl } from '../services/contentFilter';

const AddYouTubeSource: React.FC = () => {
    const navigate = useNavigate();
    const { settings, logBlockedAttempt } = useContentProtection();

    // Form State
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');

    // Metadata State
    const [metadata, setMetadata] = useState<{
        title: string;
        channelName: string;
        thumbnailUrl: string;
        videoId: string;
        embedUrl: string;
        iframeCode: string;
    } | null>(null);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [urlStatus, setUrlStatus] = useState<'idle' | 'valid' | 'invalid' | 'blocked'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // URL Validation & Metadata Fetching
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!url.trim()) {
                setUrlStatus('idle');
                setMetadata(null);
                return;
            }

            // Content Protection Check
            if (settings.protectionLevel !== 'off') {
                const protectionResult = checkUrl(url, settings.protectionLevel, settings.customBlockedDomains);
                if (protectionResult.blocked) {
                    setUrlStatus('blocked');
                    setError(`Blocked: ${protectionResult.reason}`);
                    logBlockedAttempt(url, undefined, protectionResult.reason);
                    setMetadata(null);
                    return;
                }
            }

            if (youtubeService.isValidYouTubeUrl(url)) {
                setUrlStatus('valid');
                setIsLoading(true);
                setError(null);

                try {
                    const data = await youtubeService.processYouTubeUrl(url);
                    if (data) {
                        setMetadata({
                            title: data.title || '',
                            channelName: data.channelName || '',
                            thumbnailUrl: data.thumbnailUrlHQ,
                            videoId: data.videoId,
                            embedUrl: data.embedUrl,
                            iframeCode: data.iframeCode
                        });

                        // Auto-fill title if empty
                        if (!title && data.title) {
                            setTitle(data.title);
                        }
                    } else {
                        throw new Error('Could not fetch metadata');
                    }
                } catch (err) {
                    console.error('Metadata fetch failed:', err);
                    // Still valid URL but fetch failed
                    const videoId = youtubeService.extractYouTubeVideoId(url);
                    if (videoId) {
                        setMetadata({
                            title: 'Original Title (Metadata Fetch Failed)',
                            channelName: 'Unknown Channel',
                            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                            videoId: videoId,
                            embedUrl: `https://www.youtube.com/embed/${videoId}`,
                            iframeCode: `<iframe src="https://www.youtube.com/embed/${videoId}" />`
                        });
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                setUrlStatus('invalid');
                setMetadata(null);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [url, title, settings, logBlockedAttempt]);

    const handleSave = async () => {
        if (!url || urlStatus !== 'valid') return;

        setIsSaving(true);
        setError(null);

        try {
            if (!metadata) throw new Error('No video metadata available');

            await saveYouTubeVideo({
                title: title || metadata.title || 'Untitled Video',
                originalUrl: url,
                videoId: metadata.videoId,
                thumbnailUrl: metadata.thumbnailUrl,
                iframeCode: metadata.iframeCode,
                embedUrl: metadata.embedUrl,
                channelName: metadata.channelName,
                notes: notes,
                summary: `YouTube resource saved from link: ${url}`
            });

            setSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (err) {
            console.error('Save failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to save resource');
        } finally {
            setIsSaving(false);
        }
    };

    const openInYouTube = () => {
        if (url) window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">Add YouTube Source</h1>
                    <p className="text-xs text-slate-500 font-medium">Paste a YouTube link to save and preview the video.</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 shadow-inner bg-slate-50/50">
                <div className="max-w-md mx-auto space-y-8">

                    {/* YouTube Link Input */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                            YouTube Link
                        </label>
                        <div className="relative group">
                            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${urlStatus === 'valid' ? 'text-emerald-500' :
                                urlStatus === 'invalid' ? 'text-rose-500' :
                                    urlStatus === 'blocked' ? 'text-orange-500' :
                                        'text-slate-400 group-focus-within:text-indigo-500'
                                }`}>
                                {urlStatus === 'blocked' ? <ShieldAlert className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
                            </div>
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className={`w-full bg-white border-2 rounded-2xl py-4 pl-14 pr-12 text-slate-900 font-medium transition-all outline-none ${urlStatus === 'valid' ? 'border-emerald-100 focus:border-emerald-500 shadow-sm shadow-emerald-50' :
                                    urlStatus === 'invalid' ? 'border-rose-100 focus:border-rose-500 shadow-sm shadow-rose-50' :
                                        urlStatus === 'blocked' ? 'border-orange-100 focus:border-orange-500 shadow-sm shadow-orange-50' :
                                            'border-slate-100 focus:border-indigo-500'
                                    }`}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                ) : (
                                    <>
                                        {urlStatus === 'valid' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        {urlStatus === 'invalid' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                                        {urlStatus === 'blocked' && <ShieldAlert className="w-5 h-5 text-orange-500" />}
                                    </>
                                )}
                            </div>
                        </div>
                        {urlStatus === 'invalid' && (
                            <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-wider">
                                ❌ Please enter a valid YouTube URL
                            </p>
                        )}
                        {urlStatus === 'blocked' && (
                            <p className="text-[10px] text-orange-500 font-bold ml-1 uppercase tracking-wider">
                                🛡️ Content Blocked by Protection Settings
                            </p>
                        )}
                    </div>

                    {/* Video Preview Card */}
                    <AnimatePresence>
                        {metadata && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 border border-slate-100"
                            >
                                <div className="aspect-video relative group overflow-hidden">
                                    <img
                                        src={metadata.thumbnailUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={openInYouTube}
                                            className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold text-sm border border-white/30 flex items-center gap-2 active:scale-95 transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Preview Video
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Live Preview</span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{metadata.channelName || 'YouTube Artist'}</p>
                                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                                            {metadata.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={openInYouTube}
                                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-100 transition-all active:scale-[0.98]"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open on YouTube
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Title Input */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                            Resource Title <span className="text-slate-300 ml-1">(Optional)</span>
                        </label>
                        <div className="relative">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Deep Learning Masterclass"
                                className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl py-4 px-6 text-slate-900 font-medium transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Personal Notes */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                            Personal Strategy & Notes
                        </label>
                        <div className="relative group">
                            <div className="absolute left-6 top-5 text-slate-300 pointer-events-none transition-colors group-focus-within:text-indigo-500">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What is your core focus? (e.g., Extracting marketing hooks, learning UI setup...)"
                                className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-3xl py-5 pl-14 pr-6 text-slate-900 font-medium transition-all outline-none min-h-[160px] resize-none"
                            />
                        </div>
                    </div>

                    {/* Empty spacer for bottom padding */}
                    <div className="h-24" />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-6 flex flex-col gap-3">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-2"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-2"
                    >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Resource Saved Successfully!
                    </motion.div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-3xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={urlStatus !== 'valid' || isSaving}
                        onClick={handleSave}
                        className={`flex-[2] py-5 font-black rounded-3xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] ${urlStatus === 'valid'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Resource
                            </>
                        )}
                    </button>
                </div>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                    Personal AI Vault • End-to-End Secure
                </p>
            </div>
        </div>
    );
};

export default AddYouTubeSource;
