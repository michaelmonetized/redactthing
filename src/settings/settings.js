const options = {
  mode: 'redact', // or hide, mask, blur, show
  emails: '',
  pii: ''
}

const saveOptions = (options = options) => {
  chrome.storage.sync.set({
    redactthing: options,
  });

  window.dispatchEvent(new CustomEvent('redactthing:options-changed', { detail: options }));

  return options;
};

const getOptions = () => {
  const options = chrome.storage.sync.get('redactthing', (result) => {
    return result.redactthing;
  });

  return options;
};

const setOption = (key, value) => {
  const options = getOptions();
  options[key] = value;

  saveOptions(options);
};

const getOption = (key) => {
  const options = getOptions();
  return options[key];
};

document.addEventListener('DOMContentLoaded', () => {
  const options = getOptions();

  document.querySelector('#emails').value = options.emails;
  document.querySelector('#pii').value = options.pii;

  document.querySelectorAll('[name="mode"]').forEach((radio) => {
    radio.checked = radio.value === options.mode;
  });
});

document.querySelector('[name="mode"]').addEventListener('change', (event) => {
  setOption('mode', event.target.value);
});

document.querySelector('[name="emails"]').addEventListener('blur', (event) => {
  setOption('emails', event.target.value);
});

document.querySelector('[name="pii"]').addEventListener('blur', (event) => {
  setOption('pii', event.target.value);
});

function saveForm(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const form = document.querySelector('form[name="redactthing-settings"]');
  const formOptions = { ...form.formData.entries() };

  saveOptions(formOptions);
}

document.querySelector('#save').addEventListener('mousedown', (event) => saveForm);

const formEvents = ['change', 'submit'];
formEvents.forEach((event) => {
  document.querySelector('form[name="redactthing-settings"]').addEventListener(event, (event) => saveForm);
});

document.querySelector('#reset').addEventListener('mousedown', (event) => saveForm);

