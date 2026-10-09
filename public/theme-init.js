// Aplica el tema guardado antes del primer pintado para evitar parpadeos.
// Es un archivo aparte (no un script en línea) para permitir una política CSP estricta.
try {
  var t = localStorage.getItem('vmqr-theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
