import { auth, db, listenToAttendanceSession } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export let currentUser = null;
let profileRequest;
let profileUid;

export async function loadCurrentUser({ refresh = false } = {}) {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) {
        currentUser = null;
        profileUid = undefined;
        profileRequest = undefined;
        return null;
    }

    if (refresh || profileUid !== uid || !profileRequest) {
        profileUid = uid;
        profileRequest = getDoc(doc(db, "users", uid)).then((snapshot) => {
            if (!snapshot.exists()) {
                const error = new Error("Your account profile is missing. Return to registration to finish creating it.");
                error.code = "profile/missing";
                throw error;
            }
            return { ...snapshot.data(), uid };
        });
    }

    const request = profileRequest;
    try {
        const profile = await request;
        if (auth.currentUser?.uid !== uid) return null;
        currentUser = profile;
        return currentUser;
    } catch (error) {
        if (profileRequest === request) profileRequest = undefined;
        throw error;
    }
}

export function getUserRole() {
    return currentUser ? currentUser.role || "member" : null;
}

export function getUserPark() {
    return currentUser?.park || null;
}

export function hasRole(...roles) {
    return roles.includes(getUserRole());
}

export const isAdmin = () => hasRole("admin");
export const isHost = () => hasRole("host");
export const isModerator = () => hasRole("moderator");
export const isMember = () => hasRole("member");

const isManager = () => hasRole("admin", "host");

export const canAccessDashboard = isManager;
export const canManageAttendance = () => hasRole("admin", "host", "moderator");
export const canViewAllAttendance = isManager;
export const canModifyPastAttendance = isManager;
export const canManageAllAttendance = isAdmin;
export const canManageClass = isManager;
export const canControlGlobalLiveSession = isAdmin;
export const canCreateAnnouncement = isManager;
export const canManageOwnAnnouncement = isManager;
export const canDeleteOtherAnnouncements = isAdmin;
export const canViewFullMemberInformation = isManager;
export const canManageRoles = isManager;

export function getManageableRoles() {
    if (isAdmin()) return ["member", "moderator", "host"];
    if (isHost()) return ["member", "moderator"];
    return [];
}

export function goToPage(path) {
    location.replace(new URL(path, import.meta.url));
}

export function routeAccount(user) {
    if (!user) goToPage("../pages/login.html");
    else if (user.approvalStatus === "pending") goToPage("../pages/waiting.html");
    else if (user.approvalStatus === "rejected") goToPage("../pages/rejected.html");
    else if (user.approvalStatus === "approved") goToPage("../index.html");
    else throw new Error("Your account has an unknown approval status. Contact the organization for help.");
}

export async function checkSession({ roles, status = "approved" } = {}) {
    const user = await loadCurrentUser();
    if (!user || user.approvalStatus !== status || (roles && !roles.includes(getUserRole()))) {
        routeAccount(user);
        return null;
    }
    return user;
}

export async function signOutUser() {
    await signOut(auth);
    currentUser = null;
    profileUid = undefined;
    profileRequest = undefined;
}

export function listenForSessionEnd(callback, onError) {
    return listenToAttendanceSession(callback, onError);
}
