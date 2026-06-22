document.addEventListener('DOMContentLoaded', () => {
  const redactButton = document.getElementById('redactthing-redact-btn');

  if (!redactButton) {
    return;
  }

  const defaultLabel = redactButton.textContent;

  function setButtonLabel(label) {
    redactButton.textContent = label;

    window.setTimeout(() => {
      redactButton.textContent = defaultLabel;
      redactButton.disabled = false;
    }, 1200);
  }

  redactButton.addEventListener('click', () => {
    redactButton.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0] && tabs[0].id;

      if (!activeTabId) {
        setButtonLabel('No tab');
        return;
      }

      chrome.tabs.sendMessage(activeTabId, { action: 'redactthing_redact_now' }, () => {
        if (chrome.runtime.lastError) {
          setButtonLabel('Unavailable');
          return;
        }

        setButtonLabel('Redacted');
      });
    });
  });
});
