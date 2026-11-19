import { getPersonalAttendance } from "./app-data.js";
import { attendanceLabels, describeAttendance, getAttendanceStatus } from "./attendance-model.js";
import { checkSession } from "./session.js";
import { calculateProgress, formatPracticeTime } from "./statistics.js";

document.getElementById("backButton").addEventListener("click", () => location.assign("../index.html"));

const member = await checkSession().catch(() => null);
if (member) {
    try {
        const days = await getPersonalAttendance(member);
        const stats = calculateProgress(days);
        renderAttendanceHistory(days);
        const values = {
            currentStreak: stats.currentStreak,
            monthlyAttendance: stats.monthSessions + " / " + stats.monthEligible,
            monthlyPractice: formatPracticeTime(stats.monthSeconds),
            lifetimeSessions: stats.totalSessions,
            lifetimeHours: formatPracticeTime(stats.totalSeconds),
            longestStreak: stats.longestStreak + " days"
        };
        for (const [id, value] of Object.entries(values)) {
            document.getElementById(id).textContent = value;
        }

        const targets = [
            ["First session", stats.totalSessions >= 1],
            ["7-day streak", stats.longestStreak >= 7],
            ["30-day streak", stats.longestStreak >= 30],
            ["100 hours of practice", stats.totalSeconds >= 360000]
        ];
        const list = document.getElementById("progressAchievements");
        list.replaceChildren(...targets.map(([name, achieved]) => {
            const item = document.createElement("p");
            item.className = achieved ? "achievement" : "achievement locked";
            item.textContent = (achieved ? "Earned: " : "Locked: ") + name;
            return item;
        }));
    } catch {
        document.getElementById("progressStatus").textContent = "We couldn’t load your attendance. Try again later.";
    }
}

function renderAttendanceHistory(days) {
    const list = document.getElementById("attendanceHistory");
    const more = document.getElementById("moreAttendance");
    const sorted = [...days].sort((first, second) => second.date.localeCompare(first.date));
    const displayDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
    let index = 0;

    function showNextDates() {
        const page = sorted.slice(index, index + 20);
        for (const { date, record } of page) {
            const item = document.createElement("li");
            const time = document.createElement("time");
            const result = document.createElement("span");
            time.dateTime = date;
            time.textContent = displayDate.format(new Date(date + "T00:00:00+05:30"));
            const source = describeAttendance(record);
            const status = attendanceLabels[getAttendanceStatus(record)];
            result.textContent = source ? status + " · " + source : status;
            item.append(time, result);
            list.append(item);
        }
        index += page.length;
        more.hidden = index >= sorted.length;
    }

    if (!sorted.length) {
        document.getElementById("attendanceHistoryStatus").textContent = "No class dates are available yet.";
    }
    showNextDates();
    more.addEventListener("click", showNextDates);
}
