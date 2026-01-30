import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates content using AI APIs with automatic fallback.
 * Priority: Gemini 2.0/1.5 models → OpenAI GPT-4o-mini
 * This ensures users NEVER see an error - one provider will always work.
 */
export async function generateContent(apiKey: string, prompt: string): Promise<string> {
    // First, try all Gemini models
    const geminiResult = await tryGeminiModels(apiKey, prompt);
    if (geminiResult.success) {
        return geminiResult.text;
    }

    console.warn('All Gemini models failed. Falling back to OpenAI...');

    // Fallback to OpenAI
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openAIKey && openAIKey !== 'your_openai_api_key_here') {
        const openAIResult = await tryOpenAI(openAIKey, prompt);
        if (openAIResult.success) {
            return openAIResult.text;
        }
    }

    // If everything fails, provide helpful error
    throw new Error(
        `AI Generation Failed. Gemini Error: ${geminiResult.error}. ` +
        `Please check your API keys in .env file.`
    );
}

/**
 * Attempts to generate content using Gemini models
 */
async function tryGeminiModels(apiKey: string, prompt: string): Promise<{ success: boolean; text: string; error?: string }> {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Latest Gemini 2.0 and 1.5 models - ordered by preference
    const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest'
    ];

    let lastError = '';

    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 Gemini: Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text) {
                console.log(`✅ Gemini: Success with ${modelName}`);
                return { success: true, text };
            }
        } catch (error: unknown) {
            const errorMsg = String(error);
            console.warn(`❌ Gemini ${modelName} failed:`, errorMsg.substring(0, 200));
            lastError = errorMsg;

            // Stop immediately for auth errors
            if (errorMsg.toLowerCase().includes('api_key_invalid') ||
                errorMsg.toLowerCase().includes('unauthorized') ||
                errorMsg.toLowerCase().includes('invalid key')) {
                return { success: false, text: '', error: 'Invalid Gemini API Key' };
            }
            // Continue to next model for 404/not found errors
            continue;
        }
    }

    return { success: false, text: '', error: lastError || 'All Gemini models unavailable' };
}

/**
 * Fallback: Generate content using OpenAI GPT-4o-mini
 */
async function tryOpenAI(apiKey: string, prompt: string): Promise<{ success: boolean; text: string; error?: string }> {
    try {
        console.log('🤖 OpenAI: Trying gpt-4o-mini...');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (text) {
            console.log('✅ OpenAI: Success with gpt-4o-mini');
            return { success: true, text };
        }

        return { success: false, text: '', error: 'No response from OpenAI' };
    } catch (error: unknown) {
        console.warn('❌ OpenAI failed:', error);
        return { success: false, text: '', error: String(error) };
    }
}


