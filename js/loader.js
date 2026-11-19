import { loadCurrentUser, routeAccount } from "./session.js";

try {
    routeAccount(await loadCurrentUser());
} catch (error) {
    console.error("Account loading failed", error);
    document.getElementById("loaderStatus").textContent = "We couldn’t load your account. Check your connection and try again.";
    const retry = document.getElementById("loaderRetry");
    retry.hidden = false;
    retry.addEventListener("click", () => location.reload());
    document.getElementById("loaderLogin").hidden = false;
}
