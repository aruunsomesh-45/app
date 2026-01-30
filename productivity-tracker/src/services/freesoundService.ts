
const FREESOUND_API_KEY = import.meta.env.VITE_FREESOUND_API_KEY;
const BASE_URL = 'https://freesound.org/apiv2';

export interface FreesoundResult {
    id: number;
    name: string;
    previews: {
        'preview-lq-mp3': string;
        'preview-hq-mp3': string;
    };
    duration: number;
    description: string;
}

class FreesoundService {
    async searchSounds(query: string, limit: number = 5): Promise<FreesoundResult[]> {
        if (!FREESOUND_API_KEY || FREESOUND_API_KEY === 'your_freesound_api_key_here') {
            console.warn('Freesound API key not configured');
            return [];
        }

        try {
            const response = await fetch(
                `${BASE_URL}/search/text/?query=${query}&token=${FREESOUND_API_KEY}&fields=id,name,previews,duration,description&page_size=${limit}`
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching sounds from Freesound:', error);
            return [];
        }
    }

    async getSoundDetails(id: number): Promise<FreesoundResult | null> {
        if (!FREESOUND_API_KEY || FREESOUND_API_KEY === 'your_freesound_api_key_here') return null;

        try {
            const response = await fetch(
                `${BASE_URL}/sounds/${id}/?token=${FREESOUND_API_KEY}&fields=id,name,previews,duration,description`
            );
            return await response.json();
        } catch (error) {
            console.error(`Error fetching sound ${id} from Freesound:`, error);
            return null;
        }
    }
}

export default new FreesoundService();
