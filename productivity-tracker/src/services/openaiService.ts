/**
 * OpenAI Service
 * Handles communication with OpenAI's API using the provided API key.
 */

export interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export async function generateOpenAIContent(prompt: string, model: string = "gpt-4o") {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.");
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant helping with productivity workflows, brainstorming, and design. Return clean, structured data."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "OpenAI API request failed");
        }

        const data: OpenAIResponse = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Service Error:", error);
        throw error;
    }
}
