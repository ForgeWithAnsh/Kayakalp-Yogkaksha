const maxPhotoLength = 48000;
const maxUploadBytes = 10 * 1024 * 1024;

export function renderProfilePhoto(container, name, photoDataUrl) {
    const initial = name?.trim().charAt(0).toUpperCase() || "K";
    container.textContent = initial;
    if (!photoDataUrl || photoDataUrl.length > maxPhotoLength ||
        !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(photoDataUrl)) return;

    const image = document.createElement("img");
    image.alt = "";
    image.addEventListener("error", () => { container.textContent = initial; }, { once: true });
    image.src = photoDataUrl;
    container.replaceChildren(image);
}

export async function prepareProfilePhoto(file) {
    if (!file) return "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > maxUploadBytes) {
        throw new Error("Choose a JPG, PNG, or WebP image up to 10 MB.");
    }

    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error("This image could not be opened. Try another photo.");
    }

    try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 192;
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, 192, 192);
        const size = Math.min(bitmap.width, bitmap.height);
        context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 192, 192);

        for (const quality of [0.85, 0.7, 0.5]) {
            const photo = canvas.toDataURL("image/jpeg", quality);
            if (photo.length <= maxPhotoLength) return photo;
        }
        throw new Error("This photo is too detailed to save. Try another image.");
    } finally {
        bitmap.close();
    }
}
