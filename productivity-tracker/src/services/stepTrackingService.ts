/**
 * Step Tracking Service
 * 
 * Automatically tracks steps using device motion sensors (accelerometer).
 * No manual input required - runs passively in the background.
 */

export interface StepData {
    date: string; // ISO date string (YYYY-MM-DD)
    steps: number;
    distance: number; // in meters
    calories: number;
    lastUpdated: string; // ISO timestamp
}

export interface StepTrackingState {
    isTracking: boolean;
    permissionGranted: boolean;
    todaySteps: number;
    todayDistance: number;
    todayCalories: number;
    history: StepData[];
}

// Constants for step detection algorithm
const STEP_THRESHOLD = 1.2; // Acceleration threshold to detect a step (g-force)
const STEP_COOLDOWN_MS = 250; // Minimum time between steps (prevents double-counting)
const AVERAGE_STRIDE_LENGTH_M = 0.762; // Average stride length in meters
const CALORIES_PER_STEP = 0.04; // Average calories burned per step

class StepTrackingService {
    private isTracking: boolean = false;
    private stepCount: number = 0;
    private lastStepTime: number = 0;
    private lastAcceleration: number = 0;
    private listeners: Set<(state: StepTrackingState) => void> = new Set();
    private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;

    constructor() {
        this.loadTodayData();
        this.setupDailyReset();
    }

    /**
     * Get the current date as ISO string (YYYY-MM-DD)
     */
    private getTodayKey(): string {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Load today's step data from localStorage
     */
    private loadTodayData(): void {
        const todayKey = this.getTodayKey();
        const stored = localStorage.getItem(`steps_${todayKey}`);

        if (stored) {
            const data: StepData = JSON.parse(stored);
            this.stepCount = data.steps;
        } else {
            this.stepCount = 0;
        }
    }

    /**
     * Save current step data to localStorage
     */
    private saveData(): void {
        const todayKey = this.getTodayKey();
        const data: StepData = {
            date: todayKey,
            steps: this.stepCount,
            distance: this.stepCount * AVERAGE_STRIDE_LENGTH_M,
            calories: Math.round(this.stepCount * CALORIES_PER_STEP),
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(`steps_${todayKey}`, JSON.stringify(data));
        this.updateHistory(data);
        this.notifyListeners();
    }

    /**
     * Update step history (last 30 days)
     */
    private updateHistory(todayData: StepData): void {
        const historyKey = 'step_history';
        const stored = localStorage.getItem(historyKey);
        let history: StepData[] = stored ? JSON.parse(stored) : [];

        // Update or add today's entry
        const existingIndex = history.findIndex(h => h.date === todayData.date);
        if (existingIndex >= 0) {
            history[existingIndex] = todayData;
        } else {
            history.push(todayData);
        }

        // Keep only last 30 days
        history = history
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 30);

        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    /**
     * Setup daily reset at midnight
     */
    private setupDailyReset(): void {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            this.stepCount = 0;
            this.saveData();
            this.setupDailyReset(); // Setup next day's reset
        }, msUntilMidnight);
    }

    /**
     * Check if device motion is supported
     */
    public isSupported(): boolean {
        return 'DeviceMotionEvent' in window;
    }

    /**
     * Request permission for motion sensors (required on iOS 13+)
     */
    public async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('DeviceMotion not supported on this device');
            return false;
        }

        // iOS 13+ requires explicit permission
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const permission = await (DeviceMotionEvent as any).requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Error requesting motion permission:', error);
                return false;
            }
        }

        // Android and other platforms don't require explicit permission
        return true;
    }

    /**
     * Process accelerometer data to detect steps
     */
    private processMotionEvent = (event: DeviceMotionEvent): void => {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration || acceleration.x === null || acceleration.y === null || acceleration.z === null) return;

        const now = Date.now();

        // Calculate total acceleration magnitude
        const totalAcceleration = Math.sqrt(
            acceleration.x ** 2 +
            acceleration.y ** 2 +
            acceleration.z ** 2
        ) / 9.81; // Normalize to g-force

        // Step detection algorithm:
        // 1. Check if acceleration crosses threshold (peak detection)
        // 2. Ensure minimum time between steps (cooldown)
        // 3. Detect rising edge (going above threshold)

        const isAboveThreshold = totalAcceleration > STEP_THRESHOLD;
        const wasAboveThreshold = this.lastAcceleration > STEP_THRESHOLD;
        const cooldownPassed = (now - this.lastStepTime) > STEP_COOLDOWN_MS;

        // Detect step on rising edge (transition from below to above threshold)
        if (isAboveThreshold && !wasAboveThreshold && cooldownPassed) {
            this.stepCount++;
            this.lastStepTime = now;

            // Save every 10 steps to reduce write frequency
            if (this.stepCount % 10 === 0) {
                this.saveData();
            }
        }

        this.lastAcceleration = totalAcceleration;
    };

    /**
     * Start tracking steps
     */
    public async startTracking(): Promise<boolean> {
        if (this.isTracking) return true;

        const hasPermission = await this.requestPermission();
        if (!hasPermission) return false;

        this.motionHandler = this.processMotionEvent.bind(this);
        window.addEventListener('devicemotion', this.motionHandler);
        this.isTracking = true;
        this.notifyListeners();

        console.log('Step tracking started');
        return true;
    }

    /**
     * Stop tracking steps
     */
    public stopTracking(): void {
        if (!this.isTracking || !this.motionHandler) return;

        window.removeEventListener('devicemotion', this.motionHandler);
        this.motionHandler = null;
        this.isTracking = false;
        this.saveData(); // Save final count
        this.notifyListeners();

        console.log('Step tracking stopped');
    }

    /**
     * Get current state
     */
    public getState(): StepTrackingState {
        const historyStr = localStorage.getItem('step_history');
        const history: StepData[] = historyStr ? JSON.parse(historyStr) : [];

        return {
            isTracking: this.isTracking,
            permissionGranted: this.isTracking,
            todaySteps: this.stepCount,
            todayDistance: Math.round(this.stepCount * AVERAGE_STRIDE_LENGTH_M),
            todayCalories: Math.round(this.stepCount * CALORIES_PER_STEP),
            history
        };
    }

    /**
     * Manually add steps (for testing or manual entry fallback)
     */
    public addSteps(count: number): void {
        this.stepCount += count;
        this.saveData();
    }

    /**
     * Get steps for a specific date
     */
    public getStepsForDate(date: string): StepData | null {
        const stored = localStorage.getItem(`steps_${date}`);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Subscribe to state changes
     */
    public subscribe(listener: (state: StepTrackingState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        const state = this.getState();
        this.listeners.forEach(listener => listener(state));
    }

    /**
     * Get weekly summary
     */
    public getWeeklySummary(): { totalSteps: number; avgSteps: number; totalDistance: number; totalCalories: number } {
        const history = this.getState().history;
        const lastWeek = history.slice(0, 7);

        const totalSteps = lastWeek.reduce((sum, day) => sum + day.steps, 0);
        const totalDistance = lastWeek.reduce((sum, day) => sum + day.distance, 0);
        const totalCalories = lastWeek.reduce((sum, day) => sum + day.calories, 0);

        return {
            totalSteps,
            avgSteps: Math.round(totalSteps / Math.max(lastWeek.length, 1)),
            totalDistance: Math.round(totalDistance),
            totalCalories: Math.round(totalCalories)
        };
    }
}

// Singleton instance
export const stepTrackingService = new StepTrackingService();
export default stepTrackingService;
