import type { Module } from './types';

export const STARTUP_MODULES: Module[] = [
    {
        id: 'startup-101',
        title: 'Idea Validation',
        description: 'Learn how to tell if your startup idea is worth pursuing before writing a single line of code.',
        lessons: [
            {
                id: 'lesson-s1-1',
                title: 'The Mom Test',
                type: 'text',
                duration: '5 min',
                content: `Validation is the most critical step in the startup journey. Most founders fail because they build something nobody wants.

The "Mom Test" is a set of simple rules for crafting good questions that even your mom can't lie to you about. It's about talking to customers and learning if your business is viable.

Key Principles:
1. Talk about their life instead of your idea.
2. Ask about specifics in the past instead of generics or opinions about the future.
3. Talk less and listen more.`,
                videoUrl: 'placeholder'
            },
            {
                id: 'lesson-s1-2',
                title: 'Finding Your First 10 Customers',
                type: 'video',
                duration: '10 min',
                content: `Don't scale yet. Do things that don't scale. Your first 10 customers are not just revenue; they are your product designers.

Reach out manually. Use your personal network. Go where your users hang out online. If you can't find 10 people to use your product manually, ads won't save you.`,
                quizId: 'quiz-s1'
            }
        ]
    },
    {
        id: 'startup-102',
        title: 'MVP & Product Strategy',
        description: 'Building the Minimum Viable Product that delivers actual value.',
        lessons: [
            {
                id: 'lesson-s2-1',
                title: 'Defining the MVP',
                type: 'text',
                duration: '7 min',
                content: `MVP does not mean "buggy" or "half-finished". It means the smallest version of the product that delivers the core value proposition.

Focus on the one feature that solves the burning problem. Cut everything else. If you aren't embarrassed by your first release, you launched too late.`,
            }
        ]
    }
];

export const STOCKS_MODULES: Module[] = [
    {
        id: 'stocks-101',
        title: 'Market Fundamentals',
        description: 'Understanding how the stock market actually works and why you should care.',
        lessons: [
            {
                id: 'lesson-m1-1',
                title: 'What is a Stock?',
                type: 'video',
                duration: '5 min',
                content: `A stock represents fractional ownership in a company. When you buy a share, you are buying a piece of that business's future earnings and assets.

Stocks are volatile in the short term but have historically been the best wealth-generating asset class over the long term.`,
            },
            {
                id: 'lesson-m1-2',
                title: 'The Power of Compounding',
                type: 'text',
                duration: '5 min',
                content: `Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.

Time in the market beats timing the market. Starting early, even with small amounts, can lead to exponential growth due to the compounding effect of returns on returns.`,
                quizId: 'quiz-m1'
            }
        ]
    },
    {
        id: 'stocks-102',
        title: 'ETFs & Index Funds',
        description: 'The reliable path to wealth: passive investing strategies.',
        lessons: [
            {
                id: 'lesson-m2-1',
                title: 'Why Index Funds Win',
                type: 'text',
                duration: '8 min',
                content: `Most active fund managers fail to beat the S&P 500 over a 10-year period. Why try to pick the needle when you can buy the haystack?

Index funds offer diversification, low fees, and market-matching returns with minimal effort.`,
            }
        ]
    }
];
