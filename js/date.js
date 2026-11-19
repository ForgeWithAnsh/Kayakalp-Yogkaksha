export const SESSION_TIME_ZONE = "Asia/Kolkata";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SESSION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: SESSION_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23"
});

export function getSessionDate(date = new Date()) {
    const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getSessionHour(date = new Date()) {
    return Number(hourFormatter.format(date));
}
