import {
    addDoc, collection, deleteDoc, doc, getDocs, updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { listLocations } from "./locations.js";
import { checkSession } from "./session.js";

const user = await checkSession().catch(() => null);
if (user) initializeHosts(user);

function initializeHosts(user) {
    const hosts = collection(db, "hosts");
    const status = document.getElementById("hostsStatus");
    const list = document.getElementById("hostsList");
    const template = document.getElementById("hostCardTemplate");
    const editor = document.getElementById("hostEditor");
    const editorTitle = document.getElementById("hostEditorTitle");
    const form = document.getElementById("hostForm");
    const fieldset = form.querySelector("fieldset");
    const { hostName, hostLocation, hostExperience, hostIntroduction } = form.elements;
    const formStatus = document.getElementById("hostFormStatus");
    const add = document.getElementById("addBioButton");
    const save = document.getElementById("saveBioButton");
    const cancel = document.getElementById("cancelBioButton");
    const canManage = ["admin", "host"].includes(user.role);
    const removing = new Set();
    let editId = null;
    let saving = false;
    let loadVersion = 0;

    add.hidden = !canManage;

    function openEditor(host) {
        if (saving || removing.has(host?.id)) return;

        editId = host?.id ?? null;
        editorTitle.textContent = editId ? "Edit host profile" : "Add host profile";
        hostName.value = host?.name ?? "";
        hostLocation.value = host?.location ?? "";
        hostExperience.value = host?.experience ?? "";
        hostIntroduction.value = host?.introduction ?? "";
        formStatus.textContent = "";
        editor.showModal();
    }

    function createCard(host) {
        const card = template.content.firstElementChild.cloneNode(true);
        card.querySelector(".host-avatar").textContent = host.name.charAt(0).toUpperCase();
        card.querySelector("h2").textContent = host.name;
        card.querySelector(".host-branch").textContent = host.location;
        card.querySelector(".host-experience").textContent = host.experience;
        card.querySelector(".host-introduction").textContent = host.introduction;
        card.querySelector(".host-actions").hidden = !canManage;

        if (canManage) {
            card.querySelector(".edit-host").addEventListener("click", () => openEditor(host));
            const remove = card.querySelector(".delete-host");
            remove.disabled = removing.has(host.id);
            remove.addEventListener("click", () => removeHost(host, remove));
        }
        return card;
    }

    async function loadHosts() {
        const version = ++loadVersion;
        try {
            const snapshot = await getDocs(hosts);
            if (version !== loadVersion) return;

            const records = snapshot.docs
                .map((entry) => ({ ...entry.data(), id: entry.id }))
                .filter((host) => typeof host.name === "string" && host.name.trim())
                .sort((first, second) => first.name.localeCompare(second.name));
            list.replaceChildren(...records.map(createCard));
            status.textContent = records.length ? "" : "No host profiles have been added.";
        } catch {
            if (version === loadVersion) status.textContent = "Could not load the host profiles. Reload the page to try again.";
        }
    }

    async function removeHost(host, button) {
        if (removing.has(host.id) || !window.confirm("Remove the host profile for " + host.name + "?")) return;

        removing.add(host.id);
        button.disabled = true;
        try {
            await deleteDoc(doc(db, "hosts", host.id));
            await loadHosts();
        } catch {
            status.textContent = "Could not remove the profile. Please try again.";
        } finally {
            removing.delete(host.id);
            button.disabled = false;
        }
    }

    async function saveHost(event) {
        event.preventDefault();
        if (!canManage || saving) return;

        const host = {
            name: hostName.value.trim(),
            location: hostLocation.value.trim(),
            experience: hostExperience.value.trim(),
            introduction: hostIntroduction.value.trim()
        };
        if (!host.name) {
            formStatus.textContent = "Enter the host’s name.";
            return;
        }

        saving = true;
        fieldset.disabled = true;
        save.disabled = true;
        cancel.disabled = true;
        formStatus.textContent = "Saving…";

        try {
            if (editId) await updateDoc(doc(db, "hosts", editId), host);
            else await addDoc(hosts, host);
            editor.close();
            await loadHosts();
        } catch {
            formStatus.textContent = "Could not save the profile. Please try again.";
        } finally {
            saving = false;
            fieldset.disabled = false;
            save.disabled = false;
            cancel.disabled = false;
        }
    }

    add.addEventListener("click", () => openEditor());
    cancel.addEventListener("click", () => editor.close());
    editor.addEventListener("cancel", (event) => {
        if (saving) event.preventDefault();
    });
    form.addEventListener("submit", saveHost);

    if (canManage) {
        listLocations().then((locations) => {
            const options = document.getElementById("hostLocationOptions");
            options.replaceChildren(...locations.map((location) => new Option(location, location)));
        }).catch(() => {});
    }
    void loadHosts();
}
