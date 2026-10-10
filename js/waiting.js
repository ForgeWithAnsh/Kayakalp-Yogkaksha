/* ==========================================================
   WAITING PAGE
========================================================== */


/* ==========================================================
   ELEMENTS
========================================================== */

const goToLoginButton =
    document.getElementById(
        "goToLoginButton"
    );


/* ==========================================================
   GO TO LOGIN
========================================================== */

goToLoginButton.addEventListener(
    "click",

    function(){

        window.location.href =
            "login.html";

    }

);


/* ==========================================================
   DISABLE BACK BUTTON
========================================================== */

history.pushState(
    null,

    "",

    location.href

);

window.addEventListener(

    "popstate",

    function(){

        history.pushState(

            null,

            "",

            location.href

        );

    }

);


/* ==========================================================
   ENTER KEY
========================================================== */

document.addEventListener(

    "keydown",

    function(event){

        if(event.key === "Enter"){

            goToLoginButton.click();

        }

    }

);