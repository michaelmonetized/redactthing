; (function($, window, document) {
  var emails = new RegExp(/[^@\s]+@[^@\s]+\.[^@\s]+/, 'gi');
  var phones = new RegExp(/\+?1?[\-\s\.]?\(?(\d{3})\)?[\-\s\.]?(\d{3})[\-\s\.]?(\d{4})/, 'gi');

  function redactthing_redact() {
    $('body :not([class*="redactthing-"]').contents().filter(function() {
      return this.nodeType === 3;
    }).replaceWith(function() {
      if (this.nodeValue.match(emails)) {
        return this.nodeValue.replace(emails, `<span class="redactthing-email redactthing-redact">$&</span>`);
      } else {
        if (this.nodeValue.match(phones)) {
          return this.nodeValue.replace(phones, `<span class="redactthing-pii redactthing-redact">$1-$2-$3</span>`);
        } else {
          return this.nodeValue;
        }
      }
    });
  }

  console.log('redactthing redacting');
  $(window).trigger('redactthing:redacting', redactthing_redact());

  const observer = new MutationObserver(() => {
    $(window).trigger('redactthing:redacting', redactthing_redact());
  });

  observer.observe(document.body, { childList: true });
})(jQuery, window, document, undefined);

