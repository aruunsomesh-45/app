export interface CustomCategory {
    id: string;
    title: string;
    subtitle: string;
    img: string;
    type: 'workout' | 'links' | 'checklist';
    workouts?: any[];
    items?: any[];
}
