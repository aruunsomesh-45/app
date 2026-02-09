"use strict";
/**
 * Supabase Client Configuration for Cloud Functions
 *
 * This module initializes the Supabase client for server-side operations.
 * Uses service role key for full database access.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPABASE_SERVICE_KEY = exports.SUPABASE_URL = void 0;
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const params_1 = require("firebase-functions/params");
// Define secrets (set via Firebase CLI: firebase functions:secrets:set)
exports.SUPABASE_URL = (0, params_1.defineSecret)("SUPABASE_URL");
exports.SUPABASE_SERVICE_KEY = (0, params_1.defineSecret)("SUPABASE_SERVICE_KEY");
let supabaseClient = null;
/**
 * Get Supabase client instance
 * Uses singleton pattern to reuse connections
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        const url = exports.SUPABASE_URL.value();
        const key = exports.SUPABASE_SERVICE_KEY.value();
        if (!url || !key) {
            throw new Error("Supabase credentials not configured");
        }
        supabaseClient = (0, supabase_js_1.createClient)(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseClient;
}
//# sourceMappingURL=supabase.js.map