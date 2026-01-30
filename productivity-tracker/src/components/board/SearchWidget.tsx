import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const SearchWidget: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/directory')}
            className="w-full h-full bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-[#333] cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between overflow-hidden box-border"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Web Search</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Search Preview */}
            <div className="flex-1 flex items-center justify-center py-3">
                <div className="w-full bg-gray-50 dark:bg-[#222] rounded-full px-4 py-2.5 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400 truncate">Search people, companies...</span>
                </div>
            </div>

            {/* Quick Tags */}
            <div className="flex gap-1.5 overflow-hidden">
                {['Elon Musk', 'OpenAI', 'Tesla'].map((tag) => (
                    <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-[#333] rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SearchWidget;
