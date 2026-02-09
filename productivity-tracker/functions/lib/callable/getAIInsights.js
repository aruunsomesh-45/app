"use strict";
/**
 * Callable Function: Get AI Insights
 *
 * HTTP callable function for the client to fetch AI-generated insights.
 * Insights are pre-generated and cached to reduce AI API costs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissInsight = exports.getLatestInsights = exports.getAIInsights = void 0;
const https_1 = require("firebase-functions/v2/https");
const supabase_1 = require("../config/supabase");
const dailySummary_1 = require("../ai/dailySummary");
const weeklyReview_1 = require("../ai/weeklyReview");
const goalBuddySuggestions_1 = require("../ai/goalBuddySuggestions");
const genkit_1 = require("../config/genkit");
/**
 * Get AI insights for the authenticated user
 */
exports.getAIInsights = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY, genkit_1.GEMINI_API_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const { type, date, weekStart, weekEnd, forceRefresh = false } = request.data;
    if (!type) {
        throw new https_1.HttpsError("invalid-argument", "Insight type is required");
    }
    const supabase = (0, supabase_1.getSupabaseClient)();
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
            const validInsights = (data || []).filter((i) => !i.expires_at || new Date(i.expires_at) > new Date());
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
        let insight;
        switch (type) {
            case "daily_summary": {
                insight = await (0, dailySummary_1.generateDailySummary)(firebaseUid, date || today);
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
                insight = await (0, weeklyReview_1.generateWeeklyReview)(firebaseUid, weekStart || defaultWeekStart.toISOString().split("T")[0], weekEnd || defaultWeekEnd.toISOString().split("T")[0]);
                break;
            }
            case "goal_suggestion": {
                insight = await (0, goalBuddySuggestions_1.generateGoalSuggestions)(firebaseUid);
                break;
            }
            default:
                throw new https_1.HttpsError("invalid-argument", "Invalid insight type");
        }
        return { success: true, insight, cached: false };
    }
    catch (error) {
        console.error("Error fetching AI insights:", error);
        throw new https_1.HttpsError("internal", "Failed to fetch insights");
    }
});
/**
 * Get latest insight of each type (for dashboard display)
 */
exports.getLatestInsights = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const supabase = (0, supabase_1.getSupabaseClient)();
    try {
        // Get latest of each type
        const types = [
            "daily_summary",
            "weekly_review",
            "goal_suggestion",
        ];
        const insights = {};
        await Promise.all(types.map(async (type) => {
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
            }
            else {
                insights[type] = null;
            }
        }));
        return { success: true, insights };
    }
    catch (error) {
        console.error("Error fetching latest insights:", error);
        throw new https_1.HttpsError("internal", "Failed to fetch latest insights");
    }
});
/**
 * Mark insight as read/dismissed
 */
exports.dismissInsight = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const { insightId } = request.data;
    if (!insightId) {
        throw new https_1.HttpsError("invalid-argument", "Insight ID is required");
    }
    const supabase = (0, supabase_1.getSupabaseClient)();
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
    }
    catch (error) {
        console.error("Error dismissing insight:", error);
        throw new https_1.HttpsError("internal", "Failed to dismiss insight");
    }
});
//# sourceMappingURL=getAIInsights.js.map