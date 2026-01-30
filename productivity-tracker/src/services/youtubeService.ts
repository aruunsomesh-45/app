/**
 * YouTube Service
 * Handles YouTube URL parsing, video ID extraction, thumbnail generation, and iFrame embed creation
 */

export interface YouTubeVideoData {
    originalUrl: string;
    videoId: string;
    thumbnailUrl: string;
    thumbnailUrlHQ: string;      // High quality thumbnail
    thumbnailUrlMaxRes: string;  // Max resolution (may not exist for all videos)
    iframeCode: string;
    embedUrl: string;
    title?: string;              // Optional - populated if we fetch oEmbed data
    channelName?: string;        // Optional - populated if we fetch oEmbed data
}

interface YouTubeSearchItem {
    id: { videoId: string };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            high?: { url: string };
            default?: { url: string };
            maxres?: { url: string };
        };
    };
}

/**
 * Extracts the YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') {
        console.warn('[YouTubeService] Invalid URL provided');
        return null;
    }

    // Clean and trim the URL
    const cleanUrl = url.trim();

    // Multiple regex patterns to catch different YouTube URL formats
    const patterns = [
        // Standard watch URL: youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^#&?]{11})/,
        // Short URL: youtu.be/VIDEO_ID
        /(?:youtu\.be\/)([^#&?]{11})/,
        // Embed URL: youtube.com/embed/VIDEO_ID
        /(?:youtube\.com\/embed\/)([^#&?]{11})/,
        // Old embed: youtube.com/v/VIDEO_ID
        /(?:youtube\.com\/v\/)([^#&?]{11})/,
        // Shorts: youtube.com/shorts/VIDEO_ID
        /(?:youtube\.com\/shorts\/)([^#&?]{11})/,
        // Live: youtube.com/live/VIDEO_ID
        /(?:youtube\.com\/live\/)([^#&?]{11})/,
    ];

    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            console.log(`[YouTubeService] Extracted video ID: ${match[1]}`);
            return match[1];
        }
    }

    console.warn('[YouTubeService] Could not extract video ID from URL:', cleanUrl);
    return null;
}

/**
 * Validates if a string is a valid YouTube video ID (11 characters, alphanumeric + _ -)
 */
export function isValidVideoId(videoId: string): boolean {
    if (!videoId || typeof videoId !== 'string') return false;
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Generates thumbnail URLs for a YouTube video
 * YouTube provides multiple quality options:
 * - default.jpg (120x90)
 * - mqdefault.jpg (320x180)
 * - hqdefault.jpg (480x360)
 * - sddefault.jpg (640x480) - may not exist
 * - maxresdefault.jpg (1280x720) - may not exist for all videos
 */
export function generateThumbnailUrls(videoId: string) {
    if (!isValidVideoId(videoId)) {
        console.warn('[YouTubeService] Invalid video ID for thumbnail generation');
        return null;
    }

    const baseUrl = `https://img.youtube.com/vi/${videoId}`;

    return {
        default: `${baseUrl}/default.jpg`,
        medium: `${baseUrl}/mqdefault.jpg`,
        high: `${baseUrl}/hqdefault.jpg`,
        standard: `${baseUrl}/sddefault.jpg`,
        maxRes: `${baseUrl}/maxresdefault.jpg`,
    };
}

/**
 * Generates the iFrame embed code for a YouTube video
 */
export function generateIframeCode(videoId: string, options?: {
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
    allowFullscreen?: boolean;
    title?: string;
}): string {
    if (!isValidVideoId(videoId)) {
        console.warn('[YouTubeService] Invalid video ID for iframe generation');
        return '';
    }

    const {
        width = 560,
        height = 315,
        autoplay = false,
        muted = false,
        controls = true,
        allowFullscreen = true,
        title = 'YouTube video player'
    } = options || {};

    // Build URL parameters
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (muted) params.append('mute', '1');
    if (!controls) params.append('controls', '0');
    params.append('rel', '0'); // Don't show related videos from other channels

    const embedUrl = `https://www.youtube.com/embed/${videoId}${params.toString() ? '?' + params.toString() : ''}`;

    const iframe = `<iframe 
    width="${width}" 
    height="${height}" 
    src="${embedUrl}" 
    title="${title}" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    ${allowFullscreen ? 'allowfullscreen' : ''}
></iframe>`;

    return iframe.replace(/\s+/g, ' ').trim();
}

/**
 * Fetches video metadata using YouTube's oEmbed API (no API key required)
 */
export async function fetchVideoMetadata(url: string): Promise<{ title: string; channelName: string } | null> {
    try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oEmbedUrl);

        if (!response.ok) {
            console.warn('[YouTubeService] Could not fetch oEmbed data:', response.status);
            return null;
        }

        const data = await response.json();
        return {
            title: data.title || 'Untitled Video',
            channelName: data.author_name || 'Unknown Channel',
        };
    } catch (error) {
        console.error('[YouTubeService] Error fetching video metadata:', error);
        return null;
    }
}

/**
 * Main function: Processes a YouTube URL and returns all data needed for saving
 */
export async function processYouTubeUrl(url: string, fetchMetadata: boolean = true): Promise<YouTubeVideoData | null> {
    // Extract video ID
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        console.error('[YouTubeService] Failed to extract video ID from URL');
        return null;
    }

    // Generate thumbnails
    const thumbnails = generateThumbnailUrls(videoId);
    if (!thumbnails) {
        console.error('[YouTubeService] Failed to generate thumbnail URLs');
        return null;
    }

    // Generate iFrame
    const iframeCode = generateIframeCode(videoId);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    // Create base data object
    const videoData: YouTubeVideoData = {
        originalUrl: url,
        videoId,
        thumbnailUrl: thumbnails.high,
        thumbnailUrlHQ: thumbnails.high,
        thumbnailUrlMaxRes: thumbnails.maxRes,
        iframeCode,
        embedUrl,
    };

    // Optionally fetch metadata (title, channel name)
    if (fetchMetadata) {
        const metadata = await fetchVideoMetadata(url);
        if (metadata) {
            videoData.title = metadata.title;
            videoData.channelName = metadata.channelName;
        }
    }

    console.log('[YouTubeService] Successfully processed YouTube URL:', {
        videoId,
        title: videoData.title,
        thumbnailUrl: videoData.thumbnailUrl,
    });

    return videoData;
}

/**
 * Validates the YouTube API Key by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
        return { valid: false, message: 'API Key is missing or using placeholder.' };
    }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=${apiKey}`);
        if (response.ok) {
            return { valid: true, message: 'YouTube API Key is valid!' };
        } else {
            const error = await response.json();
            return { valid: false, message: `Invalid API Key: ${error.error?.message || 'Unknown error'}` };
        }
    } catch (error) {
        console.error('YouTube API validation error:', error);
        return { valid: false, message: 'Connection error while validating API Key.' };
    }
}

/**
 * Searches for videos using the YouTube Data API
 */
export async function searchVideos(query: string, apiKey: string, maxResults: number = 5): Promise<YouTubeVideoData[]> {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error('[YouTubeService] Search failed:', await response.text());
            return [];
        }

        const data = await response.json();
        const videos: YouTubeVideoData[] = data.items.map((item: YouTubeSearchItem) => ({
            originalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            videoId: item.id.videoId,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            thumbnailUrlHQ: item.snippet.thumbnails.high?.url,
            thumbnailUrlMaxRes: item.snippet.thumbnails.maxres?.url,
            iframeCode: generateIframeCode(item.id.videoId),
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
            title: item.snippet.title,
            channelName: item.snippet.channelTitle
        }));

        return videos;
    } catch (error) {
        console.error('[YouTubeService] Error searching videos:', error);
        return [];
    }
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeVideoId(url) !== null;
}

export default {
    extractYouTubeVideoId,
    isValidVideoId,
    generateThumbnailUrls,
    generateIframeCode,
    fetchVideoMetadata,
    processYouTubeUrl,
    isValidYouTubeUrl,
    validateApiKey,
    searchVideos,
};
