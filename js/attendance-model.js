export const attendanceLabels = Object.freeze({
    present: "Present",
    short: "Short",
    absent: "Absent",
    active: "Active",
    paused: "Paused",
    unmarked: "Unmarked"
});

export const manualStatuses = Object.freeze(["present", "short", "absent"]);

const attendanceSources = {
    offline: "Physical attendance",
    manual: "Manual correction",
    zoom: "Zoom attendance"
};

export function getAttendanceStatus(record) {
    if (manualStatuses.includes(record?.manualStatus)) return record.manualStatus;
    if (record?.manual === true && manualStatuses.includes(record.status)) return record.status;
    if (manualStatuses.includes(record?.verifiedStatus)) return record.verifiedStatus;
    if (Object.hasOwn(attendanceLabels, record?.status)) return record.status;
    return "unmarked";
}

export function describeAttendance(record) {
    const legacyManual = record?.manual === true ? (record.source === "offline" ? "offline" : "manual") : null;
    const source = record?.manualSource || legacyManual || record?.verifiedSource || record?.source;
    return Object.hasOwn(attendanceSources, source) ? attendanceSources[source] : "";
}

export function getAttendanceDuration(record) {
    return record?.verifiedDurationSeconds ?? record?.durationSeconds ?? 0;
}

export function describeAttendanceDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "";
    const minutes = Math.floor(seconds / 60);
    if (!minutes) return "<1 min recorded";
    const hours = Math.floor(minutes / 60);
    const description = hours ? `${hours} hr ${minutes % 60} min` : `${minutes} min`;
    return `${description} recorded`;
}
