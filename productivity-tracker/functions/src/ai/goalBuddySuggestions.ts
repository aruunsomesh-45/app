/**
 * Goal Buddy AI Suggestions
 * 
 * Analyzes goals and progress to provide smart suggestions.
 * Detects stalled goals and suggests breakdowns.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { MODELS, PROMPTS, TOKEN_LIMITS, GEMINI_API_KEY, getAi } from "../config/genkit";
import { getSupabaseClient, AIInsight, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";

interface GoalSuggestionInput {
    goalIds?: string[]; // Optional: specific goals to analyze
}

interface Goal {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
    due_date?: string;
    priority?: string;
}

/**
 * Format goals for the AI prompt
 */
function formatGoals(goals: Goal[]): string {
    return goals
        .map(
            (g) =>
                `- "${g.title}" (${g.completed ? "✓ Done" : "Pending"}, ` +
                `Priority: ${g.priority || "Normal"}, ` +
                `Created: ${new Date(g.created_at).toLocaleDateString()})`
        )
        .join("\n");
}

/**
 * Format recent progress data
 */
function formatProgress(
    recentStats: Array<{ date: string; goals_completed: number; goals_total: number }>
): string {
    return recentStats
        .map(
            (s) =>
                `- ${s.date}: ${s.goals_completed}/${s.goals_total} goals completed`
        )
        .join("\n");
}

/**
 * Generate goal suggestions for a user
 */
export async function generateGoalSuggestions(
    firebaseUid: string,
    goalIds?: string[]
): Promise<AIInsight> {
    const supabase = getSupabaseClient();

    // Fetch recent goals (last 14 days)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    let goalsQuery = supabase
        .from("daily_tasks")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .gte("date", twoWeeksAgo)
        .order("date", { ascending: false });

    if (goalIds && goalIds.length > 0) {
        goalsQuery = goalsQuery.in("id", goalIds);
    }

    const { data: goals, error: goalsError } = await goalsQuery;

    if (goalsError) {
        throw new Error(`Failed to fetch goals: ${goalsError.message}`);
    }

    // Fetch recent stats for progress context
    const { data: recentStats, error: statsError } = await supabase
        .from("aggregated_daily_stats")
        .select("date, goals_completed, goals_total")
        .eq("firebase_uid", firebaseUid)
        .gte("date", twoWeeksAgo)
        .order("date", { ascending: false })
        .limit(7);

    if (statsError) {
        console.warn("Could not fetch stats for context:", statsError);
    }

    if (!goals || goals.length === 0) {
        // Return encouraging message for new users
        const insight: AIInsight = {
            firebase_uid: firebaseUid,
            type: "goal_suggestion",
            content:
                "You haven't set any goals recently. Start with one small, specific goal today - " +
                "something you can complete in the next few hours. Small wins build momentum!",
            metadata: { goalCount: 0 },
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
        };

        await supabase.from("ai_insights").insert(insight);
        return insight;
    }

    // Identify stalled goals (incomplete for 3+ days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const stalledGoals = goals.filter(
        (g) => !g.completed && g.date < threeDaysAgo
    );

    // Build prompt
    const goalsStr = formatGoals(goals.slice(0, 10)); // Limit to 10 goals
    const progressStr = recentStats ? formatProgress(recentStats) : "No recent data";

    const prompt = PROMPTS.goalSuggestion
        .replace("{{goals}}", goalsStr)
        .replace("{{progress}}", progressStr);

    // Generate suggestions using Genkit
    const ai = getAi();
    const response = await ai.generate({
        model: MODELS.flash,
        prompt: prompt,
        config: {
            maxOutputTokens: TOKEN_LIMITS.goalSuggestion,
            temperature: 0.7,
        },
    });

    const text = response.text; // Access as property

    // Create insight record
    const insight: AIInsight = {
        firebase_uid: firebaseUid,
        type: "goal_suggestion",
        content: text,
        metadata: {
            totalGoals: goals.length,
            stalledGoals: stalledGoals.length,
            completionRate: Math.round(
                (goals.filter((g) => g.completed).length / goals.length) * 100
            ),
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
    };

    // Store the insight
    const { error: insertError } = await supabase.from("ai_insights").insert(insight);

    if (insertError) {
        console.error("Failed to store goal suggestions:", insertError);
    }

    return insight;
}

/**
 * HTTP Callable function for generating goal suggestions
 */
export const generateGoalSuggestionsCallable = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const { goalIds } = (request.data || {}) as GoalSuggestionInput;

    try {
        // Check for recent suggestions (within 12 hours)
        const supabase = getSupabaseClient();
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

        const { data: existing } = await supabase
            .from("ai_insights")
            .select("*")
            .eq("firebase_uid", firebaseUid)
            .eq("type", "goal_suggestion")
            .gte("created_at", twelveHoursAgo)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (existing) {
            return { success: true, insight: existing, cached: true };
        }

        const insight = await generateGoalSuggestions(firebaseUid, goalIds);
        return { success: true, insight, cached: false };
    } catch (error) {
        console.error("Error generating goal suggestions:", error);
        throw new HttpsError("internal", "Failed to generate suggestions: " + (error instanceof Error ? error.message : String(error)));
    }
});
