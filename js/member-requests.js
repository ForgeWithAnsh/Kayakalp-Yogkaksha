/* ==========================================================
   MEMBER REQUESTS
========================================================== */


import {

    getUsersByApprovalStatus,

    updateApprovalStatus

} from "./firebase.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const backButton =
    document.getElementById(
        "backButton"
    );

const pendingTab =
    document.getElementById(
        "pendingTab"
    );

const approvedTab =
    document.getElementById(
        "approvedTab"
    );

const rejectedTab =
    document.getElementById(
        "rejectedTab"
    );

const requestCount =
    document.getElementById(
        "requestCount"
    );

const requestsContainer =
    document.getElementById(
        "requestsContainer"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );
    
    
    
const detailsOverlay =
    document.getElementById(
        "detailsOverlay"
    );

const closePopupButton =
    document.getElementById(
        "closePopupButton"
    );

const popupProfileImage =
    document.getElementById(
        "popupProfileImage"
    );

const popupName =
    document.getElementById(
        "popupName"
    );

const popupEmail =
    document.getElementById(
        "popupEmail"
    );

const popupPhone =
    document.getElementById(
        "popupPhone"
    );

const popupGender =
    document.getElementById(
        "popupGender"
    );

const popupDob =
    document.getElementById(
        "popupDob"
    );

const popupAddress =
    document.getElementById(
        "popupAddress"
    );

const popupPark =
    document.getElementById(
        "popupPark"
    );

const popupHealth =
    document.getElementById(
        "popupHealth"
    );


/* ==========================================================
   CURRENT TAB
========================================================== */

let currentTab =
    "pending";


/* ==========================================================
   BACK BUTTON
========================================================== */

backButton.addEventListener(

    "click",

    function(){

        window.history.back();

    }

);


/* ==========================================================
   TAB SWITCHING
========================================================== */

pendingTab.addEventListener(

    "click",

    function(){

        changeTab("pending");

    }

);

approvedTab.addEventListener(

    "click",

    function(){

        changeTab("approved");

    }

);

rejectedTab.addEventListener(

    "click",

    function(){

        changeTab("rejected");

    }

);


function changeTab(tab){

    currentTab = tab;

    pendingTab.classList.remove("active");

    approvedTab.classList.remove("active");

    rejectedTab.classList.remove("active");


    if(tab === "pending"){

        pendingTab.classList.add("active");

    }

    else if(tab === "approved"){

        approvedTab.classList.add("active");

    }

    else{

        rejectedTab.classList.add("active");

    }


    loadRequests();

}


/* ==========================================================
   LOAD REQUESTS
========================================================== */

async function loadRequests(){

    const requests =

    await getUsersByApprovalStatus(

        currentTab

    );


    requestsContainer.innerHTML = "";


    requestCount.textContent =

        requests.length;


    if(requests.length === 0){

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    requests.forEach(function(user){

    const card =

        document.createElement("div");

    card.className =

        "requestCard";


    card.innerHTML = `

        <h2 class="requestName">

            ${user.fullName}

        </h2>

        <div class="requestInfo">

            📱 ${user.phone}

        </div>

        ${currentTab === "pending" ? `

<div class="requestActions">

    <button

        class="approveButton"

        data-id="${user.uid}">

        Approve

    </button>

    <button

        class="rejectButton"

        data-id="${user.uid}">

        Reject

    </button>

</div>

` : currentTab === "rejected" ? `

<div class="requestActions">

    <button

        class="approveButton"

        data-id="${user.uid}">

        Approve

    </button>

</div>

` : ""}

    `;
    
    const approveButton =

    card.querySelector(

        ".approveButton"

    );


if(approveButton){

    approveButton.addEventListener(

        "click",

        async function(event){

            event.stopPropagation();

            await updateApprovalStatus(

                user.uid,

                "approved"

            );

            loadRequests();

        }

    );

}


const rejectButton =

    card.querySelector(

        ".rejectButton"

    );


if(rejectButton){

    rejectButton.addEventListener(

        "click",

        async function(event){

            event.stopPropagation();

            await updateApprovalStatus(

                user.uid,

                "rejected"

            );

            loadRequests();

        }

    );

}


    card.addEventListener(

        "click",

        function(event){

            if(

                event.target.classList.contains("approveButton") ||

                event.target.classList.contains("rejectButton")

            ){

                return;

            }

            openPopup(user);

        }

    );


    requestsContainer.appendChild(

        card

    );

});
}


/* ==========================================================
   INITIAL LOAD
========================================================== */

loadRequests();

function openPopup(user){

    popupName.textContent =
        user.fullName;

    popupEmail.textContent =
        user.email;

    popupPhone.textContent =
        user.phone;

    popupGender.textContent =
        user.gender;

    popupDob.textContent =
        user.dob;

    popupAddress.textContent =
        user.address;

    popupPark.textContent =
        user.park;

    popupHealth.textContent =
        user.health || "None";

    detailsOverlay.hidden = false;

}

closePopupButton.addEventListener(

    "click",

    function(){

        detailsOverlay.hidden = true;

    }

);

detailsOverlay.addEventListener(

    "click",

    function(event){

        if(event.target === detailsOverlay){

            detailsOverlay.hidden = true;

        }

    }

);