
import React from 'react';
import { Quote } from 'lucide-react';

const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" }
];

const QuoteWidget: React.FC = () => {
    const [randomQuote] = React.useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg h-full flex flex-col justify-between text-white group hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Quote className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="mt-4">
                <p className="text-lg font-medium leading-relaxed italic opacity-90">
                    "{randomQuote.text}"
                </p>
                <p className="text-sm font-bold mt-3 opacity-75 uppercase tracking-widest">
                    — {randomQuote.author}
                </p>
            </div>
        </div>
    );
};

export default QuoteWidget;
