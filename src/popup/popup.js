document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const preview = document.querySelector('.redactthing-preview');
  const settings = JSON.parse(localStorage.getItem('redactthingPluginSettings') || '{mode: "redact", email: "", other: ""}');

  document.querySelector(`input[value=${settings.mode}]`).cheched = true;

  form.addEventListener('change', function(event) {
    const mode = event.target.value;

    if (mode === 'mask') {
      preview.textContent = preview.textContent.replace(/(.{2})[^@.]@(.{2})\..*/g, '$1****@$2*****.***');
    }

    let newSettings = settings;
    newSettings.mode = mode;
    localStorage.setItem('redactthingPluginSettings', JSON.stringify(newSettings));

    // send signal to the parent document for settings change.
    const redactThingSettingsDidChange = new CustomEvent('redactThingSettingsDidChange', {
      detail: newSettings
    });

    document.dispatchEvent(redactThingSettingsDidChange);
  });

  const redactBtn = document.getElementById('redactthing-redact-btn');
  if (redactBtn) {
    redactBtn.addEventListener('click', function() {
      // Send a message to the content script to trigger redaction
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'redactthing_redact_now' });
      });
    });
  }
});

