"use strict";
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
exports.helloGenkit = void 0;
const https_1 = require("firebase-functions/v2/https");
const z = __importStar(require("zod"));
const genkit_1 = require("../config/genkit");
/**
 * Input schema for the hello flow
 */
const HelloInputSchema = z.object({
    name: z.string(),
});
/**
 * Simple Hello World Flow using Genkit
 * Adapted to use Firebase Callable Functions for easy client-side access
 */
exports.helloGenkit = (0, https_1.onCall)({
    secrets: [genkit_1.GEMINI_API_KEY],
}, async (request) => {
    // Optional: Require authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    try {
        const { name } = HelloInputSchema.parse(request.data);
        const ai = (0, genkit_1.getAi)();
        // The model is now set as default in getAi(), so we can omit it here
        // or explicitly use MODELS.flash if desired.
        const response = await ai.generate({
            prompt: `Hello Gemini, my name is ${name}`,
        });
        const text = response.text;
        console.log(text);
        return { success: true, message: text };
    }
    catch (error) {
        console.error("Error in helloGenkit:", error);
        throw new https_1.HttpsError("internal", "Failed to generate response");
    }
});
//# sourceMappingURL=helloGenkit.js.map