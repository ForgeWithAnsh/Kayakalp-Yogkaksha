/* ==========================================================
   SESSION
========================================================== */

import {

    currentUser

} from "./session.js";


/* ==========================================================
   ROLES
========================================================== */

export const Roles = {

    ADMIN: "admin",

    HOST: "host",

    MODERATOR: "moderator",

    MEMBER: "member"

};


/* ==========================================================
   ROLE HIERARCHY
========================================================== */

const RoleHierarchy = {

    admin: 4,

    host: 3,

    moderator: 2,

    member: 1

};


/* ==========================================================
   PERMISSIONS
========================================================== */

const Permissions = {

    sendAnnouncement: [

        Roles.ADMIN,

        Roles.HOST

    ],

    manageMembers: [

        Roles.ADMIN,

        Roles.HOST,

        Roles.MODERATOR

    ],

    markAttendance: [

        Roles.ADMIN,

        Roles.HOST,

        Roles.MODERATOR

    ],

    changeRoles: [

        Roles.ADMIN,

        Roles.HOST

    ],

    viewMemberData: [

        Roles.ADMIN,

        Roles.HOST

    ]

};


/* ==========================================================
   HAS PERMISSION
========================================================== */

export function hasPermission(permission){

    if(!currentUser){

        return false;

    }

    const allowedRoles =

        Permissions[permission];

    if(!allowedRoles){

        return false;

    }

    return allowedRoles.includes(

        currentUser.role

    );

}


/* ==========================================================
   CAN EDIT USER
========================================================== */

export function canEditUser(targetRole){

    if(!currentUser){

        return false;

    }

    const myLevel =

        RoleHierarchy[currentUser.role];

    const targetLevel =

        RoleHierarchy[targetRole];

    return myLevel > targetLevel;

}