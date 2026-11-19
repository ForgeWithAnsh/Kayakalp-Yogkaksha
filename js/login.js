import { loginUser } from "./firebase.js";
import { loadCurrentUser, routeAccount } from "./session.js";
import { setSubmitBusy, setupPasswordVisibility } from "./account-form.js";

const byId = (id) => document.getElementById(id);
const email = byId("emailInput");
const password = byId("passwordInput");
const submit = byId("loginButton");
const status = byId("loginError");

setupPasswordVisibility(byId("togglePassword"), password);

byId("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    setSubmitBusy(submit, true);
    status.textContent = "";
    try {
        await loginUser(email.value.trim(), password.value);
        routeAccount(await loadCurrentUser({ refresh: true }));
    } catch (error) {
        const messages = {
            "auth/invalid-credential": "Incorrect email or password.",
            "auth/invalid-email": "Enter a valid email address.",
            "auth/too-many-requests": "Too many attempts. Try again later.",
            "auth/network-request-failed": "Check your connection and try again.",
            "profile/missing": "Your registration is incomplete. Return to registration to finish it."
        };
        status.textContent = messages[error.code] || "We couldn’t sign you in. Try again.";
    } finally {
        setSubmitBusy(submit, false);
    }
});

byId("forgotPasswordButton").addEventListener("click", () => {
    const destination = new URL("forgot-password.html", location.href);
    location.assign(destination);
});
byId("createAccountButton").addEventListener("click", () => location.assign("signup.html"));
