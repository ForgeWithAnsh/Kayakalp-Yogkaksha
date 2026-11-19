import {
    createAnnouncement,
    deleteAnnouncement,
    subscribeToAnnouncements,
    updateAnnouncement
} from "./announcement-data.js";
import { SESSION_TIME_ZONE } from "./date.js";
import { checkSession } from "./session.js";

const user = await checkSession().catch(() => null);
if (user) initializeAnnouncements(user);

function initializeAnnouncements(user) {
    const list = document.getElementById("announcementsContainer");
    const template = document.getElementById("announcementCardTemplate");
    const status = document.getElementById("announcementStatus");
    const editor = document.getElementById("announcementEditor");
    const editorTitle = document.getElementById("announcementEditorTitle");
    const form = document.getElementById("announcementForm");
    const { title, message, important } = form.elements;
    const submit = document.getElementById("sendAnnouncementButton");
    const cancel = document.getElementById("cancelAnnouncementButton");
    const formStatus = document.getElementById("announcementFormStatus");
    const canPublish = ["admin", "host"].includes(user.role);
    const deleting = new Set();
    const dateFormat = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: SESSION_TIME_ZONE
    });
    let editingId = null;
    let saving = false;

    editor.hidden = !canPublish;

    function resetEditor() {
        form.reset();
        editor.open = false;
        editorTitle.textContent = "New announcement";
        submit.textContent = "Publish";
        formStatus.textContent = "";
        editingId = null;
    }

    function openEditor(announcement) {
        if (saving || deleting.has(announcement.id)) return;

        editingId = announcement.id;
        editorTitle.textContent = "Edit announcement";
        title.value = announcement.title ?? "";
        message.value = announcement.message ?? "";
        important.checked = Boolean(announcement.important);
        submit.textContent = "Save changes";
        formStatus.textContent = "";
        editor.open = true;
        title.focus();
    }

    function renderAnnouncements(announcements) {
        const cards = announcements.map((announcement) => {
            const card = template.content.firstElementChild.cloneNode(true);
            const time = card.querySelector("time");
            const date = announcement.createdAt?.toDate?.();
            if (date) {
                time.dateTime = date.toISOString();
                time.textContent = dateFormat.format(date);
            }

            card.querySelector("h2").textContent = announcement.title;
            card.querySelector(".announcement-message").textContent = announcement.message;

            const canManage = canPublish && (user.role === "admin" || announcement.createdBy === user.uid);
            card.querySelector(".announcement-actions").hidden = !canManage;
            if (canManage) {
                const deleteButton = card.querySelector(".delete-announcement");
                deleteButton.disabled = deleting.has(announcement.id);
                deleteButton.addEventListener("click", () => removeAnnouncement(announcement, deleteButton));
                card.querySelector(".edit-announcement").addEventListener("click", () => openEditor(announcement));
            }
            return card;
        });
        list.replaceChildren(...cards);
        status.textContent = cards.length ? "" : "No announcements have been posted.";
    }

    async function removeAnnouncement(announcement, button) {
        const { id, title: announcementTitle } = announcement;
        if (saving && editingId === id) return;
        if (deleting.has(id) || !window.confirm("Delete “" + announcementTitle + "”?")) return;

        deleting.add(id);
        button.disabled = true;
        try {
            await deleteAnnouncement(id);
            if (editingId === id) resetEditor();
        } catch {
            status.textContent = "Could not delete the announcement. Please try again.";
        } finally {
            deleting.delete(id);
            button.disabled = false;
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!canPublish || saving) return;

        const content = {
            title: title.value.trim(),
            message: message.value.trim(),
            important: important.checked
        };
        if (!content.title || !content.message) {
            formStatus.textContent = "Enter a title and a message.";
            return;
        }

        saving = true;
        submit.disabled = true;
        cancel.disabled = true;
        formStatus.textContent = "Saving…";
        try {
            if (editingId) await updateAnnouncement(editingId, content);
            else await createAnnouncement(content, user.uid);
            resetEditor();
        } catch {
            formStatus.textContent = "Could not save the announcement. Please try again.";
        } finally {
            saving = false;
            submit.disabled = false;
            cancel.disabled = false;
        }
    });
    cancel.addEventListener("click", resetEditor);

    const unsubscribe = subscribeToAnnouncements(renderAnnouncements, () => {
        status.textContent = "Could not load announcements. Reload the page to try again.";
    });
    window.addEventListener("pagehide", (event) => {
        if (!event.persisted) unsubscribe();
    });
}
