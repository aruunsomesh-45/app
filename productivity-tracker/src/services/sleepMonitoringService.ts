/**
 * Sleep Monitoring Service
 * 
 * Tracks sleep duration based on user-defined sleep and wake times.
 * Time-based tracking - no continuous sensor monitoring required.
 */

export interface SleepSchedule {
    sleepTime: string; // HH:MM format (24-hour)
    wakeTime: string; // HH:MM format (24-hour)
    enabled: boolean;
    bedReminder: boolean;
    wakeUpAlarm: boolean;
}

export interface SleepRecord {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD) - the date of waking up
    sleepStartTime: string; // ISO timestamp
    wakeEndTime: string; // ISO timestamp
    durationMinutes: number;
    durationHours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    isAutoTracked: boolean;
}

export interface SleepStats {
    averageDuration: number; // in hours
    totalNights: number;
    qualityBreakdown: { poor: number; fair: number; good: number; excellent: number };
    weeklyData: { date: string; hours: number }[];
    streak: number; // consecutive nights on schedule
}

export interface SleepMonitoringState {
    schedule: SleepSchedule;
    isMonitoring: boolean;
    isSleeping: boolean;
    currentSleepStart: string | null;
    todayRecord: SleepRecord | null;
    history: SleepRecord[];
    stats: SleepStats;
}

// Constants
const MIN_SLEEP_HOURS = 3; // Minimum valid sleep duration
const MAX_SLEEP_HOURS = 14; // Maximum valid sleep duration
const STORAGE_KEYS = {
    SCHEDULE: 'sleep_schedule',
    HISTORY: 'sleep_history',
    CURRENT_SESSION: 'sleep_current_session'
};

class SleepMonitoringService {
    private schedule: SleepSchedule;
    private isMonitoring: boolean = false;
    private isSleeping: boolean = false;
    private currentSleepStart: string | null = null;
    private checkInterval: any = null;
    private listeners: Set<(state: SleepMonitoringState) => void> = new Set();

    constructor() {
        this.schedule = this.loadSchedule();
        this.loadCurrentSession();
        this.startMonitoring();
    }

    /**
     * Load saved schedule from localStorage
     */
    private loadSchedule(): SleepSchedule {
        const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Ensure new fields exist for migrated data
            return {
                ...parsed,
                bedReminder: parsed.bedReminder ?? true,
                wakeUpAlarm: parsed.wakeUpAlarm ?? true
            };
        }
        // Default schedule
        return {
            sleepTime: '23:00',
            wakeTime: '07:00',
            enabled: true,
            bedReminder: true,
            wakeUpAlarm: true
        };
    }

    /**
     * Save schedule to localStorage
     */
    private saveSchedule(): void {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(this.schedule));
    }

    /**
     * Load any ongoing sleep session
     */
    private loadCurrentSession(): void {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        if (stored) {
            const session = JSON.parse(stored);
            this.isSleeping = session.isSleeping;
            this.currentSleepStart = session.sleepStart;
        }
    }

    /**
     * Save current session state
     */
    private saveCurrentSession(): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
            isSleeping: this.isSleeping,
            sleepStart: this.currentSleepStart
        }));
    }



    /**
     * Calculate sleep duration between two timestamps
     */
    private calculateDuration(startTime: string, endTime: string): { minutes: number; hours: number } {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end.getTime() - start.getTime();
        const minutes = Math.round(diffMs / (1000 * 60));
        const hours = parseFloat((minutes / 60).toFixed(2));

        return { minutes, hours };
    }

    /**
     * Determine sleep quality based on duration
     */
    private calculateQuality(durationHours: number): 'poor' | 'fair' | 'good' | 'excellent' {
        if (durationHours < 5) return 'poor';
        if (durationHours < 6.5) return 'fair';
        if (durationHours < 8) return 'good';
        return 'excellent';
    }

    /**
     * Check if current time matches sleep/wake schedule
     */
    private checkSchedule = (): void => {
        if (!this.schedule.enabled) return;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

        // Bedtime Reminder (30 mins before)
        if (this.schedule.bedReminder) {
            const [sleepH, sleepM] = this.schedule.sleepTime.split(':').map(Number);
            const sleepDate = new Date();
            sleepDate.setHours(sleepH, sleepM, 0, 0);

            // Handle day crossing for sleep time (e.g. 01:00 means next day if now is 23:00) 
            // Simplified: just check if now + 30m == sleepTime
            // or better: calculate 30 mins before sleepTime and compare with currentTime

            let reminderDate = new Date(sleepDate.getTime() - 30 * 60000);
            const reminderTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;

            if (currentTime === reminderTime) {
                this.triggerNotification("Time to wind down 🌙", "Your scheduled bedtime is in 30 minutes.");
            }
        }

        // Wake Up Alarm
        if (this.schedule.wakeUpAlarm && currentTime === this.schedule.wakeTime) {
            this.triggerNotification("Good Morning! ☀️", "It's time to wake up and start your day.");
        }

        // Auto-start sleep if schedule dictates (optional, keeping existing logic concept but ensuring it matches exact time)
        if (currentTime === this.schedule.sleepTime && !this.isSleeping) {
            // We might want to just notify instead of auto-starting, or both. 
            // For now, let's keep auto-start as it mimics "tracking mod"
            if (this.schedule.enabled) {
                this.startSleepSession();
            }
        }

        // Auto-end sleep
        if (currentTime === this.schedule.wakeTime && this.isSleeping) {
            this.endSleepSession();
        }
    };

    private triggerNotification(title: string, body: string) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body });
                }
            });
        }
    }

    /**
     * Start monitoring the schedule
     */
    public startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        // Check every minute
        this.checkInterval = setInterval(this.checkSchedule, 60000);
        this.checkSchedule(); // Check immediately
        this.notifyListeners();

        console.log('Sleep monitoring started');
    }

    /**
     * Stop monitoring
     */
    public stopMonitoring(): void {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.notifyListeners();

        console.log('Sleep monitoring stopped');
    }

    /**
     * Start a sleep session (can be called manually or automatically)
     */
    public startSleepSession(): void {
        if (this.isSleeping) return;

        this.isSleeping = true;
        this.currentSleepStart = new Date().toISOString();
        this.saveCurrentSession();
        this.notifyListeners();

        console.log('Sleep session started at:', this.currentSleepStart);
    }

    /**
     * End sleep session and record the data
     */
    public endSleepSession(): SleepRecord | null {
        if (!this.isSleeping || !this.currentSleepStart) return null;

        const wakeTime = new Date().toISOString();
        const { minutes, hours } = this.calculateDuration(this.currentSleepStart, wakeTime);

        // Validate sleep duration
        if (hours < MIN_SLEEP_HOURS || hours > MAX_SLEEP_HOURS) {
            console.warn(`Invalid sleep duration: ${hours} hours. Discarding record.`);
            this.resetSession();
            return null;
        }

        const record: SleepRecord = {
            id: `sleep_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            sleepStartTime: this.currentSleepStart,
            wakeEndTime: wakeTime,
            durationMinutes: minutes,
            durationHours: hours,
            quality: this.calculateQuality(hours),
            isAutoTracked: true
        };

        this.saveSleepRecord(record);
        this.resetSession();

        console.log('Sleep session ended. Duration:', hours, 'hours');
        return record;
    }

    /**
     * Reset current session
     */
    private resetSession(): void {
        this.isSleeping = false;
        this.currentSleepStart = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        this.notifyListeners();
    }

    /**
     * Save a sleep record to history
     */
    private saveSleepRecord(record: SleepRecord): void {
        const history = this.getHistory();

        // Replace if record for same date exists
        const existingIndex = history.findIndex(r => r.date === record.date);
        if (existingIndex >= 0) {
            history[existingIndex] = record;
        } else {
            history.unshift(record);
        }

        // Keep last 90 days
        const trimmedHistory = history.slice(0, 90);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
        this.notifyListeners();
    }

    /**
     * Get sleep history
     */
    public getHistory(): SleepRecord[] {
        const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get today's sleep record
     */
    public getTodayRecord(): SleepRecord | null {
        const today = new Date().toISOString().split('T')[0];
        const history = this.getHistory();
        return history.find(r => r.date === today) || null;
    }

    /**
     * Calculate sleep statistics
     */
    public getStats(): SleepStats {
        const history = this.getHistory();
        const last30Days = history.slice(0, 30);

        if (last30Days.length === 0) {
            return {
                averageDuration: 0,
                totalNights: 0,
                qualityBreakdown: { poor: 0, fair: 0, good: 0, excellent: 0 },
                weeklyData: [],
                streak: 0
            };
        }

        const totalDuration = last30Days.reduce((sum, r) => sum + r.durationHours, 0);
        const averageDuration = parseFloat((totalDuration / last30Days.length).toFixed(1));

        const qualityBreakdown = { poor: 0, fair: 0, good: 0, excellent: 0 };
        last30Days.forEach(r => {
            qualityBreakdown[r.quality]++;
        });

        // Weekly data (last 7 days)
        const weeklyData = history.slice(0, 7).map(r => ({
            date: r.date,
            hours: r.durationHours
        })).reverse();

        // Calculate streak
        let streak = 0;
        for (const record of history) {
            if (record.quality === 'good' || record.quality === 'excellent') {
                streak++;
            } else {
                break;
            }
        }

        return {
            averageDuration,
            totalNights: history.length,
            qualityBreakdown,
            weeklyData,
            streak
        };
    }

    /**
     * Update sleep schedule
     */
    public updateSchedule(schedule: Partial<SleepSchedule>): void {
        this.schedule = { ...this.schedule, ...schedule };
        this.saveSchedule();
        this.notifyListeners();
    }

    /**
     * Get current state
     */
    public getState(): SleepMonitoringState {
        return {
            schedule: this.schedule,
            isMonitoring: this.isMonitoring,
            isSleeping: this.isSleeping,
            currentSleepStart: this.currentSleepStart,
            todayRecord: this.getTodayRecord(),
            history: this.getHistory(),
            stats: this.getStats()
        };
    }

    /**
     * Subscribe to state changes
     */
    public subscribe(listener: (state: SleepMonitoringState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        const state = this.getState();
        this.listeners.forEach(listener => listener(state));
    }

    /**
     * Manually log a sleep record (for past entries or corrections)
     */
    public logSleepManually(sleepTime: string, wakeTime: string): SleepRecord {
        const { minutes, hours } = this.calculateDuration(sleepTime, wakeTime);

        const record: SleepRecord = {
            id: `sleep_${Date.now()}`,
            date: new Date(wakeTime).toISOString().split('T')[0],
            sleepStartTime: sleepTime,
            wakeEndTime: wakeTime,
            durationMinutes: minutes,
            durationHours: hours,
            quality: this.calculateQuality(hours),
            isAutoTracked: false
        };

        this.saveSleepRecord(record);
        return record;
    }

    /**
     * Get recommended bedtimes for a given wake time (based on 90-min cycles)
     */
    public getRecommendedBedtimes(wakeTime: string): { time: string; cycles: number; hours: number }[] {
        const [hours, mins] = wakeTime.split(':').map(Number);
        const wakeDate = new Date();
        wakeDate.setHours(hours, mins, 0, 0);

        const recommendations = [6, 5, 4].map(cycles => {
            const bedtime = new Date(wakeDate.getTime());
            // Subtract (cycles * 90 mins) + 15 mins to fall asleep
            bedtime.setMinutes(bedtime.getMinutes() - (cycles * 90) - 15);

            return {
                time: `${bedtime.getHours().toString().padStart(2, '0')}:${bedtime.getMinutes().toString().padStart(2, '0')}`,
                cycles,
                hours: (cycles * 90) / 60
            };
        });

        return recommendations;
    }
}

// Singleton instance
export const sleepMonitoringService = new SleepMonitoringService();
export default sleepMonitoringService;
