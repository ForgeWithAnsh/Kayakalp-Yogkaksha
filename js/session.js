/* ==========================================================
   SESSION.JS
   CURRENT USER + SESSION CONTROL
========================================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    listenToAttendanceSession
} from "./firebase.js";


/* ==========================================================
   CURRENT USER
========================================================== */

export let currentUser = null;


/* ==========================================================
   LOAD CURRENT USER
========================================================== */

export async function loadCurrentUser(){

    return new Promise(function(resolve){

        onAuthStateChanged(

            auth,

            async function(user){

                if(!user){

                    currentUser = null;

                    resolve(null);

                    return;

                }

                const snapshot =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );

                if(!snapshot.exists()){

                    currentUser = null;

                    resolve(null);

                    return;

                }

                currentUser = {

                    uid: user.uid,

                    ...snapshot.data()

                };

                resolve(currentUser);

            }

        );

    });

}


/* ==========================================================
   ROLE + ACCESS CONTROL
========================================================== */

export function getUserRole(){

    if(!currentUser){
        return null;
    }

    return currentUser.role || "member";

}


export function getUserPark(){

    if(!currentUser){
        return null;
    }

    return currentUser.park || null;

}


/* ==========================================================
   ROLE CHECKS
========================================================== */

export function isAdmin(){

    return getUserRole() === "admin";

}


export function isHost(){

    return getUserRole() === "host";

}


export function isModerator(){

    return getUserRole() === "moderator";

}


export function isMember(){

    return getUserRole() === "member";

}


/* ==========================================================
   MULTI-ROLE CHECK
========================================================== */

export function hasRole(...roles){

    return roles.includes(getUserRole());

}


/* ==========================================================
   DASHBOARD ACCESS
========================================================== */

export function canAccessDashboard(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   ATTENDANCE MANAGEMENT ACCESS
========================================================== */

export function canManageAttendance(){

    return hasRole(
        "admin",
        "host",
        "moderator"
    );

}


/* ==========================================================
   VIEW ALL ATTENDANCE
========================================================== */

export function canViewAllAttendance(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   MODIFY PAST ATTENDANCE
========================================================== */

export function canModifyPastAttendance(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   GLOBAL ATTENDANCE CONTROL
========================================================== */

export function canManageAllAttendance(){

    return isAdmin();

}


/* ==========================================================
   CLASS MANAGEMENT
========================================================== */

export function canManageClass(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   GLOBAL LIVE SESSION CONTROL
========================================================== */

export function canControlGlobalLiveSession(){

    return isAdmin();

}


/* ==========================================================
   ANNOUNCEMENT MANAGEMENT
========================================================== */

export function canCreateAnnouncement(){

    return hasRole(
        "admin",
        "host"
    );

}


export function canManageOwnAnnouncement(){

    return hasRole(
        "admin",
        "host"
    );

}


export function canDeleteOtherAnnouncements(){

    return isAdmin();

}


/* ==========================================================
   MEMBER INFORMATION
========================================================== */

export function canViewFullMemberInformation(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   ROLE MANAGEMENT
========================================================== */

export function canManageRoles(){

    return hasRole(
        "admin",
        "host"
    );

}


/* ==========================================================
   AVAILABLE ROLES FOR ROLE MANAGEMENT
========================================================== */

export function getManageableRoles(){

    if(isAdmin()){

        return [
            "member",
            "moderator",
            "host"
        ];

    }

    if(isHost()){

        return [
            "member",
            "moderator"
        ];

    }

    return [];

}


/* ==========================================================
   CHECK LOGIN / APPROVAL
========================================================== */

export async function checkSession(){

    await loadCurrentUser();

    if(!currentUser){

        window.location.href =
            "pages/login.html";

        return;

    }

    if(currentUser.approvalStatus === "pending"){

        window.location.href =
            "pages/waiting.html";

        return;

    }

    if(currentUser.approvalStatus === "rejected"){

        window.location.href =
            "pages/rejected.html";

        return;

    }

}




/* ==========================================================
   LISTEN FOR WHOLE SESSION END
========================================================== */

export function listenForSessionEnd(callback){

    return listenToAttendanceSession(
        function(session){

            if(!session){

                callback(null);

                return;

            }

            callback(session);

        }
    );

}


