import { loadAttendanceDay, saveAttendanceDay } from "./attendance-data.js";
import {
    attendanceLabels,
    describeAttendance,
    describeAttendanceDuration,
    getAttendanceDuration,
    getAttendanceStatus,
    manualStatuses
} from "./attendance-model.js";
import { getSessionDate } from "./date.js";
import { checkSession } from "./session.js";

const staffRoles = ["admin", "host", "moderator"];
const pageSize = 35;
const byId = (id) => document.getElementById(id);
const content = byId("attendance-content");
const message = byId("attendance-message");
const scope = byId("attendance-scope");
const date = byId("attendance-date");
const locationSelect = byId("attendance-location");
const refreshButton = byId("refresh-attendance");
const summary = byId("attendance-totals");
const sessionCard = byId("session-status-card");
const list = byId("attendance-members");
const empty = byId("attendance-empty");
const pagination = byId("attendance-pagination");
const previous = byId("attendance-previous");
const next = byId("attendance-next");
const search = byId("attendance-search");
const statusFilter = byId("attendance-status-filter");
const markButton = byId("mark-attendance");
const editBar = byId("attendance-edit-bar");
const source = byId("attendance-source");
const draftCount = byId("attendance-draft-count");
const cancelButton = byId("cancel-attendance");
const saveButton = byId("save-attendance");

const sessionMessages = {
    active: ["Live class is active", "The summary shows recorded results so far."],
    ended: ["Live class has ended", "Members without an attendance record are shown as unmarked."],
    none: ["Live class has not started", "You can record attendance for a physical class."]
};

function showMessage(text = "", isError = false) {
    message.hidden = !text;
    message.dataset.error = String(isError);
    message.textContent = text;
}

function joinedOn(timestamp) {
    if (!timestamp) return null;
    const value = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
    return Number.isFinite(value.getTime()) ? getSessionDate(value) : null;
}

function makeRows({ members, records }, selectedDate, moderator) {
    const recordByMember = new Map(records.map((record) => [record.uid, record]));
    const rows = [];
    for (const member of members) {
        const record = recordByMember.get(member.uid);
        const firstDay = joinedOn(member.joinedAt);
        if (record || !firstDay || firstDay <= selectedDate) {
            rows.push({ member, record, editable: Boolean(member.park) || (!moderator && Boolean(record)) });
        }
        recordByMember.delete(member.uid);
    }
    for (const record of recordByMember.values()) {
        const member = {
            uid: record.uid,
            fullName: record.fullName || record.memberId || "Saved member record",
            memberId: record.memberId,
            park: record.park
        };
        rows.push({ member, record, editable: !moderator });
    }
    return rows.sort((a, b) => a.member.fullName.localeCompare(b.member.fullName));
}

function renderSummary(session, rows) {
    const [title, detail] = Object.hasOwn(sessionMessages, session?.status)
        ? sessionMessages[session.status]
        : sessionMessages.none;
    byId("session-status-title").textContent = title;
    byId("session-status-message").textContent = detail;

    const counts = { present: 0, short: 0, absent: 0 };
    for (const { record } of rows) {
        const status = getAttendanceStatus(record);
        if (Object.hasOwn(counts, status)) counts[status] += 1;
    }

    for (const [status, count] of Object.entries(counts)) {
        byId(`attendance-${status}`).textContent = count;
    }
    byId("attendance-total").textContent = rows.length;
}

function appendText(parent, tag, text, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

function preventDiscard(event) {
    event.preventDefault();
    event.returnValue = true;
}

function openAttendance(user) {
    const moderator = user.role === "moderator";
    if (moderator && !user.park) {
        showMessage("Your account has no assigned location. Ask an administrator to assign one.", true);
        return;
    }

    const draft = new Map();
    const knownLocations = new Set();
    let rows = [];
    let daySession = null;
    let page = 0;
    let requestId = 0;
    let loading = false;
    let loaded = false;
    let editing = false;
    let saving = false;
    let selectedDate = getSessionDate();

    date.value = selectedDate;
    date.max = selectedDate;
    scope.textContent = moderator ? user.park : "All locations · daily records";
    byId("attendance-location-filter").hidden = moderator;
    content.hidden = false;

    function scopedRows() {
        const park = locationSelect.value;
        if (moderator || !park) return rows;
        return rows.filter(({ member, record }) => (record?.park || member.park) === park);
    }

    function renderControls() {
        content.setAttribute("aria-busy", String(loading));
        date.disabled = moderator || editing;
        locationSelect.disabled = editing;
        refreshButton.disabled = loading || editing;
        markButton.hidden = editing || !loaded || !scopedRows().some(({ editable }) => editable);
        summary.hidden = !loaded;
        sessionCard.hidden = !loaded;
        editBar.hidden = !editing;
        source.disabled = saving;
        cancelButton.disabled = saving;
        saveButton.disabled = saving || draft.size === 0;
        saveButton.textContent = saving ? "Saving…" : "Save";
    }

    function updateDraftCount() {
        draftCount.textContent = draft.size
            ? `${draft.size} ${draft.size === 1 ? "change" : "changes"} to save`
            : "No changes";
        if (draft.size) window.addEventListener("beforeunload", preventDiscard);
        else window.removeEventListener("beforeunload", preventDiscard);
        renderControls();
    }

    function buildRow({ member, record, editable }) {
        const card = document.createElement("li");
        card.className = "attendance-member-card";
        const initials = member.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
        const avatar = appendText(card, "span", initials.toUpperCase(), "attendance-avatar");
        avatar.setAttribute("aria-hidden", "true");

        const info = card.appendChild(document.createElement("div"));
        info.className = "attendance-member-info";
        appendText(info, "strong", member.fullName);
        const details = [
            member.memberId,
            record?.park || member.park,
            describeAttendance(record),
            describeAttendanceDuration(getAttendanceDuration(record))
        ];
        appendText(info, "span", details.filter(Boolean).join(" · "));

        const status = getAttendanceStatus(record);
        const badge = appendText(card, "span", attendanceLabels[status], "attendance-badge");
        badge.dataset.status = status;

        if (editing && editable) {
            const field = card.appendChild(document.createElement("label"));
            field.className = "attendance-field";
            appendText(field, "span", "Set status");
            const select = field.appendChild(document.createElement("select"));
            select.setAttribute("aria-label", `Set attendance for ${member.fullName}`);
            select.add(new Option("Keep current", ""));
            for (const value of manualStatuses) {
                select.add(new Option(attendanceLabels[value], value));
            }
            select.value = draft.get(member.uid) ?? "";
            select.disabled = saving;
            select.addEventListener("change", () => {
                if (select.value) draft.set(member.uid, select.value);
                else draft.delete(member.uid);
                updateDraftCount();
            });
        }
        return card;
    }

    function renderRows() {
        const term = search.value.trim().toLowerCase();
        const locationRows = scopedRows();
        const filtered = locationRows.filter(({ member, record }) => {
            const searchable = `${member.fullName} ${member.memberId ?? ""}`.toLowerCase();
            const status = getAttendanceStatus(record);
            return searchable.includes(term) && (!statusFilter.value || statusFilter.value === status);
        });
        const pageCount = Math.ceil(filtered.length / pageSize);
        page = Math.max(0, Math.min(page, pageCount - 1));
        const start = page * pageSize;
        list.replaceChildren(...filtered.slice(start, start + pageSize).map(buildRow));
        empty.hidden = !loaded || filtered.length > 0;
        empty.textContent = locationRows.length
            ? "No members match your filters."
            : "No attendance roster or records were found for this date and location.";
        pagination.hidden = pageCount <= 1;
        previous.disabled = page === 0;
        next.disabled = page >= pageCount - 1;
        byId("attendance-page-number").textContent = `Page ${page + 1} of ${pageCount}`;
    }

    function updateLocations({ members, records }) {
        if (moderator) return;
        const selected = locationSelect.value;
        for (const { park } of [...members, ...records]) {
            if (park) knownLocations.add(park);
        }
        const options = [...knownLocations].sort((a, b) => a.localeCompare(b));
        locationSelect.replaceChildren(new Option("All Locations", ""), ...options.map((park) => new Option(park, park)));
        locationSelect.value = selected;
    }

    async function refresh(successMessage) {
        const today = getSessionDate();
        date.max = today;
        if (moderator || !date.value || date.value > today) date.value = today;
        selectedDate = date.value;
        const ticket = ++requestId;
        loading = true;
        loaded = false;
        rows = [];
        page = 0;
        showMessage("Loading attendance…");
        renderControls();
        renderRows();
        try {
            const data = await loadAttendanceDay({ date: selectedDate, park: moderator ? user.park : null });
            if (ticket !== requestId) return;
            rows = makeRows(data, selectedDate, moderator);
            daySession = data.session;
            updateLocations(data);
            renderSummary(daySession, scopedRows());
            loaded = true;
            showMessage(successMessage);
        } catch (error) {
            if (ticket !== requestId) return;
            const denied = error.code === "permission-denied";
            showMessage(denied ? "You no longer have access to these records." : "Could not load attendance. Select Refresh to try again.", true);
        } finally {
            if (ticket === requestId) {
                loading = false;
                renderControls();
                renderRows();
            }
        }
    }

    function finishEditing() {
        editing = false;
        draft.clear();
        updateDraftCount();
        renderRows();
    }

    markButton.addEventListener("click", () => {
        editing = true;
        source.value = "offline";
        updateDraftCount();
        renderRows();
        list.querySelector("select")?.focus();
    });

    cancelButton.addEventListener("click", () => {
        if (draft.size && !window.confirm("Discard your unsaved attendance changes?")) return;
        finishEditing();
        markButton.focus();
    });

    saveButton.addEventListener("click", async () => {
        if (saving || draft.size === 0) return;
        if (draft.size > 400) {
            draftCount.textContent = "Save up to 400 changes at a time.";
            return;
        }
        const changes = rows.filter(({ member }) => draft.has(member.uid)).map(({ member, record }) => {
            const timestamp = record?.manualUpdatedAt;
            return {
                uid: member.uid,
                status: draft.get(member.uid),
                source: source.value,
                revision: timestamp ? `${timestamp.seconds}:${timestamp.nanoseconds}` : null
            };
        });
        saving = true;
        renderControls();
        renderRows();
        try {
            const { count } = await saveAttendanceDay({ date: selectedDate, changes });
            finishEditing();
            await refresh(`Saved attendance for ${count} ${count === 1 ? "member" : "members"}.`);
        } catch (error) {
            const conflict = error.code === "functions/aborted";
            const rejected = ["functions/failed-precondition", "functions/permission-denied"].includes(error.code);
            draftCount.textContent = conflict || rejected ? error.message : "Could not save attendance. Try again.";
            if (conflict || rejected) draftCount.textContent += " Cancel to discard this draft and refresh.";
        } finally {
            saving = false;
            renderControls();
            renderRows();
        }
    });

    date.addEventListener("change", () => refresh());
    locationSelect.addEventListener("change", () => {
        page = 0;
        renderSummary(daySession, scopedRows());
        renderControls();
        renderRows();
    });
    refreshButton.addEventListener("click", () => refresh());
    search.addEventListener("input", () => { page = 0; renderRows(); });
    statusFilter.addEventListener("change", () => { page = 0; renderRows(); });
    previous.addEventListener("click", () => { page -= 1; renderRows(); });
    next.addEventListener("click", () => { page += 1; renderRows(); });

    return refresh();
}

try {
    const user = await checkSession({ roles: staffRoles });
    if (user && staffRoles.includes(user.role)) await openAttendance(user);
    else showMessage("Attendance management is available to authorized staff.", true);
} catch {
    showMessage("Could not verify your access. Reload the page to try again.", true);
}
