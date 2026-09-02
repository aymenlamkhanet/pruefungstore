// ==============================================
// PRÜFUNGSTORE THEME ENGINE (DARK / LIGHT TOGGLE)
// ==============================================
(function() {
  const THEME_KEY = 'pruefung_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Mode sombre par défaut
  }

  function updateDomForTheme(theme) {
    const isDark = theme === 'dark';
    
    // Classes sur html et body
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'dark', 'light');
    document.documentElement.classList.add('theme-' + theme, theme);

    if (document.body) {
      document.body.classList.remove('theme-dark', 'theme-light', 'dark', 'light');
      document.body.classList.add('theme-' + theme, theme);
    }

    // Boutons de bascule (icones et labels)
    document.querySelectorAll('.theme-toggle-icon').forEach(el => {
      el.textContent = isDark ? '☀️' : '🌙';
    });
    document.querySelectorAll('.theme-toggle-label').forEach(el => {
      el.textContent = isDark ? 'Clair' : 'Sombre';
    });

    // Re-render catalog cards if function exists
    if (typeof window.renderCatalog === 'function') {
      window.renderCatalog();
    }
  }

  window.toggleTheme = function() {
    const current = getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    updateDomForTheme(next);
  };

  window.setTheme = function(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    localStorage.setItem(THEME_KEY, theme);
    updateDomForTheme(theme);
  };

  // Run on start
  const initialTheme = getPreferredTheme();
  updateDomForTheme(initialTheme);

  document.addEventListener('DOMContentLoaded', () => {
    updateDomForTheme(getPreferredTheme());
  });
})();
