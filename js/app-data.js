import {
    addDoc, collection, doc, documentId, getDoc, getDocs, query,
    serverTimestamp, setDoc, updateDoc, where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    EmailAuthProvider, reauthenticateWithCredential, updatePassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, callFunction, db } from "./firebase.js";
import { getSessionDate } from "./date.js";
import { getAttendanceStatus } from "./attendance-model.js";

export function parseZoomMeetingUrl(value) {
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
        const zoomHost = ["zoom.us", "zoom.com"].some((domain) => (
            url.hostname === domain || url.hostname.endsWith("." + domain)
        ));
        return zoomHost && /^\/j\/[^/]+\/?$/.test(url.pathname) && url.href.length <= 2048 ? url.href : null;
    } catch {
        return null;
    }
}

export async function getLiveMeetingUrl() {
    const snapshot = await getDoc(doc(db, "settings", "liveClass"));
    return parseZoomMeetingUrl(snapshot.data()?.zoomMeetingUrl);
}

export async function saveLiveMeetingUrl(value) {
    const zoomMeetingUrl = parseZoomMeetingUrl(value);
    if (!zoomMeetingUrl) throw new Error("Enter a valid HTTPS Zoom meeting invitation.");
    await setDoc(doc(db, "settings", "liveClass"), { zoomMeetingUrl }, { merge: true });
}

export function updatePersonalProfile(uid, profile) {
    return updateDoc(doc(db, "users", uid), profile);
}

export async function changeAccountPassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("Please sign in again before changing your password.");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
}

export function submitBugReport(uid, report) {
    return addDoc(collection(db, "bugReports"), {
        ...report,
        reportedBy: uid,
        status: "open",
        createdAt: serverTimestamp()
    });
}

function countsAsClass(session) {
    return session.status === "ended" || session.hasPhysicalAttendance === true;
}

export function getMonthlyClassStats() {
    return callFunction("getDashboardStatistics");
}

export async function getRecordedAttendanceCounts(date, session) {
    const attendanceRead = getDocs(collection(db, "sessions", date, "attendance"));
    const summaryRead = session?.status === "ended"
        ? getDoc(doc(db, "sessions", date, "statistics", "summary"))
        : Promise.resolve(null);
    const [snapshot, summarySnapshot] = await Promise.all([attendanceRead, summaryRead]);
    const attendance = snapshot.docs.map((item) => getAttendanceStatus(item.data()));
    const summary = summarySnapshot?.data();
    const summaryMatches = Number.isSafeInteger(summary?.eligible) && Number.isSafeInteger(summary?.absent) &&
        summary.stale !== true &&
        (summary.runId ?? null) === (session?.lastRunId ?? null);
    return {
        present: attendance.filter((status) => status === "present").length,
        short: attendance.filter((status) => status === "short").length,
        absent: summaryMatches ? summary.absent ?? null : null
    };
}

function getMembershipDate(user) {
    const joinedAt = user.joinedAt ?? user.createdAt;
    if (!joinedAt) return null;
    const date = joinedAt.toDate?.() ?? new Date(joinedAt);
    return Number.isFinite(date.getTime()) ? getSessionDate(date) : null;
}

export async function getPersonalAttendance(user) {
    const today = getSessionDate();
    const start = getMembershipDate(user);
    const constraints = [where(documentId(), "<=", today)];
    if (start) constraints.push(where(documentId(), ">=", start));
    const snapshot = await getDocs(query(collection(db, "sessions"), ...constraints));
    const days = snapshot.docs.filter((item) => countsAsClass(item.data()));
    const rows = [];

    // Limit concurrent reads. The user's own attendance is protected by document rules.
    for (let index = 0; index < days.length; index += 15) {
        const batch = await Promise.all(days.slice(index, index + 15).map(async ({ id }) => {
            const record = await getDoc(doc(db, "sessions", id, "attendance", user.uid));
            return { date: id, record: record.data() };
        }));
        rows.push(...batch);
    }
    return rows;
}
