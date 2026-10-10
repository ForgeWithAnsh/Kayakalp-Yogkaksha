/* ==========================================================
   BACK BUTTON
========================================================== */

const backButton =
    document.getElementById("backButton");

backButton.addEventListener("click", function(){

    window.location.href =
        "../pages/profile.html";

});


/* ==========================================================
   LOAD PROFILE PHOTO
========================================================== */

document.getElementById("editProfilePhoto").src =
    profileData.profilePhoto;
    
    
    /* ==========================================================
   LOAD FORM DATA
========================================================== */

function loadFormData(){

    fullNameInput.value = profileData.fullName;

    ageInput.value = profileData.age;

    genderInput.value = profileData.gender;

    dobInput.value = profileData.dob;

    phoneInput.value = profileData.phone;

    emailInput.value = profileData.email;

    addressInput.value = profileData.address;

}

loadFormData();


/* ==========================================================
   SAVE PROFILE
========================================================== */

const saveProfileButton =
    document.getElementById("saveProfileButton");

saveProfileButton.addEventListener("click", function(){

    alert("Save Changes functionality will be added next.");

});