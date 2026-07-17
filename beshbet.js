(function () {
  "use strict";

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
    // Finds all tab buttons inside the tablist
    return Array.prototype.slice.call(tablist.querySelectorAll(tabButtonSelector));
  }

  function findButtons(tablist) {
    var buttons = getTabButtons(tablist);
    
    // Exact matches for English and Amharic views on BeshBet
    var emailKeywords = ["email", "ኤሌክትሮኒክ", "electronic"];
    var phoneKeywords = ["phone", "ስልክ", "mobile"];

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

    // Support both <li> nested structures and direct sibling button structures
    var phoneItem = phoneButton.closest('li') || phoneButton;
    var emailItem = emailButton.closest('li') || emailButton;

    if (!phoneItem || !emailItem || phoneItem === emailItem) {
      return;
    }

    // Insert phone tab before the email tab
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

    // 1. Swap physical positions
    reorderTabs(tablist, phoneButton, emailButton);

    // Prevent infinite loop from programmatically clicking
    if (tablist.getAttribute(initializedAttr) === "true") {
      return;
    }

    // 2. Click the phone button to make it the default active tab
    var isActive = phoneButton.getAttribute("aria-current") === "page" || 
                   phoneButton.getAttribute("aria-selected") === "true" ||
                   phoneButton.classList.contains("active");

    if (!isActive) {
      phoneButton.click();
    }

    tablist.setAttribute(initializedAttr, "true");
  }

  function run() {
    scheduled = false;

    // Run on any modals found
    var modals = Array.prototype.slice.call(document.querySelectorAll(modalSelector));
    modals.forEach(function (modal) {
      var tablist = modal.querySelector(tablistSelector);
      if (tablist) {
        initializeTabState(tablist);
      }
    });

    // Fallback: Run on all tablists found globally on the page
    var allTablists = Array.prototype.slice.call(document.querySelectorAll(tablistSelector));
    allTablists.forEach(function (tablist) {
      initializeTabState(tablist);
    });

    // Clear and schedule a small microtask fallback to handle delayed react state mounts
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
    }, 150);
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

    // Watch for dynamic DOM changes (e.g. login/registration modal popping up)
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
