"use strict";
/**
 * Daily Summary AI Function
 *
 * Generates personalized daily summaries using Genkit.
 * Non-real-time: summaries are generated and stored for later display.
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
exports.generateDailySummaryCallable = void 0;
exports.generateDailySummary = generateDailySummary;
const https_1 = require("firebase-functions/v2/https");
const z = __importStar(require("zod"));
const genkit_1 = require("../config/genkit");
const supabase_1 = require("../config/supabase");
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
exports.generateDailySummaryCallable = (0, https_1.onCall)({
    secrets: [genkit_1.GEMINI_API_KEY, "SUPABASE_URL", "SUPABASE_SERVICE_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const input = DailySummaryInputSchema.parse(request.data);
    const output = await generateDailySummary(request.auth.uid, input.date);
    return { success: true, insight: output, cached: false };
});
/**
 * Core logic separated for potential reuse
 */
async function generateDailySummary(firebaseUid, dateInput) {
    const supabase = (0, supabase_1.getSupabaseClient)();
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
    const prompt = genkit_1.PROMPTS.dailySummary
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
    const ai = (0, genkit_1.getAi)();
    const response = await ai.generate({
        model: genkit_1.MODELS.flash,
        prompt: prompt,
        config: {
            maxOutputTokens: genkit_1.TOKEN_LIMITS.dailySummary,
            temperature: 0.7,
        },
    });
    const text = response.text; // Access as property
    // Create insight record
    const insight = {
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
//# sourceMappingURL=dailySummary.js.map