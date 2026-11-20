import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    getAuth,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    getFirestore,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { getSessionDate } from "./date.js";
import { createAnnouncementRepository } from "./firestore-announcements.js";

const app = initializeApp({
    apiKey: "AIzaSyCBHVrl8Z5Sm-zrPQKr2z6jVeHNoFecjHI",
    authDomain: "kayakalp-yogkaksha.firebaseapp.com",
    projectId: "kayakalp-yogkaksha",
    storageBucket: "kayakalp-yogkaksha.firebasestorage.app",
    messagingSenderId: "130698594967",
    appId: "1:130698594967:web:5ee192fb0a46223a21b7d2"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function callFunction(name, payload) {
    const result = await httpsCallable(functions, name)(payload);
    return result.data;
}

export async function signUp(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function loginUser(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function saveUserData(uid, { fullName, dob, gender, phone, address, park, health, photoDataUrl }) {
    const user = auth.currentUser;
    if (!user?.email || user.uid !== uid) {
        throw new Error("Sign in again before submitting the registration.");
    }

    await setDoc(doc(db, "users", uid), {
        fullName,
        dob,
        gender,
        phone,
        address,
        park,
        health,
        ...(photoDataUrl ? { photoDataUrl } : {}),
        email: user.email,
        role: "member",
        approvalStatus: "pending",
        createdAt: serverTimestamp()
    });
}

function usersByApprovalStatus(status) {
    return query(collection(db, "users"), where("approvalStatus", "==", status));
}

export async function getUsersByApprovalStatus(status) {
    const snapshot = await getDocs(usersByApprovalStatus(status));
    return snapshot.docs.map((entry) => ({ ...entry.data(), uid: entry.id }));
}

async function countUsers(status) {
    const snapshot = await getCountFromServer(usersByApprovalStatus(status));
    return snapshot.data().count;
}

export function getPendingRequestCount() {
    return countUsers("pending");
}

export function getApprovedMemberCount() {
    return countUsers("approved");
}

export async function updateApprovalStatus(uid, status) {
    return callFunction("setMemberApproval", { uid, status });
}

export async function updateMemberRole(uid, role) {
    return callFunction("setMemberRole", { uid, role });
}

export async function startAttendanceSession() {
    const date = getSessionDate();
    const sessionRef = doc(db, "sessions", date);
    const runRef = doc(collection(sessionRef, "runs"));

    return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(sessionRef);
        const current = snapshot.data();
        if (current?.status === "active") {
            return { ...current, id: date };
        }

        const startedAt = serverTimestamp();
        const session = {
            status: "active",
            startedAt,
            endedAt: null,
            durationSeconds: 0,
            activeRunId: runRef.id,
            lastRunId: runRef.id
        };

        transaction.set(runRef, { status: "active", startedAt, endedAt: null });
        transaction.set(sessionRef, session, { merge: true });
        return { ...session, id: date };
    });
}

export function listenToAttendanceSession(callback, onError) {
    let date;
    let unsubscribe;

    function subscribeForToday() {
        const today = getSessionDate();
        if (today === date) {
            return;
        }

        unsubscribe?.();
        date = today;
        unsubscribe = onSnapshot(doc(db, "sessions", date), (snapshot) => {
            callback(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null);
        }, onError);
    }

    subscribeForToday();
    const dateTimer = setInterval(subscribeForToday, 30_000);

    return () => {
        clearInterval(dateTimer);
        unsubscribe?.();
    };
}

// Ending a run records the server timestamp. Attendance finalization is independent.
export async function endGlobalLiveClass({ date = getSessionDate(), runId } = {}) {
    const sessionRef = doc(db, "sessions", date);

    return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(sessionRef);
        const current = snapshot.data();
        if (current?.status === "ended") {
            return { ...current, id: date };
        }
        if (current?.status !== "active") {
            throw new Error("There is no active class to end for this date.");
        }

        const activeRunId = current.activeRunId ?? null;
        if (runId !== undefined && activeRunId !== runId) {
            throw new Error("The class has restarted. Check the current session before ending it.");
        }

        const updates = {
            status: "ended",
            endedAt: serverTimestamp(),
            activeRunId: null
        };

        if (activeRunId) {
            transaction.update(doc(sessionRef, "runs", activeRunId), {
                status: updates.status,
                endedAt: updates.endedAt
            });
        }

        transaction.update(sessionRef, updates);
        return { ...current, ...updates, id: date };
    });
}

export async function getMemberAttendance(uid, date = getSessionDate()) {
    const snapshot = await getDoc(doc(db, "sessions", date, "attendance", uid));
    return snapshot.data() ?? null;
}

export const {
    createAnnouncement,
    deleteAnnouncement,
    subscribeToAnnouncements,
    subscribeToImportantAnnouncements,
    updateAnnouncement
} = createAnnouncementRepository(db);
