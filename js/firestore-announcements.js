import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export function createAnnouncementRepository(db) {
    function announcementsCollection() {
        return collection(db, "announcements");
    }

    function subscribe(announcementQuery, onData, onError) {
        return onSnapshot(announcementQuery, (snapshot) => {
            onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
        }, onError);
    }

    function subscribeToAnnouncements(onData, onError) {
        const recent = query(announcementsCollection(), orderBy("createdAt", "desc"), limit(50));
        return subscribe(recent, onData, onError);
    }

    function subscribeToImportantAnnouncements(onData, onError) {
        const important = query(
            announcementsCollection(),
            where("important", "==", true),
            orderBy("createdAt", "desc"),
            limit(1)
        );
        return subscribe(important, onData, onError);
    }

    function createAnnouncement({ title, message, important }, uid) {
        return addDoc(announcementsCollection(), {
            title,
            message,
            important,
            createdBy: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }

    function updateAnnouncement(id, { title, message, important }) {
        return updateDoc(doc(announcementsCollection(), id), {
            title,
            message,
            important,
            updatedAt: serverTimestamp()
        });
    }

    function deleteAnnouncement(id) {
        return deleteDoc(doc(announcementsCollection(), id));
    }

    return {
        createAnnouncement,
        deleteAnnouncement,
        subscribeToAnnouncements,
        subscribeToImportantAnnouncements,
        updateAnnouncement
    };
}
