// Shared helpers for the MV3 service worker.
// Content injection is owned by manifest content_scripts (foreground.js, all_frames).
// Do not chrome.scripting.executeScript foreground.js alone — that double-mounts
// the redactor. jQuery is not used.
