import { auth, saveUserData, signUp } from "./firebase.js";
import { setSubmitBusy, setupPasswordVisibility } from "./account-form.js";
import { getSessionDate } from "./date.js";
import { listLocations } from "./locations.js";
import { prepareProfilePhoto } from "./profile-photo.js";
import { loadCurrentUser, routeAccount } from "./session.js";

const byId = (id) => document.getElementById(id);
const fieldNames = ["name", "dob", "gender", "phone", "email", "address", "park", "health", "password", "confirmPassword"];
const fields = Object.fromEntries(fieldNames.map((name) => [name, byId(name + "Input")]));
const form = byId("signupForm");
const submit = byId("signupButton");
const status = byId("signupError");

fields.dob.max = getSessionDate();
fields.phone.addEventListener("input", () => {
    fields.phone.value = fields.phone.value.replace(/\D/g, "").slice(0, 10);
});
setupPasswordVisibility(byId("togglePassword"), fields.password, fields.confirmPassword);
byId("loginPageButton").addEventListener("click", () => location.assign("login.html"));

async function getRegistrationUser(email) {
    await auth.authStateReady();
    const signedIn = auth.currentUser;
    if (signedIn?.email?.toLowerCase() !== email.toLowerCase()) {
        return signUp(email, fields.password.value);
    }

    // Retry a registration interrupted after Firebase Authentication created the account.
    try {
        routeAccount(await loadCurrentUser({ refresh: true }));
        return null;
    } catch (error) {
        if (error.code !== "profile/missing") throw error;
        return signedIn;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    const fullName = fields.name.value.trim();
    if (!fullName) {
        status.textContent = "Enter your full name.";
        fields.name.focus();
        return;
    }
    if (fields.password.value !== fields.confirmPassword.value) {
        status.textContent = "Passwords do not match.";
        fields.confirmPassword.focus();
        return;
    }

    setSubmitBusy(submit, true);
    status.textContent = "";
    try {
        let photoDataUrl;
        try {
            photoDataUrl = await prepareProfilePhoto(byId("signupPhoto").files[0]);
        } catch (error) {
            status.textContent = error.message;
            return;
        }
        const user = await getRegistrationUser(fields.email.value.trim());
        if (!user) return;
        await saveUserData(user.uid, {
            fullName, photoDataUrl,
            dob: fields.dob.value,
            gender: fields.gender.value,
            phone: fields.phone.value,
            address: fields.address.value.trim(),
            park: fields.park.value,
            health: fields.health.value.trim()
        });
        location.replace("waiting.html");
    } catch (error) {
        const messages = {
            "auth/email-already-in-use": "This email already has an account. Sign in to continue.",
            "auth/network-request-failed": "Check your connection and try again.",
            "auth/weak-password": "Choose a stronger password and try again."
        };
        status.textContent = messages[error.code] || "We couldn’t create your profile. Try again.";
    } finally {
        setSubmitBusy(submit, false);
    }
});

listLocations({ useRegistrationDefaults: true }).then((locations) => {
    for (const name of locations) fields.park.add(new Option(name, name));
    if (!locations.length) status.textContent = "Registration is waiting for an available location.";
}).catch(() => {
    status.textContent = "We couldn’t load locations. Check your connection and reload.";
});
