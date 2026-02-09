/**
 * Learning Hub Content Generation Function
 * Generates summaries, mind maps, and podcasts using Firebase Genkit
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAi, GEMINI_API_KEY } from "../config/genkit";

interface LearningRequest {
    userInput: string;
}

interface GeneratedContent {
    tldr: string;
    eli5: string;
    simple: string;
    normal: string;
    deep: string;
    analogy: string;
    realWorldExample: string;
    commonMistakes: string[];
    keyTakeaways: string[];
    relatedConcepts: string[];
    mindMap: {
        core: string;
        why: string;
        where: string;
        children: Array<{
            concept: string;
            examples: string[];
            applications: string[];
        }>;
    };
    podcastScript: {
        beginner: string;
        normal: string;
        deep: string;
    };
}

/**
 * Learning Hub Generate - Creates comprehensive learning materials
 */
export const learningHubGenerate = onCall(
    {
        secrets: [GEMINI_API_KEY],
        timeoutSeconds: 300, // 5 minutes for complex generation
        memory: "512MiB"
    },
    async (request): Promise<GeneratedContent> => {
        // Verify authentication
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "User must be authenticated to use Learning Hub"
            );
        }

        const { userInput } = request.data as LearningRequest;

        if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
            throw new HttpsError(
                "invalid-argument",
                "User input is required and must be a non-empty string"
            );
        }

        try {
            const ai = getAi();

            const prompt = `You are an AI learning assistant. Analyze this content and return ONLY valid JSON.

TOPIC: ${userInput}

Return this EXACT JSON structure (keep responses CONCISE to avoid truncation):

{
  "tldr": "2-3 sentence summary of the topic",
  "eli5": "Simple 100-word explanation a child could understand",
  "simple": "300-400 word beginner explanation with examples",
  "normal": "500-600 word intermediate explanation with technical details",
  "deep": "700-800 word advanced explanation with in-depth analysis",
  "analogy": "A memorable analogy (2-3 sentences)",
  "realWorldExample": "100-150 word real-world application example",
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4", "takeaway 5"],
  "relatedConcepts": ["concept 1", "concept 2", "concept 3", "concept 4"],
  "mindMap": {
    "core": "Main concept name",
    "why": "50-word explanation of why this exists",
    "where": "50-word explanation of where it's used",
    "children": [
      {"concept": "Sub-concept 1", "examples": ["ex1", "ex2"], "applications": ["app1", "app2"]},
      {"concept": "Sub-concept 2", "examples": ["ex1", "ex2"], "applications": ["app1", "app2"]},
      {"concept": "Sub-concept 3", "examples": ["ex1", "ex2"], "applications": ["app1", "app2"]}
    ]
  },
  "podcastScript": {
    "beginner": "200-300 word friendly podcast script for beginners",
    "normal": "300-400 word informative podcast script for intermediate learners",
    "deep": "400-500 word technical podcast script for advanced learners"
  }
}

IMPORTANT: Keep ALL text fields SHORT to ensure complete JSON. Return ONLY the JSON, nothing else.`;

            // Generate content using Genkit with retry logic
            let lastError: Error | null = null;
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Learning Hub: Attempt ${attempt}/${maxRetries}`);

                    const { text } = await ai.generate({
                        model: 'googleai/gemini-1.5-flash',
                        prompt: prompt,
                        config: {
                            maxOutputTokens: 8000,
                            temperature: 0.7,
                        },
                    });

                    // Clean and parse JSON response
                    let jsonText = text.trim();

                    // Remove markdown code blocks if present
                    if (jsonText.startsWith('```json')) {
                        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                    } else if (jsonText.startsWith('```')) {
                        jsonText = jsonText.replace(/```\n?/g, '');
                    }

                    // Extract JSON object
                    const firstBrace = jsonText.indexOf('{');
                    const lastBrace = jsonText.lastIndexOf('}');

                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
                    }

                    // Parse JSON
                    const parsed = JSON.parse(jsonText);

                    // Validate required fields
                    const requiredFields = ['tldr', 'eli5', 'simple', 'normal', 'deep', 'mindMap', 'podcastScript'];
                    for (const field of requiredFields) {
                        if (!parsed[field]) {
                            throw new Error(`Missing required field: ${field}`);
                        }
                    }

                    console.log('Learning Hub: Successfully generated content');
                    return parsed as GeneratedContent;

                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    console.warn(`Learning Hub: Attempt ${attempt} failed:`, lastError.message);

                    // Check if it's a 503 error (overloaded)
                    const errorMessage = lastError.message;
                    const is503Error = errorMessage.includes('503') || errorMessage.includes('overloaded');

                    if (is503Error && attempt < maxRetries) {
                        // Wait before retrying (exponential backoff: 2s, 4s, 8s)
                        const waitTime = Math.pow(2, attempt) * 1000;
                        console.log(`Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    } else if (attempt === maxRetries) {
                        // All retries exhausted
                        break;
                    }
                }
            }

            // If we get here, all retries failed
            throw lastError || new Error('Failed to generate learning content');

        } catch (error: unknown) {
            console.error("Learning Hub Generation Error:", error);

            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('unauthorized')) {
                throw new HttpsError(
                    "failed-precondition",
                    "AI service configuration error. Please contact support."
                );
            }

            if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
                throw new HttpsError(
                    "resource-exhausted",
                    "AI service is currently busy. Please try again in a few moments."
                );
            }

            if (errorMessage.includes('JSON')) {
                throw new HttpsError(
                    "internal",
                    "Failed to parse AI response. Please try a shorter or simpler topic."
                );
            }

            throw new HttpsError(
                "internal",
                "Failed to generate learning content. Please try again."
            );
        }
    }
);
