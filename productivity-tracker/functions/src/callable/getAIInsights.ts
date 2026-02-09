/**
 * Callable Function: Get AI Insights
 * 
 * HTTP callable function for the client to fetch AI-generated insights.
 * Insights are pre-generated and cached to reduce AI API costs.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getSupabaseClient, AIInsight, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";
import { generateDailySummary } from "../ai/dailySummary";
import { generateWeeklyReview } from "../ai/weeklyReview";
import { generateGoalSuggestions } from "../ai/goalBuddySuggestions";
import { GEMINI_API_KEY } from "../config/genkit";

type InsightType = "daily_summary" | "weekly_review" | "goal_suggestion" | "all";

interface GetInsightsInput {
    type: InsightType;
    date?: string;
    weekStart?: string;
    weekEnd?: string;
    forceRefresh?: boolean;
}

/**
 * Get AI insights for the authenticated user
 */
export const getAIInsights = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const { type, date, weekStart, weekEnd, forceRefresh = false } = request.data as GetInsightsInput;

    if (!type) {
        throw new HttpsError("invalid-argument", "Insight type is required");
    }

    const supabase = getSupabaseClient();

    try {
        if (type === "all") {
            // Get all recent insights
            const { data, error } = await supabase
                .from("ai_insights")
                .select("*")
                .eq("firebase_uid", firebaseUid)
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) {
                throw new Error(error.message);
            }

            // Filter out expired insights
            const validInsights = (data || []).filter(
                (i) => !i.expires_at || new Date(i.expires_at) > new Date()
            );

            return { success: true, insights: validInsights };
        }

        // Get specific insight type
        const today = new Date().toISOString().split("T")[0];

        // Check for cached insight
        if (!forceRefresh) {
            let query = supabase
                .from("ai_insights")
                .select("*")
                .eq("firebase_uid", firebaseUid)
                .eq("type", type)
                .order("created_at", { ascending: false })
                .limit(1);

            // Add date filter for daily summaries
            if (type === "daily_summary" && date) {
                query = query.contains("metadata", { date });
            }

            // Add week filter for weekly reviews
            if (type === "weekly_review" && weekStart) {
                query = query.contains("metadata", { weekStart });
            }

            const { data, error } = await query.single();

            if (!error && data) {
                // Check if not expired
                if (!data.expires_at || new Date(data.expires_at) > new Date()) {
                    return { success: true, insight: data, cached: true };
                }
            }
        }

        // Generate new insight
        let insight: AIInsight;

        switch (type) {
            case "daily_summary": {
                insight = await generateDailySummary(firebaseUid, date || today);
                break;
            }

            case "weekly_review": {
                // Default to current week if not specified
                const now = new Date();
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                const defaultWeekStart = new Date(now);
                defaultWeekStart.setDate(diff);
                const defaultWeekEnd = new Date(defaultWeekStart);
                defaultWeekEnd.setDate(defaultWeekStart.getDate() + 6);

                insight = await generateWeeklyReview(
                    firebaseUid,
                    weekStart || defaultWeekStart.toISOString().split("T")[0],
                    weekEnd || defaultWeekEnd.toISOString().split("T")[0]
                );
                break;
            }

            case "goal_suggestion": {
                insight = await generateGoalSuggestions(firebaseUid);
                break;
            }

            default:
                throw new HttpsError("invalid-argument", "Invalid insight type");
        }

        return { success: true, insight, cached: false };
    } catch (error) {
        console.error("Error fetching AI insights:", error);
        throw new HttpsError("internal", "Failed to fetch insights");
    }
});

/**
 * Get latest insight of each type (for dashboard display)
 */
export const getLatestInsights = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const supabase = getSupabaseClient();

    try {
        // Get latest of each type
        const types: Array<AIInsight["type"]> = [
            "daily_summary",
            "weekly_review",
            "goal_suggestion",
        ];

        const insights: Record<string, AIInsight | null> = {};

        await Promise.all(
            types.map(async (type) => {
                const { data } = await supabase
                    .from("ai_insights")
                    .select("*")
                    .eq("firebase_uid", firebaseUid)
                    .eq("type", type)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                // Check if not expired
                if (data && (!data.expires_at || new Date(data.expires_at) > new Date())) {
                    insights[type] = data;
                } else {
                    insights[type] = null;
                }
            })
        );

        return { success: true, insights };
    } catch (error) {
        console.error("Error fetching latest insights:", error);
        throw new HttpsError("internal", "Failed to fetch latest insights");
    }
});

/**
 * Mark insight as read/dismissed
 */
export const dismissInsight = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const { insightId } = request.data as { insightId: string };

    if (!insightId) {
        throw new HttpsError("invalid-argument", "Insight ID is required");
    }

    const supabase = getSupabaseClient();

    try {
        // Verify ownership and update
        const { error } = await supabase
            .from("ai_insights")
            .update({ expires_at: new Date().toISOString() }) // Mark as expired
            .eq("id", insightId)
            .eq("firebase_uid", firebaseUid);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    } catch (error) {
        console.error("Error dismissing insight:", error);
        throw new HttpsError("internal", "Failed to dismiss insight");
    }
});
