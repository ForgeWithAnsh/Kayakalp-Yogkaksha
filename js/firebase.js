import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {

    getAuth,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    sendPasswordResetEmail

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    getFirestore,

    doc,

    getDoc,

    setDoc,

    updateDoc,

    collection,

    query,

    where,

    getDocs,

    getCountFromServer,

    serverTimestamp,

    Timestamp,

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {

    getStorage

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyAeCcb86xRjGqIo6uH4eTPW5OlmYMXSlt0",

    authDomain: "kayakalp-yogkaksha.firebaseapp.com",

    projectId: "kayakalp-yogkaksha",

    storageBucket: "kayakalp-yogkaksha.firebasestorage.app",

    messagingSenderId: "130698594967",

    appId: "1:130698594967:web:5ee192fb0a46223a21b7d2"

};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);


/* ==========================================================
   SIGN UP
========================================================== */

export async function signUp(email, password){

    const userCredential =

        await createUserWithEmailAndPassword(

            auth,

            email,

            password

        );

    return userCredential.user;

}


/* ==========================================================
   LOGIN
========================================================== */

export async function loginUser(email, password){

    const userCredential =
        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

    return userCredential.user;

}


/* ==========================================================
   SAVE USER DATA
========================================================== */

export async function saveUserData(uid, userData){

    await setDoc(

        doc(db, "users", uid),

        userData

    );

}


/* ==========================================================
   GET USERS BY APPROVAL STATUS
========================================================== */

export async function getUsersByApprovalStatus(status){

    const q = query(

        collection(db, "users"),

        where(

            "approvalStatus",

            "==",

            status

        )

    );

    const snapshot = await getDocs(q);

    const users = [];

    snapshot.forEach(function(document){

        users.push({

            uid: document.id,

            ...document.data()

        });

    });

    return users;

}


/* ==========================================================
   UPDATE APPROVAL STATUS
========================================================== */

export async function updateApprovalStatus(
    uid,
    status
){

    const userRef =
        doc(db, "users", uid);

    const data = {

        approvalStatus: status

    };


    if(status === "approved"){

        const currentUserSnapshot =
            await getDoc(userRef);

        const currentUser =
            currentUserSnapshot.data();

        if(!currentUser.memberId){

            const usersSnapshot =
                await getDocs(
                    collection(db, "users")
                );

            let highestNumber = 0;

            usersSnapshot.forEach(function(document){

                const memberId =
                    document.data().memberId;

                if(memberId){

                    const number =
                        parseInt(
                            memberId.replace("YG-","")
                        );

                    if(number > highestNumber){

                        highestNumber = number;

                    }

                }

            });

            const nextNumber =
                highestNumber + 1;

            data.memberId =
                "YG-" +
                String(nextNumber)
                .padStart(6,"0");

            data.joinedAt =
                new Date().toISOString();

        }

    }


    await updateDoc(

        userRef,

        data

    );

}


export {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================================
   DASHBOARD
========================================================== */

export async function getPendingRequestCount(){

    const q = query(

        collection(db, "users"),

        where(

            "approvalStatus",

            "==",

            "pending"

        )

    );

    const snapshot =
        await getCountFromServer(q);

    return snapshot.data().count;

}


export async function getApprovedMemberCount(){

    const q = query(

        collection(db, "users"),

        where(

            "approvalStatus",

            "==",

            "approved"

        )

    );

    const snapshot =
        await getCountFromServer(q);

    return snapshot.data().count;

}


export async function resetPassword(email){

    await sendPasswordResetEmail(

        auth,

        email

    );

}


/* ==========================================================
   ATTENDANCE SESSION
========================================================== */


/*
   IMPORTANT:

   Change this number whenever the attendance
   threshold is decided.

   Example:

   15 = 15 minutes
   20 = 20 minutes
   30 = 30 minutes
*/

export const SHORT_SESSION_THRESHOLD_MINUTES = 15;


/* ==========================================================
   START DAILY SESSION
========================================================== */

export async function startAttendanceSession(){

    const today =
        new Date().toISOString().split("T")[0];

    const sessionRef =
        doc(
            db,
            "sessions",
            today
        );

    const existingSession =
        await getDoc(sessionRef);


    if(existingSession.exists()){

        const data =
            existingSession.data();


        if(data.status === "active"){

            return data;

        }

    }


    const sessionData = {

        status: "active",

        startedAt: serverTimestamp(),

        endedAt: null,

        durationSeconds: 0

    };


    await setDoc(

        sessionRef,

        sessionData,

        {
            merge: true
        }

    );


    return sessionData;

}


/* ==========================================================
   LISTEN TO DAILY SESSION
========================================================== */

export function listenToAttendanceSession(callback){

    const today =
        new Date().toISOString().split("T")[0];

    const sessionRef =
        doc(

            db,

            "sessions",

            today

        );


    return onSnapshot(

        sessionRef,

        function(snapshot){

            if(!snapshot.exists()){

                callback(null);

                return;

            }


            callback({

                id: snapshot.id,

                ...snapshot.data()

            });

        }

    );

}


/* ==========================================================
   START MEMBER ATTENDANCE
========================================================== */

export async function startMemberAttendance(
    uid,
    memberId,
    park
){

    const today =
        new Date().toISOString().split("T")[0];


    const attendanceRef =
        doc(

            db,

            "sessions",

            today,

            "attendance",

            uid

        );


    const existing =
        await getDoc(attendanceRef);


    if(existing.exists()){

        return existing.data();

    }


    const attendanceData = {

        memberId: memberId,
        
        park: park,

        status: "active",

        startedAt: serverTimestamp(),

        endedAt: null,

        durationSeconds: 0,

        manual: false

    };


    await setDoc(

        attendanceRef,

        attendanceData

    );


    return attendanceData;

}


/* ==========================================================
   PAUSE MEMBER ATTENDANCE
========================================================== */

export async function pauseMemberAttendance(uid){

    const today =
        new Date().toISOString().split("T")[0];


    const attendanceRef =
        doc(

            db,

            "sessions",

            today,

            "attendance",

            uid

        );


    const snapshot =
        await getDoc(attendanceRef);


    if(!snapshot.exists()){

        throw new Error(
            "Attendance record not found."
        );

    }


    const data =
        snapshot.data();


    if(data.status !== "active"){

        return data;

    }


    await updateDoc(

        attendanceRef,

        {

            status: "paused",

            pausedAt: serverTimestamp()

        }

    );

}


/* ==========================================================
   RESUME MEMBER ATTENDANCE
========================================================== */

export async function resumeMemberAttendance(uid){

    const today =
        new Date().toISOString().split("T")[0];


    const attendanceRef =
        doc(

            db,

            "sessions",

            today,

            "attendance",

            uid

        );


    const snapshot =
        await getDoc(attendanceRef);


    if(!snapshot.exists()){

        throw new Error(
            "Attendance record not found."
        );

    }


    const data =
        snapshot.data();


    if(data.status !== "paused"){

        return data;

    }


    const pausedAt =
        data.pausedAt?.toDate();


    if(!pausedAt){

        throw new Error(
            "Pause time is missing."
        );

    }


    const now =
        new Date();


    const pausedSeconds =
        Math.max(

            0,

            Math.floor(

                (now - pausedAt) / 1000

            )

        );


    const previousPausedSeconds =
        data.totalPausedSeconds || 0;


    await updateDoc(

        attendanceRef,

        {

            status: "active",

            resumedAt: serverTimestamp(),

            totalPausedSeconds:

                previousPausedSeconds +
                pausedSeconds

        }

    );

}



/* ==========================================================
   END MEMBER ATTENDANCE
========================================================== */

export async function endMemberAttendance(uid){

    const today =
        new Date().toISOString().split("T")[0];

    const attendanceRef =
        doc(
            db,
            "sessions",
            today,
            "attendance",
            uid
        );

    const snapshot =
        await getDoc(attendanceRef);

    if(!snapshot.exists()){

        throw new Error(
            "Attendance record not found."
        );

    }

    const data =
        snapshot.data();


    /* ======================================================
       ALREADY ENDED
    ====================================================== */

    if(
        data.status === "present" ||
        data.status === "short" ||
        data.status === "absent"
    ){

        return data;

    }


    const now =
        new Date();


    const startedAt =
        data.startedAt?.toDate();


    if(!startedAt){

        throw new Error(
            "Attendance start time is missing."
        );

    }


    /* ======================================================
       CALCULATE PAUSED TIME
    ====================================================== */

    let pausedSeconds =
        data.totalPausedSeconds || 0;


    /*
     * If the member presses "End Session"
     * while currently paused, include the
     * current pause duration.
     */

    if(data.status === "paused"){

        const pausedAt =
            data.pausedAt?.toDate();


        if(pausedAt){

            pausedSeconds +=
                Math.max(

                    0,

                    Math.floor(

                        (
                            now -
                            pausedAt
                        ) / 1000

                    )

                );

        }

    }


    /* ======================================================
       CALCULATE ACTIVE DURATION
    ====================================================== */

    const durationSeconds =
        Math.max(

            0,

            Math.floor(

                (
                    now -
                    startedAt
                ) / 1000

            ) -
            pausedSeconds

        );


    /* ======================================================
       DETERMINE ATTENDANCE STATUS
    ====================================================== */

    const thresholdSeconds =
        SHORT_SESSION_THRESHOLD_MINUTES *
        60;


    let finalStatus;


    if(durationSeconds >= thresholdSeconds){

        finalStatus =
            "present";

    }

    else{

        finalStatus =
            "short";

    }


    /* ======================================================
       SAVE FINAL ATTENDANCE
    ====================================================== */

    await updateDoc(

        attendanceRef,

        {

            status:
                finalStatus,

            endedAt:
                Timestamp.fromDate(now),

            durationSeconds:
                durationSeconds,

            totalPausedSeconds:
                pausedSeconds

        }

    );


    return {

        status:
            finalStatus,

        endedAt:
            Timestamp.fromDate(now),

        durationSeconds:
            durationSeconds,

        totalPausedSeconds:
            pausedSeconds

    };

}


/* ==========================================================
   GET MEMBER ATTENDANCE
========================================================== */

export async function getMemberAttendance(uid){

    const today =
        new Date().toISOString().split("T")[0];

    const attendanceRef =
        doc(
            db,
            "sessions",
            today,
            "attendance",
            uid
        );

    const snapshot =
        await getDoc(attendanceRef);

    if(!snapshot.exists()){

        return null;

    }

    return snapshot.data();

}


/* ==========================================================
   END WHOLE DAILY SESSION
========================================================== */

export async function endAttendanceSession(){

    const today =
        new Date().toISOString().split("T")[0];


    const sessionRef =
        doc(

            db,

            "sessions",

            today

        );


    const sessionSnapshot =
        await getDoc(sessionRef);


    if(!sessionSnapshot.exists()){

        throw new Error(
            "Today's session does not exist."
        );

    }


    const sessionData =
        sessionSnapshot.data();


    if(sessionData.status === "ended"){

        return sessionData;

    }


    const now =
        new Date();


    /* ======================================================
       GET ALL APPROVED MEMBERS
    ====================================================== */

    const membersQuery =
        query(

            collection(db, "users"),

            where(

                "approvalStatus",

                "==",

                "approved"

            )

        );


    const membersSnapshot =
        await getDocs(membersQuery);


    /* ======================================================
       GET EXISTING ATTENDANCE RECORDS
    ====================================================== */

    const attendanceSnapshot =
        await getDocs(

            collection(

                db,

                "sessions",

                today,

                "attendance"

            )

        );


    const attendanceMap =
        new Map();


    attendanceSnapshot.forEach(
        function(document){

            attendanceMap.set(

                document.id,

                {

                    ...document.data()

                }

            );

        }
    );


    /* ======================================================
       PROCESS EVERY APPROVED MEMBER
    ====================================================== */

    for(
        const memberDocument
        of membersSnapshot.docs
    ){

        const uid =
            memberDocument.id;


        const member =
            memberDocument.data();


        const attendance =
            attendanceMap.get(uid);


        /* ================================================
           MEMBER NEVER STARTED
        ================================================= */

        if(!attendance){

            const attendanceRef =
                doc(

                    db,

                    "sessions",

                    today,

                    "attendance",

                    uid

                );


            await setDoc(

                attendanceRef,

                {

                    memberId:
                        member.memberId || "",

                    status: "absent",

                    startedAt: null,

                    endedAt:
                        Timestamp.fromDate(now),

                    durationSeconds: 0,

                    totalPausedSeconds: 0,

                    manual: false

                }

            );


            continue;

        }


        /* ================================================
           ALREADY FINISHED
        ================================================= */

        if(

            attendance.status === "present" ||

            attendance.status === "short" ||

            attendance.status === "absent"

        ){

            continue;

        }


        /* ================================================
           CALCULATE MEMBER DURATION
        ================================================= */

        const startedAt =
            attendance.startedAt?.toDate();


        if(!startedAt){

            await updateDoc(

                doc(

                    db,

                    "sessions",

                    today,

                    "attendance",

                    uid

                ),

                {

                    status: "absent",

                    endedAt:
                        Timestamp.fromDate(now),

                    durationSeconds: 0

                }

            );


            continue;

        }


        let pausedSeconds =
            attendance.totalPausedSeconds || 0;


        /* ================================================
           IF MEMBER IS CURRENTLY PAUSED

           Count the current pause as well.
        ================================================= */

        if(attendance.status === "paused"){

            const pausedAt =
                attendance.pausedAt?.toDate();


            if(pausedAt){

                pausedSeconds +=

                    Math.max(

                        0,

                        Math.floor(

                            (

                                now -
                                pausedAt

                            ) / 1000

                        )

                    );

            }

        }


        const totalSeconds =
            Math.max(

                0,

                Math.floor(

                    (

                        now -
                        startedAt

                    ) / 1000

                ) -

                pausedSeconds

            );


        const thresholdSeconds =

            SHORT_SESSION_THRESHOLD_MINUTES *
            60;


        let finalStatus;


        if(
            totalSeconds >=
            thresholdSeconds
        ){

            finalStatus = "present";

        }

        else{

            finalStatus = "short";

        }


        /* ================================================
           SAVE FINAL ATTENDANCE
        ================================================= */

        await updateDoc(

            doc(

                db,

                "sessions",

                today,

                "attendance",

                uid

            ),

            {

                status:
                    finalStatus,

                endedAt:
                    Timestamp.fromDate(now),

                durationSeconds:
                    totalSeconds,

                totalPausedSeconds:
                    pausedSeconds

            }

        );

    }


    /* ======================================================
       END GLOBAL SESSION
    ====================================================== */

    const endedAt =
        Timestamp.fromDate(now);


    const sessionDuration =
        sessionData.startedAt?.toDate()

            ? Math.max(

                0,

                Math.floor(

                    (

                        now -

                        sessionData
                            .startedAt
                            .toDate()

                    ) / 1000

                )

            )

            : 0;


    await updateDoc(

        sessionRef,

        {

            status: "ended",

            endedAt: endedAt,

            durationSeconds:
                sessionDuration

        }

    );


    return {

        status: "ended",

        endedAt: endedAt,

        durationSeconds:
            sessionDuration

    };

}


/* ==========================================================
   END GLOBAL LIVE CLASS — WITHOUT FINALIZING ATTENDANCE
========================================================== */

export async function endGlobalLiveClass(){

    const today = new Date().toISOString().split("T")[0];

    const sessionRef = doc(db, "sessions", today);

    const sessionSnapshot = await getDoc(sessionRef);

    if(!sessionSnapshot.exists()){
        throw new Error("Today's session does not exist.");
    }

    const sessionData = sessionSnapshot.data();

    if(sessionData.status !== "active"){
        return sessionData;
    }

    await updateDoc(sessionRef, {
        status: "ended",
        endedAt: serverTimestamp()
    });

    return {
        status: "ended"
    };
}