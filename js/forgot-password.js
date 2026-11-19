import { resetPassword } from "./firebase.js";
import { setSubmitBusy } from "./account-form.js";

const byId = (id) => document.getElementById(id);
const submit = byId("sendButton");
const status = byId("message");
const showSent = () => {
    status.textContent = "If an account exists for this email, we’ll send a reset link.";
};

byId("resetForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    setSubmitBusy(submit, true);
    status.textContent = "";
    try {
        await resetPassword(byId("emailInput").value.trim());
        showSent();
    } catch (error) {
        if (error.code === "auth/user-not-found") showSent();
        else status.textContent = "We couldn’t send a reset link. Wait a moment and try again.";
    } finally {
        setSubmitBusy(submit, false);
    }
});

const backToLogin = () => location.assign("login.html");
byId("backButton").addEventListener("click", backToLogin);
byId("loginButton").addEventListener("click", backToLogin);
