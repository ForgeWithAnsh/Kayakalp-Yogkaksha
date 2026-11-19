import {
    canCreateAnnouncement,
    canManageAttendance,
    canManageRoles,
    canViewFullMemberInformation,
    getManageableRoles
} from "./session.js";

export const Roles = Object.freeze({
    ADMIN: "admin",
    HOST: "host",
    MODERATOR: "moderator",
    MEMBER: "member"
});

const permissions = new Map([
    ["sendAnnouncement", canCreateAnnouncement],
    ["manageMembers", canManageRoles],
    ["markAttendance", canManageAttendance],
    ["changeRoles", canManageRoles],
    ["viewMemberData", canViewFullMemberInformation]
]);

export function hasPermission(permission) {
    return permissions.get(permission)?.() ?? false;
}

export function canEditUser(targetRole = Roles.MEMBER) {
    return getManageableRoles().includes(targetRole);
}
