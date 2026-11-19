import { checkSession, goToPage, signOutUser } from "./session.js";

const statusPanel = document.querySelector(".access-status");
const access = document.body.dataset.access;
const roles = {
    admin: ["admin"],
    staff: ["admin", "host"],
    attendance: ["admin", "host", "moderator"]
}[access];

window.addEventListener("pageshow", (event) => {
    if (event.persisted) location.reload();
});

try {
    const status = ["pending", "rejected"].includes(access) ? access : "approved";
    const user = await checkSession({ roles, status });
    if (user) {
        document.body.classList.add("session-ready");
    }
} catch (error) {
    console.error("Account check failed", error);
    statusPanel.querySelector("p").textContent = "We couldn't load your account. Try again or return to sign in.";
    statusPanel.querySelector(".access-status__actions").hidden = false;
}

statusPanel.querySelector("[data-retry]").addEventListener("click", () => location.reload());
statusPanel.querySelector("[data-sign-out]").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
        await signOutUser();
        goToPage("../pages/login.html");
    } catch {
        statusPanel.querySelector("p").textContent = "We couldn't sign you out. Please try again.";
        statusPanel.querySelector("[data-sign-out]").disabled = false;
    }
});
