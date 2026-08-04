(function () {
  "use strict";

  // Load Google Analytics (GA4)
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-EQ02LHDLK6";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag("js", new Date());
  gtag("config", "G-EQ02LHDLK6");
})();
