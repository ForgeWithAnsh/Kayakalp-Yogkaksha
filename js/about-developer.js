/* ==========================================================
   ABOUT DEVELOPER PAGE
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
   CONTACT LINKS
========================================================== */

const instagramLink =
    document.getElementById("instagramLink");

const githubLink =
    document.getElementById("githubLink");


instagramLink.addEventListener("click", function(event){

    event.preventDefault();

    // Replace with your Instagram link later.
    // Example:
    // window.open("https://instagram.com/forgewithansh");

});


githubLink.addEventListener("click", function(event){

    event.preventDefault();

    // Replace with your GitHub link later.
    // Example:
    // window.open("https://github.com/forgewithansh");

});