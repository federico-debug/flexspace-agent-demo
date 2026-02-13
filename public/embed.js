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
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var src = currentScript.getAttribute('src') || '';
  var BASE_URL = src.replace(/\/embed\.js(\?.*)?$/, '') || '.';

  // CSS files to inject (order matters: variables first)
  // Uses embed-global.css instead of global.css to avoid
  // overriding host page styles (resets, body, h1, h2, button, etc.)
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
    document.head.appendChild(link);
  });

  // Load the app module
  var script = document.createElement('script');
  script.type = 'module';
  script.src = BASE_URL + '/src/app.js';
  document.body.appendChild(script);
})();
