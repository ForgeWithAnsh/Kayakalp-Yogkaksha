const exercises = document.querySelectorAll(".asana[data-youtube-id]");
const videoStatus = document.getElementById("videoStatus");
const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;

for (const exercise of exercises) {
    const videoId = exercise.dataset.youtubeId;
    if (!youtubeIdPattern.test(videoId)) continue;

    const link = document.createElement("a");
    const url = new URL("https://www.youtube.com/watch");
    url.searchParams.set("v", videoId);

    link.className = "video-button";
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Watch video";
    link.setAttribute("aria-label", "Watch video for " + exercise.querySelector("h2").textContent);
    exercise.append(link);
    videoStatus.hidden = true;
}
