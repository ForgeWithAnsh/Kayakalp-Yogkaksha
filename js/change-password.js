/* ==========================================================
   CHANGE PASSWORD PAGE
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

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const showPassword =
    document.getElementById("showPassword");

const changePasswordButton =
    document.getElementById("changePasswordButton");


/* ==========================================================
   POPUP
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


function showPopup(icon, title, message){

    popupIcon.textContent = icon;

    popupTitle.textContent = title;

    popupMessage.textContent = message;

    popupOverlay.classList.add("show");

}


popupButton.addEventListener("click", function(){

    popupOverlay.classList.remove("show");

});


popupOverlay.addEventListener("click", function(event){

    if(event.target === popupOverlay){

        popupOverlay.classList.remove("show");

    }

});


/* ==========================================================
   SHOW / HIDE PASSWORDS
========================================================== */

showPassword.addEventListener("change", function(){

    const type =
        this.checked ? "text" : "password";

    currentPassword.type = type;

    newPassword.type = type;

    confirmPassword.type = type;

});


/* ==========================================================
   CHANGE PASSWORD
========================================================== */

changePasswordButton.addEventListener("click", function(){

    const current =
        currentPassword.value.trim();

    const newPass =
        newPassword.value.trim();

    const confirm =
        confirmPassword.value.trim();


    if(current === "" ||
       newPass === "" ||
       confirm === ""){

        showPopup(
            "⚠️",
            "Incomplete",
            "Please fill all fields."
        );

        return;

    }


    if(newPass.length < 6){

        showPopup(
            "🔒",
            "Weak Password",
            "Password must contain at least 6 characters."
        );

        return;

    }


    if(newPass !== confirm){

        showPopup(
            "❌",
            "Mismatch",
            "Passwords do not match."
        );

        return;

    }


    showPopup(
        "✅",
        "Success",
        "Password changed successfully!"
    );


    currentPassword.value = "";

    newPassword.value = "";

    confirmPassword.value = "";

    showPassword.checked = false;

    currentPassword.type = "password";

    newPassword.type = "password";

    confirmPassword.type = "password";

});