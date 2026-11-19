import { getLiveMeetingUrl, saveLiveMeetingUrl } from "./app-data.js";
import { listLocations, setLocationActive } from "./locations.js";
import { checkSession, goToPage, isAdmin, signOutUser } from "./session.js";

const user = await checkSession().catch(() => null);
if (user) {
    document.getElementById("backButton").addEventListener("click", () => goToPage("../index.html"));
    document.getElementById("settingsSignOut").addEventListener("click", async (event) => {
        if (!window.confirm("Sign out of Kayakalp Yogkaksha?")) return;
        const button = event.currentTarget;
        button.disabled = true;
        try {
            await signOutUser();
            goToPage("../pages/login.html");
        } catch {
            button.disabled = false;
            document.getElementById("settingsStatus").textContent = "We couldn’t sign you out. Try again.";
        }
    });

    if (isAdmin()) initializeAdminSettings();
}

function initializeAdminSettings() {
    const admin = document.getElementById("adminSettings");
    const meeting = document.getElementById("meetingUrl");
    const locationName = document.getElementById("newLocation");
    const locationList = document.getElementById("locationList");
    const status = document.getElementById("adminSettingsStatus");
    admin.hidden = false;

    async function showLocations() {
        const locations = await listLocations({ includeInactive: true });
        locationList.replaceChildren(...locations.map(({ name, active }) => {
            const entry = document.createElement("li");
            const label = document.createElement("span");
            label.textContent = name;
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = active ? "Deactivate" : "Reactivate";
            button.setAttribute("aria-label", button.textContent + " " + name);
            button.addEventListener("click", async () => {
                if (active && !window.confirm("Remove " + name + " from new registrations?")) return;
                button.disabled = true;
                try {
                    await setLocationActive(name, !active);
                    await showLocations();
                    status.textContent = name + (active ? " deactivated." : " reactivated.");
                } catch {
                    status.textContent = "We couldn’t update that location. Try again.";
                } finally {
                    button.disabled = false;
                }
            });
            entry.append(label, button);
            return entry;
        }));
    }

    getLiveMeetingUrl().then((url) => {
        meeting.value = url ?? "";
    }).catch(() => {
        status.textContent = "We couldn’t load the Zoom link.";
    });
    showLocations().catch(() => {
        status.textContent = "We couldn’t load locations.";
    });

    document.getElementById("meetingSettings").addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.submitter;
        button.disabled = true;
        try {
            await saveLiveMeetingUrl(meeting.value);
            status.textContent = "Zoom invitation saved.";
        } catch {
            status.textContent = "We couldn’t save the link. Check that it’s a valid Zoom invitation.";
        } finally {
            button.disabled = false;
        }
    });

    document.getElementById("locationSettings").addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = event.submitter;
        button.disabled = true;
        try {
            await setLocationActive(locationName.value, true);
            await showLocations();
            status.textContent = "Location saved.";
            locationName.value = "";
        } catch {
            status.textContent = "We couldn’t save the location. Check the name and try again.";
        } finally {
            button.disabled = false;
        }
    });
}
