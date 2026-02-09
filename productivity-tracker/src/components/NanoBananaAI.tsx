import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkKeywords } from '../services/contentFilter';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const NanoBananaAI: React.FC<{ isOpen: boolean; onClose: () => void; initialMessage?: string }> = ({ isOpen, onClose, initialMessage }) => {
    const { settings, logBlockedAttempt } = useContentProtection();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm Nano Banana 🍌. Your personal AI productivity coach. How can I help you optimize your day?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);

    useEffect(() => {
        if (isOpen && initialMessage) {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: initialMessage,
                    sender: 'ai',
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen, initialMessage]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Content Protection Check
        if (settings.protectionLevel !== 'off') {
            const protectionResult = checkKeywords(
                input,
                settings.protectionLevel,
                settings.customBlockedKeywords
            );

            if (protectionResult.blocked) {
                logBlockedAttempt(input, 'keyword', protectionResult.reason);

                const userMsg: Message = {
                    id: Date.now().toString(),
                    text: input,
                    sender: 'user',
                    timestamp: new Date()
                };

                const blockedMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `🔒 Content Blocked. ${protectionResult.reason}`,
                    sender: 'ai',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, userMsg, blockedMsg]);
                setInput('');
                return;
            }
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Use Firebase Cloud Function with Genkit AI
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions();
            const nanoBananaChat = httpsCallable(functions, 'nanoBananaChat');

            // Build conversation history (last 5 messages)
            const conversationHistory = messages.slice(-5).map(msg => ({
                role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
                content: msg.text
            }));

            const result = await nanoBananaChat({
                message: input,
                conversationHistory
            });

            const data = result.data as { response: string; timestamp: number };

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error: unknown) {
            console.error("AI Error:", error);

            let displayError = "Banana Split! 🍌 Something went wrong. Try again.";

            // Check for common error types
            const errorStr = String(error);
            if (errorStr.includes("unauthenticated")) {
                displayError = "Please sign in to use Nano Banana! 🍌";
            } else if (errorStr.includes("API_KEY_INVALID") || errorStr.includes("invalid key") || errorStr.includes("403") || errorStr.includes("401")) {
                displayError = "AI service configuration error. Please contact support.";
            } else if (errorStr.includes("503") || errorStr.includes("overloaded") || errorStr.includes("resource-exhausted")) {
                displayError = "AI service is busy right now. Please try again in a moment! 🍌";
            } else if (error instanceof Error) {
                displayError = `AI Error: ${error.message}`;
            }

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: displayError,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0 ai-section font-sans antialiased">
            <div className="absolute inset-0 bg-[#333333]/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <div className="bg-[#F5F5F5] w-full max-w-md h-[85vh] sm:h-[650px] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col pointer-events-auto transform transition-all overflow-hidden border border-[#CCCCCC]/30">
                {/* Header */}
                <div className="bg-[#1A1A1A] p-6 flex justify-between items-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#847777]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#847777] to-[#5a4f4f] rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10">
                            <span className="text-2xl">🍌</span>
                        </div>
                        <div>
                            <h3 className="font-black text-xl italic tracking-tighter">Nano Banana</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]/60 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#847777] animate-pulse"></span>
                                System Core: Gemini
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group active:scale-95 relative z-10">
                        <X className="w-5 h-5 text-[#CCCCCC] group-hover:text-white" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F5F5] no-scrollbar">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] p-4 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm transition-all ${msg.sender === 'user'
                                    ? 'bg-[#333333] text-white rounded-br-none border border-[#1A1A1A]'
                                    : 'bg-white text-[#333333] border border-[#CCCCCC] rounded-bl-none italic'
                                    }`}
                            >
                                {msg.text && <p>{msg.text}</p>}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-[#CCCCCC] flex gap-2">
                                <div className="w-2 h-2 bg-[#847777] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[#847777] rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-[#847777] rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-[#CCCCCC]/30 pb-8">
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Instruct Neural Core..."
                            className="w-full bg-[#F5F5F5] text-[#1A1A1A] placeholder:text-[#CCCCCC] rounded-full pl-6 pr-14 py-4.5 border border-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all shadow-inner font-medium text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1.5 w-11 h-11 bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-[#847777]/20"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </div>
                    <p className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-widest text-center mt-4 opacity-60">
                        Secure Neural Interface v4.2.0 • Data encrypted
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NanoBananaAI;
