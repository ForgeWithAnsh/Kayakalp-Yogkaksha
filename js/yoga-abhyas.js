/* ==========================================================
   YOGA ABHYAS PAGE
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
   VIDEO POPUP
========================================================== */

const videoButtons =
    document.querySelectorAll(".video-button");

const videoPopupOverlay =
    document.getElementById("videoPopupOverlay");

const closeVideoPopup =
    document.getElementById("closeVideoPopup");

videoButtons.forEach(function(button){

    button.addEventListener("click", function(){

        videoPopupOverlay.classList.add("show");

    });

});

closeVideoPopup.addEventListener("click", function(){

    videoPopupOverlay.classList.remove("show");

});

videoPopupOverlay.addEventListener("click", function(event){

    if(event.target === videoPopupOverlay){

        videoPopupOverlay.classList.remove("show");

    }

});