/* ==========================================================
YOGA APP
NAVIGATION DRAWER
========================================================== */

import {
    checkSession,
    currentUser,
    isAdmin,
    canManageAttendance,
    canAccessDashboard
} from "./session.js";

import {
    startAttendanceSession,
    listenToAttendanceSession,
    getPendingRequestCount,
    getApprovedMemberCount,
    endAttendanceSession
} from "./firebase.js";

// ==========================================================
// ELEMENT REFERENCES
// ==========================================================

const menuButton = document.getElementById("menuButton");
const sideDrawer = document.getElementById("sideDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const profileCard = document.getElementById("profileCard");

const attendanceButton =
    document.getElementById("attendanceButton");

const allMembersButton =
    document.getElementById("allMembersButton");
    
    
    /* ==========================================================
   APPLY ROLE BASED UI ACCESS
========================================================== */

function applyRoleAccess(){

    const adminDashboard =
        document.getElementById("adminDashboard");

    if(!adminDashboard){
        return;
    }

    adminDashboard.hidden =
        !canAccessDashboard();

}

// ==========================================================
// OPEN DRAWER
// ==========================================================

function openDrawer() {

sideDrawer.classList.add("open");  
drawerOverlay.classList.add("active");  

// Prevent background scrolling  
document.body.style.overflow = "hidden";

}

// ==========================================================
// CLOSE DRAWER
// ==========================================================

function closeDrawer() {

sideDrawer.classList.remove("open");  
drawerOverlay.classList.remove("active");  

// Restore scrolling  
document.body.style.overflow = "";

}

// ==========================================================
// MENU BUTTON
// ==========================================================

menuButton.addEventListener("click", function () {

openDrawer();

});

// ==========================================================
// CLICK OUTSIDE TO CLOSE
// ==========================================================

drawerOverlay.addEventListener("click", function () {

closeDrawer();

});

// ==========================================================
// ESC KEY SUPPORT
// ==========================================================

document.addEventListener("keydown", function (event) {

if (event.key === "Escape") {  

    closeDrawer();  

}

});

// ==========================================================
// PREVENT DRAWER CLICK FROM CLOSING
// ==========================================================

sideDrawer.addEventListener("click", function (event) {

event.stopPropagation();

});

/* ==========================================================
ABOUT HOSTS
========================================================== */

const aboutHostsButton =
document.getElementById("aboutHostsButton");

aboutHostsButton.addEventListener("click", function(){

window.location.href =  
    "pages/about-hosts.html";

});

/* ==========================================================
PROGRESS
========================================================== */

const progressButton =
document.getElementById("progressButton");

progressButton.addEventListener("click", function(){

window.location.href =  
    "pages/progress.html";

});


/* ==========================================================
ATTENDANCE
========================================================== */

if(attendanceButton){

    if(canManageAttendance()){

        attendanceButton.hidden = false;

    }
    else{

        attendanceButton.hidden = true;

    }


    attendanceButton.addEventListener(
        "click",
        function(){

            window.location.href =
                "pages/attendance.html";

        }
    );

}


/* ==========================================================
ALL MEMBERS
========================================================== */

if(allMembersButton){

    allMembersButton.addEventListener(
        "click",
        function(){

            window.location.href =
                "pages/all-members.html";

        }
    );

}

/* ==========================================================
ROUTINE
========================================================== */

const routineButton =
document.getElementById("routineButton");

if(routineButton){

routineButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/routine.html";  

});

}

/* ==========================================================
SETTINGS
========================================================== */

const settingsButton =
document.getElementById("settingsButton");

if(settingsButton){

settingsButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/settings.html";  

});

}

/* ==========================================================
YOGA ABHYAS
========================================================== */

const yogaButton =
document.getElementById("yogaButton");

if(yogaButton){

yogaButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/yoga-abhyas.html";  

});

}

/* ==========================================================
REPORT AN ISSUE
========================================================== */

const bugButton =
document.getElementById("bugButton");

if(bugButton){

bugButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/report-bug.html";  

});

}

/* ==========================================================
ABOUT DEVELOPER
========================================================== */

const aboutDeveloperButton =
document.getElementById("aboutDeveloperButton");

if(aboutDeveloperButton){

aboutDeveloperButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/about-developer.html";  

});

}

/* ==========================================================
PROFILE PAGE
========================================================== */

profileCard.addEventListener("click", function () {

window.location.href =  
    "pages/profile.html";

});

/* ==========================================================
ANNOUNCEMENTS
========================================================== */

const announcementButton =
document.getElementById("announcementButton");

if(announcementButton){

announcementButton.addEventListener("click", function(){  

    window.location.href =  
        "pages/announcements.html";  

});

}
/* ==========================================================
GREETING / ANNOUNCEMENT CARD
========================================================== */

// ==========================================================
// DATA
// ==========================================================

const cardData = {
isAnnouncement: false,

username: "Ishu",  

title: "",  

message: "Every breath is a new beginning."

};

// ==========================================================
// ELEMENTS
// ==========================================================

const greetingCard = document.getElementById("greetingCard");
const cardTitle = document.getElementById("cardTitle");
const cardMessage = document.getElementById("cardMessage");

// ==========================================================
// TIME-BASED GREETING
// ==========================================================

function getGreeting(){

const hour = new Date().getHours();  

if(hour >= 5 && hour < 12){  

    return "🌅 Good Morning";  

}  

if(hour >= 12 && hour < 17){  

    return "☀️ Good Afternoon";  

}  

if(hour >= 17 && hour < 21){  

    return "🌇 Good Evening";  

}  

return "🌙 Good Night";

}

// ==========================================================
// UPDATE CARD
// ==========================================================

function updateGreetingCard(){

if(cardData.isAnnouncement){  

    greetingCard.classList.remove("greeting-mode");  
    greetingCard.classList.add("announcement-mode");  

    cardTitle.textContent =  
        "📢 Important Announcement";  

    cardMessage.textContent =  
        cardData.message;  

}  

else{  

    greetingCard.classList.remove("announcement-mode");  
    greetingCard.classList.add("greeting-mode");  

    cardTitle.textContent =  
        `${getGreeting()}, ${cardData.username}`;  

    cardMessage.textContent =  
        cardData.message;  

}

}

// ==========================================================
// INITIALIZE
// ==========================================================

updateGreetingCard();

/* ==========================================================
ADMIN DASHBOARD
========================================================== */

const adminDashboard =
    document.getElementById("adminDashboard");

const pendingRequestCount =
document.getElementById(
"pendingRequestCount"
);

const allMemberCount =
document.getElementById(
"allMemberCount"
);

const pendingRequestsCard =
document.getElementById(
"pendingRequestsCard"
);

const allMembersCard =
document.getElementById(
"allMembersCard"
);

const dashboardLiveStatus =
document.getElementById(
"dashboardLiveStatus"
);

const dashboardTotalPresent =
document.getElementById(
"dashboardTotalPresent"
);

const dashboardAbsent =
document.getElementById(
"dashboardAbsent"
);

const monthClasses =
document.getElementById(
"monthClasses"
);

const monthAttendance =
document.getElementById(
"monthAttendance"
);



async function loadDashboard(){
    
    if(!canAccessDashboard()){

    return;

}

if(!pendingRequestCount){  

    return;  

}  

const pending =  
    await getPendingRequestCount();  

const approved =  
    await getApprovedMemberCount();  

pendingRequestCount.textContent =  
    pending;  

allMemberCount.textContent =  
approved;  

dashboardLiveStatus.textContent =  
    "🟡 Not Started";  

dashboardTotalPresent.textContent =  
    "0";  

dashboardAbsent.textContent =  
    approved;  

monthClasses.textContent =  
    "0";  

monthAttendance.textContent =  
    "0%";

}

loadDashboard();

/* ==========================================================
DASHBOARD SHORTCUTS
========================================================== */

pendingRequestsCard.addEventListener(

"click",  

function(){  

    window.location.href =  
        "pages/member-requests.html";  

}

);

allMembersCard.addEventListener(

"click",  

function(){  

    window.location.href =  
        "pages/all-members.html";  

}

);

/* ==========================================================
ADMIN — END WHOLE SESSION
========================================================== */

const startLiveClassButton =
    document.getElementById("startLiveClassButton");

const endWholeSessionButton =
    document.getElementById("endWholeSessionButton");

const dashboardSessionWarning =
    document.getElementById("dashboardSessionWarning");



/* ==========================================================
   LIVE CLASS
========================================================== */

const liveClass = {
    status: "none",
    zoomMeetingLink: "https://us05web.zoom.us/j/6163697724?pwd=KA2JcFfYYKpMk4J1FzPDQjnKCAKbJA.1"
};

const liveClassCard =
    document.querySelector(".live-class-card");

const liveIndicator =
    document.getElementById("liveIndicator");

const liveStatusText =
    document.getElementById("liveStatusText");

const liveClassSubtitle =
    document.getElementById("liveClassSubtitle");

const joinLiveButton =
    document.getElementById("joinLiveButton");

const joinButtonText =
    document.getElementById("joinButtonText");


/* ==========================================================
   UPDATE UI
========================================================== */

function updateLiveClass() {

    if (liveClass.status === "active") {

        liveClassCard.classList.remove("offline");
        liveIndicator.style.background = "var(--accent)";
        liveStatusText.textContent = "LIVE";
        liveClassSubtitle.textContent =
            "Today's guided yoga class is live.";

        joinButtonText.textContent =
            isAdmin ? "End Live Class" : "Join Live Class";

        joinLiveButton.disabled = false;
        return;
    }

    liveClassCard.classList.add("offline");

    if (isAdmin) {

        liveStatusText.textContent = "OFFLINE";
        liveClassSubtitle.textContent =
            "Start the live class when you're ready.";

        joinButtonText.textContent = "Start Live Class";
        joinLiveButton.disabled = false;
        return;
    }

    if (liveClass.status === "ended") {

        liveStatusText.textContent = "ENDED";
        liveClassSubtitle.textContent =
            "The live class has been ended.";

        joinButtonText.textContent = "Class Has Been Ended";
        joinLiveButton.disabled = true;
        return;
    }

    liveStatusText.textContent = "OFFLINE";
    liveClassSubtitle.textContent =
        "The live class hasn't been started yet.";

    joinButtonText.textContent = "Live Class Not Started";
    joinLiveButton.disabled = true;
}


/* ==========================================================
   MAIN LIVE CLASS BUTTON
========================================================== */

joinLiveButton.addEventListener("click", async function (e) {

    e.preventDefault();

    if (isAdmin) {

        try {

            joinLiveButton.disabled = true;

            if (liveClass.status === "active") {

                const confirmed = confirm(
                    "End the live class for everyone?"
                );

                if (!confirmed) return;

                joinButtonText.textContent = "Ending...";

                await endAttendanceSession();

            } else {

                joinButtonText.textContent = "Starting...";

                await startAttendanceSession();

            }

        } catch (error) {

            console.error("Live class control failed:", error);

            alert("Unable to update the live class. Please try again.");

        } finally {

            updateLiveClass();

        }

        return;
    }


    // Members can only join an active class.
    if (
        liveClass.status !== "active" ||
        !liveClass.zoomMeetingLink ||
        liveClass.zoomMeetingLink === "YOUR_PERMANENT_ZOOM_LINK"
    ) {
        return;
    }

    window.open(liveClass.zoomMeetingLink, "_blank");

});


/* ==========================================================
   LISTEN FOR TODAY'S GLOBAL SESSION
========================================================== */

listenToAttendanceSession(function (session) {

    if (!session) {
        liveClass.status = "none";
    } else if (session.status === "active") {
        liveClass.status = "active";
    } else if (session.status === "ended") {
        liveClass.status = "ended";
    } else {
        liveClass.status = "none";
    }

    updateLiveClass();

});


/* ==========================================================
   INITIALIZE
========================================================== */

updateLiveClass();


/* ==========================================================
SESSION CHECK
========================================================== */

(async function(){

    await checkSession();

    applyRoleAccess();

})();