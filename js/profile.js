import { renderProfilePhoto } from "./profile-photo.js";
import { getPersonalAttendance } from "./app-data.js";
import { checkSession, goToPage, signOutUser } from "./session.js";
import { calculateProgress, formatPracticeTime } from "./statistics.js";

const user = await checkSession().catch(() => null);
if (user) initializeProfile(user);

function initializeProfile(profile) {
    const byId = (id) => document.getElementById(id);
    renderProfilePhoto(byId("profilePhoto"), profile.fullName, profile.photoDataUrl);
    const fields = {
        profileFullName: profile.fullName,
        profileMemberId: profile.memberId && "Member ID: " + profile.memberId,
        profileRole: "Role: " + (profile.role || "member").replace(/^./, (letter) => letter.toUpperCase()),
        profileAge: ageOn(new Date(), profile.dob),
        profileGender: profile.gender,
        profileDob: profile.dob,
        profilePhone: profile.phone,
        profileEmail: profile.email,
        profileAddress: profile.address
    };
    for (const [id, value] of Object.entries(fields)) byId(id).textContent = value ?? "—";

    byId("backButton").addEventListener("click", () => goToPage("../index.html"));
    byId("editProfileButton").addEventListener("click", () => goToPage("../pages/edit-profile.html"));

    const overlay = byId("logoutPopupOverlay");
    byId("logoutButton").addEventListener("click", () => overlay.classList.add("show"));
    byId("logoutCancelButton").addEventListener("click", () => overlay.classList.remove("show"));
    byId("logoutConfirmButton").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
            await signOutUser();
            goToPage("../pages/login.html");
        } catch {
            button.disabled = false;
            byId("logoutPopupMessage").textContent = "We couldn’t sign you out. Please try again.";
        }
    });

    getPersonalAttendance(profile).then((rows) => {
        const stats = calculateProgress(rows);
        byId("totalAttendance").textContent = stats.totalSessions;
        byId("currentStreak").textContent = stats.currentStreak;
        byId("practiceHours").textContent = formatPracticeTime(stats.totalSeconds);
    }).catch(() => {
        byId("profileStatsStatus").textContent = "Attendance is temporarily unavailable.";
    });
}

function ageOn(today, value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
    const [year, month, day] = value.split("-").map(Number);
    const hasBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
    const age = today.getFullYear() - year - Number(!hasBirthday);
    return age >= 0 ? age : null;
}
