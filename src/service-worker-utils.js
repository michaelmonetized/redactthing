// This file can be imported inside the service worker,
// which means all of its functions and variables will be accessible
// inside the service worker.
// The importation is done in the file `service-worker.js`.

console.log("External file is also loaded!")

async function executeScriptOnTab(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.url !== undefined && !tab.url.startsWith('chrome://')) {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['foreground.js']
    });
  }
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    await executeScriptOnTab(tabId);
    console.log(tab);
  }
});

chrome.tabs.onActivated.addListener(async function(activeInfo) {
  console.log(activeInfo);
  await executeScriptOnTab(activeInfo.tabId); // tabid is undefined??
});

chrome.tabs.onReplaced.addListener(async function(addedTabId, removedTabId) {
  await executeScriptOnTab(addedTabId);
  console.log(removedTabId);
});

chrome.tabs.onAttached.addListener(async function(tabId) {
  await executeScriptOnTab(tabId);
});

chrome.tabs.onDetached.addListener(async function(tabId) {
  await executeScriptOnTab(tabId);
});

chrome.tabs.onMoved.addListener(async function(tabId) {
  await executeScriptOnTab(tabId);
});
