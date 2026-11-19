import { canEditUser } from "./auth.js";
import { getSessionDate, SESSION_TIME_ZONE } from "./date.js";
import { getUsersByApprovalStatus, updateMemberRole } from "./firebase.js";
import { checkSession, getManageableRoles } from "./session.js";

const roleNames = {
    admin: "Admin",
    host: "Host",
    moderator: "Moderator",
    member: "Member"
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: SESSION_TIME_ZONE
});
const nameOrder = new Intl.Collator("en-IN", { sensitivity: "base", numeric: true });

const user = await checkSession({ roles: ["admin", "host"] }).catch(() => null);
if (user) initializeMembers(user);

function memberName(member) {
    return member.fullName || "Unnamed member";
}

function dateValue(value) {
    if (!value) return null;
    const date = value.toDate?.() ?? new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function joinedDate(member) {
    return dateValue(member.joinedAt ?? member.approvedAt);
}

function calculateAge(birthDate) {
    if (!birthDate) return "—";

    const [year, month, day] = getSessionDate().split("-").map(Number);
    const [birthYear, birthMonth, birthDay] = getSessionDate(birthDate).split("-").map(Number);
    const birthdayPassed = month > birthMonth || (month === birthMonth && day >= birthDay);
    const age = year - birthYear - Number(!birthdayPassed);
    return age >= 0 ? String(age) : "—";
}

function sortMembers(members, sort) {
    const byName = (first, second) => nameOrder.compare(memberName(first), memberName(second));

    if (sort === "newest" || sort === "oldest") {
        const direction = sort === "newest" ? -1 : 1;
        members.sort((first, second) => {
            const firstDate = joinedDate(first)?.getTime();
            const secondDate = joinedDate(second)?.getTime();
            if (firstDate === undefined || secondDate === undefined) {
                return Number(firstDate === undefined) - Number(secondDate === undefined) || byName(first, second);
            }
            return direction * (firstDate - secondDate) || byName(first, second);
        });
    } else if (sort === "memberid") {
        members.sort((first, second) => nameOrder.compare(first.memberId ?? "", second.memberId ?? "") || byName(first, second));
    } else {
        members.sort(sort === "za" ? (first, second) => byName(second, first) : byName);
    }
}

function initializeMembers(user) {
    const list = document.getElementById("membersContainer");
    const template = document.getElementById("memberCardTemplate");
    const search = document.getElementById("searchInput");
    const location = document.getElementById("locationSelect");
    const roleFilter = document.getElementById("memberRoleSelect");
    const sort = document.getElementById("sortSelect");
    const status = document.getElementById("memberListStatus");
    const retry = document.getElementById("retryMembers");
    const profile = document.getElementById("memberProfileOverlay");
    const roleDialog = document.getElementById("managePopupOverlay");
    const manageButton = document.getElementById("manageMemberButton");
    const roleForm = document.getElementById("memberRoleForm");
    const fieldset = document.getElementById("roleOptions");
    const submit = document.getElementById("saveChangesButton");
    const closeRole = document.getElementById("closeManagePopup");
    const roleStatus = document.getElementById("memberRoleStatus");

    let members = [];
    let selectedMember = null;
    let loaded = false;
    let saving = false;

    function renderProfile(member) {
        const birthDate = dateValue(member.dob);
        const joined = joinedDate(member);
        const values = {
            profileAvatar: memberName(member).charAt(0).toUpperCase(),
            profileName: memberName(member),
            profileRole: roleNames[member.role],
            profileMemberId: member.memberId,
            profilePhone: member.phone,
            profileGender: member.gender,
            profileDob: birthDate && dateFormat.format(birthDate),
            profileAge: calculateAge(birthDate),
            profilePark: member.park,
            profileHealth: member.health,
            profileEmail: member.email,
            profileAddress: member.address,
            profileJoined: joined && dateFormat.format(joined)
        };
        for (const [id, value] of Object.entries(values)) {
            document.getElementById(id).textContent = value || "—";
        }
        manageButton.hidden = member.uid === user.uid || !canEditUser(member.role);
    }

    function openProfile(member) {
        selectedMember = member;
        renderProfile(member);
        profile.showModal();
    }

    function createCard(member) {
        const card = template.content.firstElementChild.cloneNode(true);
        const name = memberName(member);
        card.querySelector(".member-photo").textContent = name.charAt(0).toUpperCase();
        card.querySelector(".member-name").textContent = name;
        card.querySelector(".member-id").textContent = member.memberId || "No member ID";
        card.addEventListener("click", () => openProfile(member));
        return card;
    }

    function renderMembers() {
        if (!loaded) return;

        const term = search.value.trim().toLowerCase();
        const filtered = members.filter((member) => {
            const matchesSearch = memberName(member).toLowerCase().includes(term) || (member.memberId ?? "").toLowerCase().includes(term);
            return matchesSearch && (!location.value || member.park === location.value) && (!roleFilter.value || member.role === roleFilter.value);
        });
        sortMembers(filtered, sort.value);
        list.replaceChildren(...filtered.map(createCard));
        status.textContent = filtered.length
            ? String(filtered.length) + (filtered.length === 1 ? " member" : " members")
            : "No members match these filters.";
    }

    async function loadMembers() {
        retry.hidden = true;
        status.textContent = "Loading members…";
        try {
            members = await getUsersByApprovalStatus("approved");
            const locations = [...new Set(members.map((member) => member.park).filter(Boolean))];
            locations.sort(nameOrder.compare);
            location.append(...locations.map((item) => new Option(item, item)));
            loaded = true;
            renderMembers();
        } catch {
            status.textContent = "Could not load members.";
            retry.hidden = false;
        }
    }

    function openRoleEditor() {
        const member = selectedMember;
        if (!member || member.uid === user.uid || !canEditUser(member.role)) return;

        const choices = getManageableRoles().filter((role) => role !== member.role);
        const options = choices.map((role) => {
            const label = document.createElement("label");
            label.className = "role-card";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "role";
            radio.value = role;
            label.append(radio, roleNames[role]);
            return label;
        });

        fieldset.replaceChildren(fieldset.querySelector("legend"), ...options);
        document.getElementById("manageMemberName").textContent = memberName(member);
        document.getElementById("currentRoleCard").textContent = "Current role: " + roleNames[member.role];
        roleStatus.textContent = "";
        submit.disabled = true;
        roleDialog.showModal();
    }

    async function saveRole(event) {
        event.preventDefault();
        if (saving || !selectedMember) return;

        const member = selectedMember;
        const role = new FormData(roleForm).get("role");
        if (!getManageableRoles().includes(role) || role === member.role || !canEditUser(member.role)) return;

        if (!window.confirm("Change " + memberName(member) + "’s role to " + roleNames[role] + "?")) return;

        saving = true;
        closeRole.disabled = true;
        submit.disabled = true;
        fieldset.disabled = true;
        roleStatus.textContent = "Saving…";
        try {
            await updateMemberRole(member.uid, role);
            member.role = role;
            renderProfile(member);
            roleDialog.close();
            renderMembers();
        } catch {
            roleStatus.textContent = "Could not change the member’s role. Please try again.";
            submit.disabled = false;
        } finally {
            saving = false;
            fieldset.disabled = false;
            closeRole.disabled = false;
        }
    }

    search.addEventListener("input", renderMembers);
    for (const filter of [location, roleFilter, sort]) filter.addEventListener("change", renderMembers);
    retry.addEventListener("click", loadMembers);
    document.getElementById("closeMemberProfile").addEventListener("click", () => profile.close());
    closeRole.addEventListener("click", () => roleDialog.close());
    manageButton.addEventListener("click", openRoleEditor);
    roleForm.addEventListener("change", () => { submit.disabled = false; });
    roleForm.addEventListener("submit", saveRole);
    roleDialog.addEventListener("cancel", (event) => {
        if (saving) event.preventDefault();
    });
    profile.addEventListener("click", (event) => {
        if (event.target === profile) profile.close();
    });

    void loadMembers();
}
