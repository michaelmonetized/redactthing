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

function getOptions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['mode', 'email', 'pii', 'redactthing'], (storedOptions) => {
      const legacyOptions =
        storedOptions.redactthing && typeof storedOptions.redactthing === 'object'
          ? storedOptions.redactthing
          : {};

      resolve(
        normalizeOptions({
          ...legacyOptions,
          ...(storedOptions.mode !== undefined ? { mode: storedOptions.mode } : {}),
          ...(storedOptions.email !== undefined ? { email: storedOptions.email } : {}),
          ...(storedOptions.pii !== undefined ? { pii: storedOptions.pii } : {})
        })
      );
    });
  });
}

function saveOptions(options) {
  const nextOptions = normalizeOptions(options);

  return new Promise((resolve) => {
    chrome.storage.sync.set(nextOptions, () => {
      chrome.storage.sync.remove('redactthing', () => {
        resolve(nextOptions);
      });
    });
  });
}

function populateForm(form, options) {
  form.querySelector('#email').value = options.email;
  form.querySelector('#pii').value = options.pii;

  form.querySelectorAll('[name="mode"]').forEach((radio) => {
    radio.checked = radio.value === options.mode;
  });
}

function readForm(form) {
  const formData = new FormData(form);

  return normalizeOptions({
    mode: formData.get('mode'),
    email: formData.get('email'),
    pii: formData.get('pii')
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('form[name="redactthing-settings"]');
  const resetButton = document.getElementById('reset');

  if (!form) {
    return;
  }

  let options = await getOptions();
  populateForm(form, options);

  form.addEventListener('change', async () => {
    options = await saveOptions(readForm(form));
    populateForm(form, options);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    options = await saveOptions(readForm(form));
    populateForm(form, options);
  });

  ['email', 'pii'].forEach((fieldName) => {
    const field = form.querySelector(`#${fieldName}`);

    field.addEventListener('blur', async () => {
      options = await saveOptions(readForm(form));
      populateForm(form, options);
    });
  });

  resetButton.addEventListener('click', async (event) => {
    event.preventDefault();
    options = await saveOptions(DEFAULT_OPTIONS);
    form.reset();
    populateForm(form, options);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    options = normalizeOptions({
      ...options,
      ...Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, value.newValue]))
    });

    populateForm(form, options);
  });
});
