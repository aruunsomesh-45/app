import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as z from "zod";
import { getAi, GEMINI_API_KEY } from "../config/genkit";

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
export const helloGenkit = onCall(
    {
        secrets: [GEMINI_API_KEY],
    },
    async (request) => {
        // Optional: Require authentication
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "User must be authenticated");
        }

        try {
            const { name } = HelloInputSchema.parse(request.data);
            const ai = getAi();

            // The model is now set as default in getAi(), so we can omit it here
            // or explicitly use MODELS.flash if desired.
            const response = await ai.generate({
                prompt: `Hello Gemini, my name is ${name}`,
            });

            const text = response.text;
            console.log(text);

            return { success: true, message: text };
        } catch (error) {
            console.error("Error in helloGenkit:", error);
            throw new HttpsError("internal", "Failed to generate response");
        }
    }
);
