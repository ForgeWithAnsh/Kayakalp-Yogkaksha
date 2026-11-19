import {
    collection, doc, getDocs, setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase.js";

const initialLocations = ["Ashok Nagar", "Bhopal", "Gwalior", "Ramanujganj", "Khurai", "Online"];

export async function listLocations({ includeInactive = false, useRegistrationDefaults = false } = {}) {
    const snapshot = await getDocs(collection(db, "locations")).catch((error) => {
        if (useRegistrationDefaults && error.code === "permission-denied") return { docs: [] };
        throw error;
    });
    const locations = new Map(initialLocations.map((name) => [name, true]));
    for (const item of snapshot.docs) {
        const { name, active } = item.data();
        if (typeof name === "string" && typeof active === "boolean") locations.set(name, active);
    }
    return [...locations]
        .filter(([, active]) => active || includeInactive)
        .map(([name, active]) => includeInactive ? { name, active } : name)
        .sort((first, second) => (first.name ?? first).localeCompare(second.name ?? second));
}

export async function setLocationActive(name, active) {
    const label = name.trim().replace(/\s+/g, " ");
    if (!label || label.length > 80 || label.includes("/")) {
        throw new Error("Use a location name between 1 and 80 characters with no slash.");
    }
    await setDoc(doc(db, "locations", label), { name: label, active });
}
