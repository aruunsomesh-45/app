"use strict";
/**
 * Nano Banana AI Chat Function
 * Handles chat interactions using Firebase Genkit
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nanoBananaChat = void 0;
const https_1 = require("firebase-functions/v2/https");
const genkit_1 = require("../config/genkit");
/**
 * Nano Banana Chat - AI-powered productivity coaching
 */
exports.nanoBananaChat = (0, https_1.onCall)({ secrets: [genkit_1.GEMINI_API_KEY] }, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated to use Nano Banana");
    }
    const { message, conversationHistory = [] } = request.data;
    if (!message || typeof message !== 'string') {
        throw new https_1.HttpsError("invalid-argument", "Message is required and must be a string");
    }
    try {
        const ai = (0, genkit_1.getAi)();
        // Build conversation context
        let contextPrompt = `You are Nano Banana 🍌, a personal AI productivity coach. 
You are encouraging, focused on productivity, and provide actionable advice.
Keep your responses concise, warm, and human.

`;
        // Add conversation history if available
        if (conversationHistory.length > 0) {
            contextPrompt += "Previous conversation:\n";
            conversationHistory.slice(-5).forEach(msg => {
                contextPrompt += `${msg.role === 'user' ? 'User' : 'Nano Banana'}: ${msg.content}\n`;
            });
            contextPrompt += "\n";
        }
        contextPrompt += `User's current message: ${message}\n\nProvide a helpful, encouraging response:`;
        // Generate response using Genkit
        const { text } = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: contextPrompt,
            config: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });
        return {
            response: text,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        console.error("Nano Banana Chat Error:", error);
        // Provide user-friendly error messages
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('unauthorized')) {
            throw new https_1.HttpsError("failed-precondition", "AI service configuration error. Please contact support.");
        }
        throw new https_1.HttpsError("internal", `Banana Split! 🍌 (Debug: ${errorMessage})`);
    }
});
//# sourceMappingURL=nanoBananaChat.js.map