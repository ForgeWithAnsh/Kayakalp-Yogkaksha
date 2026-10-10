/* ==========================================================
   ANNOUNCEMENTS PAGE
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

const announcementText =
    document.getElementById("announcementText");

const sendAnnouncementButton =
    document.getElementById("sendAnnouncementButton");

const announcementsContainer =
    document.getElementById("announcementsContainer");


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

    if(!popupOverlay) return;

    popupIcon.textContent = icon;

    popupTitle.textContent = title;

    popupMessage.textContent = message;

    popupOverlay.classList.add("show");

}


/* ==========================================================
   CLOSE POPUP
========================================================== */

if(popupButton){

    popupButton.addEventListener("click", function(){

        popupOverlay.classList.remove("show");

    });

}

if(popupOverlay){

    popupOverlay.addEventListener("click", function(event){

        if(event.target === popupOverlay){

            popupOverlay.classList.remove("show");

        }

    });

}


/* ==========================================================
   SEND ANNOUNCEMENT
========================================================== */

sendAnnouncementButton.addEventListener("click", function(){

    const message =
        announcementText.value.trim();

    if(message === ""){

        showPopup(

            "⚠️",

            "Empty Announcement",

            "Please write an announcement before sending."

        );

        return;

    }


    /* Current Date & Time */

    const now = new Date();

    const date =
        now.toLocaleDateString("en-IN",{

            day:"2-digit",

            month:"short",

            year:"numeric"

        });

    const time =
        now.toLocaleTimeString("en-IN",{

            hour:"2-digit",

            minute:"2-digit"

        });


    /* Create Announcement Card */

    const card =
        document.createElement("section");

    card.className =
        "announcement-card";

    card.innerHTML = `

        <div class="announcement-top">

            <span class="announcement-icon">

                📢

            </span>

            <span class="announcement-date">

                ${date} • ${time}

            </span>

        </div>

        <h2>

            New Announcement

        </h2>

        <p>

            ${message.replace(/\n/g,"<br>")}

        </p>

    `;


    /* Add Card At Top */

    announcementsContainer.appendChild(card);;


    /* Clear Text */

    announcementText.value = "";
    
    window.scrollTo({

    top:document.body.scrollHeight,

    behavior:"smooth"

});


    showPopup(

        "📢",

        "Announcement Sent",

        "Your announcement has been added."

    );

});

/* ==========================================================
   OPEN PAGE FROM BOTTOM
========================================================== */

window.addEventListener("load", function(){

    window.scrollTo({

        top:document.body.scrollHeight,

        behavior:"instant"

    });

});