import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";
import { defineSecret } from "firebase-functions/params";
import { enableFirebaseTelemetry } from "@genkit-ai/firebase";

// Define the Gemini API key as a secret
export const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Configure Genkit with Google AI plugin
// Note: Firebase plugin seems to be split or handled via enableFirebaseTelemetry
let aiInstance: any;

export const getAi = () => {
    if (!aiInstance) {
        enableFirebaseTelemetry();
        aiInstance = genkit({
            plugins: [
                googleAI({ apiKey: GEMINI_API_KEY.value() }),
            ],
            model: gemini15Flash, // Set default model
        });
    }
    return aiInstance;
};

/**
 * Model configuration
 */
export const MODELS = {
    // Use Gemini 1.5 Flash for fast, cost-effective responses
    flash: "googleai/gemini-1.5-flash",
    // Use Gemini 1.5 Pro for complex analysis
    pro: "googleai/gemini-1.5-pro",
} as const;

/**
 * Token limits for cost control
 */
export const TOKEN_LIMITS = {
    dailySummary: 500,
    weeklyReview: 1000,
    goalSuggestion: 300,
};

/**
 * Prompt templates - centralized for consistency
 */
export const PROMPTS = {
    dailySummary: `You are a supportive productivity coach. Based on the following daily stats, 
provide a brief, encouraging summary of the user's day. Be specific but concise.
Focus on achievements first, then gentle suggestions for improvement.

Stats for {{date}}:
- Focus Score: {{focusScore}}/100
- Sleep: {{sleepHours}} hours
- Steps: {{steps}}
- Workouts: {{workoutsCompleted}}
- Pages Read: {{pagesRead}}
- Meditation: {{meditationMinutes}} minutes
- Goals Completed: {{goalsCompleted}}/{{goalsTotal}}

Provide a 2-3 sentence summary. Be warm and human.`,

    weeklyReview: `You are a thoughtful productivity analyst. Analyze this week's performance 
and provide actionable insights.

Week: {{weekStart}} to {{weekEnd}}

Daily Breakdown:
{{dailyData}}

Provide:
1. Top 2 strengths this week
2. Top 2 areas for improvement
3. One specific, actionable suggestion for next week

Keep the total response under 200 words. Be encouraging but honest.`,

    goalSuggestion: `You are a goal-setting expert. Based on the user's current goals and progress,
suggest ways to optimize their approach.

Current Goals:
{{goals}}

Recent Progress:
{{progress}}

Provide:
1. Any goals that seem stalled (if applicable)
2. Suggested breakdown of complex goals
3. One motivational insight

Keep response under 100 words. Be practical and supportive.`,
};
