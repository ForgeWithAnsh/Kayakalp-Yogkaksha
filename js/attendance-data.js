import {
    collection,
    doc,
    getDocFromServer,
    getDocsFromServer,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { callFunction, db } from "./firebase.js";

function documents(snapshot) {
    return snapshot.docs.map((document) => ({ ...document.data(), uid: document.id }));
}

export async function loadAttendanceDay({ date, park }) {
    const locationFilters = park ? [where("park", "==", park)] : [];
    const sessionRef = doc(db, "sessions", date);
    const roster = query(
        collection(db, "attendanceRoster"),
        where("approvalStatus", "==", "approved"),
        ...locationFilters
    );
    const attendance = query(collection(sessionRef, "attendance"), ...locationFilters);
    const [members, records, session] = await Promise.all([
        getDocsFromServer(roster),
        getDocsFromServer(attendance),
        getDocFromServer(sessionRef)
    ]);

    return {
        members: documents(members),
        records: documents(records),
        session: session.data() ?? null
    };
}

export function saveAttendanceDay({ date, changes }) {
    return callFunction("saveManualAttendance", { date, changes });
}
