(function () {
  "use strict";

  var observer;
  var scheduled = false;
  var delayedRun = 0;
  var modalSelector = '.modal[role="alertdialog"], .css-1fg8vzl';
  var tablistSelector = 'ul[role="tablist"].app-ltr-17pv0q3, ul[role="tablist"].css-17pv0q3, ul[role="tablist"]';
  var tabButtonSelector = 'li[role="presentation"] > button[role="tab"], li > button[role="tab"]';
  var initializedAttr = "data-gebeta-auth-tabs-initialized";

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "").trim().toLowerCase();
  }

  function getTabButtons(tablist) {
    return Array.prototype.slice.call(tablist.querySelectorAll(tabButtonSelector));
  }

  function findButtons(tablist) {
    var buttons = getTabButtons(tablist);
    
    // Updated to match the exact words for French UI
    var emailKeywords = ["email", "e-mail", "courriel"];
    var phoneKeywords = ["phone", "téléphone", "tel", "portable"];

    var emailButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return emailKeywords.some(function(keyword) { return text.indexOf(keyword) !== -1; });
    });
    
    var phoneButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return phoneKeywords.some(function(keyword) { return text.indexOf(keyword) !== -1; });
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

    var phoneItem = phoneButton.closest('li');
    var emailItem = emailButton.closest('li');

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

    var isActive = phoneButton.getAttribute("aria-current") === "page" || 
                   phoneButton.getAttribute("aria-selected") === "true";

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

    // Global selector fallback if the modal classes behave differently in French view
    var allTablists = Array.prototype.slice.call(document.querySelectorAll(tablistSelector));
    allTablists.forEach(function (tablist) {
      initializeTabState(tablist);
    });

    if (delayedRun) {
      window.clearTimeout(delayedRun);
    }

    delayedRun = window.setTimeout(function () {
      var activeModals = Array.prototype.slice.call(document.querySelectorAll(modalSelector));
      activeModals.forEach(function (modal) {
        var tablist = modal.querySelector(tablistSelector);
        if (tablist) {
          initializeTabState(tablist);
        }
      });
    }, 120);
  }

  function scheduleRun() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(run);
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
