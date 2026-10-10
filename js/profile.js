/* ==========================================================
   BACK BUTTON
========================================================== */

const backButton =
    document.getElementById("backButton");

backButton.addEventListener("click", function(){

    window.location.href =
        "../index.html";

});



/* ==========================================================
   EDIT PROFILE
========================================================== */

const editProfileButton =
    document.getElementById("editProfileButton");

/* ==========================================================
   EDIT PROFILE PAGE
========================================================== */

editProfileButton.addEventListener("click", function(){

    window.location.href =
        "../pages/edit-profile.html";

});


/* ==========================================================
   LOAD PROFILE HEADER
========================================================== */

function loadProfileHeader(){

    document.getElementById("profilePhoto").src =
        profileData.profilePhoto;

    document.getElementById("profileFullName").textContent =
        profileData.fullName;

    document.getElementById("profileMemberId").textContent =
        "Member ID : " + profileData.memberId;

    document.getElementById("profileMemberStatus").textContent =
        profileData.memberStatus;
        
    document.getElementById("profileRole").textContent =
    "Role : " + profileData.role;

}

loadProfileHeader();



/* ==========================================================
   LOAD PERSONAL INFORMATION
========================================================== */

function loadPersonalInformation(){

    document.getElementById("profileAge").textContent =
        profileData.age;

    document.getElementById("profileGender").textContent =
        profileData.gender;

    document.getElementById("profileDob").textContent =
        profileData.dob;

    document.getElementById("profilePhone").textContent =
        profileData.phone;

    document.getElementById("profileEmail").textContent =
        profileData.email;

    document.getElementById("profileAddress").textContent =
        profileData.address;

}

loadPersonalInformation();


/* ==========================================================
   LOAD YOGA STATISTICS
========================================================== */

function loadYogaStatistics(){

    document.getElementById(
        "totalAttendance"
    ).textContent =
        profileData.statistics.totalAttendance;

    document.getElementById(
        "currentStreak"
    ).textContent =
        profileData.statistics.currentStreak;

    document.getElementById(
        "practiceHours"
    ).textContent =
        profileData.statistics.practiceHours;

}

loadYogaStatistics();


/* ==========================================================
   CHANGE PASSWORD
========================================================== */

const changePasswordButton =
    document.getElementById("changePasswordButton");

changePasswordButton.addEventListener("click", function(){

    window.location.href =
        "../pages/change-password.html";

});


/* ==========================================================
   LOGOUT
========================================================== */

const logoutButton =
    document.getElementById("logoutButton");

const logoutPopupOverlay =
    document.getElementById("logoutPopupOverlay");

const logoutPopupTitle =
    document.getElementById("logoutPopupTitle");

const logoutPopupMessage =
    document.getElementById("logoutPopupMessage");

const logoutCancelButton =
    document.getElementById("logoutCancelButton");

const logoutConfirmButton =
    document.getElementById("logoutConfirmButton");

let confirmLogout = false;


/* ==========================================================
   OPEN POPUP
========================================================== */

logoutButton.addEventListener("click", function(){

    confirmLogout = false;

    logoutPopupTitle.textContent =
        "Logout";

    logoutPopupMessage.textContent =
        "Are you sure you want to logout?";

    logoutConfirmButton.textContent =
        "Logout";

    logoutPopupOverlay.classList.add("show");

});


/* ==========================================================
   GO BACK
========================================================== */

logoutCancelButton.addEventListener("click", function(){

    logoutPopupOverlay.classList.remove("show");

});


/* ==========================================================
   CONFIRM
========================================================== */

logoutConfirmButton.addEventListener("click", function(){

    if(!confirmLogout){

        confirmLogout = true;

        logoutPopupTitle.textContent =
            "Confirm Logout";

        logoutPopupMessage.textContent =
            "You will need to login again to access your account.";

        logoutConfirmButton.textContent =
            "Confirm Logout";

        return;

    }

    // Later we'll clear login session here

    window.location.href =
        "../pages/login.html";

});