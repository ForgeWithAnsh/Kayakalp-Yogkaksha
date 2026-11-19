import {
    doc, getDoc, runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { checkSession } from "./session.js";

const originalSchedule = [
    ["Warm-up & Dynamic Yoga", [
        ["Sukshma Vyayam", "5:00–5:05 AM · 5 min"],
        ["Surya Namaskar", "5:05–5:20 AM · 15 min"],
        ["Hanuman Dand", "5:20–5:25 AM · 5 min"]
    ]],
    ["Standing Asanas", [
        ["Tadasana", "5:25–5:35 AM · 10 min"],
        ["Vrikshasana", "5:35–5:45 AM · 10 min"],
        ["Trikonasana", "5:45–5:50 AM · 5 min"]
    ]],
    ["Sitting Asanas", [
        ["Vajrasana", "5:50–6:00 AM · 10 min"],
        ["Padmasana", "6:00–6:10 AM · 10 min"],
        ["Paschimottanasana", "6:10–6:20 AM · 10 min"]
    ]],
    ["Prone & Supine Asanas", [
        ["Bhujangasana", "6:20–6:30 AM · 10 min"],
        ["Shalabhasana", "6:30–6:35 AM · 5 min"],
        ["Shavasana", "6:35–6:40 AM · 5 min"]
    ]],
    ["Pranayama", [
        ["Kapalbhati", "6:40–6:50 AM · 10 min"],
        ["Anulom Vilom", "6:50–7:00 AM · 10 min"],
        ["Bhramari", "7:00–7:10 AM · 10 min"]
    ]],
    ["Meditation & Relaxation", [
        ["Om Chanting", "7:10–7:15 AM · 5 min"],
        ["Meditation", "7:15–7:25 AM · 10 min"]
    ]]
];
const originalItems = originalSchedule.flatMap(([group, steps]) =>
    steps.map(([name, duration]) => ({ name, group, duration, repetitions: "", instructions: "" }))
);
const fields = ["name", "group", "duration", "repetitions", "instructions"];
const itemLimit = 40;

const user = await checkSession().catch(() => null);
if (user) initializeRoutine(user);

function getSavedItems(snapshot) {
    if (!snapshot.exists()) return null;

    const { items } = snapshot.data();
    if (!Array.isArray(items) || items.length > itemLimit) throw new Error("Invalid routine.");

    return items.map((item) => {
        if (typeof item?.name !== "string" || !item.name.trim()) throw new Error("Invalid exercise.");

        return Object.fromEntries(fields.map((field) => [field, typeof item[field] === "string" ? item[field] : ""]));
    });
}

function initializeRoutine(user) {
    const reference = doc(db, "routines", "daily");
    const list = document.getElementById("routineList");
    const status = document.getElementById("routineStatus");
    const groupTemplate = document.getElementById("routineGroupTemplate");
    const itemTemplate = document.getElementById("routineItemTemplate");
    const form = document.getElementById("routineForm");
    const editorFields = document.getElementById("routineEditorFields");
    const editorItems = document.getElementById("routineEditorItems");
    const editorTemplate = document.getElementById("routineEditorTemplate");
    const edit = document.getElementById("editRoutine");
    const add = document.getElementById("addRoutineItem");
    const cancel = document.getElementById("cancelRoutine");
    const formStatus = document.getElementById("routineFormStatus");
    const canManage = ["admin", "host"].includes(user.role);
    let baseline = null;
    let items = [];
    let saving = false;

    function renderRoutine() {
        const groups = [];
        let currentGroup;
        let previousName;
        for (const [index, item] of items.entries()) {
            const groupName = item.group || "Exercises";
            if (groupName !== previousName) {
                const card = groupTemplate.content.firstElementChild.cloneNode(true);
                card.querySelector("h2").textContent = groupName;
                currentGroup = card.querySelector("ol");
                currentGroup.start = index + 1;
                groups.push(card);
                previousName = groupName;
            }

            const row = itemTemplate.content.firstElementChild.cloneNode(true);
            row.querySelector(".routine-name").textContent = item.name;
            row.querySelector(".routine-timing").textContent = [item.duration, item.repetitions].filter(Boolean).join(" · ");
            row.querySelector(".routine-instructions").textContent = item.instructions;
            currentGroup.append(row);
        }
        list.replaceChildren(...groups);
        status.textContent = items.length ? "" : "No exercises are scheduled.";
    }

    async function loadRoutine() {
        edit.hidden = true;
        status.textContent = "Loading the routine…";
        try {
            baseline = getSavedItems(await getDoc(reference));
            items = baseline ?? originalItems;
            renderRoutine();
            edit.hidden = !canManage;
        } catch {
            status.textContent = "Could not load the routine. Reload the page to try again.";
        }
    }

    function updateRowControls() {
        const rows = Array.from(editorItems.children);
        for (const [index, row] of rows.entries()) {
            row.querySelector("legend").textContent = "Exercise " + (index + 1);
            row.querySelector('[data-move="-1"]').disabled = index === 0;
            row.querySelector('[data-move="1"]').disabled = index === rows.length - 1;
        }
        add.disabled = rows.length >= itemLimit;
    }

    function createEditorRow(item = {}) {
        const row = editorTemplate.content.firstElementChild.cloneNode(true);
        for (const field of fields) row.querySelector('[name="' + field + '"]').value = item[field] ?? "";

        row.querySelector('[data-move="-1"]').addEventListener("click", () => {
            row.previousElementSibling?.before(row);
            updateRowControls();
            row.querySelector("[name=name]").focus();
        });
        row.querySelector('[data-move="1"]').addEventListener("click", () => {
            row.nextElementSibling?.after(row);
            updateRowControls();
            row.querySelector("[name=name]").focus();
        });
        row.querySelector(".routine-remove").addEventListener("click", () => {
            const sibling = row.nextElementSibling ?? row.previousElementSibling;
            row.remove();
            updateRowControls();
            (sibling?.querySelector("[name=name]") ?? add).focus();
        });
        return row;
    }

    function openEditor() {
        editorItems.replaceChildren(...items.map(createEditorRow));
        updateRowControls();
        formStatus.textContent = "";
        edit.hidden = true;
        form.hidden = false;
        (editorItems.querySelector("[name=name]") ?? add).focus();
    }

    async function saveRoutine(event) {
        event.preventDefault();
        if (!canManage || saving) return;

        const next = Array.from(editorItems.children, (row) => Object.fromEntries(
            fields.map((field) => [field, row.querySelector('[name="' + field + '"]').value.trim()])
        ));
        if (next.some((item) => !item.name)) {
            formStatus.textContent = "Enter a name for each exercise.";
            return;
        }
        if (!next.length && !window.confirm("Save an empty routine?")) return;

        saving = true;
        editorFields.disabled = true;
        formStatus.textContent = "Saving…";
        try {
            await runTransaction(db, async (transaction) => {
                const latest = getSavedItems(await transaction.get(reference));
                if (JSON.stringify(latest) !== JSON.stringify(baseline)) {
                    const error = new Error("The routine has changed.");
                    error.code = "routine/conflict";
                    throw error;
                }
                transaction.set(reference, { items: next });
            });

            items = next;
            baseline = next;
            renderRoutine();
            form.hidden = true;
            edit.hidden = false;
            status.textContent = "Routine saved.";
            edit.focus();
        } catch (error) {
            formStatus.textContent = error.code === "routine/conflict"
                ? "The routine changed while you were editing. Cancel, then reopen the editor to load the current version."
                : "Could not save the routine. Please try again.";
        } finally {
            saving = false;
            editorFields.disabled = false;
        }
    }

    edit.addEventListener("click", openEditor);
    add.addEventListener("click", () => {
        if (editorItems.childElementCount >= itemLimit) return;

        const row = createEditorRow();
        editorItems.append(row);
        updateRowControls();
        row.querySelector("[name=name]").focus();
    });
    cancel.addEventListener("click", () => {
        form.hidden = true;
        void loadRoutine();
    });
    form.addEventListener("submit", saveRoutine);

    void loadRoutine();
}
