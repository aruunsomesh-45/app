interface NotionProperty {
    type?: string;
    title?: { plain_text: string }[];
    rich_text?: { plain_text: string }[];
    url?: string;
    select?: { name: string };
    multi_select?: { name: string }[];
    number?: number;
    checkbox?: boolean;
}

interface NotionPage {
    id: string;
    properties: Record<string, NotionProperty>;
    created_time?: string;
}

const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const NOTION_DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;
// Use a separate ID if available, otherwise fallback (User might put everything in one DB, but best practice is separate)
const NOTION_TOOLS_DATABASE_ID = import.meta.env.VITE_NOTION_TOOLS_DATABASE_ID || NOTION_DATABASE_ID;
const NOTION_COMMERCIAL_DATABASE_ID = import.meta.env.VITE_NOTION_COMMERCIAL_DATABASE_ID || NOTION_DATABASE_ID;
const NOTION_LEARNING_DATABASE_ID = import.meta.env.VITE_NOTION_LEARNING_DATABASE_ID;
const NOTION_WORKFLOWS_DATABASE_ID = import.meta.env.VITE_NOTION_WORKFLOWS_DATABASE_ID;
const NOTION_AGENTS_DATABASE_ID = import.meta.env.VITE_NOTION_AGENTS_DATABASE_ID;

export const fetchPrompts = async () => {
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.error("Notion API Key or Database ID is missing");
        return [];
    }

    // Warning for potential Page ID vs Database ID confusion
    const idClean = NOTION_DATABASE_ID.replace(/-/g, '');
    if (idClean.length === 32) {
        console.warn("Using ID:", NOTION_DATABASE_ID, "Ensure this is a DATABASE ID, not a PAGE ID. If the URL is notion.so/My-Page-Title-12345..., '12345...' is likely a Page ID unless it's explicitly a full-page database.");
    }

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: 'Prompt Title', // Fixed: Actual property name
                        direction: 'ascending',
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Notion API Error: ${response.status}`);
        }

        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;

            // Helper to get text content safely
            const getText = (prop: NotionProperty) => {
                if (!prop) return '';
                if (prop.type === 'title') return prop.title?.[0]?.plain_text || '';
                if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
                return '';
            };

            const getSelect = (prop: NotionProperty) => prop?.select?.name || 'Uncategorized';
            const content = getText(props['Example Input']);
            // Extract variables like [Topic] or {{Topic}}
            const variables = content ? Array.from(new Set(
                (content.match(/\[(.*?)\]|\{\{(.*?)\}\}/g) || [])
                    .map((v: string) => v.replace(/[[\]{}]/g, ''))
            )) : [];

            return {
                id: page.id,
                title: getText(props['Prompt Title']) || 'Untitled Prompt',
                category: getSelect(props.Category),
                desc: getText(props.Purpose) || 'No description available.',
                content: content || '',
                tags: props.Tags?.multi_select?.map((t: { name: string }) => t.name) || [],
                isFavorite: props.Favorite?.checkbox || false,
                variables
            };
        });
    } catch (error) {
        console.error("Error fetching prompts from Notion:", error);
        throw error;
    }
};

export const fetchTools = async () => {
    if (!NOTION_API_KEY || !NOTION_TOOLS_DATABASE_ID) {
        console.error("Notion API Key or Tools Database ID is missing");
        return [];
    }

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_TOOLS_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: 'Tool Name', // Fixed: Actual property name
                        direction: 'ascending',
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Tools): ${response.status}`, errorText);
            // Return empty array graciously so UI doesn't crash
            return [];
        }

        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => {
                if (!prop) return '';
                if (prop.type === 'title') return prop.title?.[0]?.plain_text || '';
                if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
                if (prop.type === 'url') return prop.url || '';
                return '';
            };
            const getSelect = (prop: NotionProperty) => prop?.select?.name || 'Uncategorized';
            // Simple premium check logic (if 'Subscription' is 'Paid' or 'Enterprise') or a Checkbox
            const getIsPremium = (prop: NotionProperty) => {
                const sub = prop?.select?.name?.toLowerCase();
                return sub === 'paid' || sub === 'enterprise' || sub === 'premium';
            }

            return {
                id: page.id,
                name: getText(props['Tool Name']) || 'Untitled Tool',
                category: getSelect(props.Category),
                desc: getText(props['Description']) || 'AI Tool', // Use Description if present
                link: props['Tool URL']?.url || '#', // Using correct property name
                icon: '', // Notion doesn't easily give direct image URLs for icons unless external. We can check page.icon
                color: 'bg-indigo-500', // Default
                isPremium: getIsPremium(props.Pricing), // Using 'Pricing' instead of 'Subscription'
            };
        });

    } catch (error) {
        console.error("Error fetching tools from Notion:", error);
        return [];
    }
}

export const fetchCommercialPacks = async () => {
    if (!NOTION_API_KEY || !NOTION_COMMERCIAL_DATABASE_ID) {
        console.error("Notion API Key or Commercial Database ID is missing");
        return [];
    }

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_COMMERCIAL_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: 'Pack Name', // Updated to match mapping
                        direction: 'ascending',
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.error(`Notion API Error (Commercial): ${response.status}`);
            return [];
        }

        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => {
                if (!prop) return '';
                if (prop.type === 'title' || prop.type === undefined) return prop.title?.[0]?.plain_text || '';
                if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
                if (prop.type === 'select') return prop.select?.name || '';
                return '';
            };
            const getNumber = (prop: NotionProperty) => prop?.number || 0;

            return {
                id: page.id,
                name: getText(props['Pack Name']) || 'Untitled Pack',
                assets: getNumber(props['Number of Assets']),
                revenuePotential: getText(props['Revenue Potential']) || '$$',
                efficiency: getText(props['Efficiency Gain']) || '+',
            };
        });
    } catch (error) {
        console.error("Error fetching commercial packs:", error);
        return [];
    }
};

export const createPrompt = async (promptData: { title: string, category: string, purpose: string, content: string, tags?: string[] }) => {
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.error("Notion API Key or Database ID is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    'Prompt Title': {
                        title: [
                            {
                                text: {
                                    content: promptData.title,
                                },
                            },
                        ],
                    },
                    'Category': {
                        select: {
                            name: promptData.category,
                        },
                    },
                    'Purpose': {
                        rich_text: [
                            {
                                text: {
                                    content: promptData.purpose,
                                },
                            },
                        ],
                    },
                    'Example Input': { // Storing the actual prompt content here
                        rich_text: [
                            {
                                text: {
                                    content: promptData.content,
                                },
                            },
                        ],
                    },
                    'Tags': {
                        multi_select: (promptData.tags || []).map(tag => ({ name: tag }))
                    },
                    'Favorite': {
                        checkbox: true
                    },
                    'Prompt Body': {
                        rich_text: [
                            {
                                text: {
                                    content: promptData.content,
                                },
                            },
                        ],
                    },
                    'Status': {
                        select: {
                            name: 'Draft'
                        }
                    }
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Create): ${response.status}`, errorText);
            throw new Error(`Failed to create prompt: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating prompt in Notion:", error);
        throw error;
    }
};

export const createTool = async (toolData: { name: string, category: string, link: string, desc: string, pricing: string }) => {
    if (!NOTION_API_KEY || !NOTION_TOOLS_DATABASE_ID) {
        console.error("Notion API Key or Tools Database ID is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_TOOLS_DATABASE_ID },
                properties: {
                    'Tool Name': {
                        title: [
                            {
                                text: {
                                    content: toolData.name,
                                },
                            },
                        ],
                    },
                    'Category': {
                        select: {
                            name: toolData.category,
                        },
                    },
                    'Tool URL': {
                        url: toolData.link,
                    },
                    'Pricing': {
                        select: {
                            name: toolData.pricing,
                        },
                    },
                    'Description': {
                        rich_text: [
                            {
                                text: {
                                    content: toolData.desc,
                                },
                            },
                        ],
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Create Tool): ${response.status}`, errorText);
            throw new Error(`Failed to create tool: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating tool in Notion:", error);
        throw error;
    }
};

export const deleteNotionPage = async (pageId: string) => {
    if (!NOTION_API_KEY) {
        console.error("Notion API Key is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                archived: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Delete): ${response.status}`, errorText);
            throw new Error(`Failed to delete item: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Error deleting item in Notion:", error);
        throw error;
    }
};

// Explicit aliases for clarity
export const deletePrompt = deleteNotionPage;
export const deleteTool = deleteNotionPage;
export const deleteCommercialPack = deleteNotionPage;

export const createLearning = async (learningData: { title: string, url?: string, type: string, summary: string, notes: string }) => {
    if (!NOTION_API_KEY || !NOTION_LEARNING_DATABASE_ID) {
        console.error("Notion API Key or Learning Database ID is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_LEARNING_DATABASE_ID },
                properties: {
                    'Title': { title: [{ text: { content: learningData.title } }] },
                    'URL': { url: learningData.url || null },
                    'Type': { select: { name: learningData.type } },
                    'Quick Summary': { rich_text: [{ text: { content: learningData.summary } }] },
                    'Deep Notes': { rich_text: [{ text: { content: learningData.notes } }] },
                    'Status': { select: { name: 'Completed' } }
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Create Learning): ${response.status}`, errorText);
            throw new Error(`Failed to create learning item: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating learning item in Notion:", error);
        throw error;
    }
};

export const createWorkflow = async (workflowData: { name: string, steps: string, goal: string, frequency: string }) => {
    if (!NOTION_API_KEY || !NOTION_WORKFLOWS_DATABASE_ID) {
        console.error("Notion API Key or Workflows Database ID is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_WORKFLOWS_DATABASE_ID },
                properties: {
                    'Name': { title: [{ text: { content: workflowData.name } }] },
                    'Steps': { rich_text: [{ text: { content: workflowData.steps } }] },
                    'Goal': { rich_text: [{ text: { content: workflowData.goal.substring(0, 2000) } }] }, // Notion limit
                    'Frequency': { select: { name: workflowData.frequency } },
                    'Status': { select: { name: 'Draft' } }
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Create Workflow): ${response.status}`, errorText);
            throw new Error(`Failed to create workflow: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating workflow in Notion:", error);
        throw error;
    }
};

export const createAgent = async (agentData: { name: string, role: string, instructions: string, objective: string }) => {
    if (!NOTION_API_KEY || !NOTION_AGENTS_DATABASE_ID) {
        console.error("Notion API Key or Agents Database ID is missing");
        throw new Error("Configuration Error");
    }

    try {
        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_AGENTS_DATABASE_ID },
                properties: {
                    'Name': { title: [{ text: { content: agentData.name } }] },
                    'Role': { rich_text: [{ text: { content: agentData.role.substring(0, 2000) } }] },
                    'System Instructions': { rich_text: [{ text: { content: agentData.instructions.substring(0, 2000) } }] },
                    'Objective': { rich_text: [{ text: { content: agentData.objective.substring(0, 2000) } }] },
                    'Status': { select: { name: 'Active' } }
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Notion API Error (Create Agent): ${response.status}`, errorText);
            throw new Error(`Failed to create agent: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating agent in Notion:", error);
        throw error;
    }
};

export const fetchLearning = async () => {
    if (!NOTION_API_KEY || !NOTION_LEARNING_DATABASE_ID) {
        console.error("Notion API Key or Learning Database ID is missing");
        return [];
    }

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_LEARNING_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [{ property: 'Title', direction: 'ascending' }],
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => prop?.rich_text?.[0]?.plain_text || prop?.title?.[0]?.plain_text || '';
            return {
                id: page.id,
                title: getText(props.Title),
                url: props.URL?.url || '',
                type: props.Type?.select?.name || 'Video',
                summary: getText(props['Quick Summary']),
                notes: getText(props['Deep Notes']),
                status: props.Status?.select?.name || 'Pending',
            };
        });
    } catch (error) {
        console.error("Error fetching learning items:", error);
        return [];
    }
};

export const fetchWorkflows = async () => {
    if (!NOTION_API_KEY || !NOTION_WORKFLOWS_DATABASE_ID) return [];

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_WORKFLOWS_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [{ property: 'Name', direction: 'ascending' }],
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => prop?.rich_text?.[0]?.plain_text || prop?.title?.[0]?.plain_text || '';
            return {
                id: page.id,
                name: getText(props.Name),
                steps: getText(props.Steps),
                goal: getText(props.Goal),
                frequency: props.Frequency?.select?.name || 'Ad-hoc',
                status: props.Status?.select?.name || 'Draft',
            };
        });
    } catch (error) {
        console.error("Error fetching workflows:", error);
        return [];
    }
};

export const fetchAgents = async () => {
    if (!NOTION_API_KEY || !NOTION_AGENTS_DATABASE_ID) return [];

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_AGENTS_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sorts: [{ property: 'Name', direction: 'ascending' }],
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => prop?.rich_text?.[0]?.plain_text || prop?.title?.[0]?.plain_text || '';
            return {
                id: page.id,
                name: getText(props.Name),
                role: getText(props.Role),
                instructions: getText(props['System Instructions']),
                objective: getText(props.Objective),
                status: props.Status?.select?.name || 'Inactive',
            };
        });
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
};

// ============================================================
// YOUTUBE VIDEO SAVING
// ============================================================

export interface YouTubeVideoPayload {
    title: string;
    originalUrl: string;
    videoId: string;
    thumbnailUrl: string;
    iframeCode: string;
    embedUrl: string;
    channelName?: string;
    summary?: string;
    notes?: string;
    tags?: string[];
}

/**
 * Saves a YouTube video to the Learning Hub database in Notion
 * Includes the iFrame embed code, thumbnail, and video metadata
 */
export const saveYouTubeVideo = async (videoData: YouTubeVideoPayload): Promise<{ id: string }> => {
    if (!NOTION_API_KEY || !NOTION_LEARNING_DATABASE_ID) {
        console.error("[NotionService] Notion API Key or Learning Database ID is missing");
        throw new Error("Configuration Error: Missing Notion credentials");
    }

    // Validate required fields
    if (!videoData.title || !videoData.originalUrl || !videoData.videoId) {
        throw new Error("Missing required fields: title, originalUrl, or videoId");
    }

    console.log("[NotionService] Saving YouTube video to Notion:", {
        title: videoData.title,
        videoId: videoData.videoId,
    });

    try {
        // Build the content with iFrame embed
        const contentWithEmbed = `
## Video Embed
${videoData.iframeCode}

## Video Details
- **Channel**: ${videoData.channelName || 'Unknown'}
- **Video ID**: ${videoData.videoId}
- **Direct Link**: ${videoData.originalUrl}

## Notes
${videoData.notes || 'No notes added yet.'}

## Summary
${videoData.summary || 'No summary available.'}
`.trim();

        const response = await fetch(`/api/notion/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_LEARNING_DATABASE_ID },
                // Page cover using the thumbnail
                cover: {
                    type: 'external',
                    external: {
                        url: videoData.thumbnailUrl
                    }
                },
                // Page icon as YouTube emoji
                icon: {
                    type: 'emoji',
                    emoji: '🎬'
                },
                properties: {
                    'Title': {
                        title: [{ text: { content: videoData.title } }]
                    },
                    'URL': {
                        url: videoData.originalUrl
                    },
                    'Type': {
                        select: { name: 'Video' }
                    },
                    'Quick Summary': {
                        rich_text: [{
                            text: {
                                content: (videoData.summary || `YouTube video: ${videoData.title}`).substring(0, 2000)
                            }
                        }]
                    },
                    'Deep Notes': {
                        rich_text: [{
                            text: {
                                content: contentWithEmbed.substring(0, 2000) // Notion rich_text limit
                            }
                        }]
                    },
                    'Status': {
                        select: { name: 'To Watch' }
                    }
                },
                // Add children blocks with the embed
                children: [
                    // Thumbnail image block
                    {
                        object: 'block',
                        type: 'image',
                        image: {
                            type: 'external',
                            external: {
                                url: videoData.thumbnailUrl
                            }
                        }
                    },
                    // Video embed block
                    {
                        object: 'block',
                        type: 'video',
                        video: {
                            type: 'external',
                            external: {
                                url: videoData.embedUrl
                            }
                        }
                    },
                    // Divider
                    {
                        object: 'block',
                        type: 'divider',
                        divider: {}
                    },
                    // Channel info
                    {
                        object: 'block',
                        type: 'callout',
                        callout: {
                            rich_text: [{
                                type: 'text',
                                text: {
                                    content: `Channel: ${videoData.channelName || 'Unknown'} | Video ID: ${videoData.videoId}`
                                }
                            }],
                            icon: { type: 'emoji', emoji: '📺' },
                            color: 'red_background'
                        }
                    },
                    // Notes heading
                    {
                        object: 'block',
                        type: 'heading_2',
                        heading_2: {
                            rich_text: [{ type: 'text', text: { content: '📝 Notes' } }]
                        }
                    },
                    // Notes content
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{
                                type: 'text',
                                text: { content: videoData.notes || 'Add your notes here...' }
                            }]
                        }
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[NotionService] Notion API Error (Save YouTube): ${response.status}`, errorText);
            throw new Error(`Failed to save YouTube video: ${response.status}`);
        }

        const result = await response.json();
        console.log("[NotionService] ✅ YouTube video saved successfully:", result.id);
        return result;
    } catch (error) {
        console.error("[NotionService] Error saving YouTube video to Notion:", error);
        throw error;
    }
};

/**
 * Fetches YouTube videos from the Learning Hub (filtered by Type = Video)
 */
export const fetchYouTubeVideos = async () => {
    if (!NOTION_API_KEY || !NOTION_LEARNING_DATABASE_ID) {
        console.error("Notion API Key or Learning Database ID is missing");
        return [];
    }

    try {
        const response = await fetch(`/api/notion/v1/databases/${NOTION_LEARNING_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    property: 'Type',
                    select: { equals: 'Video' }
                },
                sorts: [{ timestamp: 'created_time', direction: 'descending' }],
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return data.results.map((page: NotionPage) => {
            const props = page.properties;
            const getText = (prop: NotionProperty) => prop?.rich_text?.[0]?.plain_text || prop?.title?.[0]?.plain_text || '';

            // Extract video ID from URL if available
            const url = props.URL?.url || '';
            let videoId = '';
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^#&?]{11})/);
            if (match) videoId = match[1];

            return {
                id: page.id,
                title: getText(props.Title),
                url,
                videoId,
                thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '',
                summary: getText(props['Quick Summary']),
                notes: getText(props['Deep Notes']),
                status: props.Status?.select?.name || 'To Watch',
                createdAt: page.created_time,
            };
        });
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
};

export default {
    fetchPrompts,
    fetchTools,
    createPrompt,
    createTool,
    fetchCommercialPacks,
    deleteNotionPage,
    deletePrompt,
    deleteTool,
    deleteCommercialPack,
    fetchLearning,
    fetchWorkflows,
    fetchAgents,
    createLearning,
    createWorkflow,
    createAgent,
    saveYouTubeVideo,
    fetchYouTubeVideos
};

