// Shared helpers for the MV3 service worker.
// Content injection is owned by manifest content_scripts (jquery.js + foreground.js,
// all_frames). Do not chrome.scripting.executeScript foreground.js alone — that
// drops jQuery and double-mounts the redactor.
