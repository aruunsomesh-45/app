/**
 * Nano Banana AI Chat Function
 * Handles chat interactions using Firebase Genkit
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAi, GEMINI_API_KEY } from "../config/genkit";

interface ChatRequest {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
    response: string;
    timestamp: number;
}

/**
 * Nano Banana Chat - AI-powered productivity coaching
 */
export const nanoBananaChat = onCall(
    { secrets: [GEMINI_API_KEY] },
    async (request): Promise<ChatResponse> => {
        // Verify authentication
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "User must be authenticated to use Nano Banana"
            );
        }

        const { message, conversationHistory = [] } = request.data as ChatRequest;

        if (!message || typeof message !== 'string') {
            throw new HttpsError(
                "invalid-argument",
                "Message is required and must be a string"
            );
        }

        try {
            const ai = getAi();

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

        } catch (error: unknown) {
            console.error("Nano Banana Chat Error:", error);

            // Provide user-friendly error messages
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('unauthorized')) {
                throw new HttpsError(
                    "failed-precondition",
                    "AI service configuration error. Please contact support."
                );
            }

            throw new HttpsError(
                "internal",
                `Banana Split! 🍌 (Debug: ${errorMessage})`
            );
        }
    }
);
