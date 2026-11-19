import { renderProfilePhoto } from "./profile-photo.js";
import {
    canAccessDashboard,
    canManageAttendance,
    checkSession,
    isAdmin
} from "./session.js";
import {
    endGlobalLiveClass,
    getApprovedMemberCount,
    getPendingRequestCount,
    listenToAttendanceSession,
    startAttendanceSession
} from "./firebase.js";
import { getSessionDate, getSessionHour } from "./date.js";
import { getLiveMeetingUrl, getMonthlyClassStats, getRecordedAttendanceCounts } from "./app-data.js";
import { subscribeToImportantAnnouncements } from "./announcement-data.js";

const byId = (id) => document.getElementById(id);
const liveCard = document.querySelector(".live-class-card");
const liveButton = byId("joinLiveButton");
const liveMessage = byId("liveClassMessage");
const zoomLink = byId("liveClassZoomLink");
const adminDashboard = byId("adminDashboard");

function setupNavigation() {
    const menu = byId("menuButton");
    const drawer = byId("sideDrawer");
    const overlay = byId("drawerOverlay");

    function toggleDrawer(open) {
        drawer.classList.toggle("open", open);
        overlay.classList.toggle("active", open);
        document.body.classList.toggle("drawer-open", open);
        menu.setAttribute("aria-expanded", String(open));
    }

    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-controls", drawer.id);
    menu.addEventListener("click", () => toggleDrawer(!drawer.classList.contains("open")));
    overlay.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") toggleDrawer(false);
    });

    const routes = {
        aboutHostsButton: "about-hosts",
        progressButton: "progress",
        attendanceButton: "attendance",
        allMembersButton: "all-members",
        routineButton: "routine",
        yogaButton: "yoga-abhyas",
        settingsButton: "settings",
        bugButton: "report-bug",
        aboutDeveloperButton: "about-developer",
        announcementButton: "announcements"
    };
    for (const [id, page] of Object.entries(routes)) {
        byId(id)?.addEventListener("click", () => location.assign(new URL("pages/" + page + ".html", location.href)));
    }
}

function getGreeting() {
    const hour = getSessionHour();
    if (hour < 5 || hour >= 21) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function showGreeting(user, announcement) {
    const name = user.fullName?.trim() || "Yoga member";
    const card = byId("greetingCard");
    card.classList.toggle("announcement-mode", Boolean(announcement));
    card.classList.toggle("greeting-mode", !announcement);
    byId("cardTitle").textContent = announcement?.title || getGreeting() + ", " + name.split(/\s+/)[0];
    byId("cardMessage").textContent = announcement?.message || "Take a moment to breathe and make time for your practice.";
    byId("announcementButton").classList.toggle("has-important-announcement", Boolean(announcement));
}

async function loadDashboard(isAdministrator) {
    const requests = [getApprovedMemberCount()];
    if (isAdministrator) requests.push(getPendingRequestCount());

    const [members, pending] = await Promise.allSettled(requests);
    if (members.status === "fulfilled") byId("allMemberCount").textContent = members.value;
    if (pending?.status === "fulfilled") byId("pendingRequestCount").textContent = pending.value;
}

function showLiveMessage(message, showZoom = false) {
    liveMessage.textContent = message;
    liveMessage.hidden = !message;
    zoomLink.hidden = !showZoom;
}

function setupLiveClass({ administrator, dashboard }) {
    let session = null;
    let ready = false;
    let busy = false;
    let meetingUrl;
    let loadCounts = 0;

    function render() {
        const active = session?.status === "active";
        const ended = session?.status === "ended";
        liveCard.classList.toggle("offline", !active);
        byId("liveStatusText").textContent = !ready ? "CONNECTING" : active ? "LIVE" : ended ? "ENDED" : "OFFLINE";

        let subtitle = "The live class hasn't started yet.";
        let label = "No Live Session";
        if (active) {
            subtitle = "Today's guided yoga class is live.";
            label = administrator ? "End Session" : "Join Live Class";
        } else if (administrator) {
            subtitle = "Start the live class when you're ready.";
            label = "Start Live Class";
        } else if (ended) {
            subtitle = "Today's live class has ended.";
            label = "Class Has Ended";
        }

        byId("liveClassSubtitle").textContent = subtitle;
        byId("joinButtonText").textContent = busy ? "Please wait…" : label;
        liveButton.disabled = !ready || busy || (!administrator && !active);
        if (dashboard) {
            byId("dashboardLiveStatus").textContent = !ready ? "Connecting" : active ? "Live" : ended ? "Ended" : "Not started";
        }
    }

    async function refreshCounts() {
        if (!dashboard) return;
        const request = ++loadCounts;
        const [attendance, month] = await Promise.allSettled([
            getRecordedAttendanceCounts(session?.id || getSessionDate(), session),
            getMonthlyClassStats()
        ]);
        if (request !== loadCounts) return;
        byId("dashboardTotalPresent").textContent = attendance.value?.present ?? "—";
        byId("dashboardTotalShort").textContent = attendance.value?.short ?? "—";
        byId("dashboardAbsent").textContent = attendance.value?.absent ?? "—";
        byId("monthClasses").textContent = month.value?.classes ?? "—";
        byId("monthAttendance").textContent = month.value?.percentage ?? "—";
    }

    liveButton.addEventListener("click", async () => {
        if (!ready || busy) return;
        const activeSession = session?.status === "active" ? session : null;
        if (administrator && activeSession && !window.confirm("End the class in Kayakalp Yogkaksha for everyone? End the Zoom meeting separately.")) {
            return;
        }

        // Open within the click event so mobile browsers can allow the new tab.
        const popup = !administrator || !activeSession ? window.open("about:blank", "_blank") : null;
        if (popup) popup.opener = null;

        busy = true;
        showLiveMessage("");
        render();
        try {
            if (administrator && activeSession) {
                await endGlobalLiveClass({
                    date: activeSession.id || getSessionDate(),
                    runId: activeSession.activeRunId ?? null
                });
                return;
            }

            meetingUrl = await getLiveMeetingUrl();
            if (!meetingUrl) {
                popup?.close();
                showLiveMessage("The Zoom meeting link hasn't been configured. Contact the administrator.");
                return;
            }

            if (!administrator && (session?.status !== "active" || session?.id !== activeSession?.id ||
                session?.activeRunId !== activeSession?.activeRunId)) {
                popup?.close();
                showLiveMessage("The class changed while Zoom was opening. Check the current status.");
                return;
            }

            if (administrator) await startAttendanceSession();
            zoomLink.href = meetingUrl;
            if (popup && !popup.closed) {
                popup.location.replace(meetingUrl);
            } else {
                showLiveMessage("Tap Open Zoom to open the meeting.", true);
            }
        } catch (error) {
            popup?.close();
            console.error("Live class action failed", error);
            showLiveMessage("We couldn't complete that action. Refresh and try again.");
        } finally {
            busy = false;
            render();
        }
    });

    render();
    return listenToAttendanceSession((nextSession) => {
        session = nextSession;
        ready = true;
        if (session?.status !== "active") showLiveMessage("");
        render();
        void refreshCounts();
    }, (error) => {
        ready = false;
        console.error("Live class listener failed", error);
        render();
        showLiveMessage("We couldn't connect to the class. Check your connection and reload.");
    });
}

async function initializeHome() {
    const user = await checkSession();
    if (!user) return;

    const administrator = isAdmin();
    const dashboard = canAccessDashboard();
    adminDashboard.hidden = !dashboard;
    byId("pendingRequestsCard").hidden = !administrator;
    byId("attendanceButton").hidden = !canManageAttendance();
    byId("allMembersButton").hidden = !dashboard;
    document.querySelector(".profile-name").textContent = user.fullName || "Kayakalp Yogkaksha";
    renderProfilePhoto(byId("homeProfileInitial"), user.fullName, user.photoDataUrl);

    setupNavigation();
    showGreeting(user);
    if (dashboard) void loadDashboard(administrator);
    const stopClass = setupLiveClass({ administrator, dashboard });
    const stopAnnouncements = subscribeToImportantAnnouncements(
        ([announcement]) => showGreeting(user, announcement),
        () => showGreeting(user)
    );

    window.addEventListener("pagehide", (event) => {
        if (!event.persisted) {
            stopClass?.();
            stopAnnouncements?.();
        }
    });
}

try {
    await initializeHome();
} catch (error) {
    // The shared page access status handles account errors.
    console.error("Home initialization failed", error);
}
