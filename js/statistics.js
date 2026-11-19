import { getAttendanceDuration, getAttendanceStatus } from "./attendance-model.js";
import { getSessionDate } from "./date.js";

export function calculateProgress(days, today = getSessionDate()) {
    const month = today.slice(0, 7);
    const stats = {
        totalSessions: 0,
        totalSeconds: 0,
        monthSessions: 0,
        monthEligible: 0,
        monthSeconds: 0,
        currentStreak: 0,
        longestStreak: 0
    };

    // Each eligible class date enters the streak once, even after a restart.
    for (const { date, record } of [...days].sort((first, second) => first.date.localeCompare(second.date))) {
        const status = getAttendanceStatus(record);
        if (date === today && ["active", "paused", "unmarked"].includes(status)) continue;

        const present = status === "present";
        const duration = getAttendanceDuration(record);
        const source = record?.verifiedSource ?? record?.source;
        const seconds = source === "zoom" && Number.isFinite(duration) ? Math.max(0, duration) : 0;
        stats.totalSessions += Number(present);
        stats.totalSeconds += seconds;
        stats.currentStreak = present ? stats.currentStreak + 1 : 0;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        if (date.startsWith(month)) {
            stats.monthEligible++;
            stats.monthSessions += Number(present);
            stats.monthSeconds += seconds;
        }
    }
    return stats;
}

export function formatPracticeTime(seconds) {
    return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
}
