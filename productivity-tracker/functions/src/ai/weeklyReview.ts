/**
 * Weekly Review AI Function
 * 
 * Generates comprehensive weekly reviews using Genkit.
 * Analyzes trends and provided actionable advice.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as z from "zod";
import { MODELS, PROMPTS, TOKEN_LIMITS, getAi, GEMINI_API_KEY } from "../config/genkit";
import { getSupabaseClient, AIInsight } from "../config/supabase";

/**
 * Input schema for weekly review
 */
const WeeklyReviewInputSchema = z.object({
    weekStart: z.string(),
    weekEnd: z.string(),
});

/**
 * Generate a weekly review for a user
 * Defined as a Firebase Callable Function
 */
export const generateWeeklyReviewCallable = onCall(
    {
        secrets: [GEMINI_API_KEY, "SUPABASE_URL", "SUPABASE_SERVICE_KEY"],
        timeoutSeconds: 120, // Weekly reviews might take longer
        memory: "1GiB",
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be authenticated");
        }

        const input = WeeklyReviewInputSchema.parse(request.data);
        const output = await generateWeeklyReview(request.auth.uid, input.weekStart, input.weekEnd);

        return { success: true, insight: output, cached: false };
    }
);

/**
 * Core logic for weekly review
 */
export async function generateWeeklyReview(firebaseUid: string, weekStart: string, weekEnd: string): Promise<AIInsight> {
    const supabase = getSupabaseClient();

    // Check for existing review
    const { data: existing } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .eq("type", "weekly_review")
        .contains("metadata", { weekStart, weekEnd })
        .single();

    if (existing) {
        return existing;
    }

    // Fetch daily stats for the week
    const { data: dailyStats, error } = await supabase
        .from("aggregated_daily_stats")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .order("date", { ascending: true });

    if (error || !dailyStats || dailyStats.length === 0) {
        throw new Error("No data available for this week");
    }

    // Format daily data for prompt
    const dailyDataString = dailyStats.map(stat =>
        `- ${stat.date}: Focus ${stat.focus_score || 0}, Sleep ${stat.sleep_hours || 0}h, Goals ${stat.goals_completed}/${stat.goals_total}`
    ).join("\n");

    // Build prompt
    const prompt = PROMPTS.weeklyReview
        .replace("{{weekStart}}", weekStart)
        .replace("{{weekEnd}}", weekEnd)
        .replace("{{dailyData}}", dailyDataString);

    // Generate review using Genkit
    const ai = getAi();
    const response = await ai.generate({
        model: MODELS.pro, // Use Pro model for deeper analysis
        prompt: prompt,
        config: {
            maxOutputTokens: TOKEN_LIMITS.weeklyReview,
            temperature: 0.7,
        },
    });

    const text = response.text; // Access as property

    // Create insight record
    const insight: AIInsight = {
        firebase_uid: firebaseUid,
        type: "weekly_review",
        content: text,
        metadata: {
            weekStart,
            weekEnd,
            daysAnalyzed: dailyStats.length,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    // Store insight
    await supabase.from("ai_insights").insert(insight);

    return insight;
}
