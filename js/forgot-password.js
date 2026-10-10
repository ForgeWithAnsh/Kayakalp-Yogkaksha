/* ==========================================================
   FORGOT PASSWORD
========================================================== */

import {

    resetPassword

} from "./firebase.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const emailInput =
    document.getElementById("emailInput");

const resetButton =
    document.getElementById("sendButton");

const resetButtonText =
    document.getElementById("buttonText");

const resetLoader =
    document.getElementById("buttonLoader");

const message =
    document.getElementById("message");

const backButton =
    document.getElementById("backButton");


/* ==========================================================
   RESET PASSWORD
========================================================== */

resetButton.addEventListener(

    "click",

    async function(){

        message.textContent = "";

        const email =
            emailInput.value.trim();

        if(email === ""){

            message.style.color =
                "#C62828";

            message.textContent =
                "Please enter your email.";

            emailInput.focus();

            return;

        }

        resetButton.disabled = true;

        resetButtonText.style.display =
            "none";

        resetLoader.style.display =
            "inline-block";

        try{

            await resetPassword(email);

            message.style.color =
                "#2E7D32";

            message.textContent =
                "Password reset link sent. Check your inbox and spam folder.";

        }

        catch(error){

            message.style.color =
                "#C62828";

            switch(error.code){

                case "auth/user-not-found":

                    message.textContent =
                        "No account exists with this email.";

                    break;

                case "auth/invalid-email":

                    message.textContent =
                        "Please enter a valid email address.";

                    break;

                default:

                    message.textContent =
                        "Something went wrong. Please try again.";

            }

        }

        finally{

            resetLoader.style.display =
                "none";

            resetButtonText.style.display =
                "inline";

            resetButton.disabled =
                false;

        }

    }

);


/* ==========================================================
   BACK TO LOGIN
========================================================== */

backButton.addEventListener(

    "click",

    function(){

        window.location.href =
            "login.html";

    }

);


/* ==========================================================
   ENTER KEY
========================================================== */

document.addEventListener(

    "keydown",

    function(event){

        if(event.key === "Enter"){

            resetButton.click();

        }

    }

);


/* ==========================================================
   AUTO FOCUS
========================================================== */

window.addEventListener(

    "load",

    function(){

        emailInput.focus();

    }

);