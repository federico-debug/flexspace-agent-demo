/**
 * FlexSpace Chat Widget - Embeddable Loader
 *
 * Drop this single script into any website (Webflow, WordPress, etc.)
 * to load the floating chat widget with all required styles.
 *
 * Usage in Webflow:
 *   <script src="https://flexspace-agent-demo-psi.vercel.app/embed.js"></script>
 */
(function () {
  'use strict';

  // Base URL — auto-detect from the script's own src attribute
  var currentScript = document.currentScript;
  var src = currentScript ? currentScript.getAttribute('src') : '';
  var BASE_URL = src.replace(/\/embed\.js(\?.*)?$/, '');

  if (!BASE_URL) {
    console.error('[FlexSpace Chat] Could not determine base URL from embed.js src');
    return;
  }

  console.log('[FlexSpace Chat] Loading from:', BASE_URL);

  // CSS files to inject (order matters: variables first)
  var cssFiles = [
    '/src/styles/variables.css',
    '/src/styles/animations.css',
    '/src/styles/embed-global.css',
    '/src/components/ExampleQuestions/ExampleQuestions.css',
    '/src/components/ChatWidget/ChatWidget.css',
    '/src/components/ChatHistory/ChatHistory.css',
    '/src/components/FloatingChatButton/FloatingChatButton.css'
  ];

  // Inject all CSS files
  cssFiles.forEach(function (file) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_URL + file;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Load the app module (type=module requires CORS for cross-origin)
  var script = document.createElement('script');
  script.type = 'module';
  script.crossOrigin = 'anonymous';
  script.src = BASE_URL + '/src/app.js';
  script.onerror = function () {
    console.error('[FlexSpace Chat] Failed to load app.js from:', BASE_URL + '/src/app.js');
  };
  document.body.appendChild(script);
})();
