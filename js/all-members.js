/* ==========================================================
   ALL MEMBERS PAGE
========================================================== */

import {

    getUsersByApprovalStatus

} from "./firebase.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const backButton =
    document.getElementById("backButton");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const membersContainer =
    document.getElementById("membersContainer");

const emptyState =
    document.getElementById("emptyState");


/* ==========================================================
   MEMBER PROFILE
========================================================== */

const memberProfileOverlay =
    document.getElementById(
        "memberProfileOverlay"
    );

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const profileName =
    document.getElementById(
        "profileName"
    );

const profileRole =
    document.getElementById(
        "profileRole"
    );

const profileMemberId =
    document.getElementById(
        "profileMemberId"
    );

const profilePhone =
    document.getElementById(
        "profilePhone"
    );

const profileGender =
    document.getElementById(
        "profileGender"
    );

const profileDob =
    document.getElementById(
        "profileDob"
    );

const profileAge =
    document.getElementById(
        "profileAge"
    );

const profilePark =
    document.getElementById(
        "profilePark"
    );

const profileHealth =
    document.getElementById(
        "profileHealth"
    );

const profileEmail =
    document.getElementById(
        "profileEmail"
    );

const profileAddress =
    document.getElementById(
        "profileAddress"
    );

const profileJoined =
    document.getElementById(
        "profileJoined"
    );

const profileAttendance =
    document.getElementById(
        "profileAttendance"
    );

const manageMemberButton =
    document.getElementById(
        "manageMemberButton"
    );


/* ==========================================================
   MANAGE POPUP
========================================================== */

const managePopupOverlay =
    document.getElementById(
        "managePopupOverlay"
    );

const closeManagePopup =
    document.getElementById(
        "closeManagePopup"
    );

const currentRoleCard =
    document.getElementById(
        "currentRoleCard"
    );

const roleOptions =
    document.getElementById(
        "roleOptions"
    );
    
    
const manageMemberName =
    document.getElementById(
        "manageMemberName"
    );

const timeoutOptions =
    document.getElementById(
        "timeoutOptions"
    );

const kickCheckbox =
    document.getElementById(
        "kickCheckbox"
    );

const banCheckbox =
    document.getElementById(
        "banCheckbox"
    );

const kickOption =
    document.getElementById(
        "kickOption"
    );

const banOption =
    document.getElementById(
        "banOption"
    );

const saveChangesButton =
    document.getElementById(
        "saveChangesButton"
    );

const moderationConfirmOverlay =
    document.getElementById(
        "moderationConfirmOverlay"
    );

const confirmationIcon =
    document.getElementById(
        "confirmationIcon"
    );

const confirmationTitle =
    document.getElementById(
        "confirmationTitle"
    );

const confirmationMessage =
    document.getElementById(
        "confirmationMessage"
    );

const cancelConfirmation =
    document.getElementById(
        "cancelConfirmation"
    );

const confirmModeration =
    document.getElementById(
        "confirmModeration"
    );


/* ==========================================================
   VARIABLES
========================================================== */

let allMembers = [];

let selectedMember = null;

/* Temporary.
   Later this will come from Firebase. */

let currentUserRole =
    "admin";
    
    
let pendingChanges = {

    role:null,

    timeout:"none",

    kick:false,

    ban:false

};

let originalChanges = {

    role:null,

    timeout:"none",

    kick:false,

    ban:false

};

let pendingConfirmationAction = null;
    
    /* ==========================================================
   BACK BUTTON
========================================================== */

backButton.addEventListener(

    "click",

    function(){

        history.back();

    }

);


/* ==========================================================
   LOAD MEMBERS
========================================================== */

async function loadMembers(){

    allMembers =
        await getUsersByApprovalStatus(
            "approved"
        );

    renderMembers(allMembers);

}

loadMembers();


/* ==========================================================
   CALCULATE AGE
========================================================== */

function calculateAge(dob){

    if(!dob){

        return "-";

    }

    const birthDate =
        new Date(dob);

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const month =
        today.getMonth() -
        birthDate.getMonth();

    if(

        month < 0 ||

        (

            month === 0 &&

            today.getDate() <
            birthDate.getDate()

        )

    ){

        age--;

    }

    return age + " Years";

}


/* ==========================================================
   OPEN MEMBER PROFILE
========================================================== */

function openMemberProfile(member){

    selectedMember = member;

    profileAvatar.textContent =
        member.fullName
            .charAt(0)
            .toUpperCase();

    profileName.textContent =
        member.fullName;

    profileRole.textContent =
        (member.role || "Member")
            .toUpperCase();

    profileMemberId.textContent =
        member.memberId || "-";

    profilePhone.textContent =
        member.phone || "-";

    profileGender.textContent =
        member.gender || "-";

    profileDob.textContent =
        member.dob || "-";

    profileAge.textContent =
        calculateAge(member.dob);

    profilePark.textContent =
        member.park || "-";

    profileHealth.textContent =
        member.health || "-";

    profileEmail.textContent =
        member.email || "-";

    profileAddress.textContent =
        member.address || "-";

    profileJoined.textContent =
        member.joinedAt || "-";

    profileAttendance.textContent =
        "Coming Soon";

    memberProfileOverlay
        .classList
        .add("show");

}


/* ==========================================================
   CLOSE MEMBER PROFILE
========================================================== */

memberProfileOverlay.addEventListener(

    "click",

    function(event){

        if(

            event.target ===
            memberProfileOverlay

        ){

            memberProfileOverlay
                .classList
                .remove("show");

        }

    }

);


/* ==========================================================
   RENDER MEMBERS
========================================================== */

function renderMembers(members){

    membersContainer.innerHTML = "";

    if(members.length === 0){

        emptyState.style.display =
            "block";

        return;

    }

    emptyState.style.display =
        "none";

    members.forEach(function(member){

        const card =
            document.createElement("div");

        card.className =
            "member-card";

        card.innerHTML = `

            <div class="member-photo">

                ${member.fullName
                    .charAt(0)
                    .toUpperCase()}

            </div>

            <div class="member-info">

                <span class="member-name">

                    ${member.fullName}

                </span>

                <span class="member-id">

                    ${member.memberId}

                </span>

            </div>

        `;

        card.addEventListener(

            "click",

            function(){

                openMemberProfile(member);

            }

        );

        membersContainer.appendChild(card);

    });

}


/* ==========================================================
   SEARCH
========================================================== */

searchInput.addEventListener(

    "input",

    function(){

        const search =

            this.value

                .toLowerCase()

                .trim();

        const filtered =

            allMembers.filter(

                function(member){

                    return(

                        member.fullName

                            .toLowerCase()

                            .includes(search)

                        ||

                        (member.memberId || "")

                            .toLowerCase()

                            .includes(search)

                    );

                }

            );

        renderMembers(filtered);

    }

);


/* ==========================================================
   SORT
========================================================== */

sortSelect.addEventListener(

    "change",

    function(){

        let sorted =
            [...allMembers];

        switch(this.value){

            case "az":

                sorted.sort(

                    (a,b)=>

                    a.fullName.localeCompare(

                        b.fullName

                    )

                );

                break;

            case "za":

                sorted.sort(

                    (a,b)=>

                    b.fullName.localeCompare(

                        a.fullName

                    )

                );

                break;

            case "newest":

                sorted.sort(

                    (a,b)=>

                    new Date(b.joinedAt) -

                    new Date(a.joinedAt)

                );

                break;

            case "oldest":

                sorted.sort(

                    (a,b)=>

                    new Date(a.joinedAt) -

                    new Date(b.joinedAt)

                );

                break;

            case "memberid":

                sorted.sort(

                    (a,b)=>

                    a.memberId.localeCompare(

                        b.memberId

                    )

                );

                break;

        }

        renderMembers(sorted);

    }

);


/* ==========================================================
   MANAGE POPUP — ROLE HIERARCHY
========================================================== */

function getAvailableRoles(targetRole){

    let roles = [];


    /* ======================================================
       ADMIN
    ======================================================= */

    if(currentUserRole === "admin"){

        if(targetRole === "member"){

            roles = [
                "moderator",
                "host"
            ];

        }

        else if(targetRole === "moderator"){

            roles = [
                "member",
                "host"
            ];

        }

        else if(targetRole === "host"){

            roles = [
                "member",
                "moderator"
            ];

        }

    }


    /* ======================================================
       HOST
    ======================================================= */

    else if(currentUserRole === "host"){

        if(targetRole === "member"){

            roles = [
                "moderator"
            ];

        }

        else if(targetRole === "moderator"){

            roles = [
                "member"
            ];

        }

    }


    return roles;

}


/* ==========================================================
   ENABLE SAVE BUTTON
========================================================== */

function checkForChanges(){

    const changed =

        pendingChanges.role !==
            originalChanges.role

        ||

        pendingChanges.timeout !==
            originalChanges.timeout

        ||

        pendingChanges.kick !==
            originalChanges.kick

        ||

        pendingChanges.ban !==
            originalChanges.ban;


    saveChangesButton.disabled =
        !changed;

}


/* ==========================================================
   RESET MANAGE POPUP
========================================================== */

function resetManagePopup(){

    pendingChanges = {

        role:null,

        timeout:"none",

        kick:false,

        ban:false

    };


    originalChanges = {

        role:null,

        timeout:"none",

        kick:false,

        ban:false

    };


    /* Reset checkboxes */

    kickCheckbox.checked =
        false;

    banCheckbox.checked =
        false;


    /* Reset timeout */

    document
        .querySelectorAll(
            ".timeout-option"
        )
        .forEach(function(option){

            option.classList.remove(
                "selected"
            );

        });


    const noneOption =
        document.querySelector(
            '.timeout-option[data-timeout="none"]'
        );


    if(noneOption){

        noneOption.classList.add(
            "selected"
        );

    }


    /* Reset disabled states */

    kickOption.classList.remove(
        "disabled"
    );

    banOption.classList.remove(
        "disabled"
    );


    document
        .querySelectorAll(
            ".timeout-option"
        )
        .forEach(function(option){

            option.classList.remove(
                "disabled"
            );

        });


    /* Disable Save */

    saveChangesButton.disabled =
        true;

}


/* ==========================================================
   OPEN MANAGE POPUP
========================================================== */

manageMemberButton.addEventListener(

    "click",

    function(){

        if(!selectedMember){

            return;

        }


        /* Reset everything */

        resetManagePopup();


        /* Member name */

        manageMemberName.textContent =
            selectedMember.fullName;


        /* Current role */

        const currentRole =
            (
                selectedMember.role ||
                "member"
            ).toLowerCase();


        currentRoleCard.textContent =

            "🟢 " +

            currentRole
                .charAt(0)
                .toUpperCase() +

            currentRole.slice(1);


        /* Store original role */

        originalChanges.role =
            currentRole;


        pendingChanges.role =
            currentRole;


        /* ==================================================
           ROLE OPTIONS
        =================================================== */

        roleOptions.innerHTML = "";


        const availableRoles =
            getAvailableRoles(
                currentRole
            );


        availableRoles.forEach(

            function(role){

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "role-card";


                card.dataset.role =
                    role;


                card.innerHTML = `

                    <span>
                        ⚪
                    </span>

                    <span>

                        ${
                            role
                                .charAt(0)
                                .toUpperCase() +
                            role.slice(1)

                        }

                    </span>

                `;


                card.addEventListener(

                    "click",

                    function(){

                        /* Only one role */

                        document
                            .querySelectorAll(
                                "#roleOptions .role-card"
                            )
                            .forEach(
                                function(item){

                                    item.classList
                                        .remove(
                                            "selected"
                                        );

                                    const icon =
                                        item.querySelector(
                                            "span"
                                        );

                                    if(icon){

                                        icon.textContent =
                                            "⚪";

                                    }

                                }
                            );


                        card.classList.add(
                            "selected"
                        );


                        const icon =
                            card.querySelector(
                                "span"
                            );


                        if(icon){

                            icon.textContent =
                                "🟢";

                        }


                        pendingChanges.role =
                            role;


                        checkForChanges();

                    }

                );


                roleOptions.appendChild(
                    card
                );

            }

        );


        /* ==================================================
           SHOW POPUP
        =================================================== */

        managePopupOverlay
            .classList
            .add("show");

    }

);


/* ==========================================================
   TIMEOUT SELECTION
========================================================== */

timeoutOptions
    .querySelectorAll(
        ".timeout-option"
    )
    .forEach(function(option){

        option.addEventListener(

            "click",

            function(){

                /* Don't allow while banned */

                if(banCheckbox.checked){

                    return;

                }


                /* Remove selection */

                timeoutOptions
                    .querySelectorAll(
                        ".timeout-option"
                    )
                    .forEach(
                        function(item){

                            item.classList
                                .remove(
                                    "selected"
                                );

                        }
                    );


                /* Select this one */

                option.classList.add(
                    "selected"
                );


                pendingChanges.timeout =
                    option.dataset.timeout;


                checkForChanges();

            }

        );

    });


/* ==========================================================
   KICK
========================================================== */

kickCheckbox.addEventListener(

    "change",

    function(){

        if(banCheckbox.checked){

            this.checked = false;

            return;

        }


        pendingChanges.kick =
            this.checked;


        checkForChanges();

    }

);


/* ==========================================================
   BAN
========================================================== */

banCheckbox.addEventListener(

    "change",

    function(){

        pendingChanges.ban =
            this.checked;


        if(this.checked){

            /* ==============================================
               BAN HAS PRIORITY
            =============================================== */

            /* Clear timeout */

            pendingChanges.timeout =
                "none";


            document
                .querySelectorAll(
                    ".timeout-option"
                )
                .forEach(
                    function(option){

                        option.classList
                            .remove(
                                "selected"
                            );

                    }
                );


            const noneOption =
                document.querySelector(
                    '.timeout-option[data-timeout="none"]'
                );


            if(noneOption){

                noneOption.classList.add(
                    "selected"
                );

            }


            /* Disable timeout */

            document
                .querySelectorAll(
                    ".timeout-option"
                )
                .forEach(
                    function(option){

                        option.classList.add(
                            "disabled"
                        );

                    }
                );


            /* Disable kick */

            kickCheckbox.checked =
                false;

            pendingChanges.kick =
                false;


            kickOption.classList.add(
                "disabled"
            );

        }

        else{

            /* ==============================================
               BAN REMOVED
            =============================================== */

            document
                .querySelectorAll(
                    ".timeout-option"
                )
                .forEach(
                    function(option){

                        option.classList.remove(
                            "disabled"
                        );

                    }
                );


            kickOption.classList.remove(
                "disabled"
            );

        }


        checkForChanges();

    }

);


/* ==========================================================
   CLOSE MANAGE POPUP
========================================================== */

closeManagePopup.addEventListener(

    "click",

    function(){

        managePopupOverlay
            .classList
            .remove("show");

        resetManagePopup();

    }

);


/* ==========================================================
   CLICK OUTSIDE POPUP
========================================================== */

managePopupOverlay.addEventListener(

    "click",

    function(event){

        if(

            event.target ===
            managePopupOverlay

        ){

            managePopupOverlay
                .classList
                .remove("show");

            resetManagePopup();

        }

    }

);


/* ==========================================================
   SAVE CHANGES
========================================================== */

saveChangesButton.addEventListener(

    "click",

    function(){

        if(!selectedMember){

            return;

        }


        /*
         * Determine whether a destructive action
         * needs confirmation.
         */

        if(pendingChanges.ban){

            openConfirmation(
                "ban"
            );

            return;

        }


        if(pendingChanges.kick){

            openConfirmation(
                "kick"
            );

            return;

        }


        /*
         * No destructive action.
         * We can save directly.
         */

        saveModerationChanges();

    }

);


/* ==========================================================
   OPEN CONFIRMATION
========================================================== */

function openConfirmation(action){

    pendingConfirmationAction =
        action;


    if(action === "ban"){

        confirmationIcon.textContent =
            "⚠️";

        confirmationTitle.textContent =
            "Ban Member?";

        confirmationMessage.textContent =

            "You are about to ban " +

            selectedMember.fullName +

            ". This will prevent the member " +
            "from accessing the app.";

        confirmModeration.textContent =
            "Ban Member";

    }


    else if(action === "kick"){

        confirmationIcon.textContent =
            "⚠️";

        confirmationTitle.textContent =
            "Kick Member?";

        confirmationMessage.textContent =

            "You are about to kick " +

            selectedMember.fullName +

            ". They will be signed out of the app.";

        confirmModeration.textContent =
            "Kick Member";

    }


    moderationConfirmOverlay
        .classList
        .add("show");

}


/* ==========================================================
   CANCEL CONFIRMATION
========================================================== */

cancelConfirmation.addEventListener(

    "click",

    function(){

        moderationConfirmOverlay
            .classList
            .remove("show");

        pendingConfirmationAction =
            null;

    }

);


/* ==========================================================
   CLICK OUTSIDE CONFIRMATION
========================================================== */

moderationConfirmOverlay.addEventListener(

    "click",

    function(event){

        if(

            event.target ===
            moderationConfirmOverlay

        ){

            moderationConfirmOverlay
                .classList
                .remove("show");

            pendingConfirmationAction =
                null;

        }

    }

);


/* ==========================================================
   CONFIRM MODERATION
========================================================== */

confirmModeration.addEventListener(

    "click",

    async function(){

        /*
         * Close confirmation popup
         */

        moderationConfirmOverlay
            .classList
            .remove("show");


        /*
         * Prevent double clicking
         */

        confirmModeration.disabled =
            true;


        try{

            await saveModerationChanges();

        }

        catch(error){

            console.error(
                "Moderation error:",
                error
            );

            alert(
                "Something went wrong while saving changes."
            );

        }


        confirmModeration.disabled =
            false;

        pendingConfirmationAction =
            null;

    }

);


/* ==========================================================
   SAVE MODERATION CHANGES
========================================================== */

async function saveModerationChanges(){

    if(!selectedMember){

        return;

    }


    /*
     * IMPORTANT:
     *
     * Firebase operations will be added here.
     *
     * For now we only display what would be saved.
     */


    console.log(
        "Saving moderation changes:",
        {

            member:

                selectedMember.fullName,

            uid:

                selectedMember.uid,

            role:

                pendingChanges.role,

            ban:

                pendingChanges.ban,

            timeout:

                pendingChanges.timeout,

            kick:

                pendingChanges.kick

        }
    );


    /*
     * Temporary success message.
     *
     * We will replace this with actual Firebase
     * updates in the next step.
     */

    alert(
        "Changes prepared successfully."
    );


    /*
     * Update the local member object so the
     * profile immediately reflects the new role.
     */

    if(
        pendingChanges.role &&
        pendingChanges.role !==
        selectedMember.role
    ){

        selectedMember.role =
            pendingChanges.role;

    }


    /*
     * Update original state.
     */

    originalChanges = {

        role:
            pendingChanges.role,

        timeout:
            pendingChanges.timeout,

        kick:
            pendingChanges.kick,

        ban:
            pendingChanges.ban

    };


    /*
     * Disable Save button again.
     */

    saveChangesButton.disabled =
        true;


    /*
     * Update profile role immediately.
     */

    profileRole.textContent =
        (
            selectedMember.role ||
            "member"
        )
            .toUpperCase();


    /*
     * Close manage popup.
     */

    managePopupOverlay
        .classList
        .remove("show");


    resetManagePopup();

}