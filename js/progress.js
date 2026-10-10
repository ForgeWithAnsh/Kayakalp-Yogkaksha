/* ==========================================================
   PROGRESS PAGE
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
   VIEW ALL ACHIEVEMENTS
========================================================== */

const viewAllButton =
    document.getElementById("viewAllButton");

if(viewAllButton){

    viewAllButton.addEventListener("click", function(){

        alert("Achievements page will be available in Version 2.");

    });

}