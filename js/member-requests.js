import { getUsersByApprovalStatus, updateApprovalStatus } from "./firebase.js";
import { checkSession } from "./session.js";

const user = await checkSession({ roles: ["admin"] }).catch(() => null);
if (user) initializeRequests(user);

function initializeRequests(user) {
    const tabs = document.querySelectorAll(".tabButton");
    const status = document.getElementById("requestStatus");
    const actionStatus = document.getElementById("requestActionStatus");
    const list = document.getElementById("requestsContainer");
    const template = document.getElementById("requestCardTemplate");
    const details = document.getElementById("detailsOverlay");
    const pendingUpdates = new Set();
    const profileFields = {
        popupName: "fullName",
        popupEmail: "email",
        popupPhone: "phone",
        popupGender: "gender",
        popupDob: "dob",
        popupAddress: "address",
        popupPark: "park",
        popupHealth: "health"
    };
    let currentStatus = "pending";
    let requestVersion = 0;

    function openDetails(request) {
        for (const [id, field] of Object.entries(profileFields)) {
            document.getElementById(id).textContent = request[field] || "—";
        }
        document.getElementById("requestAvatar").textContent = request.fullName?.charAt(0).toUpperCase() || "?";
        details.showModal();
    }

    function createCard(request) {
        const card = template.content.firstElementChild.cloneNode(true);
        const name = card.querySelector(".requestDetailsButton");
        name.textContent = request.fullName || "Unnamed member";
        name.addEventListener("click", () => openDetails(request));
        card.querySelector(".requestInfo").textContent = request.phone || "No phone number";

        const approve = card.querySelector(".approveButton");
        const reject = card.querySelector(".rejectButton");
        const actions = card.querySelector(".requestActions");
        actions.hidden = user.role !== "admin" || currentStatus === "approved";
        reject.hidden = currentStatus !== "pending";
        approve.disabled = pendingUpdates.has(request.uid);
        reject.disabled = approve.disabled;
        approve.addEventListener("click", () => saveRequest(request, "approved", [approve, reject]));
        reject.addEventListener("click", () => saveRequest(request, "rejected", [approve, reject]));
        return card;
    }

    async function loadRequests() {
        const version = ++requestVersion;
        status.textContent = "Loading requests…";
        list.replaceChildren();
        list.setAttribute("aria-busy", "true");

        try {
            const requests = await getUsersByApprovalStatus(currentStatus);
            if (version !== requestVersion) return;

            const cards = requests.map(createCard);
            list.replaceChildren(...cards);
            status.textContent = cards.length
                ? String(cards.length) + (cards.length === 1 ? " request found" : " requests found")
                : "No " + currentStatus + " requests.";
        } catch {
            if (version === requestVersion) status.textContent = "Could not load requests. Select the tab to try again.";
        } finally {
            if (version === requestVersion) list.removeAttribute("aria-busy");
        }
    }

    async function saveRequest(request, nextStatus, buttons) {
        if (user.role !== "admin" || pendingUpdates.has(request.uid)) return;

        const verb = nextStatus === "approved" ? "Approve" : "Reject";
        const name = request.fullName || "this request";
        if (!window.confirm(verb + " " + name + "?")) return;

        pendingUpdates.add(request.uid);
        for (const button of buttons) button.disabled = true;
        actionStatus.textContent = "Updating request…";
        try {
            await updateApprovalStatus(request.uid, nextStatus);
            actionStatus.textContent = "Request " + nextStatus + ".";
        } catch {
            actionStatus.textContent = "Could not update the request. Please try again.";
        } finally {
            pendingUpdates.delete(request.uid);
            await loadRequests();
        }
    }

    for (const tab of tabs) {
        tab.addEventListener("click", () => {
            currentStatus = tab.dataset.status;
            for (const item of tabs) {
                const selected = item === tab;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            }
            void loadRequests();
        });
    }

    document.getElementById("closePopupButton").addEventListener("click", () => details.close());
    details.addEventListener("click", (event) => {
        if (event.target === details) details.close();
    });

    void loadRequests();
}
