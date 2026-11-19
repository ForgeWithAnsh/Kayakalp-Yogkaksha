export function setupPasswordVisibility(button, ...fields) {
    button.setAttribute("aria-label", "Show password");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
        const show = button.getAttribute("aria-pressed") === "false";
        button.setAttribute("aria-pressed", String(show));
        for (const field of fields) field.type = show ? "text" : "password";
    });
}

export function setSubmitBusy(button, busy) {
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
}
