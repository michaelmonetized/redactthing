const DEFAULT_OPTIONS = {
  mode: 'redact',
  email: '',
  pii: ''
};

function normalizeOptions(options = {}) {
  const allowedModes = new Set(['redact', 'blur', 'mask', 'hide', 'show']);

  return {
    mode: allowedModes.has(options.mode) ? options.mode : DEFAULT_OPTIONS.mode,
    email: typeof options.email === 'string' ? options.email : DEFAULT_OPTIONS.email,
    pii: typeof options.pii === 'string' ? options.pii : DEFAULT_OPTIONS.pii
  };
}

function getStoredOptions(callback) {
  chrome.storage.sync.get(['mode', 'email', 'pii', 'redactthing'], (storedOptions) => {
    const legacyOptions =
      storedOptions.redactthing && typeof storedOptions.redactthing === 'object'
        ? storedOptions.redactthing
        : {};

    callback(
      normalizeOptions({
        ...legacyOptions,
        ...(storedOptions.mode !== undefined ? { mode: storedOptions.mode } : {}),
        ...(storedOptions.email !== undefined ? { email: storedOptions.email } : {}),
        ...(storedOptions.pii !== undefined ? { pii: storedOptions.pii } : {})
      })
    );
  });
}

chrome.runtime.onInstalled.addListener(() => {
  getStoredOptions((storedOptions) => {
    chrome.storage.sync.set(storedOptions, () => {
      chrome.storage.sync.remove('redactthing');
    });
  });
});
