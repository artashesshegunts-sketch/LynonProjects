(function () {
  "use strict";

  // ============================
  // Google Tag Manager
  // ============================
  (function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';

    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);

  })(window, document, 'script', 'dataLayer', 'GTM-MLQ3K2RK');

  var observer;
  var scheduled = false;
  var delayedRun = 0;

  // Generic but highly resilient selectors targeting standard ARIA roles
  var modalSelector = '[role="dialog"], [role="alertdialog"], .modal';
  var tablistSelector = '[role="tablist"]';
  var tabButtonSelector = '[role="tab"]';
  var initializedAttr = "data-beshbet-auth-tabs-initialized";

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "").trim().toLowerCase();
  }

  function getTabButtons(tablist) {
    return Array.prototype.slice.call(tablist.querySelectorAll(tabButtonSelector));
  }

  function findButtons(tablist) {
    var buttons = getTabButtons(tablist);

    var emailKeywords = ["email", "ኤሌክትሮኒክ", "electronic"];
    var phoneKeywords = ["phone", "ስልክ", "mobile"];

    var emailButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return emailKeywords.some(function(keyword) {
        return text.indexOf(keyword) !== -1;
      });
    });

    var phoneButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return phoneKeywords.some(function(keyword) {
        return text.indexOf(keyword) !== -1;
      });
    });

    return {
      emailButton: emailButton,
      phoneButton: phoneButton
    };
  }

  function reorderTabs(tablist, phoneButton, emailButton) {
    if (!tablist || !phoneButton || !emailButton) {
      return;
    }

    var phoneItem = phoneButton.closest('li') || phoneButton;
    var emailItem = emailButton.closest('li') || emailButton;

    if (!phoneItem || !emailItem || phoneItem === emailItem) {
      return;
    }

    if (tablist.firstElementChild !== phoneItem) {
      tablist.insertBefore(phoneItem, emailItem);
    }
  }

  function initializeTabState(tablist) {
    if (!tablist) {
      return;
    }

    var buttonSet = findButtons(tablist);
    var emailButton = buttonSet.emailButton;
    var phoneButton = buttonSet.phoneButton;

    if (!emailButton || !phoneButton) {
      return;
    }

    reorderTabs(tablist, phoneButton, emailButton);

    if (tablist.getAttribute(initializedAttr) === "true") {
      return;
    }

    var isActive =
      phoneButton.getAttribute("aria-current") === "page" ||
      phoneButton.getAttribute("aria-selected") === "true" ||
      phoneButton.classList.contains("active");

    if (!isActive) {
      phoneButton.click();
    }

    tablist.setAttribute(initializedAttr, "true");
  }

  function run() {
    scheduled = false;

    var modals = Array.prototype.slice.call(document.querySelectorAll(modalSelector));

    modals.forEach(function (modal) {
      var tablist = modal.querySelector(tablistSelector);
      if (tablist) {
        initializeTabState(tablist);
      }
    });

    var allTablists = Array.prototype.slice.call(document.querySelectorAll(tablistSelector));

    allTablists.forEach(function (tablist) {
      initializeTabState(tablist);
    });

    if (delayedRun) {
      clearTimeout(delayedRun);
    }

    delayedRun = setTimeout(function () {
      var activeModals = Array.prototype.slice.call(document.querySelectorAll(modalSelector));

      activeModals.forEach(function (modal) {
        var tablist = modal.querySelector(tablistSelector);
        if (tablist) {
          initializeTabState(tablist);
        }
      });
    }, 150);
  }

  function scheduleRun() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    requestAnimationFrame(run);
  }

  function init() {
    scheduleRun();

    observer = new MutationObserver(function () {
      scheduleRun();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-current", "aria-selected"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
