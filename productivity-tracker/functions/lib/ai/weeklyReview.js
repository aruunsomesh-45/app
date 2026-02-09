"use strict";
/**
 * Weekly Review AI Function
 *
 * Generates comprehensive weekly reviews using Genkit.
 * Analyzes trends and provided actionable advice.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReviewCallable = void 0;
exports.generateWeeklyReview = generateWeeklyReview;
const https_1 = require("firebase-functions/v2/https");
const z = __importStar(require("zod"));
const genkit_1 = require("../config/genkit");
const supabase_1 = require("../config/supabase");
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
exports.generateWeeklyReviewCallable = (0, https_1.onCall)({
    secrets: [genkit_1.GEMINI_API_KEY, "SUPABASE_URL", "SUPABASE_SERVICE_KEY"],
    timeoutSeconds: 120, // Weekly reviews might take longer
    memory: "1GiB",
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const input = WeeklyReviewInputSchema.parse(request.data);
    const output = await generateWeeklyReview(request.auth.uid, input.weekStart, input.weekEnd);
    return { success: true, insight: output, cached: false };
});
/**
 * Core logic for weekly review
 */
async function generateWeeklyReview(firebaseUid, weekStart, weekEnd) {
    const supabase = (0, supabase_1.getSupabaseClient)();
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
    const dailyDataString = dailyStats.map(stat => `- ${stat.date}: Focus ${stat.focus_score || 0}, Sleep ${stat.sleep_hours || 0}h, Goals ${stat.goals_completed}/${stat.goals_total}`).join("\n");
    // Build prompt
    const prompt = genkit_1.PROMPTS.weeklyReview
        .replace("{{weekStart}}", weekStart)
        .replace("{{weekEnd}}", weekEnd)
        .replace("{{dailyData}}", dailyDataString);
    // Generate review using Genkit
    const ai = (0, genkit_1.getAi)();
    const response = await ai.generate({
        model: genkit_1.MODELS.pro, // Use Pro model for deeper analysis
        prompt: prompt,
        config: {
            maxOutputTokens: genkit_1.TOKEN_LIMITS.weeklyReview,
            temperature: 0.7,
        },
    });
    const text = response.text; // Access as property
    // Create insight record
    const insight = {
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
//# sourceMappingURL=weeklyReview.js.map