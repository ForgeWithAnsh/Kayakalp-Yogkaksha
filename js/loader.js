import {

    loadCurrentUser,

    currentUser

} from "./session.js";


await loadCurrentUser();


if(!currentUser){

    window.location.href =
        "pages/login.html";

}

else if(currentUser.approvalStatus === "pending"){

    window.location.href =
        "pages/waiting.html";

}

else if(currentUser.approvalStatus === "rejected"){

    window.location.href =
        "pages/rejected.html";

}

else{

    window.location.href =
        "index.html";

}