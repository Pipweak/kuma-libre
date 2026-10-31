(() => {
  const locale = globalThis.navigator.language.toLowerCase().split('-')[0];
  globalThis.document.documentElement.lang = ['fr', 'en', 'es'].includes(locale) ? locale : 'fr';
})();
