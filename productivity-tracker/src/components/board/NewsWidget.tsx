import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, ArrowRight, Globe, Loader2 } from 'lucide-react';
import { fetchTopHeadlines } from '../../services/newsService';
import type { NewsArticle } from '../../services/newsService';

const NewsWidget: React.FC = () => {
    const navigate = useNavigate();
    const [headlines, setHeadlines] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const data = await fetchTopHeadlines('technology');
                setHeadlines(data.slice(0, 3)); // Top 3 headlines
            } catch (e) {
                console.error('Failed to load headlines:', e);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    return (
        <div
            onClick={() => navigate('/skim-news')}
            className="w-full h-full bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-[#333] cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all flex flex-col overflow-hidden box-border"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Newspaper className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Skim News</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Headlines Preview */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                ) : headlines.length > 0 ? (
                    headlines.map((article, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-2 py-1 border-b border-gray-50 dark:border-[#333] last:border-0"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
                                {article.title}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Globe className="w-6 h-6 text-gray-300 mb-1" />
                        <span className="text-xs text-gray-400">No news available</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pt-2 mt-auto">
                <span className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">
                    Browse all news →
                </span>
            </div>
        </div>
    );
};

export default NewsWidget;
