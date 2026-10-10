/* ==========================================================
   LOGIN PAGE
========================================================== */

import {

    loginUser,
    resetPassword

} from "./firebase.js";

import {

    loadCurrentUser,

    currentUser

} from "./session.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById("passwordInput");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginLoader =
    document.getElementById("loginLoader");

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

const createAccountButton =
    document.getElementById("createAccountButton");

const loginError =
    document.getElementById("loginError");


/* ==========================================================
   SHOW / HIDE PASSWORD
========================================================== */

const eyeIcon =
    document.getElementById("eyeIcon");

togglePassword.addEventListener("click", function(){

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        eyeIcon.innerHTML = `

            <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.8 21.8 0 015.06-5.94"></path>

            <path d="M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.8 21.8 0 01-3.17 4.55"></path>

            <path d="M1 1l22 22"></path>

        `;

        togglePassword.setAttribute(
            "aria-label",
            "Hide Password"
        );

    }

    else{

        passwordInput.type = "password";

        eyeIcon.innerHTML = `

            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>

            <circle
                cx="12"
                cy="12"
                r="3"></circle>

        `;

        togglePassword.setAttribute(
            "aria-label",
            "Show Password"
        );

    }

});


/* ==========================================================
   ENTER KEY
========================================================== */

document.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        loginButton.click();

    }

});


/* ==========================================================
   RIPPLE EFFECT
========================================================== */

function createRipple(button, event){

    const ripple =
        document.createElement("span");

    const size =
        Math.max(button.clientWidth, button.clientHeight);

    ripple.style.width = size + "px";

    ripple.style.height = size + "px";

    ripple.style.position = "absolute";

    ripple.style.borderRadius = "50%";

    ripple.style.background =
        "rgba(255,255,255,.35)";

    ripple.style.pointerEvents = "none";

    ripple.style.left =
        (event.offsetX - size / 2) + "px";

    ripple.style.top =
        (event.offsetY - size / 2) + "px";

    ripple.style.transform = "scale(0)";

    ripple.style.opacity = "1";

    ripple.style.transition =
        "transform .6s ease, opacity .6s ease";

    button.appendChild(ripple);

    requestAnimationFrame(function(){

        ripple.style.transform = "scale(2.5)";

        ripple.style.opacity = "0";

    });

    setTimeout(function(){

        ripple.remove();

    },600);

}


/* ==========================================================
   LOGIN BUTTON
========================================================== */

loginButton.addEventListener("click", async function(event){

    createRipple(loginButton, event);

    loginError.textContent = "";

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();

    if(email === ""){

        loginError.textContent =
            "Please enter your email.";

        emailInput.focus();

        return;

    }

    if(password === ""){

        loginError.textContent =
            "Please enter your password.";

        passwordInput.focus();

        return;

    }


    /* Loading */

    loginButton.disabled = true;

    loginButtonText.style.display = "none";

    loginLoader.style.display = "block";


try{

    const user =
        await loginUser(

            email,

            password

        );


    await loadCurrentUser();


    if(!currentUser){

        loginError.textContent =
            "User data not found.";

        return;

    }


    if(currentUser.approvalStatus === "pending"){

        window.location.href =
            "waiting.html";

        return;

    }


    if(currentUser.approvalStatus === "rejected"){

        window.location.href =
            "rejected.html";

        return;

    }


    window.location.href =
        "../index.html";


}

catch(error){

    switch(error.code){

        case "auth/invalid-credential":

            loginError.textContent =
                "Incorrect email or password.";
            break;

        case "auth/invalid-email":

            loginError.textContent =
                "Please enter a valid email address.";
            break;

        case "auth/too-many-requests":

            loginError.textContent =
                "Too many login attempts. Please try again later.";
            break;

        default:

            loginError.textContent =
                "Login failed. Please try again.";

    }

}

finally{

    loginLoader.style.display =
        "none";


    loginButtonText.style.display =
        "inline";


    loginButton.disabled =
        false;

}

});


/* ==========================================================
   FORGOT PASSWORD
========================================================== */

forgotPasswordButton.addEventListener(

    "click",

    async function(){

        const email =
            emailInput.value.trim();

        if(email === ""){

            loginError.textContent =
                "Enter your email first.";

            emailInput.focus();

            return;

        }

        try{

            await resetPassword(email);

            loginError.style.color =
                "#2E7D32";

            loginError.textContent =
                "Password reset link sent to your email.";

        }

        catch(error){

            loginError.style.color =
                "#C62828";

            loginError.textContent =
                "Unable to send reset email.";

        }

    }

);


/* ==========================================================
   CREATE ACCOUNT
========================================================== */

createAccountButton.addEventListener("click", function(){

    window.location.href =
        "signup.html";

});


/* ==========================================================
   AUTO FOCUS
========================================================== */

window.addEventListener("load", function(){

    emailInput.focus();

});