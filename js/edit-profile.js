import { prepareProfilePhoto, renderProfilePhoto } from "./profile-photo.js";
import { updatePersonalProfile } from "./app-data.js";
import { getSessionDate } from "./date.js";
import { checkSession, goToPage } from "./session.js";

const user = await checkSession().catch(() => null);
if (user) initializeForm(user);

function initializeForm(profile) {
    const byId = (id) => document.getElementById(id);
    const avatar = byId("editProfilePhoto");
    const inputs = Object.fromEntries(
        ["fullName", "dob", "gender", "phone", "address"].map((field) => [field, byId(field + "Input")])
    );
    for (const [field, input] of Object.entries(inputs)) input.value = profile[field] ?? "";
    renderProfilePhoto(avatar, profile.fullName, profile.photoDataUrl);
    byId("emailInput").value = profile.email ?? "";
    inputs.dob.max = getSessionDate();

    byId("backButton").addEventListener("click", () => goToPage("../pages/profile.html"));
    byId("saveProfileButton").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const status = byId("profileFormStatus");
        const values = Object.fromEntries(Object.entries(inputs).map(([field, input]) => [field, input.value.trim()]));

        const phoneChanged = values.phone !== (profile.phone ?? "");
        const dobChanged = values.dob !== (profile.dob ?? "");
        if (!values.fullName || values.fullName.length > 100 ||
            (phoneChanged && !/^\d{10}$/.test(values.phone)) ||
            (dobChanged && (!values.dob || values.dob > inputs.dob.max)) ||
            !values.gender || values.address.length > 500) {
            status.textContent = "Check the name, phone number, date of birth, and gender. Keep the address under 500 characters.";
            return;
        }

        button.disabled = true;
        status.textContent = "Saving changes…";
        try {
            const changes = Object.fromEntries(Object.entries(values).filter(([field, value]) => value !== (profile[field] ?? "")));
            const photo = byId("editPhotoInput").files[0];
            if (photo) {
                try {
                    changes.photoDataUrl = await prepareProfilePhoto(photo);
                } catch (error) {
                    status.textContent = error.message;
                    return;
                }
            }
            if (Object.keys(changes).length) {
                await updatePersonalProfile(profile.uid, changes);
            }
            goToPage("../pages/profile.html");
        } catch {
            status.textContent = "We couldn’t save your changes. Try again.";
        } finally {
            button.disabled = false;
        }
    });
}
