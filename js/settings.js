/* ==========================================================
   SETTINGS PAGE
========================================================== */


/* ==========================================================
   BACK BUTTON
========================================================== */

const backButton =
    document.getElementById("backButton");

if(backButton){

    backButton.addEventListener("click", function(){

        window.history.back();

    });

}


/* ==========================================================
   ELEMENTS
========================================================== */

const checkUpdatesButton =
    document.getElementById("checkUpdatesButton");

const privacyPolicyButton =
    document.getElementById("privacyPolicyButton");

const termsButton =
    document.getElementById("termsButton");


/* ==========================================================
   CHECK FOR UPDATES
========================================================== */

if(checkUpdatesButton){

    checkUpdatesButton.addEventListener("click", function(){

        alert(
            "You're already using the latest version."
        );

    });

}


/* ==========================================================
   PRIVACY POLICY
========================================================== */

if(privacyPolicyButton){

    privacyPolicyButton.addEventListener("click", function(){

        alert(
            "Privacy Policy page will be available soon."
        );

    });

}


/* ==========================================================
   TERMS & CONDITIONS
========================================================== */

if(termsButton){

    termsButton.addEventListener("click", function(){

        alert(
            "Terms & Conditions page will be available soon."
        );

    });

}


/* ==========================================================
   NOTIFICATION SWITCHES
========================================================== */

const announcementNotification =
    document.getElementById("announcementNotification");

const liveReminder =
    document.getElementById("liveReminder");


announcementNotification.addEventListener("change", function(){

    console.log(
        "Announcement Notifications:",
        this.checked
    );

});


liveReminder.addEventListener("change", function(){

    console.log(
        "Live Class Reminder:",
        this.checked
    );

});