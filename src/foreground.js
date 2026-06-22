(() => {
  const DEFAULT_OPTIONS = {
    mode: 'redact',
    email: '',
    pii: ''
  };
  const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const PHONE_REGEX = /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT']);

  let currentOptions = { ...DEFAULT_OPTIONS };
  let observer = null;
  let isApplying = false;

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

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function splitLines(value) {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function maskEmail(email) {
    const [user = '', domain = ''] = email.split('@');
    const maskedUser = user.length <= 2 ? '*'.repeat(Math.max(user.length, 1)) : `${user.slice(0, 2)}${'*'.repeat(user.length - 2)}`;
    const domainParts = domain.split('.');
    const domainName = domainParts.shift() || '';
    const tld = domainParts.length > 0 ? `.${domainParts.join('.')}` : '';
    const maskedDomain =
      domainName.length <= 2
        ? '*'.repeat(Math.max(domainName.length, 1))
        : `${domainName.slice(0, 2)}${'*'.repeat(domainName.length - 2)}`;

    return `${maskedUser}@${maskedDomain}${tld}`;
  }

  function maskText(value) {
    return value.replace(/[^\s]/g, '*');
  }

  function renderText(value, type) {
    if (currentOptions.mode !== 'mask') {
      return value;
    }

    return type === 'email' ? maskEmail(value) : maskText(value);
  }

  function getModeClass() {
    return currentOptions.mode === 'show' ? '' : `redactthing-${currentOptions.mode}`;
  }

  function collectPatterns() {
    const patterns = [
      { type: 'email', regex: new RegExp(EMAIL_REGEX.source, EMAIL_REGEX.flags) },
      { type: 'pii', regex: new RegExp(PHONE_REGEX.source, PHONE_REGEX.flags) }
    ];

    splitLines(currentOptions.email).forEach((email) => {
      patterns.push({
        type: 'email',
        regex: new RegExp(escapeRegExp(email), 'g')
      });
    });

    splitLines(currentOptions.pii).forEach((entry) => {
      patterns.push({
        type: 'pii',
        regex: new RegExp(escapeRegExp(entry), 'g')
      });
    });

    return patterns;
  }

  function findMatches(text) {
    const matches = [];

    collectPatterns().forEach(({ type, regex }) => {
      let match = regex.exec(text);

      while (match) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type
        });

        if (match[0].length === 0) {
          regex.lastIndex += 1;
        }

        match = regex.exec(text);
      }
    });

    matches.sort((left, right) => {
      if (left.start !== right.start) {
        return left.start - right.start;
      }

      return right.end - left.end;
    });

    const resolved = [];
    let lastEnd = -1;

    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        resolved.push(match);
        lastEnd = match.end;
      }
    });

    return resolved;
  }

  function buildReplacement(match) {
    const span = document.createElement('span');
    const modeClass = getModeClass();

    span.className = `redactthing-${match.type}`;
    if (modeClass) {
      span.classList.add(modeClass);
    }

    span.dataset.redactthingKind = match.type;
    span.dataset.redactthingOriginal = match.text;
    span.textContent = renderText(match.text, match.type);

    return span;
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;

    if (!parent) {
      return true;
    }

    if (SKIP_TAGS.has(parent.tagName) || parent.isContentEditable) {
      return true;
    }

    return Boolean(parent.closest('[data-redactthing-kind]'));
  }

  function collectTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim() || shouldSkipNode(node)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let currentNode = walker.nextNode();
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    return nodes;
  }

  function replaceTextNode(node) {
    const text = node.nodeValue;
    const matches = findMatches(text);

    if (matches.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match) => {
      if (match.start > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.start)));
      }

      fragment.appendChild(buildReplacement(match));
      cursor = match.end;
    });

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }

    node.replaceWith(fragment);
  }

  function unwrapAll() {
    document.querySelectorAll('[data-redactthing-original]').forEach((element) => {
      const originalText = element.dataset.redactthingOriginal || element.textContent || '';
      element.replaceWith(document.createTextNode(originalText));
    });
  }

  function applyRedactions() {
    if (!document.body || isApplying) {
      return;
    }

    isApplying = true;
    if (observer) {
      observer.disconnect();
    }

    try {
      unwrapAll();

      if (currentOptions.mode === 'show') {
        return;
      }

      collectTextNodes(document.body).forEach(replaceTextNode);
    } finally {
      if (observer) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }

      isApplying = false;
    }
  }

  async function refreshOptionsAndApply() {
    currentOptions = await getOptions();
    applyRedactions();
  }

  observer = new MutationObserver(() => {
    applyRedactions();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    currentOptions = normalizeOptions({
      ...currentOptions,
      ...Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, value.newValue]))
    });

    applyRedactions();
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request && request.action === 'redactthing_redact_now') {
      applyRedactions();
      sendResponse({ success: true });
    }
  });

  refreshOptionsAndApply();
})();
