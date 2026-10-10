/* ==========================================================
   SIGNUP PAGE
========================================================== */


import {

    auth,

    db,

    storage,

    signUp,

    saveUserData

} from "./firebase.js";


console.log("Firebase Connected ✅");

console.log(auth);

console.log(db);

console.log(storage);


/* ==========================================================
   ELEMENTS
========================================================== */

const profileImage =
    document.getElementById("profileImage");

const profilePreview =
    document.getElementById("profilePreview");

const choosePhotoButton =
    document.getElementById("choosePhotoButton");

const nameInput =
    document.getElementById("nameInput");

const dobInput =
    document.getElementById("dobInput");

const genderInput =
    document.getElementById("genderInput");

const phoneInput =
    document.getElementById("phoneInput");

const emailInput =
    document.getElementById("emailInput");

const addressInput =
    document.getElementById("addressInput");

const parkInput =
    document.getElementById("parkInput");

const healthInput =
    document.getElementById("healthInput");

const passwordInput =
    document.getElementById("passwordInput");

const confirmPasswordInput =
    document.getElementById("confirmPasswordInput");

const togglePassword =
    document.getElementById("togglePassword");

const eyeIcon =
    document.getElementById("eyeIcon");

const signupButton =
    document.getElementById("signupButton");

const signupButtonText =
    document.getElementById("signupButtonText");

const signupLoader =
    document.getElementById("signupLoader");

const signupError =
    document.getElementById("signupError");

const loginPageButton =
    document.getElementById("loginPageButton");


/* ==========================================================
   PROFILE PHOTO
========================================================== */

choosePhotoButton.addEventListener("click", function(){

    profileImage.click();

});


profileImage.addEventListener("change", function(){

    const file = this.files[0];

    if(!file){

        return;

    }

    const reader =
        new FileReader();

    reader.onload = function(event){

        profilePreview.src =
            event.target.result;

    };

    reader.readAsDataURL(file);

});


/* ==========================================================
   SHOW / HIDE PASSWORD
========================================================== */

togglePassword.addEventListener("click", function(){

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        confirmPasswordInput.type = "text";

        eyeIcon.innerHTML = `

            <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12"></path>

            <path d="M1 1l22 22"></path>

        `;

        togglePassword.setAttribute(
            "aria-label",
            "Hide Password"
        );

    }

    else{

        passwordInput.type = "password";

        confirmPasswordInput.type = "password";

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
   AUTO FOCUS
========================================================== */

window.addEventListener("load", function(){

    nameInput.focus();

});

/* ==========================================================
   VALIDATION FUNCTIONS
========================================================== */

function showError(message){

    signupError.textContent = message;

}

function clearError(){

    signupError.textContent = "";

}


/* ==========================================================
   PHONE NUMBER
========================================================== */

phoneInput.addEventListener("input", function(){

    this.value =
        this.value.replace(/\D/g,"");

    if(this.value.length > 10){

        this.value =
            this.value.slice(0,10);

    }

});


/* ==========================================================
   DATE OF BIRTH
========================================================== */

const today =
    new Date().toISOString().split("T")[0];

dobInput.max = today;


/* ==========================================================
   EMAIL VALIDATION
========================================================== */

function isValidEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* ==========================================================
   PASSWORD STRENGTH
========================================================== */

function isStrongPassword(password){

    return password.length >= 6;

}


/* ==========================================================
   VALIDATE FORM
========================================================== */

function validateForm(){

    clearError();


    /* Full Name */

    if(nameInput.value.trim() === ""){

        showError(
            "Please enter your full name."
        );

        nameInput.focus();

        return false;

    }


    /* Date of Birth */

    if(dobInput.value === ""){

        showError(
            "Please select your date of birth."
        );

        dobInput.focus();

        return false;

    }


    /* Gender */

    if(genderInput.value === ""){

        showError(
            "Please select your gender."
        );

        genderInput.focus();

        return false;

    }


    /* Phone */

    if(phoneInput.value.length !== 10){

        showError(
            "Please enter a valid phone number."
        );

        phoneInput.focus();

        return false;

    }


    /* Email */

    if(emailInput.value.trim() === ""){

        showError(
            "Please enter your email address."
        );

        emailInput.focus();

        return false;

    }

    if(!isValidEmail(emailInput.value.trim())){

        showError(
            "Please enter a valid email."
        );

        emailInput.focus();

        return false;

    }


    /* Park */

    if(parkInput.value === ""){

        showError(
            "Please select your preferred park."
        );

        parkInput.focus();

        return false;

    }


    /* Password */

    if(passwordInput.value === ""){

        showError(
            "Please create a password."
        );

        passwordInput.focus();

        return false;

    }


    if(!isStrongPassword(passwordInput.value)){

        showError(
            "Password must be at least 6 characters long."
        );

        passwordInput.focus();

        return false;

    }


    /* Confirm Password */

    if(confirmPasswordInput.value === ""){

        showError(
            "Please confirm your password."
        );

        confirmPasswordInput.focus();

        return false;

    }


    if(passwordInput.value !== confirmPasswordInput.value){

        showError(
            "Passwords do not match."
        );

        confirmPasswordInput.focus();

        return false;

    }


    return true;

}


/* ==========================================================
   RIPPLE EFFECT
========================================================== */

function createRipple(button,event){

    const ripple =
        document.createElement("span");

    const size =
        Math.max(button.clientWidth,button.clientHeight);

    ripple.style.width =
        size + "px";

    ripple.style.height =
        size + "px";

    ripple.style.position =
        "absolute";

    ripple.style.borderRadius =
        "50%";

    ripple.style.background =
        "rgba(255,255,255,.35)";

    ripple.style.pointerEvents =
        "none";

    ripple.style.left =
        (event.offsetX - size/2) + "px";

    ripple.style.top =
        (event.offsetY - size/2) + "px";

    ripple.style.transform =
        "scale(0)";

    ripple.style.opacity =
        "1";

    ripple.style.transition =
        "transform .6s ease, opacity .6s ease";

    button.appendChild(ripple);

    requestAnimationFrame(function(){

        ripple.style.transform =
            "scale(2.5)";

        ripple.style.opacity =
            "0";

    });

    setTimeout(function(){

        ripple.remove();

    },600);

}


/* ==========================================================
   CREATE ACCOUNT
========================================================== */

signupButton.addEventListener("click", async function(event){

    createRipple(signupButton,event);

    if(!validateForm()){

        return;

    }

    signupButton.disabled = true;

    signupButtonText.style.display =
        "none";

    signupLoader.style.display =
        "block";


    /* ======================================================
       FIREBASE CODE WILL COME HERE
    ====================================================== */

    try{
        
        const user = await signUp(

    emailInput.value.trim(),

    passwordInput.value

);

    await saveUserData(

    user.uid,

    {

        fullName:
            nameInput.value.trim(),

        dob:
            dobInput.value,

        gender:
            genderInput.value,

        phone:
            phoneInput.value.trim(),

        email:
            emailInput.value.trim(),

        address:
            addressInput.value.trim(),

        park:
            parkInput.value,

        health:
            healthInput.value.trim(),

        role: "member",

approvalStatus: "pending",

statuses: [],

        createdAt:
            new Date().toISOString()

    }

);

    signupLoader.style.display =
        "none";

    signupButtonText.style.display =
        "inline";

    signupButton.disabled =
        false;

    window.location.href = "waiting.html";

}

catch(error){

    signupLoader.style.display =
        "none";

    signupButtonText.style.display =
        "inline";

    signupButton.disabled =
        false;

    showError(error.message);

}

});


/* ==========================================================
   LOGIN PAGE
========================================================== */

loginPageButton.addEventListener("click",function(){

    window.location.href =
        "login.html";

});


/* ==========================================================
   ENTER KEY
========================================================== */

document.addEventListener("keydown",function(event){

    if(event.key === "Enter"){

        signupButton.click();

    }

});