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
   ADD BIO BUTTON
========================================================== */

const addBioButton = document.getElementById("addBioButton");
const addBioSection = document.getElementById("addBioSection");


if(addBioButton && addBioSection){

    addBioButton.addEventListener("click", function(){

        addBioSection.style.display = "flex";

    });

}




const cancelBioButton =
document.getElementById("cancelBioButton");


cancelBioButton.addEventListener("click", function(){

    addBioSection.style.display = "none";

});


const saveBioButton =
document.getElementById("saveBioButton");


const newHostContainer =
document.getElementById("newHostContainer");


saveBioButton.addEventListener("click", function(){


    const name =
    document.getElementById("hostNameInput").value;


    const branch =
    document.getElementById("hostBranchInput").value;


    const experience =
    document.getElementById("hostExperienceInput").value;


    const contact =
    document.getElementById("hostContactInput").value;



    const newHost = document.createElement("section");

    newHost.className = "host-card";


    newHost.innerHTML = `

        <img
        src="../assets/pfp.jpg"
        class="host-photo">


        <h2>
            ${name}
        </h2>


        <p class="host-branch">
            📍 ${branch}
        </p>


        <div class="host-info">


            <p>
                <strong>Experience</strong><br>
                ${experience} years
            </p>


            <p>
                <strong>Contact</strong><br>
                +91 ${contact}
            </p>


        </div>

    `;



    const divider = document.createElement("hr");

divider.className = "host-divider";


newHostContainer.appendChild(divider);

newHostContainer.appendChild(newHost);



    addBioSection.style.display = "none";


});