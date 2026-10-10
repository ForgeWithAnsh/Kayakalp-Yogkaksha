/* ==========================================================
ROUTINE PAGE
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