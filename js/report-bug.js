import { submitBugReport } from "./app-data.js";
import { checkSession } from "./session.js";

/* ==========================================================
   REPORT ISSUE PAGE
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

const issueTitle =
    document.getElementById("issueTitle");

const issueCategory =
    document.getElementById("issueCategory");

const issueDescription =
    document.getElementById("issueDescription");

const device =
    document.getElementById("device");

const attachButton =
    document.getElementById("attachButton");

const submitButton =
    document.getElementById("submitButton");


/* ==========================================================
   POPUP ELEMENTS
========================================================== */

const popupOverlay =
    document.getElementById("messagePopupOverlay");

const popupIcon =
    document.getElementById("popupIcon");

const popupTitle =
    document.getElementById("popupTitle");

const popupMessage =
    document.getElementById("popupMessage");

const popupButton =
    document.getElementById("popupButton");


/* ==========================================================
   SHOW POPUP
========================================================== */

function showPopup(icon, title, message){

    popupIcon.textContent = icon;

    popupTitle.textContent = title;

    popupMessage.textContent = message;

    popupOverlay.classList.add("show");

}


/* ==========================================================
   CLOSE POPUP
========================================================== */

popupButton.addEventListener("click", function(){

    popupOverlay.classList.remove("show");

});

popupOverlay.addEventListener("click", function(event){

    if(event.target === popupOverlay){

        popupOverlay.classList.remove("show");

    }

});


/* ==========================================================
   ATTACH SCREENSHOT
========================================================== */

attachButton.addEventListener("click", function(){

    showPopup(

        "📷",

        "Coming Soon",

        "Screenshot attachment will be available in a future update."

    );

});


/* ==========================================================
   SUBMIT REPORT
========================================================== */

submitButton.addEventListener("click", async function(){

    if(issueTitle.value.trim() === ""){

        showPopup(

            "⚠️",

            "Missing Title",

            "Please enter an issue title."

        );

        return;

    }


    if(issueCategory.selectedIndex === 0){

        showPopup(

            "⚠️",

            "Select Category",

            "Please choose an issue category."

        );

        return;

    }


    if(issueDescription.value.trim() === ""){

        showPopup(

            "⚠️",

            "Missing Description",

            "Please describe the issue."

        );

        return;

    }


    submitButton.disabled = true;
    try {
        const user = await checkSession();
        if (!user) return;
        await submitBugReport(user.uid, {
            title: issueTitle.value.trim(),
            category: issueCategory.value,
            description: issueDescription.value.trim(),
            device: device.value.trim()
        });
        showPopup("✅", "Report sent", "Thank you for reporting the issue.");
    } catch {
        showPopup("⚠️", "Report not sent", "Check your connection and try again.");
        return;
    } finally {
        submitButton.disabled = false;
    }


    issueTitle.value = "";

    issueCategory.selectedIndex = 0;

    issueDescription.value = "";

    device.value = "";

});