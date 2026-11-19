import { goToPage, signOutUser } from "./session.js";

document.getElementById("refreshApprovalButton")?.addEventListener("click", () => location.reload());
document.getElementById("goToLoginButton")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
        await signOutUser();
        goToPage("../pages/login.html");
    } catch {
        button.disabled = false;
        window.alert("We couldn’t sign you out. Please try again.");
    }
});
