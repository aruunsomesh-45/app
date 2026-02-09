/**
 * Daily Summary AI Function
 * 
 * Generates personalized daily summaries using Genkit.
 * Non-real-time: summaries are generated and stored for later display.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as z from "zod";
import { MODELS, PROMPTS, TOKEN_LIMITS, getAi, GEMINI_API_KEY } from "../config/genkit";
import { getSupabaseClient, AIInsight } from "../config/supabase";

/**
 * Input schema for the daily summary flow
 */
const DailySummaryInputSchema = z.object({
    date: z.string().optional(),
});

/**
 * Generate a daily summary for a user
 * Defined as a standard Firebase Callable Function
 */
export const generateDailySummaryCallable = onCall(
    {
        secrets: [GEMINI_API_KEY, "SUPABASE_URL", "SUPABASE_SERVICE_KEY"],
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be authenticated");
        }

        const input = DailySummaryInputSchema.parse(request.data);
        const output = await generateDailySummary(request.auth.uid, input.date);

        return { success: true, insight: output, cached: false };
    }
);

/**
 * Core logic separated for potential reuse
 */
export async function generateDailySummary(firebaseUid: string, dateInput?: string): Promise<AIInsight> {
    const supabase = getSupabaseClient();
    const date = dateInput || new Date().toISOString().split("T")[0];

    // Check if we already have a summary for this date
    const { data: existing } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .eq("type", "daily_summary")
        .contains("metadata", { date })
        .single();

    if (existing) {
        return existing;
    }

    // Fetch aggregated stats for the day
    const { data: stats, error } = await supabase
        .from("aggregated_daily_stats")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .eq("date", date)
        .single();

    if (error || !stats) {
        throw new Error("No stats available for this date");
    }

    // Build prompt with data
    const prompt = PROMPTS.dailySummary
        .replace("{{date}}", date)
        .replace("{{focusScore}}", String(stats.focus_score || 0))
        .replace("{{sleepHours}}", String(stats.sleep_hours || 0))
        .replace("{{steps}}", String(stats.steps || 0))
        .replace("{{workoutsCompleted}}", String(stats.workouts_completed || 0))
        .replace("{{pagesRead}}", String(stats.pages_read || 0))
        .replace("{{meditationMinutes}}", String(stats.meditation_minutes || 0))
        .replace("{{goalsCompleted}}", String(stats.goals_completed || 0))
        .replace("{{goalsTotal}}", String(stats.goals_total || 0));

    // Generate summary using Genkit
    const ai = getAi();
    const response = await ai.generate({
        model: MODELS.flash,
        prompt: prompt,
        config: {
            maxOutputTokens: TOKEN_LIMITS.dailySummary,
            temperature: 0.7,
        },
    });

    const text = response.text; // Access as property

    // Create insight record
    const insight: AIInsight = {
        firebase_uid: firebaseUid,
        type: "daily_summary",
        content: text,
        metadata: {
            date,
            focusScore: stats.focus_score,
            goalsCompleted: stats.goals_completed,
            goalsTotal: stats.goals_total,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Store the insight
    const { error: insertError } = await supabase
        .from("ai_insights")
        .insert(insight);

    if (insertError) {
        console.error("Failed to store insight:", insertError);
    }

    return insight;
}

